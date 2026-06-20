/**
 * ArcanaX Weekly Forecast Engine
 * Generates weekly and monthly forecasts using date-seeded card draws
 * and moon phase integration.
 */
(function (root, factory) {
  if (typeof define === "function" && define.amd) { define([], factory); }
  else if (typeof module === "object" && module.exports) { module.exports = factory(); }
  else { root.WeeklyForecast = factory(); }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // Day names and narrative connectors
  var DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var DAY_THEMES = {
    0: { ruler: "Sun", theme: "Self-expression and vitality" },
    1: { ruler: "Moon", theme: "Emotions and intuition" },
    2: { ruler: "Mars", theme: "Action and courage" },
    3: { ruler: "Mercury", theme: "Communication and learning" },
    4: { ruler: "Jupiter", theme: "Expansion and luck" },
    5: { ruler: "Venus", theme: "Love and beauty" },
    6: { ruler: "Saturn", theme: "Structure and discipline" }
  };

  var NARRATIVE_INTROS = [
    "The cosmos weaves a fascinating story for your week ahead.",
    "A powerful tapestry of energy unfolds across the coming days.",
    "The stars have composed a unique symphony for your week.",
    "Celestial forces align in an intriguing pattern for the days ahead.",
    "The universe reveals its plan for your week through the cards."
  ];

  var NARRATIVE_TRANSITIONS = [
    "This energy flows naturally into",
    "Building upon this foundation,",
    "As this influence settles,",
    "This cosmic thread connects to",
    "The energy then shifts toward",
    "Following this vibration,"
  ];

  var MONTHLY_INTROS = [
    "The month ahead holds a grand cosmic narrative, shaped by the dance of moon and stars.",
    "As a new cycle begins, the celestial realm reveals themes that will color your days.",
    "The cosmic calendar unfolds with purpose and meaning for the weeks ahead."
  ];

  /**
   * Generate a seeded pseudo-random number (deterministic based on date)
   */
  function seededRandom(seed) {
    var x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  /**
   * Get a date-based seed for a specific day
   */
  function dateSeed(date) {
    var d = date instanceof Date ? date : new Date(date);
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  }

  /**
   * Draw a card deterministically based on date seed
   * Returns a card index (0-77) that maps to the 78-card deck
   */
  function drawSeededCard(date, offset) {
    var seed = dateSeed(date) + (offset || 0) * 7919;
    var rand = seededRandom(seed);
    var cardIndex = Math.floor(rand * 78);
    var isReversed = seededRandom(seed + 1234) < 0.3;
    return { index: cardIndex, reversed: isReversed };
  }

  /**
   * Generate daily card interpretation snippet
   */
  function generateDayMessage(dayOfWeek, cardDraw) {
    var dayInfo = DAY_THEMES[dayOfWeek];
    var messages = {
      upright: [
        "Embrace the forward momentum this card brings.",
        "Positive energy supports your endeavors today.",
        "This card's gifts are fully available to you.",
        "Allow this influence to guide your actions.",
        "The universe opens doors through this energy."
      ],
      reversed: [
        "Look inward for the lesson this card offers.",
        "A gentle reminder to reconsider your approach.",
        "Hidden wisdom awaits your contemplation.",
        "Release what blocks this energy from flowing.",
        "Transform this challenge into personal growth."
      ]
    };
    var pool = cardDraw.reversed ? messages.reversed : messages.upright;
    var idx = (dateSeed(new Date()) + dayOfWeek) % pool.length;
    return {
      dayName: DAY_NAMES[dayOfWeek],
      ruler: dayInfo.ruler,
      theme: dayInfo.theme,
      message: pool[idx]
    };
  }

  /**
   * Get weekly forecast starting from a specific date
   * @param {Date|string} weekStartDate - Start of the week
   * @returns {Object} Weekly forecast with 7 daily cards and narrative
   */
  function getWeeklyForecast(weekStartDate) {
    var startDate = weekStartDate instanceof Date ? weekStartDate : new Date(weekStartDate || Date.now());
    // Normalize to start of day
    startDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());

    var days = [];
    var cardIndices = [];

    for (var i = 0; i < 7; i++) {
      var day = new Date(startDate.getTime() + i * 86400000);
      var draw = drawSeededCard(day, i + 42);
      var dayOfWeek = day.getDay();
      var dayInfo = generateDayMessage(dayOfWeek, draw);

      days.push({
        date: day.toISOString().split("T")[0],
        dayName: dayInfo.dayName,
        dayOfWeek: dayOfWeek,
        ruler: dayInfo.ruler,
        theme: dayInfo.theme,
        cardIndex: draw.index,
        reversed: draw.reversed,
        message: dayInfo.message
      });
      cardIndices.push(draw.index);
    }

    // Generate connecting narrative
    var introIdx = dateSeed(startDate) % NARRATIVE_INTROS.length;
    var narrative = NARRATIVE_INTROS[introIdx];

    // Calculate week energy (dominant element based on card distribution)
    var elementCounts = { fire: 0, water: 0, earth: 0, air: 0 };
    for (var e = 0; e < cardIndices.length; e++) {
      var ci = cardIndices[e];
      if (ci < 22) {
        // Major Arcana - balanced
        elementCounts.fire++;
        elementCounts.water++;
      } else {
        // Minor Arcana suits
        var suitIdx = Math.floor((ci - 22) / 14);
        if (suitIdx === 0) elementCounts.fire++;
        else if (suitIdx === 1) elementCounts.water++;
        else if (suitIdx === 2) elementCounts.air++;
        else elementCounts.earth++;
      }
    }

    var dominantElement = "fire";
    var maxCount = 0;
    var elKeys = Object.keys(elementCounts);
    for (var ek = 0; ek < elKeys.length; ek++) {
      if (elementCounts[elKeys[ek]] > maxCount) {
        maxCount = elementCounts[elKeys[ek]];
        dominantElement = elKeys[ek];
      }
    }

    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: new Date(startDate.getTime() + 6 * 86400000).toISOString().split("T")[0],
      days: days,
      narrative: narrative,
      dominantElement: dominantElement,
      elementBreakdown: elementCounts
    };
  }

  /**
   * Get monthly forecast with moon phase integration
   * @param {number} year
   * @param {number} month (1-12)
   * @returns {Object} Monthly forecast overview
   */
  function getMonthlyForecast(year, month) {
    var daysInMonth = new Date(year, month, 0).getDate();
    var weeks = [];
    var keyDates = [];

    // Generate 4-5 weekly overviews
    var weekStart = new Date(year, month - 1, 1);
    var weekNum = 0;
    while (weekStart.getMonth() === month - 1) {
      var weekEnd = new Date(weekStart.getTime() + 6 * 86400000);
      var weekCard = drawSeededCard(weekStart, weekNum * 100 + 7);

      weeks.push({
        weekNumber: weekNum + 1,
        startDate: weekStart.toISOString().split("T")[0],
        cardIndex: weekCard.index,
        reversed: weekCard.reversed
      });

      weekStart = new Date(weekStart.getTime() + 7 * 86400000);
      weekNum++;
    }

    // Highlight key dates (1st, 7th, 14th, 21st, 28th and last day)
    var highlightDays = [1, 7, 14, 21, 28];
    if (daysInMonth > 28) highlightDays.push(daysInMonth);
    for (var h = 0; h < highlightDays.length; h++) {
      if (highlightDays[h] <= daysInMonth) {
        var hDate = new Date(year, month - 1, highlightDays[h]);
        var hCard = drawSeededCard(hDate, 999);
        keyDates.push({
          date: hDate.toISOString().split("T")[0],
          day: highlightDays[h],
          cardIndex: hCard.index,
          reversed: hCard.reversed
        });
      }
    }

    // Monthly theme card
    var monthCard = drawSeededCard(new Date(year, month - 1, 15), 5555);

    var introIdx = dateSeed(new Date(year, month - 1, 1)) % MONTHLY_INTROS.length;

    return {
      year: year,
      month: month,
      daysInMonth: daysInMonth,
      themeCard: { index: monthCard.index, reversed: monthCard.reversed },
      weeks: weeks,
      keyDates: keyDates,
      narrative: MONTHLY_INTROS[introIdx]
    };
  }

  /**
   * Generate a forecast narrative weaving cards and moon phases together
   * @param {Array} cards - Array of card objects
   * @param {Array} moonPhases - Array of moon phase data
   * @returns {string} Cohesive narrative
   */
  function generateForecastNarrative(cards, moonPhases) {
    if (!cards || cards.length === 0) {
      return "The cosmos awaits your inquiry. Draw cards to reveal the narrative of your days ahead.";
    }

    var parts = [];
    parts.push("The celestial currents tell a story of transformation and growth.");

    for (var i = 0; i < Math.min(cards.length, 7); i++) {
      var card = cards[i];
      var cardName = card.name || card.id || ("Card " + (i + 1));
      var moon = moonPhases && moonPhases[i] ? moonPhases[i] : null;

      var cardPhrase = card.reversed ?
        cardName + " (reversed) invites introspection" :
        cardName + " brings forward momentum";

      if (moon) {
        cardPhrase += " under the " + moon.phase.replace("-", " ") + " moon " + (moon.emoji || "");
      }

      if (i > 0) {
        var transIdx = i % NARRATIVE_TRANSITIONS.length;
        parts.push(NARRATIVE_TRANSITIONS[transIdx] + " " + cardPhrase + ".");
      } else {
        parts.push("Your journey begins as " + cardPhrase + ".");
      }
    }

    parts.push("Trust the cosmic rhythm as each day unfolds its unique gifts.");
    return parts.join(" ");
  }

  // Public API
  return {
    getWeeklyForecast: getWeeklyForecast,
    getMonthlyForecast: getMonthlyForecast,
    generateForecastNarrative: generateForecastNarrative,
    DAY_NAMES: DAY_NAMES,
    DAY_THEMES: DAY_THEMES
  };
});

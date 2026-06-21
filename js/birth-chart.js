/**
 * ArcanaX Birth Chart Calculator
 * Provides simplified astrological calculations for sun, moon, and rising signs
 * with tarot card correlations. All local, no external APIs needed.
 */
(function (root, factory) {
  if (typeof define === "function" && define.amd) { define([], factory); }
  else if (typeof module === "object" && module.exports) { module.exports = factory(); }
  else { root.BirthChart = factory(); }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // Zodiac signs with date ranges (month, day)
  var ZODIAC_SIGNS = [
    { sign: "aries", start: [3, 21], end: [4, 19], element: "fire", modality: "cardinal" },
    { sign: "taurus", start: [4, 20], end: [5, 20], element: "earth", modality: "fixed" },
    { sign: "gemini", start: [5, 21], end: [6, 20], element: "air", modality: "mutable" },
    { sign: "cancer", start: [6, 21], end: [7, 22], element: "water", modality: "cardinal" },
    { sign: "leo", start: [7, 23], end: [8, 22], element: "fire", modality: "fixed" },
    { sign: "virgo", start: [8, 23], end: [9, 22], element: "earth", modality: "mutable" },
    { sign: "libra", start: [9, 23], end: [10, 22], element: "air", modality: "cardinal" },
    { sign: "scorpio", start: [10, 23], end: [11, 21], element: "water", modality: "fixed" },
    { sign: "sagittarius", start: [11, 22], end: [12, 21], element: "fire", modality: "mutable" },
    { sign: "capricorn", start: [12, 22], end: [1, 19], element: "earth", modality: "cardinal" },
    { sign: "aquarius", start: [1, 20], end: [2, 18], element: "air", modality: "fixed" },
    { sign: "pisces", start: [2, 19], end: [3, 20], element: "water", modality: "mutable" }
  ];

  // Zodiac to Major Arcana mapping
  var ZODIAC_TAROT_MAP = {
    aries: { card: "the-emperor", meaning: "Leadership, authority, and structural power define your solar essence." },
    taurus: { card: "the-hierophant", meaning: "Tradition, wisdom, and earthly devotion form your core identity." },
    gemini: { card: "the-lovers", meaning: "Choice, duality, and meaningful connection are your soul's themes." },
    cancer: { card: "the-chariot", meaning: "Emotional determination and protective strength drive your spirit." },
    leo: { card: "strength", meaning: "Courage, heart, and gentle power radiate from your being." },
    virgo: { card: "the-hermit", meaning: "Inner wisdom, analysis, and service guide your path." },
    libra: { card: "justice", meaning: "Balance, fairness, and harmonious truth are your guiding principles." },
    scorpio: { card: "death", meaning: "Transformation, depth, and regenerative power define your journey." },
    sagittarius: { card: "temperance", meaning: "Exploration, synthesis, and philosophical growth expand your horizons." },
    capricorn: { card: "the-devil", meaning: "Ambition, mastery of material, and breaking free from limitation shape you." },
    aquarius: { card: "the-star", meaning: "Innovation, hope, and humanitarian vision illuminate your purpose." },
    pisces: { card: "the-moon", meaning: "Intuition, dreams, and spiritual depth flow through your soul." }
  };

  // Sign descriptions for readings
  var SIGN_DESCRIPTIONS = {
    aries: "Bold, pioneering, and action-oriented. You lead with courage and instinct.",
    taurus: "Steady, sensual, and devoted. You build with patience and appreciate beauty.",
    gemini: "Curious, communicative, and adaptable. You connect ideas and people effortlessly.",
    cancer: "Nurturing, intuitive, and protective. You feel deeply and care fiercely.",
    leo: "Creative, generous, and magnetic. You shine with warmth and inspire others.",
    virgo: "Analytical, helpful, and precise. You improve everything you touch with care.",
    libra: "Harmonious, diplomatic, and aesthetic. You seek balance and create beauty.",
    scorpio: "Intense, perceptive, and transformative. You see beneath surfaces and regenerate.",
    sagittarius: "Adventurous, optimistic, and philosophical. You seek truth and expand horizons.",
    capricorn: "Ambitious, disciplined, and responsible. You build lasting structures with determination.",
    aquarius: "Innovative, humanitarian, and independent. You envision a better future for all.",
    pisces: "Compassionate, imaginative, and spiritual. You dissolve boundaries and heal through empathy."
  };

  /**
   * Calculate sun sign from birth date
   */
  function calculateSunSign(birthDate) {
    var date = new Date(birthDate);
    var month = date.getMonth() + 1; // 1-based
    var day = date.getDate();

    for (var i = 0; i < ZODIAC_SIGNS.length; i++) {
      var z = ZODIAC_SIGNS[i];
      var startMonth = z.start[0];
      var startDay = z.start[1];
      var endMonth = z.end[0];
      var endDay = z.end[1];

      // Handle Capricorn which spans year boundary
      if (startMonth > endMonth) {
        if ((month === startMonth && day >= startDay) || (month === endMonth && day <= endDay)) {
          return z.sign;
        }
      } else {
        if ((month === startMonth && day >= startDay) || (month === endMonth && day <= endDay) ||
            (month > startMonth && month < endMonth)) {
          return z.sign;
        }
      }
    }
    return "capricorn"; // fallback for Dec 22-31
  }

  /**
   * Approximate moon sign using simplified lunar calculation
   * The moon moves through each sign in about 2.5 days (27.3 day cycle / 12 signs)
   * This is a simplified approximation - not astronomically precise
   */
  function calculateMoonSign(birthDate, birthTime) {
    var date = new Date(birthDate);
    if (birthTime) {
      var parts = birthTime.split(":");
      date.setHours(parseInt(parts[0]) || 0, parseInt(parts[1]) || 0);
    }

    // Reference: Known new moon in Aries on March 21, 2000
    var refDate = new Date(2000, 2, 21, 0, 0, 0);
    var diffMs = date.getTime() - refDate.getTime();
    var diffDays = diffMs / (1000 * 60 * 60 * 24);

    // Moon's sidereal period is ~27.322 days
    var moonCyclePosition = ((diffDays % 27.322) + 27.322) % 27.322;
    // Each sign spans ~2.277 days
    var signIndex = Math.floor(moonCyclePosition / 2.277) % 12;

    return ZODIAC_SIGNS[signIndex].sign;
  }

  /**
   * Approximate rising sign (ascendant) based on birth time
   * The rising sign changes roughly every 2 hours through the zodiac
   * Starting from the sun sign position at sunrise (~6am)
   */
  function calculateRisingSign(birthDate, birthTime) {
    if (!birthTime) return null;

    var sunSign = calculateSunSign(birthDate);
    var sunIndex = ZODIAC_SIGNS.findIndex(function (z) { return z.sign === sunSign; });

    var parts = birthTime.split(":");
    var hours = parseInt(parts[0]) || 0;
    var minutes = parseInt(parts[1]) || 0;
    var totalMinutes = hours * 60 + minutes;

    // At sunrise (approx 6:00), the rising sign equals the sun sign
    // It advances one sign every ~2 hours
    var minutesSinceSunrise = ((totalMinutes - 360) + 1440) % 1440;
    var signsAdvanced = Math.floor(minutesSinceSunrise / 120);

    var risingIndex = (sunIndex + signsAdvanced) % 12;
    return ZODIAC_SIGNS[risingIndex].sign;
  }

  /**
   * Get tarot correlation for a zodiac sign
   */
  function getSignTarotCard(sign) {
    return ZODIAC_TAROT_MAP[sign] || null;
  }

  /**
   * Map zodiac signs to Major Arcana and provide combined reading
   */
  function getBirthChartTarotCorrelation(sunSign, moonSign, risingSign) {
    var sunCard = ZODIAC_TAROT_MAP[sunSign] || ZODIAC_TAROT_MAP.aries;
    var moonCard = moonSign ? (ZODIAC_TAROT_MAP[moonSign] || null) : null;
    var risingCard = risingSign ? (ZODIAC_TAROT_MAP[risingSign] || null) : null;

    var correlation = {
      sun: {
        sign: sunSign,
        card: sunCard.card,
        meaning: sunCard.meaning,
        description: SIGN_DESCRIPTIONS[sunSign] || "",
        role: "Your core identity and conscious self"
      },
      moon: moonSign ? {
        sign: moonSign,
        card: moonCard ? moonCard.card : null,
        meaning: moonCard ? moonCard.meaning : "",
        description: SIGN_DESCRIPTIONS[moonSign] || "",
        role: "Your emotional nature and inner world"
      } : null,
      rising: risingSign ? {
        sign: risingSign,
        card: risingCard ? risingCard.card : null,
        meaning: risingCard ? risingCard.meaning : "",
        description: SIGN_DESCRIPTIONS[risingSign] || "",
        role: "How the world sees you and your outward approach"
      } : null,
      combinedReading: ""
    };

    // Generate combined reading
    var reading = "Your Sun in " + capitalizeFirst(sunSign) + " (" + sunCard.card.replace(/-/g, " ") + ") reveals your core self: " + sunCard.meaning;

    if (moonSign && moonCard) {
      reading += " Your Moon in " + capitalizeFirst(moonSign) + " (" + moonCard.card.replace(/-/g, " ") + ") shows your emotional depths: " + moonCard.meaning;
    }

    if (risingSign && risingCard) {
      reading += " Your Rising in " + capitalizeFirst(risingSign) + " (" + risingCard.card.replace(/-/g, " ") + ") reveals your outer face: " + risingCard.meaning;
    }

    // Add element analysis
    var elements = [getSignElement(sunSign)];
    if (moonSign) elements.push(getSignElement(moonSign));
    if (risingSign) elements.push(getSignElement(risingSign));

    var elementCounts = {};
    elements.forEach(function (el) { elementCounts[el] = (elementCounts[el] || 0) + 1; });
    var dominant = Object.keys(elementCounts).sort(function (a, b) { return elementCounts[b] - elementCounts[a]; })[0];

    reading += " Your chart is dominated by " + dominant + " energy, suggesting " +
      (dominant === "fire" ? "a passionate, action-oriented nature" :
       dominant === "water" ? "deep emotional intelligence and intuitive gifts" :
       dominant === "earth" ? "practical wisdom and material mastery" :
       "intellectual brilliance and communicative power") + ".";

    correlation.combinedReading = reading;
    correlation.dominantElement = dominant;

    return correlation;
  }

  /**
   * Generate a full natal tarot reading from birth data
   */
  function generateNatalReading(birthData) {
    var birthDate = birthData.date || birthData.birthDate;
    var birthTime = birthData.time || birthData.birthTime || null;

    var sunSign = calculateSunSign(birthDate);
    var moonSign = calculateMoonSign(birthDate, birthTime);
    var risingSign = birthTime ? calculateRisingSign(birthDate, birthTime) : null;

    var correlation = getBirthChartTarotCorrelation(sunSign, moonSign, risingSign);

    // Generate life path insights
    var lifeThemes = generateLifeThemes(sunSign, moonSign, risingSign);

    return {
      birthData: {
        date: birthDate instanceof Date ? birthDate.toISOString().split("T")[0] : String(birthDate),
        time: birthTime || "unknown",
        place: birthData.place || birthData.birthPlace || "not specified"
      },
      signs: {
        sun: sunSign,
        moon: moonSign,
        rising: risingSign
      },
      tarotCorrelation: correlation,
      lifeThemes: lifeThemes,
      personalCards: getPersonalCards(sunSign, moonSign, risingSign),
      generatedAt: new Date().toISOString()
    };
  }

  function generateLifeThemes(sunSign, moonSign, risingSign) {
    var themes = [];

    // Sun theme - core purpose
    var sunEl = getSignElement(sunSign);
    themes.push({
      area: "Life Purpose",
      insight: "With your Sun in " + capitalizeFirst(sunSign) + ", your purpose revolves around " +
        (sunEl === "fire" ? "creative expression, leadership, and inspiring others through bold action" :
         sunEl === "water" ? "emotional healing, nurturing connections, and understanding the human heart" :
         sunEl === "earth" ? "building lasting structures, creating material security, and grounding spiritual wisdom" :
         "sharing knowledge, facilitating communication, and bringing new ideas to life")
    });

    // Moon theme - emotional needs
    if (moonSign) {
      var moonEl = getSignElement(moonSign);
      themes.push({
        area: "Emotional Needs",
        insight: "Your Moon in " + capitalizeFirst(moonSign) + " means you feel most nourished when " +
          (moonEl === "fire" ? "you have freedom to act spontaneously and express passion" :
           moonEl === "water" ? "you feel emotionally safe and deeply connected to loved ones" :
           moonEl === "earth" ? "your environment is stable, comfortable, and your senses are satisfied" :
           "you can process experiences through conversation and intellectual exploration")
      });
    }

    // Rising theme - life approach
    if (risingSign) {
      var risingEl = getSignElement(risingSign);
      themes.push({
        area: "Life Approach",
        insight: "With " + capitalizeFirst(risingSign) + " rising, you approach new situations with " +
          (risingEl === "fire" ? "enthusiasm, confidence, and a desire to take charge" :
           risingEl === "water" ? "sensitivity, intuition, and emotional awareness" :
           risingEl === "earth" ? "caution, practicality, and a grounded presence" :
           "curiosity, sociability, and an analytical mindset")
      });
    }

    return themes;
  }

  function getPersonalCards(sunSign, moonSign, risingSign) {
    var cards = [];
    var sunTarot = ZODIAC_TAROT_MAP[sunSign];
    if (sunTarot) cards.push({ cardId: sunTarot.card, role: "Sun Card - Core Identity" });

    if (moonSign) {
      var moonTarot = ZODIAC_TAROT_MAP[moonSign];
      if (moonTarot) cards.push({ cardId: moonTarot.card, role: "Moon Card - Emotional Self" });
    }

    if (risingSign) {
      var risingTarot = ZODIAC_TAROT_MAP[risingSign];
      if (risingTarot) cards.push({ cardId: risingTarot.card, role: "Rising Card - Outer Self" });
    }

    return cards;
  }

  function getSignElement(sign) {
    var found = ZODIAC_SIGNS.find(function (z) { return z.sign === sign; });
    return found ? found.element : "fire";
  }

  function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  return {
    calculateSunSign: calculateSunSign,
    calculateMoonSign: calculateMoonSign,
    calculateRisingSign: calculateRisingSign,
    getBirthChartTarotCorrelation: getBirthChartTarotCorrelation,
    generateNatalReading: generateNatalReading,
    getSignTarotCard: getSignTarotCard
  };
});

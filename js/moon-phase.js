/**
 * ArcanaX Moon Phase Engine
 * Pure astronomical algorithm for calculating moon phases.
 * No API calls - all math-based.
 */
(function (root, factory) {
  if (typeof define === "function" && define.amd) { define([], factory); }
  else if (typeof module === "object" && module.exports) { module.exports = factory(); }
  else { root.MoonPhase = factory(); }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // Known new moon reference: January 6, 2000 at 18:14 UTC
  var KNOWN_NEW_MOON = new Date(Date.UTC(2000, 0, 6, 18, 14, 0));
  var SYNODIC_MONTH = 29.53058770576; // Average synodic month in days
  var MS_PER_DAY = 86400000;

  // Moon phase names and their ranges (in days of the cycle)
  // "new" phase wraps around the cycle boundary (end of cycle + start)
  var PHASE_NAMES = [
    { name: "new", emoji: "\uD83C\uDF11", start: 0, end: 1.84566 },
    { name: "waxing-crescent", emoji: "\uD83C\uDF12", start: 1.84566, end: 7.38264 },
    { name: "first-quarter", emoji: "\uD83C\uDF13", start: 7.38264, end: 11.07396 },
    { name: "waxing-gibbous", emoji: "\uD83C\uDF14", start: 11.07396, end: 14.76528 },
    { name: "full", emoji: "\uD83C\uDF15", start: 14.76528, end: 16.61094 },
    { name: "waning-gibbous", emoji: "\uD83C\uDF16", start: 16.61094, end: 22.14792 },
    { name: "last-quarter", emoji: "\uD83C\uDF17", start: 22.14792, end: 25.83924 },
    { name: "waning-crescent", emoji: "\uD83C\uDF18", start: 25.83924, end: 28.53059 }
  ];
  // Anything above 28.53 days is considered "new" (approaching conjunction)

  // Tarot guidance per moon phase
  var MOON_GUIDANCE = {
    "new": {
      title: "New Moon - New Beginnings",
      guidance: "Set intentions and plant seeds for what you wish to manifest. Draw cards for new projects, fresh starts, and hidden potential. The Fool and Ace cards resonate strongly.",
      energy: "initiation",
      favoredCards: ["the-fool", "the-magician", "ace-of-wands", "ace-of-cups", "ace-of-swords", "ace-of-pentacles"]
    },
    "waxing-crescent": {
      title: "Waxing Crescent - Building Momentum",
      guidance: "Take first steps toward your intentions. Draw cards for motivation, early challenges, and building confidence. The energy supports courage and faith.",
      energy: "growth",
      favoredCards: ["the-chariot", "three-of-wands", "page-of-wands", "knight-of-wands"]
    },
    "first-quarter": {
      title: "First Quarter - Decision Point",
      guidance: "Challenges arise that test your commitment. Draw cards for obstacles, decisions, and perseverance. Strength and determination are rewarded.",
      energy: "action",
      favoredCards: ["strength", "seven-of-wands", "justice", "two-of-swords"]
    },
    "waxing-gibbous": {
      title: "Waxing Gibbous - Refinement",
      guidance: "Adjust and refine your approach. Draw cards for patience, detail work, and trust in the process. Near-completion energy flows.",
      energy: "refinement",
      favoredCards: ["temperance", "the-hermit", "eight-of-pentacles", "nine-of-pentacles"]
    },
    "full": {
      title: "Full Moon - Illumination",
      guidance: "Peak energy and revelation. Draw cards for clarity, completion, celebration, and what is now fully visible. Emotions run high - honor them.",
      energy: "culmination",
      favoredCards: ["the-moon", "the-sun", "the-world", "ten-of-cups", "the-star"]
    },
    "waning-gibbous": {
      title: "Waning Gibbous - Gratitude",
      guidance: "Share what you have learned. Draw cards for teaching, gratitude, and generosity. The energy supports giving back and integration.",
      energy: "sharing",
      favoredCards: ["the-hierophant", "six-of-pentacles", "king-of-cups", "queen-of-pentacles"]
    },
    "last-quarter": {
      title: "Last Quarter - Release",
      guidance: "Let go of what no longer serves you. Draw cards for forgiveness, closure, and release. Clear space for the next cycle.",
      energy: "release",
      favoredCards: ["death", "the-tower", "ten-of-swords", "eight-of-cups"]
    },
    "waning-crescent": {
      title: "Waning Crescent - Rest",
      guidance: "Surrender to stillness and introspection. Draw cards for dreams, healing, and preparation. The veil is thin - trust your intuition.",
      energy: "rest",
      favoredCards: ["the-high-priestess", "four-of-swords", "the-hanged-man", "the-hermit"]
    }
  };

  /**
   * Calculate moon age (days since last new moon) for a given date
   */
  function getMoonAge(date) {
    var d = date instanceof Date ? date : new Date(date);
    var diffMs = d.getTime() - KNOWN_NEW_MOON.getTime();
    var diffDays = diffMs / MS_PER_DAY;
    var age = diffDays % SYNODIC_MONTH;
    if (age < 0) age += SYNODIC_MONTH;
    return age;
  }

  /**
   * Get moon phase information for a specific date
   */
  function getMoonPhase(date) {
    var d = date instanceof Date ? date : new Date(date);
    var age = getMoonAge(d);

    // Determine phase name
    // Ages >= 28.53 wrap to "new" (approaching conjunction)
    var phase = PHASE_NAMES[0]; // default to "new" (handles wrap-around)
    if (age < 28.53059) {
      for (var i = 0; i < PHASE_NAMES.length; i++) {
        if (age >= PHASE_NAMES[i].start && age < PHASE_NAMES[i].end) {
          phase = PHASE_NAMES[i];
          break;
        }
      }
    }

    // Calculate illumination (0 at new, 1 at full)
    var illumination = (1 - Math.cos(2 * Math.PI * age / SYNODIC_MONTH)) / 2;

    return {
      phase: phase.name,
      emoji: phase.emoji,
      age: age,
      illumination: Math.round(illumination * 1000) / 1000,
      date: d.toISOString().split("T")[0],
      synodicMonth: SYNODIC_MONTH
    };
  }

  /**
   * Get moon phases for an entire month
   */
  function getMoonPhaseForMonth(year, month) {
    var results = [];
    var daysInMonth = new Date(year, month, 0).getDate();
    for (var day = 1; day <= daysInMonth; day++) {
      var d = new Date(year, month - 1, day, 12, 0, 0);
      results.push(getMoonPhase(d));
    }
    return results;
  }

  /**
   * Get tarot-specific guidance for a moon phase
   */
  function getTarotMoonGuidance(phase) {
    return MOON_GUIDANCE[phase] || MOON_GUIDANCE["new"];
  }

  /**
   * Find the next full moon from a given date
   */
  function getNextFullMoon(fromDate) {
    var d = fromDate instanceof Date ? fromDate : new Date(fromDate || Date.now());
    var age = getMoonAge(d);
    var fullMoonAge = SYNODIC_MONTH / 2; // Full moon at half cycle
    var daysUntilFull;

    if (age < fullMoonAge) {
      daysUntilFull = fullMoonAge - age;
    } else {
      daysUntilFull = (SYNODIC_MONTH - age) + fullMoonAge;
    }

    var nextFull = new Date(d.getTime() + daysUntilFull * MS_PER_DAY);
    return {
      date: nextFull.toISOString().split("T")[0],
      daysUntil: Math.round(daysUntilFull * 10) / 10
    };
  }

  /**
   * Find the next new moon from a given date
   */
  function getNextNewMoon(fromDate) {
    var d = fromDate instanceof Date ? fromDate : new Date(fromDate || Date.now());
    var age = getMoonAge(d);
    var daysUntilNew = SYNODIC_MONTH - age;

    if (daysUntilNew < 0.5) {
      daysUntilNew += SYNODIC_MONTH;
    }

    var nextNew = new Date(d.getTime() + daysUntilNew * MS_PER_DAY);
    return {
      date: nextNew.toISOString().split("T")[0],
      daysUntil: Math.round(daysUntilNew * 10) / 10
    };
  }

  // Public API
  return {
    getMoonPhase: getMoonPhase,
    getMoonPhaseForMonth: getMoonPhaseForMonth,
    getTarotMoonGuidance: getTarotMoonGuidance,
    getNextFullMoon: getNextFullMoon,
    getNextNewMoon: getNextNewMoon,
    SYNODIC_MONTH: SYNODIC_MONTH
  };
});

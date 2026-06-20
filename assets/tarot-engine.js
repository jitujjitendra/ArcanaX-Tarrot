/**
 * ArcanaX Tarot Engine v1.0.0
 * A complete tarot reading engine for the ArcanaX Cosmic Destiny platform.
 * 
 * Features:
 * - Full 78-card deck (22 Major Arcana + 56 Minor Arcana)
 * - Fisher-Yates shuffle with cryptographic randomness
 * - Configurable reversed card probability
 * - Multiple spread types (Single, Three-Card, Relationship, Celtic Cross)
 * - Date-seeded daily card selection
 * - Rich interpretation generation with positional context
 * - Celtic Cross positional meanings
 * - Cosmic/mystical tone throughout
 */

(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.ArcanaXEngine = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // ============================================================
  // CONFIGURATION
  // ============================================================

  const CONFIG = {
    reversedProbability: 0.30, // 30% chance a drawn card is reversed
    dailySeedBase: 7919,       // Prime number seed base for daily draws
    version: "1.0.0"
  };

  // ============================================================
  // CELTIC CROSS POSITIONAL MEANINGS
  // ============================================================

  const CELTIC_CROSS_POSITIONS = [
    {
      index: 0,
      name: "Present Situation",
      meaning: "The heart of the matter. This card represents the central energy or issue surrounding your question right now.",
      prompt: "At the center of your cosmic map"
    },
    {
      index: 1,
      name: "Immediate Challenge",
      meaning: "What crosses you. This is the primary obstacle, opposition, or complementary force acting upon the situation.",
      prompt: "Crossing your path like a celestial gate"
    },
    {
      index: 2,
      name: "Distant Past",
      meaning: "The root beneath. Deep foundations and past events that created the ground you now stand upon.",
      prompt: "From the deep roots of your timeline"
    },
    {
      index: 3,
      name: "Recent Past",
      meaning: "What is passing away. Recent events and energies that are fading but still influence the present moment.",
      prompt: "Echoing from your recent past"
    },
    {
      index: 4,
      name: "Best Possible Outcome",
      meaning: "The crown of possibility. The highest potential outcome if all energies align in your favor.",
      prompt: "Crowning you as the highest possibility"
    },
    {
      index: 5,
      name: "Immediate Future",
      meaning: "What approaches. The energy moving toward you in the near term, already set in motion by current forces.",
      prompt: "Approaching you from the near horizon"
    },
    {
      index: 6,
      name: "Your Approach",
      meaning: "How you see yourself. Your attitude, approach, and self-perception within this situation.",
      prompt: "Reflecting your own inner stance"
    },
    {
      index: 7,
      name: "External Influences",
      meaning: "Your environment. How others see you, external pressures, and forces beyond your direct control.",
      prompt: "Surrounding you from the external realm"
    },
    {
      index: 8,
      name: "Hopes and Fears",
      meaning: "The edge between desire and dread. What you most hope for often mirrors what you most fear.",
      prompt: "Dancing between your hopes and fears"
    },
    {
      index: 9,
      name: "Final Outcome",
      meaning: "The culmination. Where this path leads given current energies, choices, and cosmic alignments.",
      prompt: "Revealing itself as your cosmic destination"
    }
  ];

  // ============================================================
  // SPREAD DEFINITIONS
  // ============================================================

  const SPREADS = {
    single: {
      id: "single",
      name: "Single Card",
      cardCount: 1,
      positions: ["Present Energy"],
      description: "A focused pull for immediate guidance on the energy surrounding you right now.",
      cosmicIntro: "The cosmos distills its wisdom into a single revelation..."
    },
    "three-card": {
      id: "three-card",
      name: "Three Card Spread",
      cardCount: 3,
      positions: ["Past", "Present", "Future"],
      description: "The classic timeline spread revealing where you have been, where you are, and where the cosmic current carries you.",
      cosmicIntro: "Past, Present, and Future align in the cosmic mirror..."
    },
    relationship: {
      id: "relationship",
      name: "Relationship Spread",
      cardCount: 5,
      positions: ["You", "The Other", "The Connection", "The Challenge", "The Potential"],
      description: "Illuminates the dynamics between two souls, revealing hidden currents and possible futures.",
      cosmicIntro: "Two souls reflected in the starlight, their threads weaving together..."
    },
    "celtic-cross": {
      id: "celtic-cross",
      name: "Celtic Cross",
      cardCount: 10,
      positions: CELTIC_CROSS_POSITIONS.map(function (p) { return p.name; }),
      description: "The grand spread of Western tarot tradition. Ten cards revealing the full landscape of your question with cosmic depth and nuance.",
      cosmicIntro: "The ancient cross unfolds across the fabric of your destiny..."
    }
  };

  // ============================================================
  // UTILITY FUNCTIONS
  // ============================================================

  /**
   * Fisher-Yates (Knuth) shuffle algorithm.
   * Uses crypto.getRandomValues when available for better randomness.
   * @param {Array} array - Array to shuffle (mutates in place)
   * @returns {Array} The shuffled array
   */
  function fisherYatesShuffle(array) {
    var m = array.length;
    var t, i;

    while (m) {
      // Pick a remaining element
      if (typeof crypto !== "undefined" && crypto.getRandomValues) {
        var randomArray = new Uint32Array(1);
        crypto.getRandomValues(randomArray);
        i = randomArray[0] % m;
      } else {
        i = Math.floor(Math.random() * m);
      }
      m--;

      // Swap
      t = array[m];
      array[m] = array[i];
      array[i] = t;
    }

    return array;
  }

  /**
   * Simple seeded pseudo-random number generator (mulberry32).
   * Used for deterministic daily card draws.
   * @param {number} seed
   * @returns {function} A function that returns a pseudo-random number [0, 1)
   */
  function seededRandom(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /**
   * Generate a numeric seed from a date string.
   * @param {string|Date} date
   * @returns {number}
   */
  function dateSeed(date) {
    var d = date instanceof Date ? date : new Date(date);
    var day = d.getDate();
    var month = d.getMonth() + 1;
    var year = d.getFullYear();
    return (year * 10000 + month * 100 + day) ^ CONFIG.dailySeedBase;
  }

  // ============================================================
  // DECK MANAGEMENT
  // ============================================================

  var _deckData = null;
  var _fullDeck = null;

  /**
   * Load the deck from the JSON file or accept it directly.
   * @param {Object|string} source - Deck JSON object or URL to fetch
   * @returns {Promise<Object>} The loaded deck
   */
  function loadDeck(source) {
    if (typeof source === "object" && source !== null) {
      _deckData = source;
      _fullDeck = buildFullDeck(source);
      return Promise.resolve(_deckData);
    }

    // Fetch from URL
    var url = typeof source === "string" ? source : "assets/tarot-deck.json";
    return fetch(url)
      .then(function (response) {
        if (!response.ok) throw new Error("Failed to load deck: " + response.status);
        return response.json();
      })
      .then(function (data) {
        _deckData = data;
        _fullDeck = buildFullDeck(data);
        return _deckData;
      });
  }

  /**
   * Build a flat array of all 78 cards from the deck data.
   * @param {Object} data - Raw deck JSON
   * @returns {Array} Flat array of card objects
   */
  function buildFullDeck(data) {
    var cards = [];

    // Add Major Arcana
    if (data.majorArcana) {
      data.majorArcana.forEach(function (card) {
        cards.push(Object.assign({}, card, { arcana: "major" }));
      });
    }

    // Add Minor Arcana
    if (data.minorArcana) {
      data.minorArcana.forEach(function (card) {
        cards.push(Object.assign({}, card, { arcana: "minor" }));
      });
    }

    return cards;
  }

  /**
   * Get the full deck as a flat array.
   * @returns {Array|null}
   */
  function getDeck() {
    return _fullDeck ? _fullDeck.slice() : null;
  }

  /**
   * Get a specific card by ID.
   * @param {string} id
   * @returns {Object|null}
   */
  function getCardById(id) {
    if (!_fullDeck) return null;
    for (var i = 0; i < _fullDeck.length; i++) {
      if (_fullDeck[i].id === id) return Object.assign({}, _fullDeck[i]);
    }
    return null;
  }

  // ============================================================
  // DRAWING CARDS
  // ============================================================

  /**
   * Draw cards from a shuffled deck.
   * @param {number} count - Number of cards to draw
   * @param {Object} [options] - Drawing options
   * @param {number} [options.reversedProbability] - Override default reversed probability
   * @param {Array} [options.excludeIds] - Card IDs to exclude from the draw
   * @returns {Array} Array of drawn card objects with `reversed` boolean
   */
  function drawCards(count, options) {
    if (!_fullDeck) {
      throw new Error("Deck not loaded. Call loadDeck() first.");
    }

    var opts = options || {};
    var reversedProb = typeof opts.reversedProbability === "number"
      ? opts.reversedProbability
      : CONFIG.reversedProbability;
    var excludeIds = opts.excludeIds || [];

    // Create a working copy excluding specified cards
    var available = _fullDeck.filter(function (card) {
      return excludeIds.indexOf(card.id) === -1;
    });

    // Shuffle
    fisherYatesShuffle(available);

    // Draw the specified count
    var drawn = available.slice(0, Math.min(count, available.length));

    // Determine reversed status for each card
    return drawn.map(function (card) {
      var isReversed;
      if (typeof crypto !== "undefined" && crypto.getRandomValues) {
        var arr = new Uint32Array(1);
        crypto.getRandomValues(arr);
        isReversed = (arr[0] / 4294967296) < reversedProb;
      } else {
        isReversed = Math.random() < reversedProb;
      }

      return Object.assign({}, card, { reversed: isReversed });
    });
  }

  /**
   * Draw a daily card seeded by date. Same date always yields same card.
   * @param {Date|string} [date] - Date to use (defaults to today)
   * @returns {Object} Card object with reversed status
   */
  function drawDailyCard(date) {
    if (!_fullDeck) {
      throw new Error("Deck not loaded. Call loadDeck() first.");
    }

    var d = date || new Date();
    var seed = dateSeed(d);
    var rng = seededRandom(seed);

    // Select card deterministically
    var cardIndex = Math.floor(rng() * _fullDeck.length);
    var card = Object.assign({}, _fullDeck[cardIndex]);

    // Determine reversed status deterministically
    card.reversed = rng() < CONFIG.reversedProbability;

    return card;
  }

  // ============================================================
  // SPREAD READING
  // ============================================================

  /**
   * Perform a full spread reading.
   * @param {string} spreadType - One of: 'single', 'three-card', 'relationship', 'celtic-cross'
   * @param {Object} [options] - Options passed to drawCards
   * @returns {Object} Reading result with cards, interpretations, and summary
   */
  function performReading(spreadType, options) {
    var spread = SPREADS[spreadType];
    if (!spread) {
      throw new Error("Unknown spread type: " + spreadType + ". Available: " + Object.keys(SPREADS).join(", "));
    }

    var cards = drawCards(spread.cardCount, options);

    var positions = cards.map(function (card, index) {
      var positionName = spread.positions[index];
      var positionalContext = spreadType === "celtic-cross"
        ? CELTIC_CROSS_POSITIONS[index]
        : { name: positionName, prompt: "In the position of " + positionName };

      return {
        position: positionName,
        positionalMeaning: positionalContext.meaning || null,
        card: card,
        interpretation: generateInterpretation(card, positionalContext, spreadType)
      };
    });

    return {
      spread: spread,
      timestamp: new Date().toISOString(),
      positions: positions,
      summary: generateReadingSummary(positions, spread),
      cosmicIntro: spread.cosmicIntro
    };
  }

  // ============================================================
  // INTERPRETATION ENGINE
  // ============================================================

  /**
   * Generate a rich interpretation for a card in its positional context.
   * @param {Object} card - The drawn card
   * @param {Object} position - Positional context
   * @param {string} spreadType - The type of spread
   * @returns {string} Generated interpretation
   */
  function generateInterpretation(card, position, spreadType) {
    var meaning = card.reversed ? card.reversed : card.upright;
    // If upright/reversed are stored as string properties on the card
    if (typeof meaning !== "string") {
      meaning = card.reversed ? "Reversed energy flows through this position." : "Upright energy illuminates this position.";
    }

    var direction = card.reversed ? "reversed" : "upright";
    var keywords = card.keywords || [];
    var element = card.element || "";

    // Build contextual interpretation
    var parts = [];

    // Opening with positional context
    if (position && position.prompt) {
      parts.push(position.prompt + ", " + card.name + " appears " + direction + ".");
    } else {
      parts.push(card.name + " reveals itself " + direction + ".");
    }

    // Core meaning
    parts.push(meaning);

    // Keyword resonance
    if (keywords.length > 2) {
      var selectedKeywords = fisherYatesShuffle(keywords.slice()).slice(0, 3);
      parts.push("The cosmic threads of " + selectedKeywords.join(", ") + " weave through this moment.");
    }

    // Elemental wisdom
    if (element && _deckData && _deckData.elementGuidance && _deckData.elementGuidance[element]) {
      parts.push("Elemental guidance (" + element + "): " + _deckData.elementGuidance[element]);
    }

    return parts.join(" ");
  }

  /**
   * Generate a holistic reading summary across all positions.
   * @param {Array} positions - Array of position results
   * @param {Object} spread - Spread definition
   * @returns {string} Summary narrative
   */
  function generateReadingSummary(positions, spread) {
    var majorCount = 0;
    var elements = {};
    var reversedCount = 0;
    var suits = {};

    positions.forEach(function (pos) {
      var card = pos.card;
      if (card.arcana === "major") majorCount++;
      if (card.reversed) reversedCount++;
      if (card.element) {
        elements[card.element] = (elements[card.element] || 0) + 1;
      }
      if (card.suit) {
        suits[card.suit] = (suits[card.suit] || 0) + 1;
      }
    });

    var parts = [];

    // Overall energy assessment
    if (majorCount > positions.length / 2) {
      parts.push("This reading is dominated by Major Arcana energy, signaling profound karmic forces and major life themes at play. The universe speaks loudly through these cards.");
    } else if (majorCount === 0 && positions.length > 1) {
      parts.push("All Minor Arcana cards suggest this situation is within your direct influence. Daily choices and practical actions shape this outcome more than fate.");
    }

    // Reversed ratio insight
    if (reversedCount > positions.length * 0.6) {
      parts.push("A high number of reversed cards indicates internal work needed. The energy is turned inward - this is a time of reflection, shadow integration, and honest self-examination.");
    } else if (reversedCount === 0 && positions.length > 2) {
      parts.push("All cards appear upright, suggesting clear and flowing energy. The path forward is relatively unobstructed - trust the momentum.");
    }

    // Dominant element
    var dominantElement = null;
    var maxElementCount = 0;
    Object.keys(elements).forEach(function (el) {
      if (elements[el] > maxElementCount) {
        maxElementCount = elements[el];
        dominantElement = el;
      }
    });

    if (dominantElement && maxElementCount > 1) {
      var elementMessages = {
        fire: "Fire dominates this reading - passion, action, and creative force are your primary allies. Move boldly.",
        water: "Water flows through this reading - emotions, intuition, and heart-connections are central. Trust what you feel.",
        air: "Air sweeps through this reading - mental clarity, communication, and truth-seeking guide your path. Think clearly.",
        earth: "Earth grounds this reading - practical matters, material concerns, and patient building are highlighted. Act tangibly."
      };
      if (elementMessages[dominantElement]) {
        parts.push(elementMessages[dominantElement]);
      }
    }

    // Dominant suit
    var dominantSuit = null;
    var maxSuitCount = 0;
    Object.keys(suits).forEach(function (s) {
      if (suits[s] > maxSuitCount) {
        maxSuitCount = suits[s];
        dominantSuit = s;
      }
    });

    if (dominantSuit && maxSuitCount > 1) {
      var suitMessages = {
        cups: "The Cups remind you that emotional truth and authentic connection are your compass now.",
        pentacles: "The Pentacles ground you in material reality - tend to practical matters with dedication.",
        swords: "The Swords call for mental clarity and honest communication - face truth without flinching.",
        wands: "The Wands ignite your creative spirit - channel passion into purposeful action."
      };
      if (suitMessages[dominantSuit]) {
        parts.push(suitMessages[dominantSuit]);
      }
    }

    // Closing cosmic wisdom
    var closings = [
      "The stars have spoken. Let their wisdom settle into your being before acting.",
      "Remember: these cards reflect the current energetic landscape, not an unchangeable fate. You hold the power to dance with destiny.",
      "The cosmos offers guidance, never commandment. Integrate what resonates, release what does not serve your highest path.",
      "Trust the reading as a mirror of your deeper knowing. The answers were always within - the cards simply give them voice."
    ];
    var closingIndex = positions.length % closings.length;
    parts.push(closings[closingIndex]);

    return parts.join("\n\n");
  }

  // ============================================================
  // DAILY DESTINY
  // ============================================================

  /**
   * Generate a complete daily destiny reading.
   * @param {Date|string} [date] - Date to use (defaults to today)
   * @returns {Object} Daily reading with card, message, and affirmation
   */
  function dailyDestiny(date) {
    var card = drawDailyCard(date);
    var direction = card.reversed ? "reversed" : "upright";
    var meaning = card.reversed ? card.reversed : card.upright;

    // Generate a cosmic daily message
    var dayOfWeek = (date instanceof Date ? date : new Date(date || Date.now())).getDay();
    var dayEnergies = [
      "Sunday brings solar clarity",
      "Monday channels lunar intuition",
      "Tuesday ignites martial courage",
      "Wednesday sharpens mercurial wit",
      "Thursday expands jovial wisdom",
      "Friday deepens venusian love",
      "Saturday demands saturnian discipline"
    ];

    var affirmations = [
      "I am aligned with the cosmic flow and trust my path.",
      "Today I embrace transformation with open arms.",
      "My intuition guides me truly through all uncertainty.",
      "I create my reality through conscious intention.",
      "The universe conspires in my favor when I move with authenticity.",
      "I release what no longer serves and welcome what empowers.",
      "My inner fire illuminates the path for myself and others."
    ];

    var seed = dateSeed(date || new Date());
    var rng = seededRandom(seed + 42); // Offset seed for affirmation selection
    var affirmationIndex = Math.floor(rng() * affirmations.length);

    return {
      date: (date instanceof Date ? date : new Date(date || Date.now())).toISOString().split("T")[0],
      card: card,
      direction: direction,
      message: dayEnergies[dayOfWeek] + ". " + card.name + " (" + direction + ") guides your cosmic journey today. " + meaning,
      affirmation: affirmations[affirmationIndex],
      element: card.element,
      keywords: card.keywords || [],
      essence: card.essence || ""
    };
  }

  // ============================================================
  // PUBLIC API
  // ============================================================

  return {
    // Core
    version: CONFIG.version,
    loadDeck: loadDeck,
    getDeck: getDeck,
    getCardById: getCardById,

    // Drawing
    drawCards: drawCards,
    drawDailyCard: drawDailyCard,

    // Readings
    performReading: performReading,
    dailyDestiny: dailyDestiny,

    // Spreads & Positions
    spreads: SPREADS,
    celticCrossPositions: CELTIC_CROSS_POSITIONS,

    // Utilities
    shuffle: fisherYatesShuffle,

    // Configuration
    config: CONFIG
  };
});

/**
 * ArcanaX Premium Engine - Enhanced Interpretation System
 * Provides deeper, richer tarot readings with card combination analysis,
 * elemental interactions, timing suggestions, and actionable advice.
 * All local, zero external APIs.
 */
(function (root, factory) {
  if (typeof define === "function" && define.amd) { define([], factory); }
  else if (typeof module === "object" && module.exports) { module.exports = factory(); }
  else { root.PremiumEngine = factory(); }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // Element interaction meanings
  var ELEMENT_INTERACTIONS = {
    "fire-fire": { quality: "intense", meaning: "Explosive energy, passion doubled. Action is swift but beware of burnout." },
    "fire-water": { quality: "transformative", meaning: "Steam rises - emotional passion creates transformation. Deep feelings fuel creative action." },
    "fire-earth": { quality: "productive", meaning: "Fire tempers earth into something useful. Ambition meets practicality for tangible results." },
    "fire-air": { quality: "inspiring", meaning: "Flames leap higher with air. Ideas ignite into action, communication sparks creativity." },
    "water-water": { quality: "deep", meaning: "Emotional depths upon depths. Profound intuition, but guard against drowning in feeling." },
    "water-earth": { quality: "nurturing", meaning: "Water feeds the earth. Emotions ground into stability, nurturing growth over time." },
    "water-air": { quality: "reflective", meaning: "Mist and clouds form. Intellectual understanding of emotions, clarity through reflection." },
    "earth-earth": { quality: "stable", meaning: "Double foundation. Extreme stability but potential stagnation. Build deliberately." },
    "earth-air": { quality: "manifesting", meaning: "Ideas take physical form. Planning meets execution, thoughts become reality." },
    "air-air": { quality: "mental", meaning: "Pure thought, doubled intellect. Brilliant ideas flow but need grounding to become real." }
  };

  // Card pair special meanings
  var SPECIAL_PAIRS = {
    "the-fool+the-world": "The complete cycle - from innocent beginning to triumphant completion. You are being called to start a magnificent new chapter.",
    "the-magician+the-high-priestess": "Conscious and unconscious unite. You have both the active will and the hidden knowledge to manifest anything.",
    "the-empress+the-emperor": "Divine masculine and feminine in perfect balance. Creation through structured nurturing.",
    "the-tower+the-star": "After destruction comes hope. The collapse was necessary to reveal the light that was always there.",
    "death+the-sun": "Transformation leads to joy. What ends makes way for radiant new beginnings.",
    "the-lovers+the-devil": "The tension between authentic love and unhealthy attachment. Choose what truly serves your heart.",
    "the-hermit+the-world": "Wisdom gained in solitude now ready to be shared with the world. Your inner journey has prepared you.",
    "strength+the-chariot": "Inner courage meets outer determination. An unstoppable force guided by compassion.",
    "the-moon+the-sun": "Illusion gives way to clarity. Trust the process of moving from confusion to understanding.",
    "wheel-of-fortune+justice": "Fate and fairness intertwine. What goes around comes around, and balance will be restored.",
    "the-hanged-man+judgement": "Sacrifice leads to awakening. Surrender your old perspective to receive a higher calling.",
    "temperance+the-star": "Patience and hope together - healing is happening, trust the gradual process of renewal."
  };

  // Positional context for enhanced readings
  var POSITION_CONTEXTS = {
    past: "This energy has been shaping your journey. It represents what brought you to this moment - ",
    present: "This is the active force in your life right now. Pay close attention because - ",
    future: "This energy is approaching. Prepare yourself because - ",
    above: "This is your highest aspiration in this situation. Your soul is reaching for - ",
    below: "This is the foundation beneath everything. The hidden root cause is - ",
    advice: "The universe counsels you to - ",
    outcome: "If you follow this path, the likely culmination is - ",
    challenge: "The obstacle you must navigate is - ",
    environment: "The people and circumstances around you reflect - ",
    hopes_fears: "What you simultaneously desire and dread is - "
  };

  // Timing suggestions based on elements and suits
  var TIMING_MAP = {
    fire: { timeframe: "days to weeks", season: "spring/summer", advice: "Act quickly while the energy is hot." },
    water: { timeframe: "weeks to months", season: "autumn", advice: "Allow emotions to flow and settle naturally." },
    earth: { timeframe: "months to a year", season: "winter into spring", advice: "Build steadily; this requires patience and persistence." },
    air: { timeframe: "days to weeks", season: "spring", advice: "Communicate now; the window for clarity is open." }
  };

  // Deep interpretation templates
  var DEEP_TEMPLATES = {
    upright: [
      "At its deepest level, {name} speaks to {essence}. In this position, the card reveals that {upright}. The {element} energy here suggests {elementMeaning}. Consider how this connects to your daily life: {actionable}.",
      "The presence of {name} illuminates a powerful truth: {upright}. As a card of {element}, it carries the energy of {elementMeaning}. This is not merely symbolic - it points to concrete circumstances where {actionable}.",
      "{name} appears with strong intention here. Its core message of {essence} is amplified by the {element} energy surrounding it. The deeper meaning: {upright}. What this means practically: {actionable}."
    ],
    reversed: [
      "When {name} appears reversed, the energy of {essence} is being blocked or internalized. The shadow side reveals: {reversed}. The {element} element in this blocked state suggests {elementShadow}. To move forward: {actionable}.",
      "The reversal of {name} asks you to look within. Rather than the outward expression of {upright}, you are experiencing: {reversed}. The {element} energy turned inward creates {elementShadow}. Your path forward: {actionable}.",
      "{name} reversed is not a punishment but an invitation. The blocked {element} energy indicates {elementShadow}. The core issue: {reversed}. Transform this by: {actionable}."
    ]
  };

  // Actionable advice based on element
  var ACTIONABLE_BY_ELEMENT = {
    fire: [
      "take bold action within the next 48 hours",
      "channel your passion into a specific creative project",
      "set a clear intention and pursue it with full energy",
      "express your authentic desires without hesitation"
    ],
    water: [
      "sit with your feelings before making decisions",
      "nurture your relationships with genuine vulnerability",
      "trust your intuition even when logic disagrees",
      "allow yourself to feel fully without judging the emotion"
    ],
    earth: [
      "create a concrete plan with measurable steps",
      "invest in something that will grow over time",
      "ground yourself through physical activity or nature",
      "build one small habit that compounds into big results"
    ],
    air: [
      "have an honest conversation you have been avoiding",
      "write down your thoughts to gain clarity",
      "seek a new perspective from someone you trust",
      "study or learn something that expands your understanding"
    ]
  };

  // Element shadow meanings when blocked
  var ELEMENT_SHADOWS = {
    fire: "stagnation, loss of motivation, or misdirected anger",
    water: "emotional numbness, codependency, or fear of vulnerability",
    earth: "financial anxiety, workaholism, or resistance to change",
    air: "overthinking, dishonesty, or mental paralysis"
  };

  // Element positive meanings
  var ELEMENT_MEANINGS = {
    fire: "passionate drive, creative inspiration, and the courage to act",
    water: "deep emotional wisdom, intuitive knowing, and compassionate flow",
    earth: "material stability, patient growth, and embodied presence",
    air: "intellectual clarity, truthful communication, and fresh perspective"
  };

  // Spread types for premium readings
  var PREMIUM_SPREADS = {
    "deep-celtic-cross": {
      name: "Deep Celtic Cross",
      positions: 10,
      positionNames: ["Present", "Challenge", "Past Foundation", "Recent Past", "Best Outcome", "Near Future", "Your Attitude", "Environment", "Hopes & Fears", "Final Outcome"],
      positionContexts: ["present", "challenge", "below", "past", "above", "future", "advice", "environment", "hopes_fears", "outcome"]
    },
    "yearly-forecast": {
      name: "Yearly Forecast",
      positions: 12,
      positionNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      positionContexts: ["future", "future", "future", "future", "future", "future", "future", "future", "future", "future", "future", "future"]
    },
    "relationship-deep-dive": {
      name: "Relationship Deep Dive",
      positions: 7,
      positionNames: ["You", "Your Partner", "The Connection", "Challenges Together", "Strengths Together", "What Needs Work", "Potential Outcome"],
      positionContexts: ["present", "environment", "above", "challenge", "below", "advice", "outcome"]
    }
  };

  function getElementInteraction(el1, el2) {
    var key = [el1, el2].sort().join("-");
    return ELEMENT_INTERACTIONS[key] || { quality: "balanced", meaning: "These energies work together in subtle harmony." };
  }

  function getCardPairKey(id1, id2) {
    var sorted = [id1, id2].sort();
    return sorted[0] + "+" + sorted[1];
  }

  function seededChoice(arr, seed) {
    var idx = Math.abs(seed) % arr.length;
    return arr[idx];
  }

  function hashStr(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  /**
   * Generate a deep interpretation for a single card in context
   */
  function generateCardInterpretation(card, position, isReversed) {
    var element = card.element || "fire";
    var seed = hashStr(card.id + position);
    var templates = isReversed ? DEEP_TEMPLATES.reversed : DEEP_TEMPLATES.upright;
    var template = seededChoice(templates, seed);
    var actionable = seededChoice(ACTIONABLE_BY_ELEMENT[element] || ACTIONABLE_BY_ELEMENT.fire, seed + 1);
    var positionContext = POSITION_CONTEXTS[position] || POSITION_CONTEXTS.present;

    var text = template
      .replace(/\{name\}/g, card.name)
      .replace(/\{essence\}/g, card.essence || "transformation and growth")
      .replace(/\{upright\}/g, card.upright || "positive energy flows")
      .replace(/\{reversed\}/g, card.reversed || "blocked energy seeks release")
      .replace(/\{element\}/g, element)
      .replace(/\{elementMeaning\}/g, ELEMENT_MEANINGS[element] || ELEMENT_MEANINGS.fire)
      .replace(/\{elementShadow\}/g, ELEMENT_SHADOWS[element] || ELEMENT_SHADOWS.fire)
      .replace(/\{actionable\}/g, actionable);

    return positionContext + text;
  }

  /**
   * Analyze the elemental balance of a set of cards
   */
  function getElementalBalance(cards) {
    var counts = { fire: 0, water: 0, earth: 0, air: 0 };
    var total = cards.length;

    cards.forEach(function (card) {
      var el = card.element || "fire";
      if (counts.hasOwnProperty(el)) {
        counts[el]++;
      }
    });

    var dominant = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; })[0];
    var missing = Object.keys(counts).filter(function (el) { return counts[el] === 0; });
    var balanced = Object.values(counts).every(function (c) { return c >= 1; });

    var analysis = {
      counts: counts,
      total: total,
      dominant: dominant,
      dominantPercent: Math.round((counts[dominant] / total) * 100),
      missing: missing,
      isBalanced: balanced,
      interpretation: ""
    };

    if (balanced) {
      analysis.interpretation = "Your reading shows remarkable elemental balance. All four forces - passion (fire), emotion (water), stability (earth), and intellect (air) - are present. This suggests a holistic situation where all aspects of your life are engaged.";
    } else if (counts[dominant] >= total * 0.5) {
      analysis.interpretation = "Your reading is strongly dominated by " + dominant + " energy (" + analysis.dominantPercent + "%). " + ELEMENT_MEANINGS[dominant] + ". This concentration suggests the situation is primarily about " + (dominant === "fire" ? "action and passion" : dominant === "water" ? "emotions and relationships" : dominant === "earth" ? "material concerns and stability" : "thoughts and communication") + ".";
      if (missing.length > 0) {
        analysis.interpretation += " The absence of " + missing.join(" and ") + " energy suggests you may need to consciously bring in " + missing.map(function (m) { return ELEMENT_MEANINGS[m]; }).join("; and ") + ".";
      }
    } else {
      analysis.interpretation = "The elemental spread leans toward " + dominant + " but maintains diversity. " + ELEMENT_MEANINGS[dominant] + " leads the way, supported by the other elements present.";
    }

    return analysis;
  }

  /**
   * Analyze the meaning of two cards appearing together
   */
  function getCardCombinationMeaning(card1, card2) {
    var pairKey = getCardPairKey(card1.id, card2.id);
    var specialMeaning = SPECIAL_PAIRS[pairKey] || null;

    var interaction = getElementInteraction(card1.element || "fire", card2.element || "fire");

    var result = {
      card1: card1.name,
      card2: card2.name,
      elementalInteraction: interaction,
      specialMeaning: specialMeaning,
      combinedInterpretation: ""
    };

    if (specialMeaning) {
      result.combinedInterpretation = specialMeaning + " The " + interaction.quality + " energy between these cards amplifies: " + interaction.meaning;
    } else {
      result.combinedInterpretation = card1.name + " and " + card2.name + " together create " + interaction.quality + " energy. " + interaction.meaning + " Combined, the essence of '" + (card1.essence || "change") + "' meets '" + (card2.essence || "growth") + "', suggesting a situation where both forces are active and influential.";
    }

    return result;
  }

  /**
   * Generate an actionable plan based on a complete reading
   */
  function generateActionPlan(reading) {
    var cards = reading.cards || [];
    var elements = {};
    cards.forEach(function (c) {
      var el = c.element || "fire";
      if (!elements[el]) elements[el] = [];
      elements[el].push(c);
    });

    var steps = [];
    var dominantElement = Object.keys(elements).sort(function (a, b) {
      return (elements[b] || []).length - (elements[a] || []).length;
    })[0] || "fire";

    // Immediate action (based on dominant element)
    steps.push({
      timeframe: "This Week",
      action: seededChoice(ACTIONABLE_BY_ELEMENT[dominantElement], hashStr(cards.map(function (c) { return c.id; }).join(""))),
      element: dominantElement,
      reasoning: "Your reading is strongly influenced by " + dominantElement + " energy, calling for " + TIMING_MAP[dominantElement].advice.toLowerCase()
    });

    // Short-term reflection
    var secondElement = Object.keys(elements).sort(function (a, b) {
      return (elements[b] || []).length - (elements[a] || []).length;
    })[1] || "water";
    steps.push({
      timeframe: "Next 2 Weeks",
      action: seededChoice(ACTIONABLE_BY_ELEMENT[secondElement] || ACTIONABLE_BY_ELEMENT.water, hashStr("short" + (cards[0] || {}).id)),
      element: secondElement,
      reasoning: "The secondary " + secondElement + " influence suggests balancing your primary action with " + ELEMENT_MEANINGS[secondElement]
    });

    // Medium-term integration
    steps.push({
      timeframe: "This Month",
      action: "Revisit this reading and journal about what has shifted. Notice which card's energy you felt most strongly and which felt distant.",
      element: "all",
      reasoning: "Integration takes time. The cards reveal patterns that unfold over weeks."
    });

    // Long-term growth
    var missingElements = ["fire", "water", "earth", "air"].filter(function (el) { return !elements[el] || elements[el].length === 0; });
    if (missingElements.length > 0) {
      steps.push({
        timeframe: "Ongoing",
        action: "Consciously cultivate " + missingElements[0] + " energy in your life through " + (missingElements[0] === "fire" ? "creative projects and physical activity" : missingElements[0] === "water" ? "emotional expression and nurturing relationships" : missingElements[0] === "earth" ? "financial planning and connecting with nature" : "learning, reading, and meaningful conversations"),
        element: missingElements[0],
        reasoning: "The absence of " + missingElements[0] + " in your reading suggests this is an area needing attention."
      });
    }

    return {
      summary: "Based on your " + cards.length + "-card reading, here is your personalized action plan guided by the " + dominantElement + " energy that dominates your spread.",
      steps: steps,
      timing: TIMING_MAP[dominantElement],
      mantra: generateMantra(cards, dominantElement)
    };
  }

  function generateMantra(cards, element) {
    var mantras = {
      fire: ["I act with courage and passion.", "My creative fire burns bright and clear.", "I am bold, decisive, and alive."],
      water: ["I flow with grace through all emotions.", "My intuition guides me truly.", "I am open to love and compassion."],
      earth: ["I build my dreams one solid step at a time.", "I am grounded, stable, and abundant.", "Patience and persistence are my strengths."],
      air: ["My mind is clear and my words are true.", "I communicate with honesty and grace.", "New ideas flow to me effortlessly."]
    };
    return seededChoice(mantras[element] || mantras.fire, hashStr(cards.map(function (c) { return c.id; }).join("-")));
  }

  /**
   * Generate a full premium deep reading
   */
  function generateDeepReading(cards, spreadType) {
    var spread = PREMIUM_SPREADS[spreadType] || PREMIUM_SPREADS["deep-celtic-cross"];
    var interpretations = [];

    cards.forEach(function (card, index) {
      var posContext = spread.positionContexts[index] || "present";
      var posName = spread.positionNames[index] || ("Position " + (index + 1));
      var isReversed = card.isReversed || false;

      interpretations.push({
        position: posName,
        card: card,
        interpretation: generateCardInterpretation(card, posContext, isReversed),
        isReversed: isReversed
      });
    });

    // Generate card combination insights (analyze adjacent pairs)
    var combinations = [];
    for (var i = 0; i < cards.length - 1; i++) {
      if (i < 4) { // Limit to first few pairs for readability
        combinations.push(getCardCombinationMeaning(cards[i], cards[i + 1]));
      }
    }

    // Elemental balance
    var balance = getElementalBalance(cards);

    // Action plan
    var actionPlan = generateActionPlan({ cards: cards, spreadType: spreadType });

    return {
      spreadName: spread.name,
      cardCount: cards.length,
      interpretations: interpretations,
      combinations: combinations,
      elementalBalance: balance,
      actionPlan: actionPlan,
      summary: generateReadingSummary(interpretations, balance, combinations)
    };
  }

  function generateReadingSummary(interpretations, balance, combinations) {
    var cardNames = interpretations.map(function (i) { return i.card.name; }).slice(0, 3).join(", ");
    var summary = "This premium reading reveals a journey shaped by " + cardNames + " and more. ";
    summary += balance.interpretation + " ";
    if (combinations.length > 0) {
      summary += "The strongest card pairing - " + combinations[0].card1 + " with " + combinations[0].card2 + " - creates " + combinations[0].elementalInteraction.quality + " energy that colors the entire reading.";
    }
    return summary;
  }

  /**
   * Get available premium spread types
   */
  function getAvailableSpreads() {
    return Object.keys(PREMIUM_SPREADS).map(function (key) {
      var s = PREMIUM_SPREADS[key];
      return { id: key, name: s.name, positions: s.positions };
    });
  }

  // Public API
  return {
    generateDeepReading: generateDeepReading,
    getCardCombinationMeaning: getCardCombinationMeaning,
    getElementalBalance: getElementalBalance,
    generateActionPlan: generateActionPlan,
    getAvailableSpreads: getAvailableSpreads
  };
});

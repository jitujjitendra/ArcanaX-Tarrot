/**
 * ArcanaX Smart Oracle - Rule-Based NLP Engine
 * Provides AI-like personalized tarot responses without paid APIs.
 * Uses keyword extraction, pattern matching, and template-based generation.
 */
(function (root, factory) {
  if (typeof define === "function" && define.amd) { define([], factory); }
  else if (typeof module === "object" && module.exports) { module.exports = factory(); }
  else { root.SmartOracle = factory(); }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // Keyword dictionaries mapping user input to categories
  var KEYWORD_MAP = {
    love: {
      keywords: ["love", "relationship", "partner", "romance", "heart", "dating", "marriage", "crush", "soulmate", "breakup", "ex", "boyfriend", "girlfriend", "husband", "wife", "attraction", "chemistry", "pyaar", "ishq", "mohabbat", "dil", "rishta"],
      suit: "cups",
      element: "water",
      majorCards: ["the-lovers", "the-empress", "two-of-cups"]
    },
    career: {
      keywords: ["career", "job", "work", "business", "promotion", "salary", "boss", "office", "profession", "money", "income", "success", "ambition", "naukri", "kaam", "paisa", "karobar"],
      suit: "pentacles",
      element: "earth",
      majorCards: ["the-emperor", "wheel-of-fortune", "the-world"]
    },
    health: {
      keywords: ["health", "sick", "illness", "energy", "body", "mind", "wellness", "fitness", "stress", "anxiety", "mental", "healing", "recovery", "sehat", "tabiyat", "theek"],
      suit: "wands",
      element: "fire",
      majorCards: ["strength", "temperance", "the-star"]
    },
    spiritual: {
      keywords: ["spiritual", "soul", "purpose", "destiny", "fate", "universe", "divine", "meditation", "enlightenment", "karma", "dharma", "moksha", "aatma", "bhagya"],
      suit: "cups",
      element: "water",
      majorCards: ["the-high-priestess", "the-hermit", "the-star"]
    },
    decision: {
      keywords: ["decision", "choose", "choice", "confused", "should", "option", "path", "direction", "which", "what to do", "faisla", "kya karu", "confused"],
      suit: "swords",
      element: "air",
      majorCards: ["justice", "the-chariot", "wheel-of-fortune"]
    },
    family: {
      keywords: ["family", "mother", "father", "parent", "child", "children", "home", "house", "sibling", "brother", "sister", "maa", "papa", "ghar", "parivar", "bachche"],
      suit: "pentacles",
      element: "earth",
      majorCards: ["the-empress", "the-emperor", "ten-of-pentacles"]
    },
    money: {
      keywords: ["money", "finance", "debt", "savings", "invest", "rich", "poor", "wealth", "abundance", "prosperity", "paise", "dhan", "ameer"],
      suit: "pentacles",
      element: "earth",
      majorCards: ["the-empress", "wheel-of-fortune", "nine-of-pentacles"]
    },
    travel: {
      keywords: ["travel", "move", "relocation", "journey", "abroad", "foreign", "trip", "adventure", "safar", "videsh", "yatra"],
      suit: "wands",
      element: "fire",
      majorCards: ["the-chariot", "the-fool", "eight-of-wands"]
    },
    education: {
      keywords: ["study", "exam", "education", "school", "college", "university", "learn", "knowledge", "degree", "padhai", "pariksha", "vidya"],
      suit: "swords",
      element: "air",
      majorCards: ["the-magician", "the-hierophant", "the-hermit"]
    },
    timing: {
      keywords: ["when", "how long", "time", "soon", "kab", "kitna waqt", "jaldi"],
      suit: null,
      element: null,
      majorCards: ["wheel-of-fortune", "the-world"]
    }
  };

  // Response templates per category (50+ total)
  var RESPONSE_TEMPLATES = {
    love: [
      "The cosmos reveals a powerful energy surrounding your heart. {card} suggests that {interpretation}. Trust the rhythm of connection - what is meant for you will find its way.",
      "Your emotional waters run deep right now. {card} illuminates {interpretation}. Open yourself to vulnerability; it is the doorway to authentic love.",
      "The stars whisper of romantic potential. {card} indicates {interpretation}. Be patient with the unfolding - love cannot be rushed.",
      "A significant shift in your love life is approaching. {card} reveals {interpretation}. Honor both your needs and your partner's journey.",
      "The universe holds a mirror to your heart. {card} shows {interpretation}. Remember, self-love is the foundation of all connection.",
      "Celestial forces are aligning in matters of the heart. {card} speaks of {interpretation}. Allow love to surprise you.",
      "Your romantic energy is transforming. {card} suggests {interpretation}. Be brave enough to show your true self.",
      "The cosmos sees your longing and responds with hope. {card} reveals {interpretation}. Trust divine timing in love."
    ],
    career: [
      "The professional realm holds great promise. {card} reveals {interpretation}. Your dedication is building something lasting.",
      "A shift in your career path is illuminated by the stars. {card} suggests {interpretation}. Bold moves may be called for.",
      "Your professional energy is aligned with abundance. {card} indicates {interpretation}. Trust your expertise and step forward.",
      "The cosmos sees your ambition clearly. {card} shows {interpretation}. Now is the time to plant seeds for future harvest.",
      "Professional transformation is on the horizon. {card} reveals {interpretation}. Embrace change as opportunity.",
      "Your work is about to enter a new chapter. {card} suggests {interpretation}. Stay focused on your long-term vision.",
      "The stars favor your professional pursuits. {card} indicates {interpretation}. Believe in your capability to succeed.",
      "Career momentum is building in your favor. {card} shows {interpretation}. Do not underestimate what you bring to the table."
    ],
    health: [
      "The cosmic energies speak to your well-being. {card} suggests {interpretation}. Listen to what your body is telling you.",
      "Healing light surrounds you. {card} indicates {interpretation}. Small consistent steps lead to great transformation.",
      "Your vitality is shifting. {card} reveals {interpretation}. Nurture yourself with the same care you give others.",
      "The stars illuminate your path to wellness. {card} shows {interpretation}. Balance is the key to sustained energy.",
      "A renewal of physical and mental strength awaits. {card} suggests {interpretation}. Trust in your body's wisdom.",
      "Cosmic healing energy is available to you now. {card} indicates {interpretation}. Prioritize rest alongside action.",
      "Your health journey is divinely guided. {card} reveals {interpretation}. Be gentle with yourself through this process.",
      "The universe supports your healing. {card} shows {interpretation}. Every positive choice compounds over time."
    ],
    spiritual: [
      "The veil between worlds thins. {card} reveals {interpretation}. Your spiritual awareness is expanding rapidly.",
      "Deep within, your soul already knows the answer. {card} suggests {interpretation}. Trust your inner wisdom.",
      "The cosmos invites you deeper into mystery. {card} indicates {interpretation}. Meditation will illuminate hidden truths.",
      "Your spiritual path is unfolding perfectly. {card} shows {interpretation}. Embrace the unknown with curiosity.",
      "A spiritual awakening pulses through your being. {card} reveals {interpretation}. You are more connected than you realize.",
      "The universe speaks through silence. {card} suggests {interpretation}. Stillness will bring the clarity you seek.",
      "Your soul's purpose is being revealed. {card} indicates {interpretation}. Follow the path that lights you up.",
      "Cosmic wisdom flows through you. {card} shows {interpretation}. Trust the signs the universe sends."
    ],
    decision: [
      "The crossroads before you is illuminated. {card} suggests {interpretation}. Trust your gut - it knows the way.",
      "Clarity emerges from the cosmic mist. {card} reveals {interpretation}. The choice that excites and frightens you equally is often the right one.",
      "The stars offer guidance at this fork in your path. {card} indicates {interpretation}. Both options hold wisdom, but one resonates deeper.",
      "Your decision carries great power. {card} shows {interpretation}. Align your choice with your values, not your fears.",
      "The cosmos offers perspective on your dilemma. {card} suggests {interpretation}. Sometimes the boldest choice is to wait.",
      "At this junction, wisdom comes from within. {card} reveals {interpretation}. Consider what future-you would want you to choose.",
      "The universe reveals hidden factors in your decision. {card} indicates {interpretation}. Seek counsel from those who know you best.",
      "Your path forward becomes clearer. {card} shows {interpretation}. Trust that there is no truly wrong choice - only different lessons."
    ],
    family: [
      "Family bonds are shifting under cosmic influence. {card} reveals {interpretation}. Communication is the bridge to understanding.",
      "The stars speak of home and belonging. {card} suggests {interpretation}. Boundaries can be acts of love.",
      "Family dynamics are evolving. {card} indicates {interpretation}. Patience and compassion will serve you well.",
      "Your roots are strengthening. {card} shows {interpretation}. Honor where you come from as you grow.",
      "The cosmos illuminates family patterns. {card} reveals {interpretation}. Breaking cycles takes courage and awareness.",
      "Home energy is transforming. {card} suggests {interpretation}. Create the family culture you wish to live in.",
      "Ancestral wisdom supports you now. {card} indicates {interpretation}. You carry generations of strength within.",
      "Family connections deepen through honest expression. {card} shows {interpretation}. Vulnerability builds trust."
    ],
    money: [
      "Abundance energy is activating. {card} reveals {interpretation}. Your relationship with money is evolving.",
      "Financial clarity comes into focus. {card} suggests {interpretation}. Trust your ability to attract prosperity.",
      "The cosmos aligns with your material goals. {card} indicates {interpretation}. Patience and persistence build wealth.",
      "Your financial situation is transforming. {card} shows {interpretation}. Look for opportunities hidden in plain sight.",
      "Prosperity flows toward you. {card} reveals {interpretation}. Generous spirits often attract abundance.",
      "The stars favor smart financial moves. {card} suggests {interpretation}. Plan today for the comfort of tomorrow.",
      "Material security is within reach. {card} indicates {interpretation}. Value yourself and your contributions highly.",
      "Wealth consciousness is expanding within you. {card} shows {interpretation}. Believe you deserve abundance."
    ],
    travel: [
      "Adventure calls from the cosmos. {card} reveals {interpretation}. New horizons await your exploration.",
      "Movement energy is strong in your chart. {card} suggests {interpretation}. The journey itself holds the magic.",
      "The stars support a change of scenery. {card} indicates {interpretation}. Sometimes we must leave to find ourselves.",
      "Travel brings unexpected gifts. {card} shows {interpretation}. Be open to where the wind carries you.",
      "A new chapter begins in distant lands. {card} reveals {interpretation}. Expansion of your world is divinely timed.",
      "The cosmos encourages exploration. {card} suggests {interpretation}. Every journey transforms the traveler."
    ],
    education: [
      "Knowledge beckons from the cosmic library. {card} reveals {interpretation}. Your mind is ready for expansion.",
      "Academic success is supported by the stars. {card} suggests {interpretation}. Consistent effort compounds into mastery.",
      "The pursuit of knowledge is divinely guided. {card} indicates {interpretation}. Trust your intellectual capacity.",
      "Learning opens new doorways. {card} shows {interpretation}. Embrace curiosity as your greatest teacher.",
      "The cosmos favors your studies. {card} reveals {interpretation}. Deep focus will yield extraordinary results.",
      "Educational growth is accelerating. {card} suggests {interpretation}. Share what you learn - teaching deepens understanding."
    ],
    timing: [
      "The wheel of time turns in your favor. {card} reveals {interpretation}. Trust in divine timing - the cosmos has a schedule beyond our knowing.",
      "Cosmic cycles suggest patience. {card} indicates {interpretation}. What you seek is also seeking you.",
      "The stars speak of timing. {card} shows {interpretation}. Seeds planted now will bloom in their perfect season.",
      "Divine timing is at work. {card} reveals {interpretation}. The universe does not operate on human schedules, but it is never late.",
      "Patience is its own form of power. {card} suggests {interpretation}. The answer will arrive when you are truly ready to receive it.",
      "Cycles of transformation take their own time. {card} indicates {interpretation}. Trust the process - rushing creates resistance."
    ],
    general: [
      "The cosmic tapestry reveals much. {card} suggests {interpretation}. Stay open to the messages life sends you.",
      "Universal forces align around your question. {card} indicates {interpretation}. Trust the journey even when the path is unclear.",
      "The stars hear your inquiry. {card} reveals {interpretation}. Everything is connected in ways beyond our seeing.",
      "Cosmic wisdom illuminates your situation. {card} shows {interpretation}. You are exactly where you need to be.",
      "The universe responds to your seeking. {card} suggests {interpretation}. Answers often come from unexpected directions.",
      "A message from the cosmos arrives. {card} reveals {interpretation}. Pay attention to synchronicities in the coming days.",
      "The celestial realm offers insight. {card} indicates {interpretation}. Your intuition is stronger than you give it credit for.",
      "Starlight illuminates your path. {card} shows {interpretation}. Trust that you are guided, even in uncertainty."
    ]
  };

  // Card interpretation fragments based on upright/reversed
  var CARD_INTERPRETATIONS = {
    upright: [
      "new energy flowing into your life",
      "a positive shift is underway",
      "your inner strength is recognized by the universe",
      "growth and expansion are natural at this time",
      "clarity emerges from recent confusion",
      "doors are opening before you",
      "your efforts are about to be rewarded",
      "alignment between desire and action"
    ],
    reversed: [
      "old patterns are being released",
      "a need to look within before moving forward",
      "resistance is showing you where growth awaits",
      "something hidden needs to be acknowledged",
      "a call to pause and reassess your direction",
      "inner work is required before external change can manifest",
      "what you resist persists - acceptance brings freedom",
      "lessons from the past are resurfacing for resolution"
    ]
  };

  // Conversation context for follow-ups
  var conversationContext = {
    lastCategory: null,
    lastKeywords: [],
    lastCards: [],
    questionCount: 0,
    history: []
  };

  /**
   * Extract keywords and categories from user input text
   */
  function analyzeQuestion(text) {
    if (!text || typeof text !== "string") {
      return { keywords: [], categories: [], primaryCategory: "general", sentiment: "neutral" };
    }

    var input = text.toLowerCase().trim();
    var foundKeywords = [];
    var foundCategories = [];
    var categoryScores = {};

    // Scan for keywords in each category
    var categoryNames = Object.keys(KEYWORD_MAP);
    for (var i = 0; i < categoryNames.length; i++) {
      var catName = categoryNames[i];
      var catData = KEYWORD_MAP[catName];
      var score = 0;
      for (var j = 0; j < catData.keywords.length; j++) {
        var kw = catData.keywords[j];
        if (input.indexOf(kw) !== -1) {
          foundKeywords.push(kw);
          score++;
          if (foundCategories.indexOf(catName) === -1) {
            foundCategories.push(catName);
          }
        }
      }
      if (score > 0) {
        categoryScores[catName] = score;
      }
    }

    // Determine primary category
    var primaryCategory = "general";
    var maxScore = 0;
    var catKeys = Object.keys(categoryScores);
    for (var k = 0; k < catKeys.length; k++) {
      if (categoryScores[catKeys[k]] > maxScore) {
        maxScore = categoryScores[catKeys[k]];
        primaryCategory = catKeys[k];
      }
    }

    // Simple sentiment detection
    var sentiment = "neutral";
    var positiveWords = ["happy", "good", "great", "wonderful", "excited", "hopeful", "positive", "lucky", "blessed"];
    var negativeWords = ["sad", "bad", "worried", "scared", "anxious", "lost", "confused", "stuck", "afraid", "hopeless"];
    for (var p = 0; p < positiveWords.length; p++) {
      if (input.indexOf(positiveWords[p]) !== -1) { sentiment = "positive"; break; }
    }
    if (sentiment === "neutral") {
      for (var n = 0; n < negativeWords.length; n++) {
        if (input.indexOf(negativeWords[n]) !== -1) { sentiment = "negative"; break; }
      }
    }

    // Update context
    conversationContext.lastCategory = primaryCategory;
    conversationContext.lastKeywords = foundKeywords;
    conversationContext.questionCount++;
    conversationContext.history.push({ text: input, category: primaryCategory, time: Date.now() });

    // Keep history manageable
    if (conversationContext.history.length > 20) {
      conversationContext.history = conversationContext.history.slice(-10);
    }

    return {
      keywords: foundKeywords,
      categories: foundCategories,
      primaryCategory: primaryCategory,
      sentiment: sentiment,
      isFollowUp: conversationContext.questionCount > 1,
      suggestedSuit: KEYWORD_MAP[primaryCategory] ? KEYWORD_MAP[primaryCategory].suit : null,
      suggestedElement: KEYWORD_MAP[primaryCategory] ? KEYWORD_MAP[primaryCategory].element : null
    };
  }

  /**
   * Generate a personalized response based on keywords and cards
   */
  function generateResponse(keywords, cards) {
    if (!keywords) keywords = [];
    if (!cards) cards = [];

    var category = conversationContext.lastCategory || "general";
    var templates = RESPONSE_TEMPLATES[category] || RESPONSE_TEMPLATES.general;

    // Pick a template based on variety (use timestamp + keyword length for pseudo-randomness)
    var seed = Date.now() + (keywords.length * 7) + (cards.length * 13);
    var templateIndex = seed % templates.length;
    var template = templates[templateIndex];

    // Generate card reference
    var cardName = "The cosmic energy";
    var isReversed = false;
    if (cards.length > 0) {
      var card = cards[0];
      cardName = card.name || card.id || "The drawn card";
      isReversed = card.reversed || false;
    }

    // Generate interpretation
    var interpPool = isReversed ? CARD_INTERPRETATIONS.reversed : CARD_INTERPRETATIONS.upright;
    var interpIndex = (seed + cardName.length) % interpPool.length;
    var interpretation = interpPool[interpIndex];

    // Fill template
    var response = template
      .replace("{card}", cardName)
      .replace("{interpretation}", interpretation);

    // Update context with cards
    conversationContext.lastCards = cards;

    return {
      message: response,
      category: category,
      cardUsed: cards.length > 0 ? cards[0] : null,
      followUpPrompts: getFollowUpPrompts(category)
    };
  }

  /**
   * Generate follow-up based on conversation context
   */
  function getFollowUp(context) {
    if (!context) context = conversationContext;
    var category = context.lastCategory || "general";
    var prompts = getFollowUpPrompts(category);
    var depth = context.questionCount || 0;

    var followUpMessages = [
      "I sense there is more you wish to explore. Would you like to go deeper?",
      "The cards have more to reveal. Ask what weighs on your heart.",
      "Your energy draws me to say - there is a connected matter. Shall we explore it?",
      "The cosmic threads suggest a related concern. Would you like guidance there as well?",
      "I feel the pull of another question within you. Speak it freely."
    ];

    var idx = (depth + Date.now()) % followUpMessages.length;

    return {
      message: followUpMessages[idx],
      suggestedQuestions: prompts,
      context: {
        questionsAsked: context.questionCount,
        lastCategory: context.lastCategory,
        categoriesExplored: context.history ? context.history.map(function(h) { return h.category; }).filter(function(v, i, a) { return a.indexOf(v) === i; }) : []
      }
    };
  }

  function getFollowUpPrompts(category) {
    var prompts = {
      love: ["How can I attract the right partner?", "What does my partner truly feel?", "Is this relationship meant to last?"],
      career: ["What should I focus on professionally?", "Is a career change coming?", "How can I increase my income?"],
      health: ["What energy blocks should I release?", "How can I improve my vitality?", "What self-care practice serves me?"],
      spiritual: ["What is my soul's purpose?", "How can I deepen my spiritual practice?", "What lesson is the universe teaching me?"],
      decision: ["What am I not seeing clearly?", "What outcome does each path hold?", "What does my heart truly want?"],
      family: ["How can I heal this family dynamic?", "What role should I play?", "How can we communicate better?"],
      money: ["What blocks my abundance?", "Where should I invest my energy?", "How can I create financial freedom?"],
      travel: ["Where should my next journey take me?", "Is this move right for me?", "What will travel teach me?"],
      education: ["What should I study next?", "How can I improve my focus?", "What knowledge will serve my path?"],
      timing: ["What should I do while waiting?", "How can I align with divine timing?", "What signs should I watch for?"],
      general: ["What does the universe want me to know?", "What energy surrounds me today?", "What should I focus on this week?"]
    };
    return prompts[category] || prompts.general;
  }

  /**
   * Reset conversation context
   */
  function resetContext() {
    conversationContext = {
      lastCategory: null,
      lastKeywords: [],
      lastCards: [],
      questionCount: 0,
      history: []
    };
  }

  // Public API
  return {
    analyzeQuestion: analyzeQuestion,
    generateResponse: generateResponse,
    getFollowUp: getFollowUp,
    resetContext: resetContext,
    KEYWORD_MAP: KEYWORD_MAP
  };
});

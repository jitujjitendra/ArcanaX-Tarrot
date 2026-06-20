/**
 * ArcanaX Deck Themes - CSS-based visual theme system
 * Provides 4 distinct visual themes that modify card art colors and UI palette.
 * Each theme overrides CSS custom properties and card-art-generator palettes.
 */
(function (root, factory) {
  if (typeof define === "function" && define.amd) { define([], factory); }
  else if (typeof module === "object" && module.exports) { module.exports = factory(); }
  else { root.DeckThemes = factory(); }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var THEMES = {
    cosmic: {
      id: "cosmic",
      name: "Cosmic Night",
      description: "Default purple and blue nebula theme with starfield accents",
      preview: { primary: "#a855f7", secondary: "#6366f1", bg: "#0a0a1a", accent: "#c084fc" },
      cssVars: {
        "--ax-bg": "#0a0a1a",
        "--ax-bg-card": "#1a1025",
        "--ax-bg-surface": "#12101f",
        "--ax-accent": "#a855f7",
        "--ax-accent-soft": "rgba(168,85,247,0.12)",
        "--ax-gold": "#ffd700",
        "--ax-gold-soft": "rgba(255,215,0,0.15)",
        "--ax-text": "#e8e0f0",
        "--ax-text-muted": "#9580aa",
        "--ax-secondary": "#c4b5fd",
        "--ax-border": "rgba(168,85,247,0.2)",
        "--ax-border-accent": "rgba(168,85,247,0.4)"
      },
      cardColors: {
        fire: { primary: "#ff6b35", secondary: "#ffa500", bg: "#1a0800" },
        water: { primary: "#4ecdc4", secondary: "#00bfff", bg: "#001a1a" },
        earth: { primary: "#8fce00", secondary: "#2d5a27", bg: "#0a1a00" },
        air: { primary: "#b8d4e3", secondary: "#e8e8ff", bg: "#0a0a1a" }
      },
      cardBack: { pattern: "stars", color1: "#a855f7", color2: "#6366f1", bg: "#0a0a1a" }
    },
    golden: {
      id: "golden",
      name: "Golden Temple",
      description: "Gold and amber Egyptian-inspired theme with hieroglyphic accents",
      preview: { primary: "#f59e0b", secondary: "#d97706", bg: "#1a1200", accent: "#fbbf24" },
      cssVars: {
        "--ax-bg": "#1a1200",
        "--ax-bg-card": "#2a1f08",
        "--ax-bg-surface": "#1f1805",
        "--ax-accent": "#f59e0b",
        "--ax-accent-soft": "rgba(245,158,11,0.12)",
        "--ax-gold": "#fbbf24",
        "--ax-gold-soft": "rgba(251,191,36,0.15)",
        "--ax-text": "#fef3c7",
        "--ax-text-muted": "#a88a40",
        "--ax-secondary": "#fcd34d",
        "--ax-border": "rgba(245,158,11,0.25)",
        "--ax-border-accent": "rgba(245,158,11,0.45)"
      },
      cardColors: {
        fire: { primary: "#ef4444", secondary: "#f97316", bg: "#1a0500" },
        water: { primary: "#06b6d4", secondary: "#0891b2", bg: "#001519" },
        earth: { primary: "#fbbf24", secondary: "#d97706", bg: "#1a1200" },
        air: { primary: "#fef3c7", secondary: "#fde68a", bg: "#1a1700" }
      },
      cardBack: { pattern: "geometric", color1: "#f59e0b", color2: "#92400e", bg: "#1a1200" }
    },
    forest: {
      id: "forest",
      name: "Enchanted Forest",
      description: "Green and earth-toned nature theme with organic patterns",
      preview: { primary: "#10b981", secondary: "#059669", bg: "#0a1a0f", accent: "#34d399" },
      cssVars: {
        "--ax-bg": "#0a1a0f",
        "--ax-bg-card": "#0f2518",
        "--ax-bg-surface": "#0c1f12",
        "--ax-accent": "#10b981",
        "--ax-accent-soft": "rgba(16,185,129,0.12)",
        "--ax-gold": "#a3e635",
        "--ax-gold-soft": "rgba(163,230,53,0.15)",
        "--ax-text": "#d1fae5",
        "--ax-text-muted": "#6b9f80",
        "--ax-secondary": "#6ee7b7",
        "--ax-border": "rgba(16,185,129,0.2)",
        "--ax-border-accent": "rgba(16,185,129,0.4)"
      },
      cardColors: {
        fire: { primary: "#f97316", secondary: "#ea580c", bg: "#1a0e00" },
        water: { primary: "#22d3ee", secondary: "#06b6d4", bg: "#001a1f" },
        earth: { primary: "#10b981", secondary: "#059669", bg: "#001a0d" },
        air: { primary: "#a7f3d0", secondary: "#d1fae5", bg: "#0a1a10" }
      },
      cardBack: { pattern: "organic", color1: "#10b981", color2: "#065f46", bg: "#0a1a0f" }
    },
    ocean: {
      id: "ocean",
      name: "Deep Ocean",
      description: "Teal and blue aquatic theme with flowing wave patterns",
      preview: { primary: "#0891b2", secondary: "#0e7490", bg: "#001a22", accent: "#22d3ee" },
      cssVars: {
        "--ax-bg": "#001a22",
        "--ax-bg-card": "#002530",
        "--ax-bg-surface": "#001f28",
        "--ax-accent": "#0891b2",
        "--ax-accent-soft": "rgba(8,145,178,0.12)",
        "--ax-gold": "#67e8f9",
        "--ax-gold-soft": "rgba(103,232,249,0.15)",
        "--ax-text": "#cffafe",
        "--ax-text-muted": "#5b9aaa",
        "--ax-secondary": "#a5f3fc",
        "--ax-border": "rgba(8,145,178,0.2)",
        "--ax-border-accent": "rgba(8,145,178,0.4)"
      },
      cardColors: {
        fire: { primary: "#fb923c", secondary: "#f97316", bg: "#1a0c00" },
        water: { primary: "#0891b2", secondary: "#06b6d4", bg: "#001520" },
        earth: { primary: "#14b8a6", secondary: "#0d9488", bg: "#001a18" },
        air: { primary: "#a5f3fc", secondary: "#cffafe", bg: "#001a22" }
      },
      cardBack: { pattern: "waves", color1: "#0891b2", color2: "#164e63", bg: "#001a22" }
    }
  };

  var currentTheme = "cosmic";

  /**
   * Apply a theme by name - updates CSS custom properties on document root
   */
  function applyTheme(themeName) {
    var theme = THEMES[themeName];
    if (!theme) return false;

    currentTheme = themeName;

    // Apply CSS variables if in browser
    if (typeof document !== "undefined") {
      var root = document.documentElement;
      var vars = theme.cssVars;
      Object.keys(vars).forEach(function (key) {
        root.style.setProperty(key, vars[key]);
      });
    }

    // Store preference
    if (typeof localStorage !== "undefined") {
      try { localStorage.setItem("arcanax-theme", themeName); } catch (e) { /* ignore */ }
    }

    return true;
  }

  /**
   * Get list of all available themes with metadata
   */
  function getAvailableThemes() {
    return Object.keys(THEMES).map(function (key) {
      var t = THEMES[key];
      return {
        id: t.id,
        name: t.name,
        description: t.description,
        preview: t.preview,
        isActive: key === currentTheme
      };
    });
  }

  /**
   * Get the card color palette for the current theme
   */
  function getCardColors(element) {
    var theme = THEMES[currentTheme];
    return theme.cardColors[element] || theme.cardColors.fire;
  }

  /**
   * Get card back design info for current theme
   */
  function getCardBack() {
    return THEMES[currentTheme].cardBack;
  }

  /**
   * Get current theme name
   */
  function getCurrentTheme() {
    return currentTheme;
  }

  /**
   * Load saved theme preference
   */
  function loadSavedTheme() {
    if (typeof localStorage !== "undefined") {
      try {
        var saved = localStorage.getItem("arcanax-theme");
        if (saved && THEMES[saved]) {
          applyTheme(saved);
          return saved;
        }
      } catch (e) { /* ignore */ }
    }
    return currentTheme;
  }

  return {
    applyTheme: applyTheme,
    getAvailableThemes: getAvailableThemes,
    getCardColors: getCardColors,
    getCardBack: getCardBack,
    getCurrentTheme: getCurrentTheme,
    loadSavedTheme: loadSavedTheme
  };
});

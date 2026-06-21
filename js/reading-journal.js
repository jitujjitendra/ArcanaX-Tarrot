/**
 * ArcanaX Reading Journal
 * localStorage-based system for saving and annotating tarot readings.
 */
(function (root, factory) {
  if (typeof define === "function" && define.amd) { define([], factory); }
  else if (typeof module === "object" && module.exports) { module.exports = factory(); }
  else { root.ReadingJournal = factory(); }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var STORAGE_KEY = "arcanax_reading_journal";

  // Detect environment (Node.js vs browser)
  var storage = {};
  var isBrowser = typeof window !== "undefined" && typeof localStorage !== "undefined";

  function getStore() {
    if (isBrowser) {
      try {
        var data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : { readings: [], version: 1 };
      } catch (e) {
        return { readings: [], version: 1 };
      }
    }
    // In-memory fallback for Node.js
    if (!storage.data) {
      storage.data = { readings: [], version: 1 };
    }
    return storage.data;
  }

  function saveStore(store) {
    if (isBrowser) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
      } catch (e) {
        console.warn("ArcanaX Journal: Unable to save to localStorage");
      }
    } else {
      storage.data = store;
    }
  }

  function generateId() {
    var ts = Date.now().toString(36);
    var rand = Math.random().toString(36).substring(2, 8);
    return "rdg_" + ts + "_" + rand;
  }

  /**
   * Save a new reading to the journal
   * @param {Object} reading - The reading data (cards, spread, question, etc.)
   * @param {string} [notes] - Optional initial notes
   * @returns {Object} The saved reading entry
   */
  function saveReading(reading, notes) {
    var store = getStore();
    var entry = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      reading: reading || {},
      notes: notes ? [{ text: notes, timestamp: new Date().toISOString() }] : [],
      tags: [],
      favorite: false
    };

    // Extract metadata for filtering
    if (reading) {
      entry.spreadType = reading.spreadType || reading.spread || "single";
      entry.question = reading.question || "";
      entry.cardIds = [];
      if (reading.cards && Array.isArray(reading.cards)) {
        for (var i = 0; i < reading.cards.length; i++) {
          var c = reading.cards[i];
          entry.cardIds.push(c.id || c.cardId || c.name || "unknown");
        }
      }
    }

    store.readings.unshift(entry);
    saveStore(store);
    return entry;
  }

  /**
   * Retrieve readings with optional filters
   * @param {Object} [filters] - Filter criteria
   * @returns {Array} Filtered readings
   */
  function getReadings(filters) {
    var store = getStore();
    var readings = store.readings;

    if (!filters) return readings;

    return readings.filter(function (r) {
      if (filters.startDate) {
        if (new Date(r.timestamp) < new Date(filters.startDate)) return false;
      }
      if (filters.endDate) {
        if (new Date(r.timestamp) > new Date(filters.endDate)) return false;
      }
      if (filters.spread) {
        if (r.spreadType !== filters.spread) return false;
      }
      if (filters.card) {
        if (!r.cardIds || r.cardIds.indexOf(filters.card) === -1) return false;
      }
      if (filters.favorite) {
        if (!r.favorite) return false;
      }
      return true;
    });
  }

  /**
   * Add a note to an existing reading
   * @param {string} readingId - The reading ID
   * @param {string} note - The note text
   * @returns {Object|null} Updated reading or null if not found
   */
  function addNote(readingId, note) {
    var store = getStore();
    for (var i = 0; i < store.readings.length; i++) {
      if (store.readings[i].id === readingId) {
        store.readings[i].notes.push({
          text: note,
          timestamp: new Date().toISOString()
        });
        saveStore(store);
        return store.readings[i];
      }
    }
    return null;
  }

  /**
   * Delete a reading by ID
   * @param {string} readingId - The reading ID
   * @returns {boolean} Whether the reading was found and deleted
   */
  function deleteReading(readingId) {
    var store = getStore();
    var original = store.readings.length;
    store.readings = store.readings.filter(function (r) {
      return r.id !== readingId;
    });
    if (store.readings.length < original) {
      saveStore(store);
      return true;
    }
    return false;
  }

  /**
   * Export all journal data as JSON
   * @returns {string} JSON string of all readings
   */
  function exportJournal() {
    var store = getStore();
    return JSON.stringify({
      exportDate: new Date().toISOString(),
      version: store.version,
      totalReadings: store.readings.length,
      readings: store.readings
    }, null, 2);
  }

  /**
   * Import readings from JSON
   * @param {string} jsonStr - JSON data to import
   * @returns {number} Number of readings imported
   */
  function importJournal(jsonStr) {
    try {
      var data = JSON.parse(jsonStr);
      var store = getStore();
      var imported = 0;
      var readings = data.readings || [];
      for (var i = 0; i < readings.length; i++) {
        var entry = readings[i];

        // Validate required fields before accepting
        if (!entry || typeof entry !== 'object') continue;
        if (!entry.id || typeof entry.id !== 'string') continue;
        if (!entry.timestamp || typeof entry.timestamp !== 'string') continue;

        // Avoid duplicates by ID
        var exists = false;
        for (var j = 0; j < store.readings.length; j++) {
          if (store.readings[j].id === entry.id) {
            exists = true;
            break;
          }
        }
        if (!exists) {
          store.readings.push(entry);
          imported++;
        }
      }
      store.readings.sort(function (a, b) {
        return new Date(b.timestamp) - new Date(a.timestamp);
      });
      saveStore(store);
      return imported;
    } catch (e) {
      return 0;
    }
  }

  /**
   * Get reading statistics
   * @returns {Object} Stats including total readings, most drawn cards, etc.
   */
  function getStats() {
    var store = getStore();
    var readings = store.readings;
    var total = readings.length;
    if (total === 0) {
      return { totalReadings: 0, mostDrawnCards: [], favoriteSpread: null, readingsThisWeek: 0, readingsThisMonth: 0 };
    }

    // Card frequency
    var cardCounts = {};
    var spreadCounts = {};
    var now = new Date();
    var weekAgo = new Date(now.getTime() - 7 * 86400000);
    var monthAgo = new Date(now.getTime() - 30 * 86400000);
    var weekCount = 0;
    var monthCount = 0;

    for (var i = 0; i < readings.length; i++) {
      var r = readings[i];
      var rDate = new Date(r.timestamp);
      if (rDate >= weekAgo) weekCount++;
      if (rDate >= monthAgo) monthCount++;

      if (r.spreadType) {
        spreadCounts[r.spreadType] = (spreadCounts[r.spreadType] || 0) + 1;
      }
      if (r.cardIds) {
        for (var j = 0; j < r.cardIds.length; j++) {
          var cid = r.cardIds[j];
          cardCounts[cid] = (cardCounts[cid] || 0) + 1;
        }
      }
    }

    // Top cards
    var cardEntries = Object.keys(cardCounts).map(function (k) { return { id: k, count: cardCounts[k] }; });
    cardEntries.sort(function (a, b) { return b.count - a.count; });
    var topCards = cardEntries.slice(0, 5);

    // Favorite spread
    var favoriteSpread = null;
    var maxSpread = 0;
    var spreadKeys = Object.keys(spreadCounts);
    for (var s = 0; s < spreadKeys.length; s++) {
      if (spreadCounts[spreadKeys[s]] > maxSpread) {
        maxSpread = spreadCounts[spreadKeys[s]];
        favoriteSpread = spreadKeys[s];
      }
    }

    return {
      totalReadings: total,
      mostDrawnCards: topCards,
      favoriteSpread: favoriteSpread,
      readingsThisWeek: weekCount,
      readingsThisMonth: monthCount,
      firstReading: readings[readings.length - 1].timestamp,
      lastReading: readings[0].timestamp
    };
  }

  /**
   * Search through readings and notes
   * @param {string} query - Search text
   * @returns {Array} Matching readings
   */
  function searchReadings(query) {
    if (!query) return [];
    var store = getStore();
    var q = query.toLowerCase();

    return store.readings.filter(function (r) {
      // Search in question
      if (r.question && r.question.toLowerCase().indexOf(q) !== -1) return true;
      // Search in notes
      if (r.notes) {
        for (var i = 0; i < r.notes.length; i++) {
          if (r.notes[i].text && r.notes[i].text.toLowerCase().indexOf(q) !== -1) return true;
        }
      }
      // Search in card IDs
      if (r.cardIds) {
        for (var j = 0; j < r.cardIds.length; j++) {
          if (r.cardIds[j].toLowerCase().indexOf(q) !== -1) return true;
        }
      }
      // Search in spread type
      if (r.spreadType && r.spreadType.toLowerCase().indexOf(q) !== -1) return true;
      return false;
    });
  }

  /**
   * Toggle favorite status
   */
  function toggleFavorite(readingId) {
    var store = getStore();
    for (var i = 0; i < store.readings.length; i++) {
      if (store.readings[i].id === readingId) {
        store.readings[i].favorite = !store.readings[i].favorite;
        saveStore(store);
        return store.readings[i].favorite;
      }
    }
    return null;
  }

  // Public API
  return {
    saveReading: saveReading,
    getReadings: getReadings,
    addNote: addNote,
    deleteReading: deleteReading,
    exportJournal: exportJournal,
    importJournal: importJournal,
    getStats: getStats,
    searchReadings: searchReadings,
    toggleFavorite: toggleFavorite
  };
});

/**
 * ArcanaX Ambient Sound System
 * Generates cosmic ambient sound programmatically using Web Audio API.
 * No external audio files required.
 * Creates a soft, meditative drone using layered detuned oscillators with slow LFO modulation.
 */
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ArcanaXAmbient = factory();
  }
}(typeof self !== 'undefined' ? self : this, function() {
  'use strict';

  var audioCtx = null;
  var masterGain = null;
  var isPlaying = false;
  var oscillators = [];
  var lfoNodes = [];
  var volume = 0.08; // Very low default volume for subtle ambience

  function getAudioContext() {
    if (!audioCtx) {
      var AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return null;
      audioCtx = new AudioContext();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = 0;
      masterGain.connect(audioCtx.destination);
    }
    return audioCtx;
  }

  /**
   * Creates a single oscillator layer with LFO modulation
   */
  function createLayer(ctx, frequency, detune, lfoRate, lfoDepth, type) {
    // Main oscillator
    var osc = ctx.createOscillator();
    osc.type = type || 'sine';
    osc.frequency.value = frequency;
    osc.detune.value = detune;

    // Gain for this layer
    var layerGain = ctx.createGain();
    layerGain.gain.value = 0.3;

    // LFO for amplitude modulation (tremolo-like effect)
    var lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = lfoRate;

    var lfoGain = ctx.createGain();
    lfoGain.gain.value = lfoDepth;

    // Connect LFO to layer gain
    lfo.connect(lfoGain);
    lfoGain.connect(layerGain.gain);

    // Connect oscillator through layer gain to master
    osc.connect(layerGain);
    layerGain.connect(masterGain);

    osc.start();
    lfo.start();

    oscillators.push(osc);
    lfoNodes.push(lfo);

    return { osc: osc, lfo: lfo, gain: layerGain };
  }

  /**
   * Creates the cosmic drone: layered detuned oscillators with slow LFO modulation.
   * Produces a soft, evolving pad sound reminiscent of space ambience.
   */
  function createCosmicDrone() {
    var ctx = getAudioContext();
    if (!ctx) return null;

    // Resume context if suspended (required for autoplay policy)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Stop any existing drone
    stopDrone();

    // Layer 1: Deep sub bass (very low frequency sine)
    createLayer(ctx, 55, 0, 0.05, 0.1, 'sine');

    // Layer 2: Low drone with slight detuning
    createLayer(ctx, 82.4, -5, 0.08, 0.12, 'sine');

    // Layer 3: Harmonic fifth, detuned for movement
    createLayer(ctx, 110, 7, 0.03, 0.08, 'sine');

    // Layer 4: Higher harmonic, triangle for softer overtones
    createLayer(ctx, 164.8, -12, 0.06, 0.15, 'triangle');

    // Layer 5: Ethereal high layer, very quiet
    createLayer(ctx, 220, 15, 0.02, 0.05, 'sine');

    // Layer 6: Sub-octave triangle for warmth
    createLayer(ctx, 41.2, 3, 0.04, 0.06, 'triangle');

    return { layers: oscillators.length };
  }

  function stopDrone() {
    for (var i = 0; i < oscillators.length; i++) {
      try { oscillators[i].stop(); } catch (e) { /* already stopped */ }
    }
    for (var j = 0; j < lfoNodes.length; j++) {
      try { lfoNodes[j].stop(); } catch (e) { /* already stopped */ }
    }
    oscillators = [];
    lfoNodes = [];
  }

  /**
   * Toggles ambient sound on/off.
   * Returns the new playing state (true = playing, false = stopped).
   */
  function toggleAmbient() {
    if (isPlaying) {
      // Fade out
      if (masterGain) {
        masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.0);
      }
      setTimeout(function() {
        stopDrone();
        isPlaying = false;
      }, 1100);
      isPlaying = false;
      return false;
    } else {
      createCosmicDrone();
      // Fade in
      if (masterGain) {
        masterGain.gain.value = 0;
        masterGain.gain.linearRampToValueAtTime(volume, audioCtx.currentTime + 2.0);
      }
      isPlaying = true;
      return true;
    }
  }

  /**
   * Sets the master volume (0.0 to 1.0).
   * Recommended range: 0.02 - 0.15 for subtle background ambience.
   */
  function setVolume(level) {
    volume = Math.max(0, Math.min(1, level));
    if (masterGain && isPlaying) {
      masterGain.gain.linearRampToValueAtTime(volume, audioCtx.currentTime + 0.5);
    }
  }

  /**
   * Returns current state information.
   */
  function getState() {
    return {
      isPlaying: isPlaying,
      volume: volume,
      layers: oscillators.length
    };
  }

  return {
    toggleAmbient: toggleAmbient,
    setVolume: setVolume,
    createCosmicDrone: createCosmicDrone,
    getState: getState
  };
}));

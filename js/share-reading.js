/**
 * ArcanaX Share Reading as Image
 * Canvas-based image generator for sharing tarot readings as cosmic images.
 * Uses Canvas API in browser; exports function signatures safely in Node.js.
 */
(function (root, factory) {
  if (typeof define === "function" && define.amd) { define([], factory); }
  else if (typeof module === "object" && module.exports) { module.exports = factory(); }
  else { root.ShareReading = factory(); }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var isBrowser = typeof window !== "undefined" && typeof document !== "undefined";

  // Default options for image generation
  var DEFAULTS = {
    width: 1200,
    height: 630,
    bgGradientStart: "#0a0a1a",
    bgGradientEnd: "#1a0a2e",
    accentColor: "#b084ff",
    secondaryColor: "#80e1ff",
    textColor: "#e8e8ff",
    goldColor: "#ffd700",
    fontFamily: "Georgia, serif",
    bodyFontFamily: "system-ui, sans-serif",
    watermark: "ArcanaX",
    cardSize: 90,
    padding: 40
  };

  /**
   * Draw cosmic background with stars and nebula gradient
   */
  function drawCosmicBackground(ctx, width, height, opts) {
    // Main gradient
    var grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, opts.bgGradientStart);
    grad.addColorStop(0.5, "#0f0a20");
    grad.addColorStop(1, opts.bgGradientEnd);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Nebula glow
    var nebulaGrad = ctx.createRadialGradient(
      width * 0.3, height * 0.4, 0,
      width * 0.3, height * 0.4, width * 0.4
    );
    nebulaGrad.addColorStop(0, "rgba(176, 132, 255, 0.08)");
    nebulaGrad.addColorStop(1, "rgba(176, 132, 255, 0)");
    ctx.fillStyle = nebulaGrad;
    ctx.fillRect(0, 0, width, height);

    var nebulaGrad2 = ctx.createRadialGradient(
      width * 0.7, height * 0.6, 0,
      width * 0.7, height * 0.6, width * 0.35
    );
    nebulaGrad2.addColorStop(0, "rgba(128, 225, 255, 0.06)");
    nebulaGrad2.addColorStop(1, "rgba(128, 225, 255, 0)");
    ctx.fillStyle = nebulaGrad2;
    ctx.fillRect(0, 0, width, height);

    // Stars
    ctx.fillStyle = "#ffffff";
    for (var i = 0; i < 80; i++) {
      var sx = Math.random() * width;
      var sy = Math.random() * height;
      var sr = Math.random() * 1.5 + 0.3;
      ctx.globalAlpha = Math.random() * 0.5 + 0.2;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;
  }

  /**
   * Draw a simplified tarot card placeholder on the canvas
   */
  function drawCardPlaceholder(ctx, x, y, cardSize, cardName, opts) {
    var w = cardSize;
    var h = cardSize * 1.5;

    // Card background
    ctx.fillStyle = "#16162a";
    ctx.strokeStyle = opts.accentColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 8);
    ctx.fill();
    ctx.stroke();

    // Inner glow
    var innerGrad = ctx.createRadialGradient(
      x + w / 2, y + h / 2, 0,
      x + w / 2, y + h / 2, w * 0.6
    );
    innerGrad.addColorStop(0, "rgba(176, 132, 255, 0.15)");
    innerGrad.addColorStop(1, "rgba(176, 132, 255, 0)");
    ctx.fillStyle = innerGrad;
    ctx.beginPath();
    ctx.roundRect(x + 4, y + 4, w - 8, h - 8, 6);
    ctx.fill();

    // Card name text
    ctx.fillStyle = opts.textColor;
    ctx.font = "bold " + Math.round(cardSize * 0.12) + "px " + opts.fontFamily;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Word wrap card name
    var words = cardName.split(" ");
    var lines = [];
    var currentLine = "";
    var maxWidth = w - 12;
    for (var i = 0; i < words.length; i++) {
      var testLine = currentLine ? currentLine + " " + words[i] : words[i];
      if (ctx.measureText(testLine).width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    var lineHeight = Math.round(cardSize * 0.14);
    var startY = y + h / 2 - ((lines.length - 1) * lineHeight) / 2;
    for (var j = 0; j < lines.length; j++) {
      ctx.fillText(lines[j], x + w / 2, startY + j * lineHeight);
    }
  }

  /**
   * Draw the ArcanaX watermark/branding
   */
  function drawWatermark(ctx, width, height, opts) {
    ctx.fillStyle = opts.accentColor;
    ctx.globalAlpha = 0.6;
    ctx.font = "bold 14px " + opts.bodyFontFamily;
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.fillText(opts.watermark, width - opts.padding, height - opts.padding / 2);
    ctx.globalAlpha = 1.0;

    // Decorative line
    ctx.strokeStyle = opts.accentColor;
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(opts.padding, height - opts.padding);
    ctx.lineTo(width - opts.padding, height - opts.padding);
    ctx.stroke();
    ctx.globalAlpha = 1.0;
  }

  /**
   * Create a canvas image from a reading result.
   * @param {Object} reading - Reading object with cards and spread info
   * @param {Object} reading.spread - Spread name (e.g., "Three-Card Spread")
   * @param {Array} reading.cards - Array of {name, position, keywords}
   * @param {string} [reading.question] - Optional question asked
   * @param {Object} [options] - Customization options
   * @returns {HTMLCanvasElement|null} Canvas element or null if not in browser
   */
  function createReadingImage(reading, options) {
    if (!isBrowser) { return null; }

    var opts = {};
    var key;
    for (key in DEFAULTS) {
      if (DEFAULTS.hasOwnProperty(key)) {
        opts[key] = (options && options[key] !== undefined) ? options[key] : DEFAULTS[key];
      }
    }

    var canvas = document.createElement("canvas");
    canvas.width = opts.width;
    canvas.height = opts.height;
    var ctx = canvas.getContext("2d");

    // Draw cosmic background
    drawCosmicBackground(ctx, opts.width, opts.height, opts);

    // Title area
    var titleY = opts.padding + 20;
    ctx.fillStyle = opts.goldColor;
    ctx.font = "bold 28px " + opts.fontFamily;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(reading.spread || "Tarot Reading", opts.width / 2, titleY);

    // Question (if provided)
    var contentStartY = titleY + 50;
    if (reading.question) {
      ctx.fillStyle = opts.textColor;
      ctx.globalAlpha = 0.7;
      ctx.font = "italic 16px " + opts.bodyFontFamily;
      ctx.fillText('"' + reading.question + '"', opts.width / 2, contentStartY);
      ctx.globalAlpha = 1.0;
      contentStartY += 40;
    }

    // Draw cards in spread layout
    var cards = reading.cards || [];
    var totalWidth = cards.length * (opts.cardSize + 20) - 20;
    var startX = (opts.width - totalWidth) / 2;
    var cardY = contentStartY + 20;

    for (var i = 0; i < cards.length; i++) {
      var cardX = startX + i * (opts.cardSize + 20);
      drawCardPlaceholder(ctx, cardX, cardY, opts.cardSize, cards[i].name || "Card", opts);

      // Position label
      if (cards[i].position) {
        ctx.fillStyle = opts.secondaryColor;
        ctx.font = "11px " + opts.bodyFontFamily;
        ctx.textAlign = "center";
        ctx.fillText(cards[i].position, cardX + opts.cardSize / 2, cardY + opts.cardSize * 1.5 + 16);
      }
    }

    // Summary area
    var summaryY = cardY + opts.cardSize * 1.5 + 50;
    if (summaryY < opts.height - 80) {
      ctx.fillStyle = opts.textColor;
      ctx.font = "14px " + opts.bodyFontFamily;
      ctx.textAlign = "center";
      var cardNames = cards.map(function (c) { return c.name; }).join("  |  ");
      if (ctx.measureText(cardNames).width > opts.width - opts.padding * 2) {
        cardNames = cards.map(function (c) { return c.name; }).join(" | ");
      }
      ctx.fillText(cardNames, opts.width / 2, summaryY);
    }

    // Watermark
    drawWatermark(ctx, opts.width, opts.height, opts);

    return canvas;
  }

  /**
   * Download canvas as PNG image
   * @param {HTMLCanvasElement} canvas
   * @param {string} [filename] - Download filename
   */
  function downloadImage(canvas, filename) {
    if (!isBrowser || !canvas) { return; }
    var link = document.createElement("a");
    link.download = filename || "arcanax-reading.png";
    link.href = canvas.toDataURL("image/png");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Get a shareable data URL from canvas
   * @param {HTMLCanvasElement} canvas
   * @returns {string|null} Base64 PNG data URL
   */
  function getShareableDataURL(canvas) {
    if (!isBrowser || !canvas) { return null; }
    return canvas.toDataURL("image/png");
  }

  return {
    createReadingImage: createReadingImage,
    downloadImage: downloadImage,
    getShareableDataURL: getShareableDataURL
  };
});

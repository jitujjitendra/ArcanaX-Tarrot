(function (root, factory) {
  if (typeof define === "function" && define.amd) { define([], factory); }
  else if (typeof module === "object" && module.exports) { module.exports = factory(); }
  else { root.CardArtGenerator = factory(); }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var COLORS = {
    fire: { primary: "#ff6b35", secondary: "#ffa500", bg: "#1a0800" },
    water: { primary: "#4ecdc4", secondary: "#00bfff", bg: "#001a1a" },
    earth: { primary: "#8fce00", secondary: "#2d5a27", bg: "#0a1a00" },
    air: { primary: "#b8d4e3", secondary: "#e8e8ff", bg: "#0a0a1a" }
  };

  var MAJOR_SYMBOLS = {
    "the-fool": "M50,20 L55,40 L45,40 Z M50,45 L50,70 M40,55 L60,55 M45,70 L50,85 M55,70 L50,85",
    "the-magician": "M50,15 L50,25 M45,20 L55,20 M35,40 Q50,55 65,40 M40,60 L60,60 L55,80 L45,80 Z",
    "the-high-priestess": "M50,20 A8,8 0 1,1 50,36 A8,8 0 1,1 50,20 M42,40 L42,75 L58,75 L58,40 Z M35,42 L65,42",
    "the-empress": "M50,25 L35,50 L50,45 L65,50 Z M40,55 Q50,70 60,55 M45,70 Q50,80 55,70",
    "the-emperor": "M40,20 L40,45 L60,45 L60,20 M35,45 L65,45 L65,80 L35,80 Z",
    "the-hierophant": "M50,15 L45,30 L55,30 Z M42,35 L58,35 L58,65 L42,65 Z M50,65 L50,80 M40,72 L60,72",
    "the-lovers": "M35,35 A10,10 0 1,1 35,55 A10,10 0 1,1 35,35 M65,35 A10,10 0 1,1 65,55 A10,10 0 1,1 65,35 M50,20 L45,30 L55,30 Z",
    "the-chariot": "M30,50 L70,50 L65,75 L35,75 Z M40,30 L60,30 L55,50 L45,50 Z M50,15 L50,30",
    "strength": "M35,50 Q50,30 65,50 Q50,70 35,50 M45,45 Q50,40 55,45 M40,55 L60,55",
    "the-hermit": "M50,15 L45,25 L55,25 Z M48,25 L48,50 M42,50 L58,50 L55,80 L45,80 Z M50,50 L65,35",
    "wheel-of-fortune": "M50,20 A30,30 0 1,1 50,80 A30,30 0 1,1 50,20 M50,30 A20,20 0 1,1 50,70 A20,20 0 1,1 50,30 M50,20 L50,80 M20,50 L80,50",
    "justice": "M50,20 L50,70 M35,35 L65,35 M30,30 L30,45 L40,45 L40,30 Z M60,30 L60,45 L70,45 L70,30 Z",
    "the-hanged-man": "M35,20 L65,20 M50,20 L50,50 M40,50 L60,50 M45,50 L40,70 M55,50 L60,70 M50,50 L50,80",
    "death": "M50,20 A5,5 0 1,1 50,30 A5,5 0 1,1 50,20 M40,35 L60,35 L55,55 L45,55 Z M35,60 L65,60 M30,65 L70,80",
    "temperance": "M35,30 L35,55 L45,55 L45,30 Z M55,30 L55,55 L65,55 L65,30 Z M45,42 Q50,35 55,42",
    "the-devil": "M50,15 L45,25 L55,25 Z M35,30 L65,30 L60,60 L40,60 Z M40,65 L35,80 M60,65 L65,80 M45,35 L45,40 M55,35 L55,40",
    "the-tower": "M40,25 L60,25 L58,80 L42,80 Z M35,25 L65,25 M50,10 L45,25 L55,25 Z M55,40 L70,35 M58,55 L72,52",
    "the-star": "M50,15 L53,30 L68,30 L56,40 L60,55 L50,45 L40,55 L44,40 L32,30 L47,30 Z",
    "the-moon": "M50,20 A15,15 0 1,0 50,50 A10,10 0 1,1 50,20 M30,70 Q40,60 50,70 Q60,60 70,70",
    "the-sun": "M50,30 A20,20 0 1,1 50,70 A20,20 0 1,1 50,30 M50,15 L50,25 M50,75 L50,85 M15,50 L25,50 M75,50 L85,50 M25,25 L32,32 M75,25 L68,32 M25,75 L32,68 M75,75 L68,68",
    "judgement": "M50,15 L50,35 M45,20 L55,20 M35,40 A5,5 0 1,1 35,50 M65,40 A5,5 0 1,1 65,50 M40,55 L40,80 M50,55 L50,80 M60,55 L60,80",
    "the-world": "M50,15 A35,40 0 1,1 50,85 A35,40 0 1,1 50,15 M50,30 L55,50 L50,70 L45,50 Z"
  };

  function hashCode(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  function seededRandom(seed) {
    var s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return function() {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  function generateMandala(cx, cy, radius, seed, layers) {
    var rng = seededRandom(seed);
    var paths = "";
    for (var layer = 0; layer < layers; layer++) {
      var r = radius * (0.3 + (layer / layers) * 0.7);
      var points = 6 + Math.floor(rng() * 8);
      var d = "";
      for (var i = 0; i <= points; i++) {
        var angle = (i / points) * Math.PI * 2 + (layer * 0.3);
        var variation = 1 + (rng() - 0.5) * 0.3;
        var x = cx + Math.cos(angle) * r * variation;
        var y = cy + Math.sin(angle) * r * variation;
        d += (i === 0 ? "M" : "L") + x.toFixed(1) + "," + y.toFixed(1);
      }
      d += " Z";
      paths += d + " ";
    }
    return paths;
  }

  function generateSuitPattern(suit, number, cx, cy, radius, seed) {
    var rng = seededRandom(seed + 777);
    var paths = "";
    var count = Math.min(number, 10);

    if (suit === "cups") {
      for (var i = 0; i < count; i++) {
        var angle = (i / count) * Math.PI * 2;
        var r = radius * (0.3 + rng() * 0.5);
        var x = cx + Math.cos(angle) * r;
        var y = cy + Math.sin(angle) * r;
        var size = 5 + rng() * 8;
        paths += "M" + (x-size).toFixed(1) + "," + y.toFixed(1) + " Q" + x.toFixed(1) + "," + (y-size*1.5).toFixed(1) + " " + (x+size).toFixed(1) + "," + y.toFixed(1) + " L" + (x+size*0.7).toFixed(1) + "," + (y+size).toFixed(1) + " L" + (x-size*0.7).toFixed(1) + "," + (y+size).toFixed(1) + " Z ";
      }
    } else if (suit === "pentacles") {
      for (var i = 0; i < count; i++) {
        var angle = (i / count) * Math.PI * 2;
        var r = radius * (0.3 + rng() * 0.5);
        var x = cx + Math.cos(angle) * r;
        var y = cy + Math.sin(angle) * r;
        var size = 6 + rng() * 6;
        for (var p = 0; p < 5; p++) {
          var a1 = (p / 5) * Math.PI * 2 - Math.PI / 2;
          var a2 = ((p + 2) / 5) * Math.PI * 2 - Math.PI / 2;
          paths += "M" + (x + Math.cos(a1)*size).toFixed(1) + "," + (y + Math.sin(a1)*size).toFixed(1) + " L" + (x + Math.cos(a2)*size).toFixed(1) + "," + (y + Math.sin(a2)*size).toFixed(1) + " ";
        }
      }
    } else if (suit === "swords") {
      for (var i = 0; i < count; i++) {
        var angle = (i / count) * Math.PI * 2 + rng() * 0.5;
        var r = radius * (0.2 + rng() * 0.6);
        var x = cx + Math.cos(angle) * r;
        var y = cy + Math.sin(angle) * r;
        var len = 10 + rng() * 15;
        var a = rng() * Math.PI * 2;
        paths += "M" + (x - Math.cos(a)*len).toFixed(1) + "," + (y - Math.sin(a)*len).toFixed(1) + " L" + (x + Math.cos(a)*len).toFixed(1) + "," + (y + Math.sin(a)*len).toFixed(1) + " ";
        paths += "M" + (x - Math.cos(a+1.57)*3).toFixed(1) + "," + (y - Math.sin(a+1.57)*3).toFixed(1) + " L" + (x + Math.cos(a+1.57)*3).toFixed(1) + "," + (y + Math.sin(a+1.57)*3).toFixed(1) + " ";
      }
    } else if (suit === "wands") {
      for (var i = 0; i < count; i++) {
        var angle = (i / count) * Math.PI * 2;
        var r = radius * (0.2 + rng() * 0.5);
        var x = cx + Math.cos(angle) * r;
        var y = cy + Math.sin(angle) * r;
        var h = 12 + rng() * 10;
        paths += "M" + x.toFixed(1) + "," + (y + h/2).toFixed(1) + " L" + x.toFixed(1) + "," + (y - h/2).toFixed(1) + " ";
        paths += "M" + (x-3).toFixed(1) + "," + (y - h/2).toFixed(1) + " Q" + x.toFixed(1) + "," + (y - h/2 - 6).toFixed(1) + " " + (x+3).toFixed(1) + "," + (y - h/2).toFixed(1) + " ";
      }
    }
    return paths;
  }

  function generateCardSVG(cardId, width, height) {
    width = width || 300;
    height = height || 450;
    var seed = hashCode(cardId);
    var rng = seededRandom(seed + 42);
    var isMajor = !cardId.includes("-of-");
    var element = "air";
    var suit = null;
    var number = 0;

    if (!isMajor) {
      var parts = cardId.split("-of-");
      suit = parts[1];
      var numPart = parts[0];
      var numMap = { ace:1, two:2, three:3, four:4, five:5, six:6, seven:7, eight:8, nine:9, ten:10, page:11, knight:12, queen:13, king:14 };
      number = numMap[numPart] || 0;
      var suitElements = { cups:"water", pentacles:"earth", swords:"air", wands:"fire" };
      element = suitElements[suit] || "air";
    } else {
      var majorElements = {
        "the-fool":"air","the-magician":"air","the-high-priestess":"water",
        "the-empress":"earth","the-emperor":"fire","the-hierophant":"earth",
        "the-lovers":"air","the-chariot":"water","strength":"fire",
        "the-hermit":"earth","wheel-of-fortune":"fire","justice":"air",
        "the-hanged-man":"water","death":"water","temperance":"fire",
        "the-devil":"earth","the-tower":"fire","the-star":"air",
        "the-moon":"water","the-sun":"fire","judgement":"fire","the-world":"earth"
      };
      element = majorElements[cardId] || "air";
      var majorNumbers = {
        "the-fool":0,"the-magician":1,"the-high-priestess":2,"the-empress":3,
        "the-emperor":4,"the-hierophant":5,"the-lovers":6,"the-chariot":7,
        "strength":8,"the-hermit":9,"wheel-of-fortune":10,"justice":11,
        "the-hanged-man":12,"death":13,"temperance":14,"the-devil":15,
        "the-tower":16,"the-star":17,"the-moon":18,"the-sun":19,
        "judgement":20,"the-world":21
      };
      number = majorNumbers[cardId] || 0;
    }

    var colors = COLORS[element] || COLORS.air;
    var cx = width / 2;
    var cy = height / 2;
    var maxR = Math.min(width, height) * 0.38;

    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + width + ' ' + height + '" width="' + width + '" height="' + height + '">';

    // Defs
    svg += '<defs>';
    svg += '<radialGradient id="bg-' + seed + '" cx="50%" cy="50%" r="70%">';
    svg += '<stop offset="0%" stop-color="' + colors.bg + '"/>';
    svg += '<stop offset="100%" stop-color="#0a0a1a"/>';
    svg += '</radialGradient>';
    svg += '<radialGradient id="glow-' + seed + '" cx="50%" cy="50%" r="50%">';
    svg += '<stop offset="0%" stop-color="' + colors.primary + '" stop-opacity="0.3"/>';
    svg += '<stop offset="100%" stop-color="' + colors.primary + '" stop-opacity="0"/>';
    svg += '</radialGradient>';
    svg += '</defs>';

    // Background + border
    svg += '<rect width="' + width + '" height="' + height + '" rx="12" fill="url(#bg-' + seed + ')"/>';
    svg += '<rect x="4" y="4" width="' + (width-8) + '" height="' + (height-8) + '" rx="10" fill="none" stroke="' + colors.primary + '" stroke-width="1" opacity="0.4"/>';

    // Glow
    svg += '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + (maxR*1.2).toFixed(1) + '" ry="' + (maxR*1.2).toFixed(1) + '" fill="url(#glow-' + seed + ')"/>';

    // Decorative rings
    svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + maxR.toFixed(1) + '" fill="none" stroke="' + colors.secondary + '" stroke-width="0.5" opacity="0.3"/>';
    svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (maxR*0.85).toFixed(1) + '" fill="none" stroke="' + colors.primary + '" stroke-width="0.8" opacity="0.4"/>';

    // Stars
    for (var i = 0; i < 12; i++) {
      var sx = rng() * width;
      var sy = rng() * height;
      var sr = 0.5 + rng() * 1.5;
      svg += '<circle cx="' + sx.toFixed(1) + '" cy="' + sy.toFixed(1) + '" r="' + sr.toFixed(1) + '" fill="#ffffff" opacity="' + (0.2 + rng()*0.4).toFixed(2) + '"/>';
    }

    if (isMajor) {
      var mandalaPath = generateMandala(cx, cy, maxR * 0.7, seed, 4 + (number % 3));
      svg += '<path d="' + mandalaPath + '" fill="none" stroke="' + colors.primary + '" stroke-width="0.8" opacity="0.5"/>';

      var symbolPath = MAJOR_SYMBOLS[cardId];
      if (symbolPath) {
        var scale = maxR / 50;
        svg += '<g transform="translate(' + (cx - 50*scale).toFixed(1) + ',' + (cy - 50*scale).toFixed(1) + ') scale(' + scale.toFixed(2) + ')">';
        svg += '<path d="' + symbolPath + '" fill="none" stroke="' + colors.secondary + '" stroke-width="' + (2/scale).toFixed(2) + '" stroke-linecap="round" stroke-linejoin="round"/>';
        svg += '</g>';
      }

      svg += '<text x="' + cx + '" y="' + (height*0.08).toFixed(1) + '" text-anchor="middle" font-size="' + (width*0.06).toFixed(1) + '" fill="' + colors.primary + '" opacity="0.7" font-family="serif">' + number + '</text>';
    } else {
      var suitPath = generateSuitPattern(suit, number, cx, cy, maxR * 0.7, seed);
      svg += '<path d="' + suitPath + '" fill="none" stroke="' + colors.primary + '" stroke-width="1.2" opacity="0.6" stroke-linecap="round"/>';

      var innerR = maxR * 0.4;
      if (suit === "cups") {
        svg += '<ellipse cx="' + cx + '" cy="' + (cy+5) + '" rx="' + innerR.toFixed(1) + '" ry="' + (innerR*1.2).toFixed(1) + '" fill="none" stroke="' + colors.secondary + '" stroke-width="0.6" opacity="0.4" stroke-dasharray="4 3"/>';
      } else if (suit === "pentacles") {
        svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + innerR.toFixed(1) + '" fill="none" stroke="' + colors.secondary + '" stroke-width="0.6" opacity="0.4"/>';
        svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (innerR*0.6).toFixed(1) + '" fill="none" stroke="' + colors.secondary + '" stroke-width="0.4" opacity="0.3"/>';
      } else if (suit === "swords") {
        svg += '<rect x="' + (cx-innerR).toFixed(1) + '" y="' + (cy-innerR).toFixed(1) + '" width="' + (innerR*2).toFixed(1) + '" height="' + (innerR*2).toFixed(1) + '" fill="none" stroke="' + colors.secondary + '" stroke-width="0.6" opacity="0.4" transform="rotate(45 ' + cx + ' ' + cy + ')"/>';
      } else if (suit === "wands") {
        var triR = innerR * 0.9;
        svg += '<polygon points="' + cx + ',' + (cy-triR).toFixed(1) + ' ' + (cx+triR*0.87).toFixed(1) + ',' + (cy+triR*0.5).toFixed(1) + ' ' + (cx-triR*0.87).toFixed(1) + ',' + (cy+triR*0.5).toFixed(1) + '" fill="none" stroke="' + colors.secondary + '" stroke-width="0.6" opacity="0.4"/>';
      }

      var numDisplay = number <= 10 ? String(number) : (number===11?"Pg":number===12?"Kn":number===13?"Qn":"Kg");
      svg += '<text x="' + cx + '" y="' + (height*0.08).toFixed(1) + '" text-anchor="middle" font-size="' + (width*0.055).toFixed(1) + '" fill="' + colors.primary + '" opacity="0.7" font-family="serif">' + numDisplay + '</text>';

      var suitLabel = suit ? suit.toUpperCase() : "";
      svg += '<text x="' + cx + '" y="' + (height*0.95).toFixed(1) + '" text-anchor="middle" font-size="' + (width*0.035).toFixed(1) + '" fill="' + colors.secondary + '" opacity="0.5" font-family="sans-serif" letter-spacing="2">' + suitLabel + '</text>';
    }

    // Corner decorations
    var cs = width * 0.06;
    svg += '<path d="M12,' + (12+cs).toFixed(1) + ' L12,12 L' + (12+cs).toFixed(1) + ',12" fill="none" stroke="' + colors.primary + '" stroke-width="1" opacity="0.5"/>';
    svg += '<path d="M' + (width-12-cs).toFixed(1) + ',12 L' + (width-12) + ',12 L' + (width-12) + ',' + (12+cs).toFixed(1) + '" fill="none" stroke="' + colors.primary + '" stroke-width="1" opacity="0.5"/>';
    svg += '<path d="M12,' + (height-12-cs).toFixed(1) + ' L12,' + (height-12) + ' L' + (12+cs).toFixed(1) + ',' + (height-12) + '" fill="none" stroke="' + colors.primary + '" stroke-width="1" opacity="0.5"/>';
    svg += '<path d="M' + (width-12-cs).toFixed(1) + ',' + (height-12) + ' L' + (width-12) + ',' + (height-12) + ' L' + (width-12) + ',' + (height-12-cs).toFixed(1) + '" fill="none" stroke="' + colors.primary + '" stroke-width="1" opacity="0.5"/>';

    svg += '</svg>';
    return svg;
  }

  return { generateCardSVG: generateCardSVG };
});

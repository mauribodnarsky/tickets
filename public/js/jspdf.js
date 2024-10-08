/* global saveAs, define, RGBColor */
// eslint-disable-next-line no-unused-vars
var jsPDF = (function (global) {
    'use strict';
    /**
     * jsPDF's Internal PubSub Implementation.
     * Backward compatible rewritten on 2014 by
     * Diego Casorran, https://github.com/diegocr
     *
     * @class
     * @name PubSub
     * @ignore
     */
    function PubSub(context) {
      if (typeof context !== 'object') {
        throw new Error('Invalid Context passed to initialize PubSub (jsPDF-module)');
      }
      var topics = {};
      this.subscribe = function (topic, callback, once) {
        once = once || false;
        if (typeof topic !== 'string' || typeof callback !== 'function' || typeof once !== 'boolean') {
          throw new Error('Invalid arguments passed to PubSub.subscribe (jsPDF-module)');
        }
        if (!topics.hasOwnProperty(topic)) {
          topics[topic] = {};
        }
        var token = Math.random().toString(35);
        topics[topic][token] = [callback, !!once];
        return token;
      };
      this.unsubscribe = function (token) {
        for (var topic in topics) {
          if (topics[topic][token]) {
            delete topics[topic][token];
            if (Object.keys(topics[topic]).length === 0) {
              delete topics[topic];
            }
            return true;
          }
        }
        return false;
      };
      this.publish = function (topic) {
        if (topics.hasOwnProperty(topic)) {
          var args = Array.prototype.slice.call(arguments, 1),
            tokens = [];
          for (var token in topics[topic]) {
            var sub = topics[topic][token];
            try {
              sub[0].apply(context, args);
            } catch (ex) {
              if (global.console) {
                console.error('jsPDF PubSub Error', ex.message, ex);
              }
            }
            if (sub[1]) tokens.push(token);
          }
          if (tokens.length) tokens.forEach(this.unsubscribe);
        }
      };
      this.getTopics = function () {
        return topics;
      }
    }
      /**
      * Creates new jsPDF document object instance.
      * @name jsPDF
      * @class
      * @param {Object} [options] - Collection of settings initializing the jsPDF-instance
      * @param {string} [options.orientation=portrait] - Orientation of the first page. Possible values are "portrait" or "landscape" (or shortcuts "p" or "l").<br />
      * @param {string} [options.unit=mm] Measurement unit (base unit) to be used when coordinates are specified.<br />
      * Possible values are "pt" (points), "mm", "cm", "m", "in" or "px".
      * @param {string/Array} [options.format=a4] The format of the first page. Can be:<ul><li>a0 - a10</li><li>b0 - b10</li><li>c0 - c10</li><li>dl</li><li>letter</li><li>government-letter</li><li>legal</li><li>junior-legal</li><li>ledger</li><li>tabloid</li><li>credit-card</li></ul><br />
      * Default is "a4". If you want to use your own format just pass instead of one of the above predefined formats the size as an number-array, e.g. [595.28, 841.89]
      * @param {boolean} [options.putOnlyUsedFonts=false] Only put fonts into the PDF, which were used.
      * @param {boolean} [options.compress=false] Compress the generated PDF.
      * @param {number} [options.precision=2] Precision of the element-positions.
      * @param {number} [options.userUnit=1.0] Not to be confused with the base unit. Please inform yourself before you use it.
      * @returns {jsPDF} jsPDF-instance
      * @description
      * ```
      * {
      *  orientation: 'p',
      *  unit: 'mm',
      *  format: 'a4',
      *  putOnlyUsedFonts:true
      * }
      * ```
      *
      * @constructor
      */
    function jsPDF(options) {
      var unit = arguments[1];
      var format = arguments[2];
      var compressPdf = arguments[3];
      var filters = [];
      var userUnit = 1.0;
      var precision;
      var orientation = typeof options === 'string' ? options : 'p';
      
      options = options || {};
      if (typeof options === 'object') {
        orientation = options.orientation;
        unit = options.unit || unit;
        format = options.format || format;
        compressPdf = options.compress || options.compressPdf || compressPdf;
        filters = options.filters || ((compressPdf === true) ? ['FlateEncode'] : filters);
        userUnit = typeof options.userUnit === "number" ? Math.abs(options.userUnit) : 1.0;
        precision = options.precision;
      }
      unit = unit || 'mm';
      orientation = ('' + (orientation || 'P')).toLowerCase();
      var putOnlyUsedFonts = options.putOnlyUsedFonts || true;
      var usedFonts = {};
      
      var API = {
        internal: {},
        __private__: {}
      };
      API.__private__.PubSub = PubSub;
      var pdfVersion = '1.3';
      var getPdfVersion = API.__private__.getPdfVersion = function () {
        return pdfVersion;
      };
      var setPdfVersion = API.__private__.setPdfVersion = function (value) {
        pdfVersion = value;
      };
      // Size in pt of various paper formats
      var pageFormats = {
        'a0': [2383.94, 3370.39],
        'a1': [1683.78, 2383.94],
        'a2': [1190.55, 1683.78],
        'a3': [841.89, 1190.55],
        'a4': [595.28, 841.89],
        'a5': [419.53, 595.28],
        'a6': [297.64, 419.53],
        'a7': [209.76, 297.64],
        'a8': [147.40, 209.76],
        'a9': [104.88, 147.40],
        'a10': [73.70, 104.88],
        'b0': [2834.65, 4008.19],
        'b1': [2004.09, 2834.65],
        'b2': [1417.32, 2004.09],
        'b3': [1000.63, 1417.32],
        'b4': [708.66, 1000.63],
        'b5': [498.90, 708.66],
        'b6': [354.33, 498.90],
        'b7': [249.45, 354.33],
        'b8': [175.75, 249.45],
        'b9': [124.72, 175.75],
        'b10': [87.87, 124.72],
        'c0': [2599.37, 3676.54],
        'c1': [1836.85, 2599.37],
        'c2': [1298.27, 1836.85],
        'c3': [918.43, 1298.27],
        'c4': [649.13, 918.43],
        'c5': [459.21, 649.13],
        'c6': [323.15, 459.21],
        'c7': [229.61, 323.15],
        'c8': [161.57, 229.61],
        'c9': [113.39, 161.57],
        'c10': [79.37, 113.39],
        'dl': [311.81, 623.62],
        'letter': [612, 792],
        'government-letter': [576, 756],
        'legal': [612, 1008],
        'junior-legal': [576, 360],
        'ledger': [1224, 792],
        'tabloid': [792, 1224],
        'credit-card': [153, 243]
      };
      var getPageFormats = API.__private__.getPageFormats = function () {
        return pageFormats;
      };
      var getPageFormat = API.__private__.getPageFormat = function (value) {
        return pageFormats[value];
      };
      format = format || 'a4';
      var roundToPrecision = API.roundToPrecision = API.__private__.roundToPrecision = function (number, parmPrecision) {
        var tmpPrecision = precision || parmPrecision;
        if (isNaN(number) || isNaN(tmpPrecision)) {
          throw new Error('Invalid argument passed to jsPDF.roundToPrecision');
        }
        if (precision >= 16) {
          return number.toFixed(precision).replace(/0+$/, "");
        } else {
          return number.toFixed(tmpPrecision);
        }
      };
      var scale = API.scale = API.__private__.scale = function (number) {
        if (isNaN(number)) {
          throw new Error('Invalid argument passed to jsPDF.scale');
        }
        return number * k;
      };
      var hpf = API.hpf = API.__private__.hpf = function (number) {
        if (isNaN(number)) {
          throw new Error('Invalid argument passed to jsPDF.hpf');
        }
        return roundToPrecision(number, 16);
      };
      var f2 = API.f2 = API.__private__.f2 = function (number) {
        if (isNaN(number)) {
          throw new Error('Invalid argument passed to jsPDF.f2');
        }
        return roundToPrecision(number, 2);
      };
      var f3 = API.__private__.f3 = function (number) {
        if (isNaN(number)) {
          throw new Error('Invalid argument passed to jsPDF.f3');
        }
        return roundToPrecision(number, 3);
      };
      var fileId = '00000000000000000000000000000000';
      var getFileId = API.__private__.getFileId = function () {
        return fileId;
      };
      var setFileId = API.__private__.setFileId = function (value) {
        value = value || ("12345678901234567890123456789012").split('').map(function () {
          return "ABCDEF0123456789".charAt(Math.floor(Math.random() * 16));
        }).join('');
        fileId = value;
        return fileId;
      };
      /**
       * @name setFileId
       * @memberof jsPDF#
       * @function
       * @instance
       * @param {string} value GUID.
       * @returns {jsPDF}
       */
      API.setFileId = function (value) {
        setFileId(value);
        return this;
      }
      /**
       * @name getFileId
       * @memberof jsPDF#
       * @function
       * @instance
       *
       * @returns {string} GUID.
       */
      API.getFileId = function () {
        return getFileId();
      }
      var creationDate;
      var convertDateToPDFDate = API.__private__.convertDateToPDFDate = function (parmDate) {
        var result = '';
        var tzoffset = parmDate.getTimezoneOffset(),
          tzsign = tzoffset < 0 ? '+' : '-',
          tzhour = Math.floor(Math.abs(tzoffset / 60)),
          tzmin = Math.abs(tzoffset % 60),
          timeZoneString = [tzsign, padd2(tzhour), "'", padd2(tzmin), "'"].join('');
        result = ['D:',
          parmDate.getFullYear(),
          padd2(parmDate.getMonth() + 1),
          padd2(parmDate.getDate()),
          padd2(parmDate.getHours()),
          padd2(parmDate.getMinutes()),
          padd2(parmDate.getSeconds()),
          timeZoneString
        ].join('');
        return result;
      };
      var convertPDFDateToDate = API.__private__.convertPDFDateToDate = function (parmPDFDate) {
        var year = parseInt(parmPDFDate.substr(2, 4), 10);
        var month = parseInt(parmPDFDate.substr(6, 2), 10) - 1;
        var date = parseInt(parmPDFDate.substr(8, 2), 10);
        var hour = parseInt(parmPDFDate.substr(10, 2), 10);
        var minutes = parseInt(parmPDFDate.substr(12, 2), 10);
        var seconds = parseInt(parmPDFDate.substr(14, 2), 10);
        // var timeZoneHour = parseInt(parmPDFDate.substr(16, 2), 10);
        // var timeZoneMinutes = parseInt(parmPDFDate.substr(20, 2), 10);
        var resultingDate = new Date(year, month, date, hour, minutes, seconds, 0);
        return resultingDate;
      };
      var setCreationDate = API.__private__.setCreationDate = function (date) {
        var tmpCreationDateString;
        var regexPDFCreationDate = (/^D:(20[0-2][0-9]|203[0-7]|19[7-9][0-9])(0[0-9]|1[0-2])([0-2][0-9]|3[0-1])(0[0-9]|1[0-9]|2[0-3])(0[0-9]|[1-5][0-9])(0[0-9]|[1-5][0-9])(\+0[0-9]|\+1[0-4]|\-0[0-9]|\-1[0-1])\'(0[0-9]|[1-5][0-9])\'?$/);
        if (typeof (date) === "undefined") {
          date = new Date();
        }
        if (typeof date === "object" && Object.prototype.toString.call(date) === "[object Date]") {
          tmpCreationDateString = convertDateToPDFDate(date)
        } else if (regexPDFCreationDate.test(date)) {
          tmpCreationDateString = date;
        } else {
          throw new Error('Invalid argument passed to jsPDF.setCreationDate');
        }
        creationDate = tmpCreationDateString;
        return creationDate;
      };
      var getCreationDate = API.__private__.getCreationDate = function (type) {
        var result = creationDate;
        if (type === "jsDate") {
          result = convertPDFDateToDate(creationDate);
        }
        return result;
      };
      /**
       * @name setCreationDate
       * @memberof jsPDF#
       * @function
       * @instance
       * @param {Object} date
       * @returns {jsPDF}
       */
      API.setCreationDate = function (date) {
        setCreationDate(date);
        return this;
      }
      /**
       * @name getCreationDate
       * @memberof jsPDF#
       * @function
       * @instance
       * @param {Object} type
       * @returns {Object}
       */
      API.getCreationDate = function (type) {
        return getCreationDate(type);
      }
      var padd2 = API.__private__.padd2 = function (number) {
        return ('0' + parseInt(number)).slice(-2);
      };
      var padd2Hex = API.__private__.padd2Hex = function(hexString) {
        hexString = hexString.toString();
        return ("00" + hexString).substr(hexString.length);
      }
      var outToPages = !1; // switches where out() prints. outToPages true = push to pages obj. outToPages false = doc builder content
      var pages = [];
      var content = [];
      var currentPage;
      var content_length = 0;
      var customOutputDestination;
      var setOutputDestination = API.__private__.setCustomOutputDestination = function (destination) {
        customOutputDestination = destination;
      };
      var resetOutputDestination = API.__private__.resetCustomOutputDestination = function () {
        customOutputDestination = undefined;
      };
      var out = API.__private__.out = function (string) {
        var writeArray;
        string = (typeof string === "string") ? string : string.toString();
        if (typeof customOutputDestination === "undefined") {
          writeArray = ((outToPages) ? pages[currentPage] : content);
        } else {
          writeArray = customOutputDestination;
        }
        writeArray.push(string);
        if (!outToPages) {
          content_length += string.length + 1;
        }
        return writeArray;
      };
      var write = API.__private__.write = function (value) {
        return out(arguments.length === 1 ? value.toString() : Array.prototype.join.call(arguments, ' '));
      };
      var getArrayBuffer = API.__private__.getArrayBuffer = function (data) {
        var len = data.length,
          ab = new ArrayBuffer(len),
          u8 = new Uint8Array(ab);
        while (len--) u8[len] = data.charCodeAt(len);
        return ab;
      };
      var standardFonts = [
        ['Helvetica', "helvetica", "normal", 'WinAnsiEncoding'],
        ['Helvetica-Bold', "helvetica", "bold", 'WinAnsiEncoding'],
        ['Helvetica-Oblique', "helvetica", "italic", 'WinAnsiEncoding'],
        ['Helvetica-BoldOblique', "helvetica", "bolditalic", 'WinAnsiEncoding'],
        ['Courier', "courier", "normal", 'WinAnsiEncoding'],
        ['Courier-Bold', "courier", "bold", 'WinAnsiEncoding'],
        ['Courier-Oblique', "courier", "italic", 'WinAnsiEncoding'],
        ['Courier-BoldOblique', "courier", "bolditalic", 'WinAnsiEncoding'],
        ['Times-Roman', "times", "normal", 'WinAnsiEncoding'],
        ['Times-Bold', "times", "bold", 'WinAnsiEncoding'],
        ['Times-Italic', "times", "italic", 'WinAnsiEncoding'],
        ['Times-BoldItalic', "times", "bolditalic", 'WinAnsiEncoding'],
        ['ZapfDingbats', "zapfdingbats", "normal", null],
        ['Symbol', "symbol", "normal", null]
      ];
      var getStandardFonts = API.__private__.getStandardFonts = function () {
        return standardFonts;
      };
      var activeFontSize = options.fontSize || 16;
      /**
       * Sets font size for upcoming text elements.
       *
       * @param {number} size Font size in points.
       * @function
       * @instance
       * @returns {jsPDF}
       * @memberof jsPDF#
       * @name setFontSize
       */
      var setFontSize = API.__private__.setFontSize = API.setFontSize = function (size) {
        activeFontSize = size;
        return this;
      };
      /**
       * Gets the fontsize for upcoming text elements.
       *
       * @function
       * @instance
       * @returns {number}
       * @memberof jsPDF#
       * @name getFontSize
       */
      var getFontSize = API.__private__.getFontSize = API.getFontSize = function () {
        return activeFontSize;
      };
      var R2L = options.R2L || false;
      /**
       * Set value of R2L functionality.
       *
       * @param {boolean} value
       * @function
       * @instance
       * @returns {jsPDF} jsPDF-instance
       * @memberof jsPDF#
       * @name setR2L
       */
      var setR2L = API.__private__.setR2L = API.setR2L = function (value) {
        R2L = value;
        return this;
      };
      /**
       * Get value of R2L functionality.
       *
       * @function
       * @instance
       * @returns {boolean} jsPDF-instance
       * @memberof jsPDF#
       * @name getR2L
       */
      var getR2L = API.__private__.getR2L = API.getR2L = function () {
        return R2L;
      };
      var zoomMode; // default: 1;
      var setZoomMode = API.__private__.setZoomMode = function (zoom) {
        var validZoomModes = [undefined, null, 'fullwidth', 'fullheight', 'fullpage', 'original'];
        if (/^\d*\.?\d*\%$/.test(zoom)) {
          zoomMode = zoom;
        } else if (!isNaN(zoom)) {
          zoomMode = parseInt(zoom, 10);
        } else if (validZoomModes.indexOf(zoom) !== -1) {
          zoomMode = zoom
        } else {
          throw new Error('zoom must be Integer (e.g. 2), a percentage Value (e.g. 300%) or fullwidth, fullheight, fullpage, original. "' + zoom + '" is not recognized.')
        }
      }
      var getZoomMode = API.__private__.getZoomMode = function () {
        return zoomMode;
      }
      var pageMode; // default: 'UseOutlines';
      var setPageMode = API.__private__.setPageMode = function (pmode) {
        var validPageModes = [undefined, null, 'UseNone', 'UseOutlines', 'UseThumbs', 'FullScreen'];
        if (validPageModes.indexOf(pmode) == -1) {
          throw new Error('Page mode must be one of UseNone, UseOutlines, UseThumbs, or FullScreen. "' + pmode + '" is not recognized.')
        }
        pageMode = pmode;
      }
      var getPageMode = API.__private__.getPageMode = function () {
        return pageMode;
      }
      var layoutMode; // default: 'continuous';
      var setLayoutMode = API.__private__.setLayoutMode = function (layout) {
        var validLayoutModes = [undefined, null, 'continuous', 'single', 'twoleft', 'tworight', 'two'];
        if (validLayoutModes.indexOf(layout) == -1) {
          throw new Error('Layout mode must be one of continuous, single, twoleft, tworight. "' + layout + '" is not recognized.')
        }
        layoutMode = layout;
      }
      var getLayoutMode = API.__private__.getLayoutMode = function () {
        return layoutMode;
      }
      /**
       * Set the display mode options of the page like zoom and layout.
       *
       * @name setDisplayMode
       * @memberof jsPDF#
       * @function 
       * @instance
       * @param {integer|String} zoom   You can pass an integer or percentage as
       * a string. 2 will scale the document up 2x, '200%' will scale up by the
       * same amount. You can also set it to 'fullwidth', 'fullheight',
       * 'fullpage', or 'original'.
       *
       * Only certain PDF readers support this, such as Adobe Acrobat.
       *
       * @param {string} layout Layout mode can be: 'continuous' - this is the
       * default continuous scroll. 'single' - the single page mode only shows one
       * page at a time. 'twoleft' - two column left mode, first page starts on
       * the left, and 'tworight' - pages are laid out in two columns, with the
       * first page on the right. This would be used for books.
       * @param {string} pmode 'UseOutlines' - it shows the
       * outline of the document on the left. 'UseThumbs' - shows thumbnails along
       * the left. 'FullScreen' - prompts the user to enter fullscreen mode.
       *
       * @returns {jsPDF}
       */
      var setDisplayMode = API.__private__.setDisplayMode = API.setDisplayMode = function (zoom, layout, pmode) {
        setZoomMode(zoom);
        setLayoutMode(layout);
        setPageMode(pmode);
        return this;
      };
      var documentProperties = {
        'title': '',
        'subject': '',
        'author': '',
        'keywords': '',
        'creator': ''
      };
      var getDocumentProperty = API.__private__.getDocumentProperty = function (key) {
        if (Object.keys(documentProperties).indexOf(key) === -1) {
          throw new Error('Invalid argument passed to jsPDF.getDocumentProperty');
        }
        return documentProperties[key];
      };
      var getDocumentProperties = API.__private__.getDocumentProperties = function () {
        return documentProperties;
      };
      /**
       * Adds a properties to the PDF document.
       *
       * @param {Object} A property_name-to-property_value object structure.
       * @function
       * @instance
       * @returns {jsPDF}
       * @memberof jsPDF#
       * @name setDocumentProperties
       */
      var setDocumentProperties = API.__private__.setDocumentProperties = API.setProperties = API.setDocumentProperties = function (properties) {
        // copying only those properties we can render.
        for (var property in documentProperties) {
          if (documentProperties.hasOwnProperty(property) && properties[
              property]) {
            documentProperties[property] = properties[property];
          }
        }
        return this;
      };
      var setDocumentProperty = API.__private__.setDocumentProperty = function (key, value) {
        if (Object.keys(documentProperties).indexOf(key) === -1) {
          throw new Error('Invalid arguments passed to jsPDF.setDocumentProperty');
        }
        return documentProperties[key] = value;
      };
      var objectNumber = 0; // 'n' Current object number
      var offsets = []; // List of offsets. Activated and reset by buildDocument(). Pupulated by various calls buildDocument makes.
      var fonts = {}; // collection of font objects, where key is fontKey - a dynamically created label for a given font.
      var fontmap = {}; // mapping structure fontName > fontStyle > font key - performance layer. See addFont()
      var activeFontKey; // will be string representing the KEY of the font as combination of fontName + fontStyle
      var fontStateStack = []; //
      var patterns = {}; // collection of pattern objects
      var patternMap = {}; // see fonts
      var gStates = {}; // collection of graphic state objects
      var gStatesMap = {}; // see fonts
      var activeGState = null;
      var k; // Scale factor
      var page = 0;
      var pagesContext = [];
      var additionalObjects = [];
      var events = new PubSub(API);
      var hotfixes = options.hotfixes || [];
      var renderTargets = {};
      var renderTargetMap = {};
      var renderTargetStack = [];
      var pageX;
      var pageY;
      var pageMatrix; // only used for FormObjects
      /**
      * A matrix object for 2D homogenous transformations: <br>
      * | a b 0 | <br>
      * | c d 0 | <br>
      * | e f 1 | <br>
      * pdf multiplies matrices righthand: v' = v x m1 x m2 x ...
      *
      * @class
      * @name Matrix
      * @param {number} a
      * @param {number} b
      * @param {number} c
      * @param {number} d
      * @param {number} e
      * @param {number} f
      * @constructor
      */
      var Matrix = function (sx, shy, shx, sy, tx, ty) {
          var round = function (number) {
              if (precision >= 16) {
                  return number;
              } else {
                  return Math.round(number * 100000) / 100000
              }
          };
          var _matrix = [];
          
          /**
          * @name sx
          * @memberof Matrix#
          */
          Object.defineProperty(this, 'sx', {
              get : function() {
                  return _matrix[0];
              },
              set : function(value) {
                  _matrix[0] = round(value);
              }
          });
          /**
          * @name shy
          * @memberof Matrix#
          */
          Object.defineProperty(this, 'shy', {
              get : function() {
                  return _matrix[1];
              },
              set : function(value) {
                  _matrix[1] = round(value);
              }
          });
          /**
          * @name shx
          * @memberof Matrix#
          */
          Object.defineProperty(this, 'shx', {
              get : function() {
                  return _matrix[2];
              },
              set : function(value) {
                  _matrix[2] = round(value);
              }
          });
          /**
          * @name sy
          * @memberof Matrix#
          */
          Object.defineProperty(this, 'sy', {
              get : function() {
                  return _matrix[3];
              },
              set : function(value) {
                  _matrix[3] = round(value);
              }
          });
          
          /**
          * @name tx
          * @memberof Matrix#
          */
          Object.defineProperty(this, 'tx', {
              get : function() {
                  return _matrix[4];
              },
              set : function(value) {
                  _matrix[4] = round(value);
              }
          });
          
          /**
          * @name ty
          * @memberof Matrix#
          */
          Object.defineProperty(this, 'ty', {
              get : function() {
                  return _matrix[5];
              },
              set : function(value) {
                  _matrix[5] = round(value);
              }
          });
          Object.defineProperty(this, 'a', {
              get : function() {
                  return _matrix[0];
              },
              set : function(value) {
                  _matrix[0] = round(value);
              }
          });
          Object.defineProperty(this, 'b', {
              get : function() {
                  return _matrix[1];
              },
              set : function(value) {
                  _matrix[1] = round(value);
              }
          });
          Object.defineProperty(this, 'c', {
              get : function() {
                  return _matrix[2];
              },
              set : function(value) {
                  _matrix[2] = round(value);
              }
          });
          Object.defineProperty(this, 'd', {
              get : function() {
                  return _matrix[3];
              },
              set : function(value) {
                  _matrix[3] = round(value);
              }
          });
          
          Object.defineProperty(this, 'e', {
              get : function() {
                  return _matrix[4];
              },
              set : function(value) {
                  _matrix[4] = round(value);
              }
          });
          
          Object.defineProperty(this, 'f', {
              get : function() {
                  return _matrix[5];
              },
              set : function(value) {
                  _matrix[5] = round(value);
              }
          });
          /**
          * @name rotation
          * @memberof Matrix#
          */
          Object.defineProperty(this, 'rotation', {
              get : function() {
                  return Math.atan2(this.shx, this.sx);
              }
          });
          /**
          * @name scaleX
          * @memberof Matrix#
          */
          Object.defineProperty(this, 'scaleX', {
              get : function() {
                  return this.decompose().scale.sx;
              }
          });
          /**
          * @name scaleY
          * @memberof Matrix#
          */
          Object.defineProperty(this, 'scaleY', {
              get : function() {
                  return this.decompose().scale.sy;
              }
          });
          /**
          * @name isIdentity
          * @memberof Matrix#
          */
          Object.defineProperty(this, 'isIdentity', {
              get : function() {
                  if (this.sx !== 1) {
                      return false;
                  }
                  if (this.shy !== 0) {
                      return false;
                  }
                  if (this.shx !== 0) {
                      return false;
                  }
                  if (this.sy !== 1) {
                      return false;
                  }
                  if (this.tx !== 0) {
                      return false;
                  }
                  if (this.ty !== 0) {
                      return false;
                  }
                  return true;
              }
          });
          this.sx = !isNaN(sx) ? sx : 1;
          this.shy = !isNaN(shy) ? shy : 0;
          this.shx = !isNaN(shx) ? shx : 0;
          this.sy = !isNaN(sy) ? sy : 1;
          this.tx = !isNaN(tx) ? tx : 0;
          this.ty = !isNaN(ty) ? ty : 0;
          return this;
      }
       
      /**
      * Multiply the matrix with given Matrix
      * 
      * @function join
      * @param {string} separator Specifies a string to separate each pair of adjacent elements of the array. The separator is converted to a string if necessary. If omitted, the array elements are separated with a comma (","). If separator is an empty string, all elements are joined without any characters in between them.
      * @returns {string} A string with all array elements joined.
      * @memberof Matrix#
      */
      Matrix.prototype.join = function (parm1) {
          return ([this.sx, this.shy, this.shx, this.sy, this.tx, this.ty]).join(parm1);
      };
      /**
      * Multiply the matrix with given Matrix
      * 
      * @function multiply
      * @param matrix
      * @returns {Matrix}
      * @memberof Matrix#
      */
      Matrix.prototype.multiply = function (matrix) {
          var sx = matrix.sx * this.sx + matrix.shy * this.shx;
          var shy = matrix.sx * this.shy + matrix.shy * this.sy;
          var shx = matrix.shx * this.sx + matrix.sy * this.shx;
          var sy = matrix.shx * this.shy + matrix.sy * this.sy;
          var tx = matrix.tx * this.sx + matrix.ty * this.shx + this.tx;
          var ty = matrix.tx * this.shy + matrix.ty * this.sy + this.ty;
          return new Matrix(sx, shy, shx, sy, tx, ty);
      };
      /**
      * @function decompose
      * @memberof Matrix#
      */
      Matrix.prototype.decompose = function () {
          var a = this.sx;
          var b = this.shy;
          var c = this.shx;
          var d = this.sy;
          var e = this.tx;
          var f = this.ty;
          var scaleX = Math.sqrt(a * a + b * b);
          a /= scaleX;
          b /= scaleX;
          var shear = a * c + b * d;
          c -= a * shear;
          d -= b * shear;
          var scaleY = Math.sqrt(c * c + d * d);
          c /= scaleY;
          d /= scaleY;
          shear /= scaleY;
          if (a * d < b * c) {
              a = -a;
              b = -b;
              shear = -shear;
              scaleX = -scaleX;
          }
          return {
              scale: new Matrix(scaleX, 0, 0, scaleY, 0, 0),
              translate: new Matrix(1, 0, 0, 1, e, f),
              rotate: new Matrix(a, b, -b, a, 0, 0),
              skew: new Matrix(1, 0, shear, 1, 0, 0)
          };
      };
      /**
      * @function toString
      * @memberof Matrix#
      */
      Matrix.prototype.toString = function (parmPrecision) {
        var tmpPrecision = precision || parmPrecision || 5
        var round = function (number) {
        if (precision >= 16) {
          return hpf(number);
        } else {
          return Math.round(number * Math.pow(10, tmpPrecision)) / Math.pow(10, tmpPrecision)
        }
      };
        return [round(this.sx), round(this.shy), round(this.shx), round(this.sy), round(this.tx), round(this.ty)].join(" ");
      };
      /**
      * @function inversed
      * @memberof Matrix#
      */
      Matrix.prototype.inversed = function () {
          var a = this.sx,
            b = this.shy,
            c = this.shx,
            d = this.sy,
            e = this.tx,
            f = this.ty;
          var quot = 1 / (a * d - b * c);
          var aInv = d * quot;
          var bInv = -b * quot;
          var cInv = -c * quot;
          var dInv = a * quot;
          var eInv = -aInv * e - cInv * f;
          var fInv = -bInv * e - dInv * f;
          return new Matrix(aInv, bInv, cInv, dInv, eInv, fInv);
      };
      /**
      * @function applyToPoint
      * @memberof Matrix#
      */
      Matrix.prototype.applyToPoint = function (pt) {
          var x = pt.x * this.sx + pt.y * this.shx + this.tx;
          var y = pt.x * this.shy + pt.y * this.sy + this.ty;
          return new Point(x, y);
      };
      /**
      * @function applyToRectangle
      * @memberof Matrix#
      */
      Matrix.prototype.applyToRectangle = function (rect) {
          var pt1 = this.applyToPoint(rect);
          var pt2 = this.applyToPoint(new Point(rect.x + rect.w, rect.y + rect.h));
          return new Rectangle(pt1.x, pt1.y, pt2.x - pt1.x, pt2.y - pt1.y);
      };
      /**
      * Clone the Matrix
      *
      * @function clone
      * @memberof Matrix#
      * @name clone
      * @instance
      */
      Matrix.prototype.clone = function () {
          var sx = this.sx;
          var shy = this.shy;
          var shx = this.shx;
          var sy = this.sy;
          var tx = this.tx;
          var ty = this.ty;
          return new Matrix(sx, shy, shx, sy, tx, ty);
      };
      API.Matrix = Matrix;
      /**
       * Multiplies two matrices. (see {@link Matrix})
       * @param {Matrix} m1
       * @param {Matrix} m2
       * @memberof jsPDF#
       * @name matrixMult
       */
      var matrixMult = API.matrixMult  = function (m1, m2) {
          return m1.multiply(m2);
      };
      /**
       * The identity matrix (equivalent to new Matrix(1, 0, 0, 1, 0, 0)).
       * @type {Matrix}
       * @memberof! jsPDF#
       * @name identityMatrix
       */
      var identityMatrix = new Matrix(1, 0, 0, 1, 0, 0);
      API.unitMatrix = API.identityMatrix = identityMatrix;
      var newObject = API.__private__.newObject = function () {
          var oid = newObjectDeferred();
          newObjectDeferredBegin(oid, true);
          return oid;
      };
      
      // Does not output the object.  The caller must call newObjectDeferredBegin(oid) before outputing any data
      var newObjectDeferred = API.__private__.newObjectDeferred = function () {
        objectNumber++;
        offsets[objectNumber] = function () {
          return content_length;
        };
        return objectNumber;
      };
      
      var newObjectDeferredBegin = function (oid, doOutput) {
        doOutput = typeof (doOutput) === 'boolean' ? doOutput : false;
        offsets[oid] = content_length;
        if (doOutput) {
          out(oid + ' 0 obj');
        }
        return oid;
      };
      // Does not output the object until after the pages have been output.
      // Returns an object containing the objectId and content.
      // All pages have been added so the object ID can be estimated to start right after.
      // This does not modify the current objectNumber;  It must be updated after the newObjects are output.
      var newAdditionalObject = API.__private__.newAdditionalObject = function () {
        var objId = newObjectDeferred();
        var obj = {
          objId: objId,
          content: ''
        };
        additionalObjects.push(obj);
        return obj;
      };
      var rootDictionaryObjId = newObjectDeferred();
      var resourceDictionaryObjId = newObjectDeferred();
      /////////////////////
      // Private functions
      /////////////////////
      var decodeColorString = API.__private__.decodeColorString = function (color) {
        var colorEncoded = color.split(' ');
        if (colorEncoded.length === 2 && (colorEncoded[1] === 'g' || colorEncoded[1] === 'G')) {
          // convert grayscale value to rgb so that it can be converted to hex for consistency
          var floatVal = parseFloat(colorEncoded[0]);
          colorEncoded = [floatVal, floatVal, floatVal, 'r'];
        } else if (colorEncoded.length === 5 && (colorEncoded[4] === 'k' || colorEncoded[4] === 'K')) {
          // convert CMYK values to rbg so that it can be converted to hex for consistency
          var red = (1.0 - colorEncoded[0]) * (1.0 - colorEncoded[3]);
          var green = (1.0 - colorEncoded[1]) * (1.0 - colorEncoded[3]);
          var blue = (1.0 - colorEncoded[2]) * (1.0 - colorEncoded[3]);
          colorEncoded = [red, green, blue, 'r'];
        }
        var colorAsRGB = '#';
        for (var i = 0; i < 3; i++) {
          colorAsRGB += ('0' + Math.floor(parseFloat(colorEncoded[i]) * 255).toString(16)).slice(-2);
        }
        return colorAsRGB;
      }
      var encodeColorString = API.__private__.encodeColorString = function (options) {
        var color;
        if (typeof options === "string") {
          options = {
            ch1: options
          };
        }
        var ch1 = options.ch1;
        var ch2 = options.ch2;
        var ch3 = options.ch3;
        var ch4 = options.ch4;
        var letterArray = (options.pdfColorType === "draw") ? ['G', 'RG', 'K'] : ['g', 'rg', 'k'];
        if ((typeof ch1 === "string") && ch1.charAt(0) !== '#') {
          var rgbColor = new RGBColor(ch1);
          if (rgbColor.ok) {
            ch1 = rgbColor.toHex();
          } else if (!(/^\d*\.?\d*$/.test(ch1))) {
            throw new Error('Invalid color "' + ch1 + '" passed to jsPDF.encodeColorString.');
          }
        }
        //convert short rgb to long form
        if ((typeof ch1 === "string") && (/^#[0-9A-Fa-f]{3}$/).test(ch1)) {
          ch1 = '#' + ch1[1] + ch1[1] + ch1[2] + ch1[2] + ch1[3] + ch1[3];
        }
        if ((typeof ch1 === "string") && (/^#[0-9A-Fa-f]{6}$/).test(ch1)) {
          var hex = parseInt(ch1.substr(1), 16);
          ch1 = (hex >> 16) & 255;
          ch2 = (hex >> 8) & 255;
          ch3 = (hex & 255);
        }
        if ((typeof ch2 === "undefined") || ((typeof ch4 === "undefined") && (ch1 === ch2) && (ch2 === ch3))) {
          // Gray color space.
          if (typeof ch1 === "string") {
            color = ch1 + " " + letterArray[0];
          } else {
            switch (options.precision) {
              case 2:
                color = f2(ch1 / 255) + " " + letterArray[0];
                break;
              case 3:
              default:
                color = f3(ch1 / 255) + " " + letterArray[0];
            }
          }
        } else if (typeof ch4 === "undefined" || typeof ch4 === "object") {
          // assume RGBA
          if (ch4 && !isNaN(ch4.a)) {
            //TODO Implement transparency.
            //WORKAROUND use white for now, if transparent, otherwise handle as rgb
            if (ch4.a === 0) {
              color = ['1.000', '1.000', '1.000', letterArray[1]].join(" ");
              return color;
            }
          }
          // assume RGB
          if (typeof ch1 === "string") {
            color = [ch1, ch2, ch3, letterArray[1]].join(" ");
          } else {
            switch (options.precision) {
              case 2:
                color = [f2(ch1 / 255), f2(ch2 / 255), f2(ch3 / 255), letterArray[1]].join(" ");
                break;
              default:
              case 3:
                color = [f3(ch1 / 255), f3(ch2 / 255), f3(ch3 / 255), letterArray[1]].join(" ");
            }
          }
        } else {
          // assume CMYK
          if (typeof ch1 === 'string') {
            color = [ch1, ch2, ch3, ch4, letterArray[2]].join(" ");
          } else {
            switch (options.precision) {
              case 2:
                color = [f2(ch1), f2(ch2), f2(ch3), f2(ch4), letterArray[2]].join(" ");
                break;
              case 3:
              default:
                color = [f3(ch1), f3(ch2), f3(ch3), f3(ch4), letterArray[2]].join(" ");
            }
          }
        }
        return color;
      };
      var getFilters = API.__private__.getFilters = function () {
        return filters;
      };
      
      var putStream = API.__private__.putStream = function (options) {
        options = options || {};
        var data = options.data || '';
        var filters = options.filters || getFilters();
        var alreadyAppliedFilters = options.alreadyAppliedFilters || [];
        var addLength1 = options.addLength1 || false;
        var valueOfLength1 = data.length;
        var processedData = {};
        if (filters === true) {
          filters = ['FlateEncode'];
        }
        var keyValues = options.additionalKeyValues || [];
        if (typeof jsPDF.API.processDataByFilters !== 'undefined') {
          processedData = jsPDF.API.processDataByFilters(data, filters);
        } else {
          processedData = {data: data, reverseChain : []}  
        }
        var filterAsString = processedData.reverseChain + ((Array.isArray(alreadyAppliedFilters)) ? alreadyAppliedFilters.join(' ') : alreadyAppliedFilters.toString());
        if (processedData.data.length !== 0) {
          keyValues.push({
            key: 'Length',
            value: processedData.data.length
          });
          if (addLength1 === true) {
            keyValues.push({
              key: 'Length1',
              value: valueOfLength1
            });
          }
        }
        if (filterAsString.length != 0) {
          //if (filters.length === 0 && alreadyAppliedFilters.length === 1 && typeof alreadyAppliedFilters !== "undefined") {
          if ((filterAsString.split('/').length - 1 === 1)) {
            keyValues.push({
              key: 'Filter',
              value: filterAsString
            });
          } else {
            keyValues.push({
              key: 'Filter',
              value: '[' + filterAsString + ']'
            });
          }
        }
        out('<<');
        for (var i = 0; i < keyValues.length; i++) {
          out('/' + keyValues[i].key + ' ' + keyValues[i].value);
        }
        out('>>');
        if (processedData.data.length !== 0) {
          out('stream');
          out(processedData.data);
          out('endstream');
        }
      };
      var putPage = API.__private__.putPage = function (page) {
        var pageNumber = page.number;
        var data = page.data;
        var pageObjectNumber = page.objId;
        var pageContentsObjId = page.contentsObjId;
        newObjectDeferredBegin(pageObjectNumber, true);
        out('<</Type /Page');
        out('/Parent ' + page.rootDictionaryObjId + ' 0 R');
        out('/Resources ' + page.resourceDictionaryObjId + ' 0 R');
        out('/MediaBox [' + parseFloat(f2(page.mediaBox.bottomLeftX)) + ' ' + parseFloat(f2(page.mediaBox.bottomLeftY)) + ' ' + f2(page.mediaBox.topRightX) + ' ' + f2(page.mediaBox.topRightY) + ']');
        if (page.cropBox !== null) {
          out('/CropBox [' + f2(page.cropBox.bottomLeftX) + ' ' + f2(page.cropBox.bottomLeftY) + ' ' + f2(page.cropBox.topRightX) + ' ' + f2(page.cropBox.topRightY) + ']');
        }
        if (page.bleedBox !== null) {
          out('/BleedBox [' + f2(page.bleedBox.bottomLeftX) + ' ' + f2(page.bleedBox.bottomLeftY) + ' ' + f2(page.bleedBox.topRightX) + ' ' + f2(page.bleedBox.topRightY) + ']');
        }
        if (page.trimBox !== null) {
          out('/TrimBox [' + f2(page.trimBox.bottomLeftX) + ' ' + f2(page.trimBox.bottomLeftY) + ' ' + f2(page.trimBox.topRightX) + ' ' + f2(page.trimBox.topRightY) + ']');
        }
        if (page.artBox !== null) {
          out('/ArtBox [' + f2(page.artBox.bottomLeftX) + ' ' + f2(page.artBox.bottomLeftY) + ' ' + f2(page.artBox.topRightX) + ' ' + f2(page.artBox.topRightY) + ']');
        }
        if (typeof page.userUnit === "number" && page.userUnit !== 1.0) {
          out('/UserUnit ' + page.userUnit);
       }
        events.publish('putPage', {
          objId : pageObjectNumber,
          pageContext: pagesContext[pageNumber],
          pageNumber: pageNumber,
          page: data
        });
        out('/Contents ' + pageContentsObjId + ' 0 R');
        out('>>');
        out('endobj');
        // Page content
        var pageContent = data.join('\n');
        newObjectDeferredBegin(pageContentsObjId, true);
        putStream({
          data: pageContent,
          filters: getFilters()
        });
        out('endobj');
        return pageObjectNumber;
      }
      var putPages = API.__private__.putPages = function () {
        var n, i, pageObjectNumbers = [];
        
        for (n = 1; n <= page; n++) {
          pagesContext[n].objId = newObjectDeferred();
          pagesContext[n].contentsObjId = newObjectDeferred();
        }
        for (n = 1; n <= page; n++) {
          pageObjectNumbers.push(putPage({
            number: n,
            data: pages[n],
            objId: pagesContext[n].objId,
            contentsObjId: pagesContext[n].contentsObjId,
            mediaBox: pagesContext[n].mediaBox,
            cropBox: pagesContext[n].cropBox,
            bleedBox: pagesContext[n].bleedBox,
            trimBox: pagesContext[n].trimBox,
            artBox: pagesContext[n].artBox,
            userUnit: pagesContext[n].userUnit,
            rootDictionaryObjId: rootDictionaryObjId, 
            resourceDictionaryObjId: resourceDictionaryObjId
          }));
        }
        newObjectDeferredBegin(rootDictionaryObjId, true);
        out('<</Type /Pages');
        var kids = '/Kids [';
        for (i = 0; i < page; i++) {
          kids += pageObjectNumbers[i] + ' 0 R ';
        }
        out(kids + ']');
        out('/Count ' + page);
        out('>>');
        out('endobj');
        events.publish('postPutPages');
      };
      var putFont = function (font) {
        var pdfEscapeWithNeededParanthesis = function (text, flags) {
          var addParanthesis = text.indexOf(' ') !== -1;
          return (addParanthesis) ? '(' + pdfEscape(text, flags) + ')' : pdfEscape(text, flags);
        }
        events.publish('putFont', {
          font: font,
          out: out,
          newObject: newObject,
          putStream: putStream,
          pdfEscapeWithNeededParanthesis: pdfEscapeWithNeededParanthesis
        });
        if (font.isAlreadyPutted !== true) {
          font.objectNumber = newObject();
          out('<<');
          out('/Type /Font');
          out('/BaseFont /' + pdfEscapeWithNeededParanthesis(font.postScriptName));
          out('/Subtype /Type1');
          if (typeof font.encoding === 'string') {
            out('/Encoding /' + font.encoding);
          }
          out('/FirstChar 32');
          out('/LastChar 255');
          out('>>');
          out('endobj');
        }
      };
      var putFonts = function () {
        for (var fontKey in fonts) {
          if (fonts.hasOwnProperty(fontKey)) {
            if (putOnlyUsedFonts === false || (putOnlyUsedFonts === true && usedFonts.hasOwnProperty(fontKey))) {
              putFont(fonts[fontKey]);
            }
          }
        }
      };
      var putXObject = function(xObject) {
        xObject.objectNumber = newObject();
        out("<<");
        out("/Type /XObject");
        out("/Subtype /Form");
        out(
          "/BBox [" +
            [hpf(xObject.x), hpf(xObject.y), hpf(xObject.x + xObject.width), hpf(xObject.y + xObject.height)].join(
              " "
            ) +
            "]"
        );
        out("/Matrix [" + xObject.matrix.toString() + "]");
        // TODO: /Resources
        var p = xObject.pages[1].join("\n");
        out("/Length " + p.length);
        out(">>");
        putStream(p);
        out("endobj");
      };
      var putXObjects = function() {
        for (var xObjectKey in renderTargets) {
          if (renderTargets.hasOwnProperty(xObjectKey)) {
            putXObject(renderTargets[xObjectKey]);
          }
        }
      };
      var interpolateAndEncodeRGBStream = function(colors, numberSamples) {
        var tValues = [];
        var t;
        var dT = 1.0 / (numberSamples - 1);
        for (t = 0.0; t < 1.0; t += dT) {
          tValues.push(t);
        }
        tValues.push(1.0);
        // add first and last control point if not present
        if (colors[0].offset != 0.0) {
          var c0 = {
            offset: 0.0,
            color: colors[0].color
          };
          colors.unshift(c0);
        }
        if (colors[colors.length - 1].offset != 1.0) {
          var c1 = {
            offset: 1.0,
            color: colors[colors.length - 1].color
          };
          colors.push(c1);
        }
        var out = "";
        var index = 0;
        for (var i = 0; i < tValues.length; i++) {
          t = tValues[i];
          while (t > colors[index + 1].offset) index++;
          var a = colors[index].offset;
          var b = colors[index + 1].offset;
          var d = (t - a) / (b - a);
          var aColor = colors[index].color;
          var bColor = colors[index + 1].color;
          out +=
            padd2Hex(Math.round((1 - d) * aColor[0] + d * bColor[0]).toString(16)) +
            padd2Hex(Math.round((1 - d) * aColor[1] + d * bColor[1]).toString(16)) +
            padd2Hex(Math.round((1 - d) * aColor[2] + d * bColor[2]).toString(16));
        }
        return out.trim();
      };
      var putShadingPattern = function(pattern, numberSamples) {
      /*
       Axial patterns shade between the two points specified in coords, radial patterns between the inner
       and outer circle.
       The user can specify an array (colors) that maps t-Values in [0, 1] to RGB colors. These are now
       interpolated to equidistant samples and written to pdf as a sample (type 0) function.
       */
       out("/Shading <<");
        // The number of color samples that should be used to describe the shading.
        // The higher, the more accurate the gradient will be.
        numberSamples || (numberSamples = 21);
        var funcObjectNumber = newObject();
        var stream = interpolateAndEncodeRGBStream(pattern.colors, numberSamples);
        out("<< /FunctionType 0");
        out("/Domain [0.0 1.0]");
        out("/Size [" + numberSamples + "]");
        out("/BitsPerSample 8");
        out("/Range [0.0 1.0 0.0 1.0 0.0 1.0]");
        out("/Decode [0.0 1.0 0.0 1.0 0.0 1.0]");
        out("/Length " + stream.length);
        // The stream is Hex encoded
        out("/Filter /ASCIIHexDecode");
        out(">>");
        putStream(stream);
        out("endobj");
        pattern.objectNumber = newObject();
        out("<< /ShadingType " + pattern.type);
        out("/ColorSpace /DeviceRGB");
        var coords =
          "/Coords [" +
          hpf(parseFloat(pattern.coords[0])) +
          " " + // x1
          hpf(parseFloat(pattern.coords[1])) +
          " "; // y1
        if (pattern.type === 2) {
          // axial
          coords +=
            hpf(parseFloat(pattern.coords[2])) +
            " " + // x2
            hpf(parseFloat(pattern.coords[3])); // y2
        } else {
          // radial
          coords +=
            hpf(parseFloat(pattern.coords[2])) +
            " " + // r1
            hpf(parseFloat(pattern.coords[3])) +
            " " + // x2
            hpf(parseFloat(pattern.coords[4])) +
            " " + // y2
            hpf(parseFloat(pattern.coords[5])); // r2
        }
        coords += "]";
        out(coords);
        if (pattern.matrix) {
          out("/Matrix [" + pattern.matrix.toString() + "]");
        }
        out("/Function " + funcObjectNumber + " 0 R");
        out("/Extend [true true]");
        out(">>");
        out("endobj");
        out(">>");
      };
      var putTilingPattern = function(pattern) {
        var resourcesObjectNumber = newObject();
        putResourceDictionary();
        out("endobj");
        pattern.objectNumber = newObject();
        out("<< /Type /Pattern");
        out("/PatternType 1"); // tiling pattern
        out("/PaintType 1"); // colored tiling pattern
        out("/TilingType 1"); // constant spacing
        out("/BBox [" + pattern.boundingBox.map(hpf).join(" ") + "]");
        out("/XStep " + hpf(pattern.xStep));
        out("/YStep " + hpf(pattern.yStep));
        out("/Length " + pattern.stream.length);
        out("/Resources " + resourcesObjectNumber + " 0 R"); // TODO: resources
        pattern.matrix && out("/Matrix [" + pattern.matrix.toString() + "]");
        out(">>");
        putStream(pattern.stream);
        out("endobj");
      };
      var putPatterns = function() {
        var patternKey;
        for (patternKey in patterns) {
          if (patterns.hasOwnProperty(patternKey)) {
            if (patterns[patternKey] instanceof API.ShadingPattern) {
              putShadingPattern(patterns[patternKey]);
            } else if (patterns[patternKey] instanceof API.TilingPattern) {
              putTilingPattern(patterns[patternKey]);
            }
          }
        }
      };
      var putGState = function(gState) {
        gState.objectNumber = newObject();
        out("<<");
        for (var p in gState) {
          switch (p) {
            case "opacity":
              out("/ca " + f2(gState[p]));
              break;
            case "stroke-opacity":
              out("/CA " + f2(gState[p]));
              break;
          }
        }
        out(">>");
        out("endobj");
      };
      var putGStates = function() {
        var gStateKey;
        for (gStateKey in gStates) {
          if (gStates.hasOwnProperty(gStateKey)) {
            putGState(gStates[gStateKey]);
          }
        }
      };
      var putXobjectDict = function() {
        out("/XObject <<");
        for (var xObjectKey in renderTargets) {
          if (renderTargets.hasOwnProperty(xObjectKey) && renderTargets[xObjectKey].objectNumber >= 0) {
            out("/" + xObjectKey + " " + renderTargets[xObjectKey].objectNumber + " 0 R");
          }
        }
        // Loop through images, or other data objects
        events.publish("putXobjectDict");
        out(">>");
      };
      var putFontDict = function() {
        out('/Font <<');
        for (var fontKey in fonts) {
          if (fonts.hasOwnProperty(fontKey)) {
            if (putOnlyUsedFonts === true && usedFonts.hasOwnProperty(fontKey)) {
              out('/' + fontKey + ' ' + fonts[fontKey].objectNumber + ' 0 R');
             }
          }
        }
        out('>>');
      };
      var putShadingPatternDict = function() {
        if (Object.keys(patterns).length > 0) {
          out("/Shading <<");
          for (var patternKey in patterns) {
            if (
              patterns.hasOwnProperty(patternKey) &&
              patterns[patternKey] instanceof API.ShadingPattern &&
              patterns[patternKey].objectNumber >= 0
            ) {
              out("/" + patternKey + " " + patterns[patternKey].objectNumber + " 0 R");
            }
          }
          events.publish("putShadingPatternDict");
          out(">>");
        }
      };
      var putTilingPatternDict = function() {
        if (Object.keys(patterns).length > 0) {
          out("/Pattern <<");
          for (var patternKey in patterns) {
            if (
              patterns.hasOwnProperty(patternKey) &&
              patterns[patternKey] instanceof API.TilingPattern &&
              patterns[patternKey].objectNumber >= 0
            ) {
              out("/" + patternKey + " " + patterns[patternKey].objectNumber + " 0 R");
            }
          }
          events.publish("putTilingPatternDict");
        }
      };
      var putGStatesDict = function() {
        if (Object.keys(gStates).length > 0) {
          var gStateKey;
          out("/ExtGState <<");
          for (gStateKey in gStates) {
            if (gStates.hasOwnProperty(gStateKey) && gStates[gStateKey].objectNumber >= 0) {
              out("/" + gStateKey + " " + gStates[gStateKey].objectNumber + " 0 R");
            }
          }
          events.publish("putGStateDict");
          out(">>");
        }
      };
      var putResourceDictionary = function () {
        out('<<');
        out('/ProcSet [/PDF /Text /ImageB /ImageC /ImageI]');
        putFontDict();
        putShadingPatternDict();
        putTilingPatternDict();
        putGStatesDict();
        putXobjectDict();
        out('>>');
      };
      var putResources = function () {
        putFonts();
        putGStates();
        putXObjects();
        putPatterns();
        events.publish('putResources');
        newObjectDeferredBegin(resourceDictionaryObjId, true);
        putResourceDictionary();
        out('endobj');
        events.publish('postPutResources');
      };
      var putAdditionalObjects = function () {
        events.publish('putAdditionalObjects');
        for (var i = 0; i < additionalObjects.length; i++) {
          var obj = additionalObjects[i];
          newObjectDeferredBegin(obj.objId, true);
          out(obj.content);
          out('endobj');
        }
        events.publish('postPutAdditionalObjects');
      };
      var addToFontDictionary = function (fontKey, fontName, fontStyle) {
        // this is mapping structure for quick font key lookup.
        // returns the KEY of the font (ex: "F1") for a given
        // pair of font name and type (ex: "Arial". "Italic")
        if (!fontmap.hasOwnProperty(fontName)) {
          fontmap[fontName] = {};
        }
        fontmap[fontName][fontStyle] = fontKey;
      };
      var addFont = function (postScriptName, fontName, fontStyle, encoding, isStandardFont) {
        isStandardFont = isStandardFont || false;
        var fontKey = 'F' + (Object.keys(fonts).length + 1).toString(10),
          // This is FontObject
          font = {
            'id': fontKey,
            'postScriptName': postScriptName,
            'fontName': fontName,
            'fontStyle': fontStyle,
            'encoding': encoding,
            'isStandardFont': isStandardFont,
            'metadata': {}
          };
        var instance = this;
        events.publish('addFont', {
          font: font,
          instance: instance
        });
        if (fontKey !== undefined) {
          fonts[fontKey] = font;
          addToFontDictionary(fontKey, fontName, fontStyle);
        }
        return fontKey;
      };
      var addFonts = function (arrayOfFonts) {
        for (var i = 0, l = standardFonts.length; i < l; i++) {
          var fontKey = addFont(
            arrayOfFonts[i][0],
            arrayOfFonts[i][1],
            arrayOfFonts[i][2],
            standardFonts[i][3],
            true);
            
          usedFonts[fontKey] = true;
          // adding aliases for standard fonts, this time matching the capitalization
          var parts = arrayOfFonts[i][0].split('-');
          addToFontDictionary(fontKey, parts[0], parts[1] || '');
        }
        events.publish('addFonts', {
          fonts: fonts,
          dictionary: fontmap
        });
      };
      var SAFE = function __safeCall(fn) {
        fn.foo = function __safeCallWrapper() {
          try {
            return fn.apply(this, arguments);
          } catch (e) {
            var stack = e.stack || '';
            if (~stack.indexOf(' at ')) stack = stack.split(" at ")[1];
            var m = "Error in function " + stack.split("\n")[0].split('<')[
              0] + ": " + e.message;
            if (global.console) {
              global.console.error(m, e);
              if (global.alert) alert(m);
            } else {
              throw new Error(m);
            }
          }
        };
        fn.foo.bar = fn;
        return fn.foo;
      };
      var to8bitStream = function (text, flags) {
        /**
         * PDF 1.3 spec:
         * "For text strings encoded in Unicode, the first two bytes must be 254 followed by
         * 255, representing the Unicode byte order marker, U+FEFF. (This sequence conflicts
         * with the PDFDocEncoding character sequence thorn ydieresis, which is unlikely
         * to be a meaningful beginning of a word or phrase.) The remainder of the
         * string consists of Unicode character codes, according to the UTF-16 encoding
         * specified in the Unicode standard, version 2.0. Commonly used Unicode values
         * are represented as 2 bytes per character, with the high-order byte appearing first
         * in the string."
         *
         * In other words, if there are chars in a string with char code above 255, we
         * recode the string to UCS2 BE - string doubles in length and BOM is prepended.
         *
         * HOWEVER!
         * Actual *content* (body) text (as opposed to strings used in document properties etc)
         * does NOT expect BOM. There, it is treated as a literal GID (Glyph ID)
         *
         * Because of Adobe's focus on "you subset your fonts!" you are not supposed to have
         * a font that maps directly Unicode (UCS2 / UTF16BE) code to font GID, but you could
         * fudge it with "Identity-H" encoding and custom CIDtoGID map that mimics Unicode
         * code page. There, however, all characters in the stream are treated as GIDs,
         * including BOM, which is the reason we need to skip BOM in content text (i.e. that
         * that is tied to a font).
         *
         * To signal this "special" PDFEscape / to8bitStream handling mode,
         * API.text() function sets (unless you overwrite it with manual values
         * given to API.text(.., flags) )
         * flags.autoencode = true
         * flags.noBOM = true
         *
         * ===================================================================================
         * `flags` properties relied upon:
         *   .sourceEncoding = string with encoding label.
         *                     "Unicode" by default. = encoding of the incoming text.
         *                     pass some non-existing encoding name
         *                     (ex: 'Do not touch my strings! I know what I am doing.')
         *                     to make encoding code skip the encoding step.
         *   .outputEncoding = Either valid PDF encoding name
         *                     (must be supported by jsPDF font metrics, otherwise no encoding)
         *                     or a JS object, where key = sourceCharCode, value = outputCharCode
         *                     missing keys will be treated as: sourceCharCode === outputCharCode
         *   .noBOM
         *       See comment higher above for explanation for why this is important
         *   .autoencode
         *       See comment higher above for explanation for why this is important
         */
        var i, l, sourceEncoding, encodingBlock, outputEncoding, newtext,
          isUnicode, ch, bch;
        flags = flags || {};
        sourceEncoding = flags.sourceEncoding || 'Unicode';
        outputEncoding = flags.outputEncoding;
        // This 'encoding' section relies on font metrics format
        // attached to font objects by, among others,
        // "Willow Systems' standard_font_metrics plugin"
        // see jspdf.plugin.standard_font_metrics.js for format
        // of the font.metadata.encoding Object.
        // It should be something like
        //   .encoding = {'codePages':['WinANSI....'], 'WinANSI...':{code:code, ...}}
        //   .widths = {0:width, code:width, ..., 'fof':divisor}
        //   .kerning = {code:{previous_char_code:shift, ..., 'fof':-divisor},...}
        if ((flags.autoencode || outputEncoding) &&
          fonts[activeFontKey].metadata &&
          fonts[activeFontKey].metadata[sourceEncoding] &&
          fonts[activeFontKey].metadata[sourceEncoding].encoding) {
          encodingBlock = fonts[activeFontKey].metadata[sourceEncoding].encoding;
          // each font has default encoding. Some have it clearly defined.
          if (!outputEncoding && fonts[activeFontKey].encoding) {
            outputEncoding = fonts[activeFontKey].encoding;
          }
          // Hmmm, the above did not work? Let's try again, in different place.
          if (!outputEncoding && encodingBlock.codePages) {
            outputEncoding = encodingBlock.codePages[0]; // let's say, first one is the default
          }
          if (typeof outputEncoding === 'string') {
            outputEncoding = encodingBlock[outputEncoding];
          }
          // we want output encoding to be a JS Object, where
          // key = sourceEncoding's character code and
          // value = outputEncoding's character code.
          if (outputEncoding) {
            isUnicode = false;
            newtext = [];
            for (i = 0, l = text.length; i < l; i++) {
              ch = outputEncoding[text.charCodeAt(i)];
              if (ch) {
                newtext.push(
                  String.fromCharCode(ch));
              } else {
                newtext.push(
                  text[i]);
              }
              // since we are looping over chars anyway, might as well
              // check for residual unicodeness
              if (newtext[i].charCodeAt(0) >> 8) {
                /* more than 255 */
                isUnicode = true;
              }
            }
            text = newtext.join('');
          }
        }
        i = text.length;
        // isUnicode may be set to false above. Hence the triple-equal to undefined
        while (isUnicode === undefined && i !== 0) {
          if (text.charCodeAt(i - 1) >> 8) {
            /* more than 255 */
            isUnicode = true;
          }
          i--;
        }
        if (!isUnicode) {
          return text;
        }
        newtext = flags.noBOM ? [] : [254, 255];
        for (i = 0, l = text.length; i < l; i++) {
          ch = text.charCodeAt(i);
          bch = ch >> 8; // divide by 256
          if (bch >> 8) {
            /* something left after dividing by 256 second time */
            throw new Error("Character at position " + i + " of string '" +
              text + "' exceeds 16bits. Cannot be encoded into UCS-2 BE");
          }
          newtext.push(bch);
          newtext.push(ch - (bch << 8));
        }
        return String.fromCharCode.apply(undefined, newtext);
      };
      var pdfEscape = API.__private__.pdfEscape = API.pdfEscape = function (text, flags) {
        /**
         * Replace '/', '(', and ')' with pdf-safe versions
         *
         * Doing to8bitStream does NOT make this PDF display unicode text. For that
         * we also need to reference a unicode font and embed it - royal pain in the rear.
         *
         * There is still a benefit to to8bitStream - PDF simply cannot handle 16bit chars,
         * which JavaScript Strings are happy to provide. So, while we still cannot display
         * 2-byte characters property, at least CONDITIONALLY converting (entire string containing)
         * 16bit chars to (USC-2-BE) 2-bytes per char + BOM streams we ensure that entire PDF
         * is still parseable.
         * This will allow immediate support for unicode in document properties strings.
         */
        return to8bitStream(text, flags).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
      };
      var beginPage = API.__private__.beginPage = function (parmFormat, parmOrientation) {
        var tmp, width, height;
        if (typeof parmFormat === 'string') {
          if (tmp = getPageFormat(parmFormat.toLowerCase())) {
            width = tmp[0];
            height = tmp[1];
          }
        }
        if (Array.isArray(parmFormat)) {
          width = parmFormat[0] * k;
          height = parmFormat[1] * k;
        }
        if (isNaN(width)) {
          width = format[0];
          height = format[1];
        }
        if (parmOrientation) {
          switch (parmOrientation.substr(0, 1)) {
            case 'l':
              if (height > width) orientation = 's';
              break;
            case 'p':
              if (width > height) orientation = 's';
              break;
          }
          if (orientation === 's') {
            tmp = width;
            width = height;
            height = tmp;
          }
        }
        if (width > 14400 || height > 14400) {
            console.warn('A page in a PDF can not be wider or taller than 14400 userUnit. jsPDF limits the width/height to 14400');
            width = Math.min(14400, width);
            height = Math.min(14400, height);
        }
        format = [width, height];
        outToPages = true;
        pages[++page] = [];
        pagesContext[page] = {
          objId: 0,
          contentsObjId: 0,
          userUnit : Number(userUnit),
          artBox: null,
          bleedBox: null,
          cropBox: null,
          trimBox: null,
          mediaBox: {
            bottomLeftX: 0,
            bottomLeftY: 0,
            topRightX: Number(width),
            topRightY: Number(height)
          }
        };
        _setPage(page);
      };
      var _addPage = function () {
        beginPage.apply(this, arguments);
        // Set line width
        setLineWidth(lineWidth);
        // Set draw color
        out(strokeColor);
        // resurrecting non-default line caps, joins
        if (lineCapID !== 0) {
          out(lineCapID + ' J');
        }
        if (lineJoinID !== 0) {
          out(lineJoinID + ' j');
        }
        events.publish('addPage', {
          pageNumber: page
        });
      };
      var _deletePage = function (n) {
        if (n > 0 && n <= page) {
          pages.splice(n, 1);
          pagesContext.splice(n, 1);
          page--;
          if (currentPage > page) {
            currentPage = page;
          }
          this.setPage(currentPage);
        }
      };
      var _setPage = function (n) {
        if (n > 0 && n <= page) {
          currentPage = n;
        }
      };
      var getNumberOfPages = API.__private__.getNumberOfPages = API.getNumberOfPages = function () {
        return pages.length - 1;
      }
      /**
       * Returns a document-specific font key - a label assigned to a
       * font name + font type combination at the time the font was added
       * to the font inventory.
       *
       * Font key is used as label for the desired font for a block of text
       * to be added to the PDF document stream.
       * @private
       * @function
       * @param fontName {string} can be undefined on "falthy" to indicate "use current"
       * @param fontStyle {string} can be undefined on "falthy" to indicate "use current"
       * @returns {string} Font key.
       * @ignore
       */
      var getFont = function (fontName, fontStyle, options) {
        var key = undefined, fontNameLowerCase;
        options = options || {};
        fontName = fontName !== undefined ? fontName : fonts[activeFontKey].fontName;
        fontStyle = fontStyle !== undefined ? fontStyle : fonts[activeFontKey].fontStyle;
        fontNameLowerCase = fontName.toLowerCase();
        if (fontmap[fontNameLowerCase] !== undefined && fontmap[fontNameLowerCase][fontStyle] !== undefined) {
          key = fontmap[fontNameLowerCase][fontStyle];
        } else if (fontmap[fontName] !== undefined && fontmap[fontName][fontStyle] !== undefined) {
          key = fontmap[fontName][fontStyle];
        } else {
          if (options.disableWarning === false) {
            console.warn("Unable to look up font label for font '" + fontName + "', '" + fontStyle + "'. Refer to getFontList() for available fonts.");
          }
        }
        if (!key && !options.noFallback) {
          key = fontmap['times'][fontStyle];
          if (key == null) {
            key = fontmap['times']['normal'];
          }
        }
        return key;
      };
      var putInfo = API.__private__.putInfo = function () {
        newObject();
        out('<<');
        out('/Producer (jsPDF ' + jsPDF.version + ')');
        for (var key in documentProperties) {
          if (documentProperties.hasOwnProperty(key) && documentProperties[key]) {
            out('/' + key.substr(0, 1).toUpperCase() + key.substr(1) + ' (' +
              pdfEscape(documentProperties[key]) + ')');
          }
        }
        out('/CreationDate (' + creationDate + ')');
        out('>>');
        out('endobj');
      };
      var putCatalog = API.__private__.putCatalog = function (options) {
        options = options || {};
        var tmpRootDictionaryObjId = options.rootDictionaryObjId || rootDictionaryObjId;
        newObject();
        out('<<');
        out('/Type /Catalog');
        out('/Pages ' + tmpRootDictionaryObjId + ' 0 R');
        // PDF13ref Section 7.2.1
        if (!zoomMode) zoomMode = 'fullwidth';
        switch (zoomMode) {
          case 'fullwidth':
            out('/OpenAction [3 0 R /FitH null]');
            break;
          case 'fullheight':
            out('/OpenAction [3 0 R /FitV null]');
            break;
          case 'fullpage':
            out('/OpenAction [3 0 R /Fit]');
            break;
          case 'original':
            out('/OpenAction [3 0 R /XYZ null null 1]');
            break;
          default:
            var pcn = '' + zoomMode;
            if (pcn.substr(pcn.length - 1) === '%')
              zoomMode = parseInt(zoomMode) / 100;
            if (typeof zoomMode === 'number') {
              out('/OpenAction [3 0 R /XYZ null null ' + f2(zoomMode) + ']');
            }
        }
        if (!layoutMode) layoutMode = 'continuous';
        switch (layoutMode) {
          case 'continuous':
            out('/PageLayout /OneColumn');
            break;
          case 'single':
            out('/PageLayout /SinglePage');
            break;
          case 'two':
          case 'twoleft':
            out('/PageLayout /TwoColumnLeft');
            break;
          case 'tworight':
            out('/PageLayout /TwoColumnRight');
            break;
        }
        if (pageMode) {
          /**
           * A name object specifying how the document should be displayed when opened:
           * UseNone      : Neither document outline nor thumbnail images visible -- DEFAULT
           * UseOutlines  : Document outline visible
           * UseThumbs    : Thumbnail images visible
           * FullScreen   : Full-screen mode, with no menu bar, window controls, or any other window visible
           */
          out('/PageMode /' + pageMode);
        }
        events.publish('putCatalog');
        out('>>');
        out('endobj');
      };
      var putTrailer = API.__private__.putTrailer = function () {
        out('trailer');
        out('<<');
        out('/Size ' + (objectNumber + 1));
        out('/Root ' + objectNumber + ' 0 R');
        out('/Info ' + (objectNumber - 1) + ' 0 R');
        out("/ID [ <" + fileId + "> <" + fileId + "> ]");
        out('>>');
      };
      var putHeader = API.__private__.putHeader = function () {
        out('%PDF-' + pdfVersion);
        out("%\xBA\xDF\xAC\xE0");
      };
      var putXRef = API.__private__.putXRef = function () {
        var i = 1;
        var p = "0000000000";
        out('xref');
        out('0 ' + (objectNumber + 1));
        out('0000000000 65535 f ');
        for (i = 1; i <= objectNumber; i++) {
          var offset = offsets[i];
          if (typeof offset === 'function') {
            out((p + offsets[i]()).slice(-10) + ' 00000 n ');
          } else {
            if (typeof offsets[i] !== "undefined") {
              out((p + offsets[i]).slice(-10) + ' 00000 n ');
            } else {
              out('0000000000 00000 n ');
            }
          }
        }
      };
      
      var buildDocument = API.__private__.buildDocument = function () {
        outToPages = false; // switches out() to content
        //reset fields relevant for objectNumber generation and xref.
        objectNumber = 0;
        content_length = 0;
        content = [];
        offsets = [];
        additionalObjects = [];
        rootDictionaryObjId = newObjectDeferred();
        resourceDictionaryObjId = newObjectDeferred();
        events.publish('buildDocument');
        putHeader();
        putPages();
        putAdditionalObjects();
        putResources();
        putInfo();
        putCatalog();
        var offsetOfXRef = content_length;
        putXRef();
        putTrailer();
        out('startxref');
        out('' + offsetOfXRef);
        out('%%EOF');
        outToPages = true;
        return content.join('\n');
      };
      var getBlob = API.__private__.getBlob = function (data) {
        return new Blob([getArrayBuffer(data)], {
          type: "application/pdf"
        });
      };
      
      /**
       * Generates the PDF document.
       *
       * If `type` argument is undefined, output is raw body of resulting PDF returned as a string.
       *
       * @param {string} type A string identifying one of the possible output types. Possible values are 'arraybuffer', 'blob', 'bloburi'/'bloburl', 'datauristring'/'dataurlstring', 'datauri'/'dataurl', 'dataurlnewwindow', 'pdfobjectnewwindow', 'pdfjsnewwindow'.
       * @param {Object} options An object providing some additional signalling to PDF generator. Possible options are 'filename'.
       *
       * @function
       * @instance
       * @returns {jsPDF}
       * @memberof jsPDF#
       * @name output
       */
      var output = API.output = API.__private__.output = SAFE(function output(type, options) {
        options = options || {};
        if (typeof options === "string") {
          options = {
            filename: options
          };
        } else {
          options.filename = options.filename || 'generated.pdf';
        }
        switch (type) {
          case undefined:
            return buildDocument();
          case 'save':
            API.save(options.filename);
            break;
          case 'arraybuffer':
            return getArrayBuffer(buildDocument());
          case 'blob':
            return getBlob(buildDocument());
          case 'bloburi':
          case 'bloburl':
            // Developer is responsible of calling revokeObjectURL
            if (typeof global.URL !== "undefined" && typeof global.URL.createObjectURL === "function") {
              return global.URL && global.URL.createObjectURL(getBlob(buildDocument())) || void 0;
            } else {
              console.warn('bloburl is not supported by your system, because URL.createObjectURL is not supported by your browser.');
            }
            break;
          case 'datauristring':
          case 'dataurlstring':
              var dataURI = '';
              var pdfDocument = buildDocument();
              try {
                  dataURI = btoa(pdfDocument);
              } catch(e) {
                  dataURI = btoa(unescape(encodeURIComponent(pdfDocument)));
              }
              return 'data:application/pdf;filename=' + options.filename + ';base64,' + dataURI;
            case 'pdfobjectnewwindow':
              if (Object.prototype.toString.call(global) === '[object Window]') {
                var pdfObjectUrl = options.pdfObjectUrl || 'https://cdnjs.cloudflare.com/ajax/libs/pdfobject/2.1.1/pdfobject.min.js';
                var htmlForNewWindow = '<html>' + '<style>html, body { padding: 0; margin: 0; } iframe { width: 100%; height: 100%; border: 0;}  </style>' + '<body>' + '<script src="' + pdfObjectUrl + '"></script>' + '<script >PDFObject.embed("' + this.output('dataurlstring') + '", ' + JSON.stringify(options) + ');</script>' + '</body></html>';
                var nW = global.open();
    
                if (nW !== null) {
                  nW.document.write(htmlForNewWindow);
                }
                return nW;
              } else {
                throw new Error('The option pdfobjectnewwindow just works in a browser-environment.')
              }
              break;
            case 'pdfjsnewwindow':
            if (Object.prototype.toString.call(global) === '[object Window]') {
              var pdfJsUrl = options.pdfJsUrl || 'examples/PDF.js/web/viewer.html';
              var htmlForNewWindow = '<html>' + 
              '<style>html, body { padding: 0; margin: 0; } iframe { width: 100%; height: 100%; border: 0;}  </style>' +
              '<body><iframe id="pdfViewer" src="' + pdfJsUrl + '?file=" width="500px" height="400px" />' +
              '</body></html>';
              var nW = global.open();
              if (nW !== null) {
                nW.document.write(htmlForNewWindow);
                var scope = this;
                  nW.document.documentElement.querySelector('#pdfViewer').onload = function() {
                  nW.document.documentElement.querySelector('#pdfViewer').contentWindow.PDFViewerApplication.open(scope.output('bloburl'));
                }
              }
              return nW;
            } else {
              throw new Error('The option pdfjsnewwindow just works in a browser-environment.')
            }
            break;
          case 'dataurlnewwindow':
          if (Object.prototype.toString.call(global) === '[object Window]') {
            var htmlForNewWindow = '<html>' +
              '<style>html, body { padding: 0; margin: 0; } iframe { width: 100%; height: 100%; border: 0;}  </style>' +
              '<body>' +
              '<iframe src="' + this.output('datauristring', options) + '"></iframe>' +
              '</body></html>';
            var nW = global.open();
            if (nW !== null) {
              nW.document.write(htmlForNewWindow)
            }
            if (nW || typeof safari === "undefined") return nW;
          } else {
            throw new Error('The option dataurlnewwindow just works in a browser-environment.')
          }
          break;
          case 'datauri':
          case 'dataurl':
            return global.document.location.href = this.output('datauristring', options);
          default:
            return null;
        }
      });
      /**
       * Used to see if a supplied hotfix was requested when the pdf instance was created.
       * @param {string} hotfixName - The name of the hotfix to check.
       * @returns {boolean}
       */
      var hasHotfix = function (hotfixName) {
        return (Array.isArray(hotfixes) === true &&
          hotfixes.indexOf(hotfixName) > -1);
      };
      switch (unit) {
        case 'pt':
          k = 1;
          break;
        case 'mm':
          k = 72 / 25.4;
          break;
        case 'cm':
          k = 72 / 2.54;
          break;
        case 'in':
          k = 72;
          break;
        case 'px':
          if (hasHotfix('px_scaling') == true) {
            k = 72 / 96;
          } else {
            k = 96 / 72;
          }
          break;
        case 'pc':
          k = 12;
          break;
        case 'em':
          k = 12;
          break;
        case 'ex':
          k = 6;
          break;
        default:
          throw new Error('Invalid unit: ' + unit);
      }
      setCreationDate();
      setFileId();
      //---------------------------------------
      // Public API
      
      var getPageInfo = API.__private__.getPageInfo = API.getPageInfo = function (pageNumberOneBased) {
        if (isNaN(pageNumberOneBased) || (pageNumberOneBased % 1 !== 0)) {
          throw new Error('Invalid argument passed to jsPDF.getPageInfo');
        }
        var objId = pagesContext[pageNumberOneBased].objId;
        return {
          objId: objId,
          pageNumber: pageNumberOneBased,
          pageContext: pagesContext[pageNumberOneBased]
        };
      };
      var getPageInfoByObjId = API.__private__.getPageInfoByObjId = function (objId) {
        var pageNumberWithObjId;
        for (var pageNumber in pagesContext) {
          if (pagesContext[pageNumber].objId === objId) {
            pageNumberWithObjId = pageNumber;
            break;
          }
        }
        if (isNaN(objId) || (objId % 1 !== 0)) {
          throw new Error('Invalid argument passed to jsPDF.getPageInfoByObjId');
        }
        return getPageInfo(pageNumber);
      };
      var getCurrentPageInfo = API.__private__.getCurrentPageInfo = API.getCurrentPageInfo = function () {
        return {
          objId: pagesContext[currentPage].objId,
          pageNumber: currentPage,
          pageContext: pagesContext[currentPage]
        };
      };
      /**
       * Adds (and transfers the focus to) new page to the PDF document.
       * @param format {String/Array} The format of the new page. Can be: <ul><li>a0 - a10</li><li>b0 - b10</li><li>c0 - c10</li><li>dl</li><li>letter</li><li>government-letter</li><li>legal</li><li>junior-legal</li><li>ledger</li><li>tabloid</li><li>credit-card</li></ul><br />
       * Default is "a4". If you want to use your own format just pass instead of one of the above predefined formats the size as an number-array, e.g. [595.28, 841.89]
       * @param orientation {string} Orientation of the new page. Possible values are "portrait" or "landscape" (or shortcuts "p" (Default), "l").
       * @function
       * @instance
       * @returns {jsPDF}
       *
       * @memberof jsPDF#
       * @name addPage
       */
      API.addPage = function () {
        _addPage.apply(this, arguments);
        return this;
      };
      /**
       * Adds (and transfers the focus to) new page to the PDF document.
       * @function
       * @instance
       * @returns {jsPDF}
       *
       * @memberof jsPDF#
       * @name setPage
       * @param {number} page Switch the active page to the page number specified.
       * @example
       * doc = jsPDF()
       * doc.addPage()
       * doc.addPage()
       * doc.text('I am on page 3', 10, 10)
       * doc.setPage(1)
       * doc.text('I am on page 1', 10, 10)
       */
      API.setPage = function () {
        _setPage.apply(this, arguments);
        return this;
      };
      /**
       * @name insertPage
       * @memberof jsPDF#
       * 
       * @function 
       * @instance
       * @param {Object} beforePage
       * @returns {jsPDF}
       */
      API.insertPage = function (beforePage) {
        this.addPage();
        this.movePage(currentPage, beforePage);
        return this;
      };
      /**
       * @name movePage
       * @memberof jsPDF#
       * @function
       * @instance
       * @param {number} targetPage
       * @param {number} beforePage
       * @returns {jsPDF}
       */
      API.movePage = function (targetPage, beforePage) {
        var tmpPages, tmpPagesContext;
        if (targetPage > beforePage) {
          tmpPages = pages[targetPage];
          tmpPagesContext = pagesContext[targetPage];
          for (var i = targetPage; i > beforePage; i--) {
            pages[i] = pages[i - 1];
            pagesContext[i] = pagesContext[i - 1];
          }
          pages[beforePage] = tmpPages;
          pagesContext[beforePage] = tmpPagesContext;
          this.setPage(beforePage);
        } else if (targetPage < beforePage) {
          tmpPages = pages[targetPage];
          tmpPagesContext = pagesContext[targetPage];
          for (var j = targetPage; j < beforePage; j++) {
            pages[j] = pages[j + 1];
            pagesContext[j] = pagesContext[j + 1];
          }
          pages[beforePage] = tmpPages;
          pagesContext[beforePage] = tmpPagesContext;
          this.setPage(beforePage);
        }
        return this;
      };
      /**
       * Deletes a page from the PDF.
       * @name deletePage
       * @memberof jsPDF#
       * @function
       * @param {number} targetPage
       * @instance
       * @returns {jsPDF}
       */
      API.deletePage = function () {
        _deletePage.apply(this, arguments);
        return this;
      };
      /**
       * Adds text to page. Supports adding multiline text when 'text' argument is an Array of Strings.
       *
       * @function
       * @instance
       * @param {String|Array} text String or array of strings to be added to the page. Each line is shifted one line down per font, spacing settings declared before this call.
       * @param {number} x Coordinate (in units declared at inception of PDF document) against left edge of the page.
       * @param {number} y Coordinate (in units declared at inception of PDF document) against upper edge of the page.
       * @param {Object} [options] - Collection of settings signaling how the text must be encoded.
       * @param {string} [options.align=left] - The alignment of the text, possible values: left, center, right, justify.
       * @param {string} [options.baseline=alphabetic] - Sets text baseline used when drawing the text, possible values: alphabetic, ideographic, bottom, top, middle, hanging
       * @param {string} [options.angle=0] - Rotate the text clockwise or counterclockwise. Expects the angle in degree.
       * @param {string} [options.rotationDirection=1] - Direction of the rotation. 0 = clockwise, 1 = counterclockwise.
       * @param {string} [options.charSpace=0] - The space between each letter.
       * @param {string} [options.lineHeightFactor=1.15] - The lineheight of each line.
       * @param {string} [options.flags] - Flags for to8bitStream.
       * @param {string} [options.flags.noBOM=true] - Don't add BOM to Unicode-text.
       * @param {string} [options.flags.autoencode=true] - Autoencode the Text.
       * @param {string} [options.maxWidth=0] - Split the text by given width, 0 = no split.
       * @param {string} [options.renderingMode=fill] - Set how the text should be rendered, possible values: fill, stroke, fillThenStroke, invisible, fillAndAddForClipping, strokeAndAddPathForClipping, fillThenStrokeAndAddToPathForClipping, addToPathForClipping.
       * @param {number|Matrix} transform If transform is a number the text will be rotated by this value around the anchor set by x and y.
       *
       * If it is a Matrix, this matrix gets directly applied to the text, which allows shearing
       * effects etc.; the x and y offsets are then applied AFTER the coordinate system has been established by this
       * matrix. This means passing a rotation matrix that is equivalent to some rotation angle will in general yield a
       * DIFFERENT result. A matrix is only allowed in "advanced" API mode.
       * @returns {jsPDF}
       * @memberof jsPDF#
       * @name text
       */
      var text = API.__private__.text = API.text = function (text, x, y, options, transform) {
        /*
         * Inserts something like this into PDF
         *   BT
         *    /F1 16 Tf  % Font name + size
         *    16 TL % How many units down for next line in multiline text
         *    0 g % color
         *    28.35 813.54 Td % position
         *    (line one) Tj
         *    T* (line two) Tj
         *    T* (line three) Tj
         *   ET
         */
        options = options || {};
        var scope = options.scope || this;
        //backwardsCompatibility
        var tmp;
        // Pre-August-2012 the order of arguments was function(x, y, text, flags)
        // in effort to make all calls have similar signature like
        //   function(data, coordinates... , miscellaneous)
        // this method had its args flipped.
        // code below allows backward compatibility with old arg order.
        if (typeof text === 'number' && typeof x === 'number' && (typeof y === 'string' || Array.isArray(y))) {
          tmp = y;
          y = x;
          x = text;
          text = tmp;
        }
        var transformationMatrix;
        if (arguments[3] instanceof Matrix === false) {
          var flags = arguments[3];
          var angle = arguments[4];
          var align = arguments[5];
          if (typeof flags !== "object" || flags === null) {
            if (typeof angle === 'string') {
              align = angle;
              angle = null;
            }
            if (typeof flags === 'string') {
              align = flags;
              flags = null;
            }
            if (typeof flags === 'number') {
              angle = flags;
              flags = null;
            }
            options = {
              flags: flags,
              angle: angle,
              align: align
            };
          }
        } else {
          transformationMatrix = arguments[3];
        }
        
        if (isNaN(x) || isNaN(y) || typeof text === "undefined" || text === null) {
          throw new Error('Invalid arguments passed to jsPDF.text');
        }
        if (text.length === 0) {
            return scope;
        }
        var xtra = '';
        var isHex = false;
        var lineHeight = typeof options.lineHeightFactor === 'number' ? options.lineHeightFactor : lineHeightFactor;
        var k = scope.internal.scaleFactor;
        function ESC(s) {
          s = s.split("\t").join(Array(options.TabLen || 9).join(" "));
          return pdfEscape(s, flags);
        }
        function transformTextToSpecialArray(text) {
          //we don't want to destroy original text array, so cloning it
          var sa = text.concat();
          var da = [];
          var len = sa.length;
          var curDa;
          //we do array.join('text that must not be PDFescaped")
          //thus, pdfEscape each component separately
          while (len--) {
            curDa = sa.shift();
            if (typeof curDa === "string") {
              da.push(curDa);
            } else {
              if (Array.isArray(text) && (curDa.length === 1 || (curDa[1] === undefined && curDa[2] === undefined))) {
                da.push(curDa[0]);
              } else {
                da.push([curDa[0], curDa[1], curDa[2]]);
              }
            }
          }
          return da;
        }
        function processTextByFunction(text, processingFunction) {
          var result;
          if (typeof text === 'string') {
            result = processingFunction(text)[0];
          } else if (Array.isArray(text)) {
            //we don't want to destroy original text array, so cloning it
            var sa = text.concat();
            var da = [];
            var len = sa.length;
            var curDa;
            var tmpResult;
            //we do array.join('text that must not be PDFescaped")
            //thus, pdfEscape each component separately
            while (len--) {
              curDa = sa.shift();
              if (typeof curDa === "string") {
                da.push(processingFunction(curDa)[0]);
              } else if ((Array.isArray(curDa) && typeof curDa[0] === "string")) {
                tmpResult = processingFunction(curDa[0], curDa[1], curDa[2]);
                da.push([tmpResult[0], tmpResult[1], tmpResult[2]]);
              }
            }
            result = da;
          }
          return result;
        }
        //Check if text is of type String
        var textIsOfTypeString = false;
        var tmpTextIsOfTypeString = true;
        if (typeof text === 'string') {
          textIsOfTypeString = true;
        } else if (Array.isArray(text)) {
          //we don't want to destroy original text array, so cloning it
          var sa = text.concat();
          var da = [];
          var len = sa.length;
          var curDa;
          //we do array.join('text that must not be PDFescaped")
          //thus, pdfEscape each component separately
          while (len--) {
            curDa = sa.shift();
            if (typeof curDa !== "string" || (Array.isArray(curDa) && typeof curDa[0] !== "string")) {
              tmpTextIsOfTypeString = false;
            }
          }
          textIsOfTypeString = tmpTextIsOfTypeString
        }
        if (textIsOfTypeString === false) {
          throw new Error('Type of text must be string or Array. "' + text + '" is not recognized.');
        }
        //If there are any newlines in text, we assume
        //the user wanted to print multiple lines, so break the
        //text up into an array. If the text is already an array,
        //we assume the user knows what they are doing.
        //Convert text into an array anyway to simplify
        //later code.
        if (typeof text === 'string') {
          if (text.match(/[\r?\n]/)) {
            text = text.split(/\r\n|\r|\n/g);
          } else {
            text = [text];
          }
        }
        //baseline
        var height = activeFontSize / scope.internal.scaleFactor;
        var descent = height * (lineHeightFactor - 1);
        switch (options.baseline) {
          case 'bottom':
            y -= descent;
            break;
          case 'top':
            y += height - descent;
            break;
          case 'hanging':
            y += height - 2 * descent;
            break;
          case 'middle':
            y += height / 2 - descent;
            break;
          case 'ideographic':
          case 'alphabetic':
          default:
            // do nothing, everything is fine
            break;
          }
        //multiline
        var maxWidth = options.maxWidth || 0;
        if (maxWidth > 0) {
          if (typeof text === 'string') {
            text = scope.splitTextToSize(text, maxWidth);
          } else if (Object.prototype.toString.call(text) === '[object Array]') {
            text = scope.splitTextToSize(text.join(" "), maxWidth);
          }
        }
        //creating Payload-Object to make text byRef
        var payload = {
          text: text,
          x: x,
          y: y,
          options: options,
          mutex: {
            pdfEscape: pdfEscape,
            activeFontKey: activeFontKey,
            fonts: fonts,
            activeFontSize: activeFontSize
          }
        };
        events.publish('preProcessText', payload);
        text = payload.text;
        options = payload.options;
        //angle
        var angle = options.angle;
        if (transformationMatrix instanceof Matrix === false && angle && typeof angle === "number") {
          angle *= Math.PI / 180;
          if (options.rotationDirection === 0) {
             angle = -angle;
         }
          var c = Math.cos(angle);
          var s = Math.sin(angle);
          transformationMatrix = new Matrix(f2(c), f2(s), f2(s * -1), f2(c), 0, 0);
        } else if (angle && angle instanceof Matrix) {
          transformationMatrix = angle;
        }
        //charSpace
        var charSpace = options.charSpace || activeCharSpace;
        if (typeof charSpace !== 'undefined') {
          xtra += f3(charSpace * k) + " Tc\n";
          this.setCharSpace(this.getCharSpace() || 0);
        }
        //lang
        var lang = options.lang;
        if (lang) {
          //    xtra += "/Lang (" + lang +")\n";
        }
        //renderingMode
        var renderingMode = -1;
        var parmRenderingMode = (typeof options.renderingMode !== "undefined") ? options.renderingMode : options.stroke;
        var pageContext = scope.internal.getCurrentPageInfo().pageContext;
        switch (parmRenderingMode) {
          case 0:
          case false:
          case 'fill':
            renderingMode = 0;
            break;
          case 1:
          case true:
          case 'stroke':
            renderingMode = 1;
            break;
          case 2:
          case 'fillThenStroke':
            renderingMode = 2;
            break;
          case 3:
          case 'invisible':
            renderingMode = 3;
            break;
          case 4:
          case 'fillAndAddForClipping':
            renderingMode = 4;
            break;
          case 5:
          case 'strokeAndAddPathForClipping':
            renderingMode = 5;
            break;
          case 6:
          case 'fillThenStrokeAndAddToPathForClipping':
            renderingMode = 6;
            break;
          case 7:
          case 'addToPathForClipping':
            renderingMode = 7;
            break;
        }
        var usedRenderingMode = typeof pageContext.usedRenderingMode !== 'undefined' ? pageContext.usedRenderingMode : -1;
        //if the coder wrote it explicitly to use a specific 
        //renderingMode, then use it
        if (renderingMode !== -1) {
          xtra += renderingMode + " Tr\n"
          //otherwise check if we used the rendering Mode already
          //if so then set the rendering Mode...
        } else if (usedRenderingMode !== -1) {
          xtra += "0 Tr\n";
        }
        if (renderingMode !== -1) {
          pageContext.usedRenderingMode = renderingMode;
        }
        //align
        var align = options.align || 'left';
        var leading = activeFontSize * lineHeight;
        var pageWidth = scope.internal.pageSize.getWidth();
        var lineWidth = lineWidth;
        var activeFont = fonts[activeFontKey];
        var charSpace = options.charSpace || activeCharSpace;
        var widths;
        var maxWidth = options.maxWidth || 0;
        var lineWidths;
        var flags = {};
        var wordSpacingPerLine = [];
        if (Object.prototype.toString.call(text) === '[object Array]') {
          var da = transformTextToSpecialArray(text);
          var left = 0;
          var newY;
          var maxLineLength;
          var lineWidths;
          if (align !== "left") {
            lineWidths = da.map(function (v) {
              return scope.getStringUnitWidth(v, {
                font: activeFont,
                charSpace: charSpace,
                fontSize: activeFontSize
              }) * activeFontSize / k;
            });
          }
          var maxLineLength = Math.max.apply(Math, lineWidths);
          //The first line uses the "main" Td setting,
          //and the subsequent lines are offset by the
          //previous line's x coordinate.
          var prevWidth = 0;
          var delta;
          var newX;
          if (align === "right") {
            //The passed in x coordinate defines the
            //rightmost point of the text.
            left = x - maxLineLength;
            x -= lineWidths[0];
            text = [];
            for (var i = 0, len = da.length; i < len; i++) {
              delta = maxLineLength - lineWidths[i];
              if (i === 0) {
                newX = getHorizontalCoordinate(x);
                newY = getVerticalCoordinate(y);
              } else {
                newX = (prevWidth - lineWidths[i]) * k;
                newY = -leading;
              }
              text.push([da[i], newX, newY]);
              prevWidth = lineWidths[i];
            }
          } else if (align === "center") {
            //The passed in x coordinate defines
            //the center point.
            left = x - maxLineLength / 2;
            x -= lineWidths[0] / 2;
            text = [];
            for (var i = 0, len = da.length; i < len; i++) {
              delta = (maxLineLength - lineWidths[i]) / 2;
              if (i === 0) {
                newX = getHorizontalCoordinate(x);
                newY = getVerticalCoordinate(y);
              } else {
                newX = (prevWidth - lineWidths[i]) / 2 * k;
                newY = -leading;
              }
              text.push([da[i], newX, newY]);
              prevWidth = lineWidths[i];
            }
          } else if (align === "left") {
            text = [];
            for (var i = 0, len = da.length; i < len; i++) {
              newY = (i === 0) ? getVerticalCoordinate(y) : -leading;
              newX = (i === 0) ? getHorizontalCoordinate(x) : 0;
              //text.push([da[i], newX, newY]);
              text.push(da[i]);
            }
          } else if (align === "justify") {
            text = [];
            var maxWidth = (maxWidth !== 0) ? maxWidth : pageWidth;
            for (var i = 0, len = da.length; i < len; i++) {
              newY = (i === 0) ? getVerticalCoordinate(y) : -leading;
              newX = (i === 0) ? getHorizontalCoordinate(x) : 0;
              if (i < (len - 1)) {
                wordSpacingPerLine.push(f2((maxWidth - lineWidths[i]) / (da[i].split(" ").length - 1) * k));
              }
              text.push([da[i], newX, newY]);
            }
          } else {
            throw new Error(
              'Unrecognized alignment option, use "left", "center", "right" or "justify".'
            );
          }
        }
        //R2L
        var doReversing = typeof options.R2L === "boolean" ? options.R2L : R2L;
        if (doReversing === true) {
          text = processTextByFunction(text, function (text, posX, posY) {
            return [text.split("").reverse().join(""), posX, posY];
          });
        }
        //creating Payload-Object to make text byRef
        var payload = {
          text: text,
          x: x,
          y: y,
          options: options,
          mutex: {
            pdfEscape: pdfEscape,
            activeFontKey: activeFontKey,
            fonts: fonts,
            activeFontSize: activeFontSize
          }
        };
        events.publish('postProcessText', payload);
        text = payload.text;
        isHex = payload.mutex.isHex || false;
        //Escaping 
        var activeFontEncoding = fonts[activeFontKey].encoding;
        if (activeFontEncoding === "WinAnsiEncoding" || activeFontEncoding === "StandardEncoding") {
          text = processTextByFunction(text, function (text, posX, posY) {
            return [ESC(text), posX, posY];
          });
        }
        var da = transformTextToSpecialArray(text);
        text = [];
        var STRING = 0;
        var ARRAY = 1;
        var variant = Array.isArray(da[0]) ? ARRAY : STRING;
        var posX;
        var posY;
        var content;
        var wordSpacing = '';
        
        var generatePosition = function (parmPosX, parmPosY, parmTransformationMatrix) {
          var position = '';
          if (parmTransformationMatrix instanceof Matrix) {
            parmTransformationMatrix.tx = parseFloat(f2(parmPosX));
            parmTransformationMatrix.ty = parseFloat(f2(parmPosY));
            position = parmTransformationMatrix.join(" ") + " Tm\n";
          } else {
            position = f2(parmPosX) + " " + f2(parmPosY) + " Td\n";
          }
          return position;
        }
        for (var lineIndex = 0; lineIndex < da.length; lineIndex++) {
          wordSpacing = '';
          switch (variant) {
            case ARRAY: 
              content = (((isHex) ? "<" : "(")) + da[lineIndex][0] + ((isHex) ? ">" : ")");
              posX = parseFloat(da[lineIndex][1]);
              posY = parseFloat(da[lineIndex][2]);
              break;
            case STRING: 
              content = (((isHex) ? "<" : "(")) + da[lineIndex] + ((isHex) ? ">" : ")");
              posX = getHorizontalCoordinate(x);
              posY = getVerticalCoordinate(y);
              break;
          }
          if (wordSpacingPerLine !== undefined && wordSpacingPerLine[lineIndex] !== undefined) {
            wordSpacing = wordSpacingPerLine[lineIndex] + " Tw\n";
          }
          if (lineIndex === 0) {
            text.push(wordSpacing + generatePosition(posX, posY, transformationMatrix) + content);
          } else if (variant === STRING) {
            text.push(wordSpacing + content);
          } else if (variant === ARRAY) {
            text.push(wordSpacing + generatePosition(posX, posY) + content);
          }
        }
        text = (variant === STRING) ? text.join(" Tj\nT* ") : text.join(" Tj\n");
        text += " Tj\n";
        var result = 'BT\n/';
        result += activeFontKey + ' ' + activeFontSize + ' Tf\n'; // font face, style, size
        result += f2(activeFontSize * lineHeight) + ' TL\n'; // line spacing
        result += textColor + '\n';
        result += xtra;
        result += text;
        result += "ET";
        out(result);
        usedFonts[activeFontKey] = true;
        return scope;
      };
      /**
       * Letter spacing method to print text with gaps
       *
       * @function
       * @instance
       * @param {String|Array} text String to be added to the page.
       * @param {number} x Coordinate (in units declared at inception of PDF document) against left edge of the page
       * @param {number} y Coordinate (in units declared at inception of PDF document) against upper edge of the page
       * @param {number} spacing Spacing (in units declared at inception)
       * @returns {jsPDF}
       * @memberof jsPDF#
       * @name lstext
       * @deprecated We'll be removing this function. It doesn't take character width into account.
       */
      var lstext = API.__private__.lstext = API.lstext = function (text, x, y, charSpace) {
        return this.text(text, x, y, {
          charSpace: charSpace
        });
      };
      // PDF supports these path painting and clip path operators:
      //
      // S - stroke
      // s - close/stroke
      // f (F) - fill non-zero
      // f* - fill evenodd
      // B - fill stroke nonzero
      // B* - fill stroke evenodd
      // b - close fill stroke nonzero
      // b* - close fill stroke evenodd
      // n - nothing (consume path)
      // W - clip nonzero
      // W* - clip evenodd
      //
      // In order to keep the API small, we omit the close-and-fill/stroke operators and provide a separate close()
      // method.
      /**
       * 
       * @name clip
       * @function
       * @instance
       * @param {string} rule Only possible value is 'evenodd'
       * @returns {jsPDF}
       * @memberof jsPDF#
       * @description All .clip() after calling drawing ops with a style argument of null.
       */
      var clip = API.__private__.clip = API.clip = function (rule) {
        // Call .clip() after calling drawing ops with a style argument of null
        // W is the PDF clipping op
        if ('evenodd' === rule) {
          out('W*');
        } else {
          out('W');
        }
      };
      /**
       * Modify the current clip path by intersecting it with the current path using the even-odd rule. Note
       * that this will NOT consume the current path. In order to only use this path for clipping call
       * {@link API.discardPath} afterwards.
       *
       * @return jsPDF
       * @memberof jsPDF#
       * @name clipEvenOdd
       */
      var clipEvenOdd = API.clipEvenOdd = function() {
        clip('evenodd');
        return this;
      };
      /**
       * This fixes the previous function clip(). Perhaps the 'stroke path' hack was due to the missing 'n' instruction?
       * We introduce the fixed version so as to not break API.
       * @param fillRule
       * @deprecated
       * @ignore
       */
      var clip_fixed = API.__private__.clip_fixed = API.clip_fixed = function (rule) {
        API.clip(rule);
      };
      /**
       * Consumes the current path without any effect. Mainly used in combination with {@link clip} or
       * {@link clipEvenOdd}. The PDF "n" operator.
       * @return {jsPDF}
       * @memberof jsPDF#
       * @name discardPath
       */
      var discardPath = API.__private__.discardPath = API.discardPath = function() {
        out("n");
        return this;
      };
      var isValidStyle = API.__private__.isValidStyle = function (style) {
        var validStyleVariants = [undefined, null, 'S', 'F', 'DF', 'FD', 'f', 'f*', 'B', 'B*'];
        var result = false;
        if (validStyleVariants.indexOf(style) !== -1) {
          result = true;
        }
        return (result);
      }
      var getStyle = API.__private__.getStyle = API.getStyle = function (style) {
        // see path-painting operators in PDF spec
        var op = 'S'; // stroke
        if (style === 'F') {
          op = 'f'; // fill
        } else if (style === 'FD' || style === 'DF') {
          op = 'B'; // both
        } else if (style === 'f' || style === 'f*' || style === 'B' ||
          style === 'B*') {
          /*
           Allow direct use of these PDF path-painting operators:
           - f    fill using nonzero winding number rule
           - f*    fill using even-odd rule
           - B    fill then stroke with fill using non-zero winding number rule
           - B*    fill then stroke with fill using even-odd rule
           */
          op = style;
        }
        return op;
      };
      /**
       * Close the current path. The PDF "h" operator.
       * @return jsPDF
       * @memberof jsPDF#
       * @name close
       */
      var close = API.close = function() {
        out("h");
        return this;
      };
      /**
       * Stroke the path. The PDF "S" operator.
       * @return jsPDF
       * @memberof jsPDF#
       * @name stroke
       */
      var stroke = API.stroke = function() {
        out("S");
        return this;
      };
      /**
       * Fill the current path using the nonzero winding number rule. If a pattern is provided, the path will be filled
       * with this pattern, otherwise with the current fill color. Equivalent to the PDF "f" operator.
       * @param {PatternData=} pattern If provided the path will be filled with this pattern
       * @return jsPDF
       * @memberof jsPDF#
       * @name fill
       */
      var fill = API.fill = function(pattern) {
        fillWithOptionalPattern("f", pattern);
        return this;
      };
      /**
       * Fill the current path using the even-odd rule. The PDF f* operator.
       * @see API.fill
       * @param {PatternData=} pattern Optional pattern
       * @return jsPDF
       * @memberof jsPDF#
       * @name fillEvenOdd
       */
      var fillEvenOdd = API.fillEvenOdd = function(pattern) {
        fillWithOptionalPattern("f*", pattern);
        return this;
      };
      /**
       * Fill using the nonzero winding number rule and then stroke the current Path. The PDF "B" operator.
       * @see API.fill
       * @param {PatternData=} pattern Optional pattern
       * @return jsPDF
       * @memberof jsPDF#
       * @name fillStroke
       */
      var fillStroke = API.fillStroke = function(pattern) {
        fillWithOptionalPattern("B", pattern);
        return this;
      };
      /**
       * Fill using the even-odd rule and then stroke the current Path. The PDF "B" operator.
       * @see API.fill
       * @param {PatternData=} pattern Optional pattern
       * @return jsPDF
       * @memberof jsPDF#
       * @name fillStrokeEvenOdd
       */
      var fillStrokeEvenOdd = API.fillStrokeEvenOdd = function(pattern) {
        fillWithOptionalPattern("B*", pattern);
        return this;
      };
      var fillWithOptionalPattern = function (style, pattern) {
        if (typeof pattern === "object") {
          fillWithPattern(pattern, style);
        } else {
          out(style);
        }
      };
      var putStyle = function(style, patternKey, patternData) {
        if (style === null || style === undefined) {
          return;
        }
        style = getStyle(style);
        // stroking / filling / both the path
        if (!patternKey) {
          out(style);
          return;
        }
        if (!patternData) {
          patternData = { matrix: identityMatrix };
        }
        if (patternData instanceof Matrix) {
          patternData = { matrix: patternData };
        }
        patternData.key = patternKey;
        patternData || (patternData = identityMatrix);
        fillWithPattern(patternData, style);
      };
      var fillWithPattern = function(patternData, style) {
        var patternId = patternMap[patternData.key];
        var pattern = patterns[patternId];
        if (pattern instanceof API.ShadingPattern) {
          out("q");
          out(clipRuleFromStyle(style));
          if (pattern.gState) {
            API.setGState(pattern.gState);
          }
          out(patternData.matrix.toString() + " cm");
          out("/" + patternId + " sh");
          out("Q");
        } else if (pattern instanceof API.TilingPattern) {
          // pdf draws patterns starting at the bottom left corner and they are not affected by the global transformation,
          // so we must flip them
          var matrix = new Matrix(1, 0, 0, -1, 0, pageHeight);
          if (patternData.matrix) {
            matrix = (patternData.matrix || identityMatrix).multiply(matrix);
            // we cannot apply a matrix to the pattern on use so we must abuse the pattern matrix and create new instances
            // for each use
            patternId = pattern.createClone(
              patternData.key,
              patternData.boundingBox,
              patternData.xStep,
              patternData.yStep,
              matrix
            ).id;
          }
          out("q");
          out("/Pattern cs");
          out("/" + patternId + " scn");
          if (pattern.gState) {
            API.setGState(pattern.gState);
          }
          out(style);
          out("Q");
        }
      };
      var clipRuleFromStyle = function(style) {
        switch (style) {
          case "f":
          case "F":
            return "W n";
          case "f*":
            return "W* n";
          case "B":
            return "W S";
          case "B*":
            return "W* S";
          // these two are for compatibility reasons (in the past, calling any primitive method with a shading pattern
          // and "n"/"S" as style would still fill/fill and stroke the path)
          case "S":
            return "W S";
          case "n":
            return "W n";
        }
      };
      /**
       * Begin a new subpath by moving the current point to coordinates (x, y). The PDF "m" operator.
       * @param {number} x
       * @param {number} y
       * @memberof jsPDF#
       * @name moveTo
       */
      var moveTo = API.moveTo = function(x, y) {
        out(hpf(scale(x)) + " " + hpf(transformScaleY(y)) + " m");
      };
      /**
       * Append a straight line segment from the current point to the point (x, y). The PDF "l" operator.
       * @param {number} x
       * @param {number} y
       * @memberof jsPDF#
       * @name lineTo
       */
      var lineTo = API.lineTo = function(x, y) {
        out(hpf(scale(x)) + " " + hpf(transformScaleY(y)) + " l");
      };
      /**
       * Draw a line on the current page.
       *
       * @name line
       * @function 
       * @instance
       * @param {number} x1
       * @param {number} y1
       * @param {number} x2
       * @param {number} y2
       * @param {string} style A string specifying the painting style or null.  Valid styles include: 'S' [default] - stroke, 'F' - fill,  and 'DF' (or 'FD') -  fill then stroke. A null value postpones setting the style so that a shape may be composed using multiple method calls. The last drawing method call used to define the shape should not have a null style argument. default: 'S'
       * @returns {jsPDF}
       * @memberof jsPDF#
       */
      var line = API.__private__.line = API.line = function (x1, y1, x2, y2, style) {
        style = style || 'S';
        if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2) || !isValidStyle(style)) {
          throw new Error('Invalid arguments passed to jsPDF.line');
        }
        return this.lines([
          [x2 - x1, y2 - y1]
        ], x1, y1);
      };
      /**
       * Adds series of curves (straight lines or cubic bezier curves) to canvas, starting at `x`, `y` coordinates.
       * All data points in `lines` are relative to last line origin.
       * `x`, `y` become x1,y1 for first line / curve in the set.
       * For lines you only need to specify [x2, y2] - (ending point) vector against x1, y1 starting point.
       * For bezier curves you need to specify [x2,y2,x3,y3,x4,y4] - vectors to control points 1, 2, ending point. All vectors are against the start of the curve - x1,y1.
       *
       * @example .lines([[2,2],[-2,2],[1,1,2,2,3,3],[2,1]], 212,110, [1,1], 'F', false) // line, line, bezier curve, line
       * @param {Array} lines Array of *vector* shifts as pairs (lines) or sextets (cubic bezier curves).
       * @param {number} x Coordinate (in units declared at inception of PDF document) against left edge of the page.
       * @param {number} y Coordinate (in units declared at inception of PDF document) against upper edge of the page.
       * @param {number} scale (Defaults to [1.0,1.0]) x,y Scaling factor for all vectors. Elements can be any floating number Sub-one makes drawing smaller. Over-one grows the drawing. Negative flips the direction.
       * @param {string} style A string specifying the painting style or null.  Valid styles include: 'S' [default] - stroke, 'F' - fill,  and 'DF' (or 'FD') -  fill then stroke. A null value postpones setting the style so that a shape may be composed using multiple method calls. The last drawing method call used to define the shape should not have a null style argument.
       * @param {boolean} closed If true, the path is closed with a straight line from the end of the last curve to the starting point.
       * @function
       * @instance
       * @returns {jsPDF}
       * @memberof jsPDF#
       * @name lines
       */
      var lines = API.__private__.lines = API.lines = function (lines, x, y, scale, style, closed) {
        var scalex, scaley, i, l, leg, x2, y2, x3, y3, x4, y4, tmp;
        // Pre-August-2012 the order of arguments was function(x, y, lines, scale, style)
        // in effort to make all calls have similar signature like
        //   function(content, coordinateX, coordinateY , miscellaneous)
        // this method had its args flipped.
        // code below allows backward compatibility with old arg order.
        if (typeof lines === 'number') {
          tmp = y;
          y = x;
          x = lines;
          lines = tmp;
        }
        scale = scale || [1, 1];
        closed = closed || false;
        if (isNaN(x) || isNaN(y) || !Array.isArray(lines) || !Array.isArray(scale) || !isValidStyle(style) || typeof closed !== 'boolean') {
          throw new Error('Invalid arguments passed to jsPDF.lines');
        }
        // starting point
        out(f3(getHorizontalCoordinate(x)) + ' ' + f3(getVerticalCoordinate(y)) + ' m ');
        scalex = scale[0];
        scaley = scale[1];
        l = lines.length;
        //, x2, y2 // bezier only. In page default measurement "units", *after* scaling
        //, x3, y3 // bezier only. In page default measurement "units", *after* scaling
        // ending point for all, lines and bezier. . In page default measurement "units", *after* scaling
        x4 = x; // last / ending point = starting point for first item.
        y4 = y; // last / ending point = starting point for first item.
        for (i = 0; i < l; i++) {
          leg = lines[i];
          if (leg.length === 2) {
            // simple line
            x4 = leg[0] * scalex + x4; // here last x4 was prior ending point
            y4 = leg[1] * scaley + y4; // here last y4 was prior ending point
            out(f3(getHorizontalCoordinate(x4)) + ' ' + f3(getVerticalCoordinate(y4)) + ' l');
          } else {
            // bezier curve
            x2 = leg[0] * scalex + x4; // here last x4 is prior ending point
            y2 = leg[1] * scaley + y4; // here last y4 is prior ending point
            x3 = leg[2] * scalex + x4; // here last x4 is prior ending point
            y3 = leg[3] * scaley + y4; // here last y4 is prior ending point
            x4 = leg[4] * scalex + x4; // here last x4 was prior ending point
            y4 = leg[5] * scaley + y4; // here last y4 was prior ending point
            out(
              f3(getHorizontalCoordinate(x2)) + ' ' +
              f3(getVerticalCoordinate(y2)) + ' ' +
              f3(getHorizontalCoordinate(x3)) + ' ' +
              f3(getVerticalCoordinate(y3)) + ' ' +
              f3(getHorizontalCoordinate(x4)) + ' ' +
              f3(getVerticalCoordinate(y4)) + ' c');
          }
        }
        if (closed) {
          out(' h');
        }
        // stroking / filling / both the path
        if (style !== null) {
          out(getStyle(style));
        }
        return this;
      };
      /**
       * Similar to {@link API.lines} but all coordinates are interpreted as absolute coordinates instead of relative.
       * @param {Array<Object>} lines An array of {op: operator, c: coordinates} object, where op is one of "m" (move to), "l" (line to)
       * "c" (cubic bezier curve) and "h" (close (sub)path)). c is an array of coordinates. "m" and "l" expect two, "c"
       * six and "h" an empty array (or undefined).
       * @param {String=} style  The style. Deprecated!
       * @param {String=} patternKey The pattern key for the pattern that should be used to fill the path. Deprecated!
       * @param {(Matrix|PatternData)=} patternData The matrix that transforms the pattern into user space, or an object that
       * will modify the pattern on use. Deprecated!
       * @function
       * @returns {jsPDF}
       * @memberof jsPDF#
       * @name path
       */
      API.path = function(lines, style, patternKey, patternData) {
        for (var i = 0; i < lines.length; i++) {
          var leg = lines[i];
          var coords = leg.c;
          switch (leg.op) {
            case "m":
              this.moveTo(coords[0], coords[1]);
              break;
            case "l":
              this.lineTo(coords[0], coords[1]);
              break;
            case "c":
              this.curveTo.apply(this, coords);
              break;
            case "h":
              this.close();
              break;
          }
        }
        putStyle(style, patternKey, patternData);
        return this;
      };
      /**
       * Adds a rectangle to PDF.
       *
       * @param {number} x Coordinate (in units declared at inception of PDF document) against left edge of the page.
       * @param {number} y Coordinate (in units declared at inception of PDF document) against upper edge of the page.
       * @param {number} w Width (in units declared at inception of PDF document).
       * @param {number} h Height (in units declared at inception of PDF document).
       * @param {string} style A string specifying the painting style or null.  Valid styles include: 'S' [default] - stroke, 'F' - fill,  and 'DF' (or 'FD') -  fill then stroke. A null value postpones setting the style so that a shape may be composed using multiple method calls. The last drawing method call used to define the shape should not have a null style argument.
       * @function
       * @instance
       * @returns {jsPDF}
       * @memberof jsPDF#
       * @name rect
       */
      var rect = API.__private__.rect = API.rect = function (x, y, w, h, style) {
        if (isNaN(x) || isNaN(y) || isNaN(w) || isNaN(h) || !isValidStyle(style)) {
          throw new Error('Invalid arguments passed to jsPDF.rect');
        }
        out([
          f2(getHorizontalCoordinate(x)),
          f2(getVerticalCoordinate(y)),
          f2(w * k),
          f2(-h * k),
          're'
        ].join(' '));
        if (style !== null) {
          out(getStyle(style));
        }
        return this;
      };
      /**
       * Adds a triangle to PDF.
       *
       * @param {number} x1 Coordinate (in units declared at inception of PDF document) against left edge of the page.
       * @param {number} y1 Coordinate (in units declared at inception of PDF document) against upper edge of the page.
       * @param {number} x2 Coordinate (in units declared at inception of PDF document) against left edge of the page.
       * @param {number} y2 Coordinate (in units declared at inception of PDF document) against upper edge of the page.
       * @param {number} x3 Coordinate (in units declared at inception of PDF document) against left edge of the page.
       * @param {number} y3 Coordinate (in units declared at inception of PDF document) against upper edge of the page.
       * @param {string} style A string specifying the painting style or null.  Valid styles include: 'S' [default] - stroke, 'F' - fill,  and 'DF' (or 'FD') -  fill then stroke. A null value postpones setting the style so that a shape may be composed using multiple method calls. The last drawing method call used to define the shape should not have a null style argument.
       * @function
       * @instance
       * @returns {jsPDF}
       * @memberof jsPDF#
       * @name triangle
       */
      var triangle = API.__private__.triangle = API.triangle = function (x1, y1, x2, y2, x3, y3, style) {
        if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2) || isNaN(x3) || isNaN(y3) || !isValidStyle(style)) {
          throw new Error('Invalid arguments passed to jsPDF.triangle');
        }
        this.lines(
          [
            [x2 - x1, y2 - y1], // vector to point 2
            [x3 - x2, y3 - y2], // vector to point 3
            [x1 - x3, y1 - y3] // closing vector back to point 1
          ],
          x1,
          y1, // start of path
          [1, 1],
          style,
          true);
        return this;
      };
      /**
       * Adds a rectangle with rounded corners to PDF.
       *
       * @param {number} x Coordinate (in units declared at inception of PDF document) against left edge of the page.
       * @param {number} y Coordinate (in units declared at inception of PDF document) against upper edge of the page.
       * @param {number} w Width (in units declared at inception of PDF document).
       * @param {number} h Height (in units declared at inception of PDF document).
       * @param {number} rx Radius along x axis (in units declared at inception of PDF document).
       * @param {number} ry Radius along y axis (in units declared at inception of PDF document).
       * @param {string} style A string specifying the painting style or null.  Valid styles include: 'S' [default] - stroke, 'F' - fill,  and 'DF' (or 'FD') -  fill then stroke. A null value postpones setting the style so that a shape may be composed using multiple method calls. The last drawing method call used to define the shape should not have a null style argument.
       * @function
       * @instance
       * @returns {jsPDF}
       * @memberof jsPDF#
       * @name roundedRect
       */
      var roundedRect = API.__private__.roundedRect = API.roundedRect = function (x, y, w, h, rx, ry, style) {
        if (isNaN(x) || isNaN(y) || isNaN(w) || isNaN(h) || isNaN(rx) || isNaN(ry) || !isValidStyle(style)) {
          throw new Error('Invalid arguments passed to jsPDF.roundedRect');
        }
        var MyArc = 4 / 3 * (Math.SQRT2 - 1);
        this.lines(
          [
            [(w - 2 * rx), 0],
            [(rx * MyArc), 0, rx, ry - (ry * MyArc), rx, ry],
            [0, (h - 2 * ry)],
            [0, (ry * MyArc), -(rx * MyArc), ry, -rx, ry],
            [(-w + 2 * rx), 0],
            [-(rx * MyArc), 0, -rx, -(ry * MyArc), -rx, -ry],
            [0, (-h + 2 * ry)],
            [0, -(ry * MyArc), (rx * MyArc), -ry, rx, -ry]
          ],
          x + rx,
          y, // start of path
          [1, 1],
          style);
        return this;
      };
      /**
       * Adds an ellipse to PDF.
       *
       * @param {number} x Coordinate (in units declared at inception of PDF document) against left edge of the page.
       * @param {number} y Coordinate (in units declared at inception of PDF document) against upper edge of the page.
       * @param {number} rx Radius along x axis (in units declared at inception of PDF document).
       * @param {number} ry Radius along y axis (in units declared at inception of PDF document).
       * @param {string} style A string specifying the painting style or null.  Valid styles include: 'S' [default] - stroke, 'F' - fill,  and 'DF' (or 'FD') -  fill then stroke. A null value postpones setting the style so that a shape may be composed using multiple method calls. The last drawing method call used to define the shape should not have a null style argument.
       * @function
       * @instance
       * @returns {jsPDF}
       * @memberof jsPDF#
       * @name ellipse
       */
      var ellise = API.__private__.ellipse = API.ellipse = function (x, y, rx, ry, style) {
        if (isNaN(x) || isNaN(y) || isNaN(rx) || isNaN(ry) || !isValidStyle(style)) {
          throw new Error('Invalid arguments passed to jsPDF.ellipse');
        }
        var lx = 4 / 3 * (Math.SQRT2 - 1) * rx,
          ly = 4 / 3 * (Math.SQRT2 - 1) * ry;
        out([
          f2(getHorizontalCoordinate(x + rx)),
          f2(getVerticalCoordinate(y)),
          'm',
          f2(getHorizontalCoordinate(x + rx)),
          f2(getVerticalCoordinate(y - ly)),
          f2(getHorizontalCoordinate(x + lx)),
          f2(getVerticalCoordinate(y - ry)),
          f2(getHorizontalCoordinate(x)),
          f2(getVerticalCoordinate(y - ry)),
          'c'
        ].join(' '));
        out([
          f2(getHorizontalCoordinate(x - lx)),
          f2(getVerticalCoordinate(y - ry)),
          f2(getHorizontalCoordinate(x - rx)),
          f2(getVerticalCoordinate(y - ly)),
          f2(getHorizontalCoordinate(x - rx)),
          f2(getVerticalCoordinate(y)),
          'c'
        ].join(' '));
        out([
          f2(getHorizontalCoordinate(x - rx)),
          f2(getVerticalCoordinate(y + ly)),
          f2(getHorizontalCoordinate(x - lx)),
          f2(getVerticalCoordinate(y + ry)),
          f2(getHorizontalCoordinate(x)),
          f2(getVerticalCoordinate(y + ry)),
          'c'
        ].join(' '));
        out([
          f2(getHorizontalCoordinate(x + lx)),
          f2(getVerticalCoordinate(y + ry)),
          f2(getHorizontalCoordinate(x + rx)),
          f2(getVerticalCoordinate(y + ly)),
          f2(getHorizontalCoordinate(x + rx)),
          f2(getVerticalCoordinate(y)),
          'c'
        ].join(' '));
        if (style !== null) {
          out(getStyle(style));
        }
        return this;
      };
      /**
       * Adds an circle to PDF.
       *
       * @param {number} x Coordinate (in units declared at inception of PDF document) against left edge of the page.
       * @param {number} y Coordinate (in units declared at inception of PDF document) against upper edge of the page.
       * @param {number} r Radius (in units declared at inception of PDF document).
       * @param {string} style A string specifying the painting style or null.  Valid styles include: 'S' [default] - stroke, 'F' - fill,  and 'DF' (or 'FD') -  fill then stroke. A null value postpones setting the style so that a shape may be composed using multiple method calls. The last drawing method call used to define the shape should not have a null style argument.
       * @function
       * @instance
       * @returns {jsPDF}
       * @memberof jsPDF#
       * @name circle
       */
      var circle = API.__private__.circle = API.circle = function (x, y, r, style) {
        if (isNaN(x) || isNaN(y) || isNaN(r) || !isValidStyle(style)) {
          throw new Error('Invalid arguments passed to jsPDF.circle');
        }
        return this.ellipse(x, y, r, r, style);
      };
      /**
       * Sets text font face, variant for upcoming text elements.
       * See output of jsPDF.getFontList() for possible font names, styles.
       *
       * @param {string} fontName Font name or family. Example: "times".
       * @param {string} fontStyle Font style or variant. Example: "italic".
       * @function
       * @instance
       * @returns {jsPDF}
       * @memberof jsPDF#
       * @name setFont
       */
      API.setFont = function (fontName, fontStyle) {
        activeFontKey = getFont(fontName, fontStyle, {
          disableWarning: false
        });
        return this;
      };
      /**
       * Gets text font face, variant for upcoming text elements.
       *
       * @function
       * @instance
       * @returns {Object}
       * @memberof jsPDF#
       * @name getFont
       */
      var getFontEntry = API.__private__.getFont = API.getFont = function () {
        return fonts[getFont.apply(API, arguments)];
      };
      /**
       * Switches font style or variant for upcoming text elements,
       * while keeping the font face or family same.
       * See output of jsPDF.getFontList() for possible font names, styles.
       *
       * @param {string} style Font style or variant. Example: "italic".
       * @function
       * @instance
       * @returns {jsPDF}
       * @memberof jsPDF#
       * @deprecated
       * @name setFontStyle
       */
      API.setFontStyle = API.setFontType = function (style) {
        activeFontKey = getFont(undefined, style);
        // if font is not found, the above line blows up and we never go further
        return this;
      };
      /**
       * Returns an object - a tree of fontName to fontStyle relationships available to
       * active PDF document.
       *
       * @public
       * @function
       * @instance
       * @returns {Object} Like {'times':['normal', 'italic', ... ], 'arial':['normal', 'bold', ... ], ... }
       * @memberof jsPDF#
       * @name getFontList
       */
      var getFontList = API.__private__.getFontList = API.getFontList = function () {
        // TODO: iterate over fonts array or return copy of fontmap instead in case more are ever added.
        var list = {},
          fontName, fontStyle, tmp;
        for (fontName in fontmap) {
          if (fontmap.hasOwnProperty(fontName)) {
            list[fontName] = tmp = [];
            for (fontStyle in fontmap[fontName]) {
              if (fontmap[fontName].hasOwnProperty(fontStyle)) {
                tmp.push(fontStyle);
              }
            }
          }
        }
        return list;
      };
      /**
       * Add a custom font to the current instance.
       *
       * @property {string} postScriptName PDF specification full name for the font.
       * @property {string} id PDF-document-instance-specific label assinged to the font.
       * @property {string} fontStyle Style of the Font.
       * @property {Object} encoding Encoding_name-to-Font_metrics_object mapping.
       * @function
       * @instance
       * @memberof jsPDF#
       * @name addFont
       */
      API.addFont = function (postScriptName, fontName, fontStyle, encoding) {
        encoding = encoding || 'Identity-H';
        addFont.call(this, postScriptName, fontName, fontStyle, encoding);
      };
      var lineWidth = options.lineWidth || 0.200025; // 2mm
      /**
       * Sets line width for upcoming lines.
       *
       * @param {number} width Line width (in units declared at inception of PDF document).
       * @function
       * @instance
       * @returns {jsPDF}
       * @memberof jsPDF#
       * @name setLineWidth
       */
      var setLineWidth = API.__private__.setLineWidth = API.setLineWidth = function (width) {
        out(f2(width * k) + ' w');
        return this;
      };
      /**
       * Sets the dash pattern for upcoming lines.
       * 
       * To reset the settings simply call the method without any parameters.
       * @param {Array<number>} dashArray An array containing 0-2 numbers. The first number sets the length of the
       * dashes, the second number the length of the gaps. If the second number is missing, the gaps are considered
       * to be as long as the dashes. An empty array means solid, unbroken lines.
       * @param {number} dashPhase The phase lines start with.
       * @function
       * @instance
       * @returns {jsPDF}
       * @memberof jsPDF#
       * @name setLineDashPattern
       */
      var setLineDash = API.__private__.setLineDash = jsPDF.API.setLineDash = function (dashArray, dashPhase) {
        dashArray = dashArray || [];
        dashPhase = dashPhase || 0;
        if (isNaN(dashPhase) || !Array.isArray(dashArray)) {
          throw new Error('Invalid arguments passed to jsPDF.setLineDash');
        }
        dashArray = dashArray.map(function (x) {return f3(x * k)}).join(' ');
        dashPhase = f3(dashPhase * k);
        out('[' + dashArray + '] ' + dashPhase + ' d');
        return this;
      };
      var lineHeightFactor;
      var getLineHeight = API.__private__.getLineHeight = API.getLineHeight = function () {
        return activeFontSize * lineHeightFactor;
      };
      var lineHeightFactor;
      var getLineHeight = API.__private__.getLineHeight = API.getLineHeight = function () {
        return activeFontSize * lineHeightFactor;
      };
      /**
       * Sets the LineHeightFactor of proportion.
       *
       * @param {number} value LineHeightFactor value. Default: 1.15.
       * @function
       * @instance
       * @returns {jsPDF}
       * @memberof jsPDF#
       * @name setLineHeightFactor
       */
      var setLineHeightFactor = API.__private__.setLineHeightFactor = API.setLineHeightFactor = function (value) {
          value = value || 1.15;
          if (typeof value === "number") {
              lineHeightFactor = value;
          }
          return this;
      };
      /**
       * Gets the LineHeightFactor, default: 1.15.
       *
       * @function
       * @instance
       * @returns {number} lineHeightFactor
       * @memberof jsPDF#
       * @name getLineHeightFactor
       */
      var getLineHeightFactor = API.__private__.getLineHeightFactor = API.getLineHeightFactor = function () {
          return lineHeightFactor;
      };
      setLineHeightFactor(options.lineHeight);
      
      var getHorizontalCoordinate = API.__private__.getHorizontalCoordinate = function (value) {
        return scale(value);
      };
      var getVerticalCoordinate = API.__private__.getVerticalCoordinate = function (value) {
        return pagesContext[currentPage].mediaBox.topRightY - pagesContext[currentPage].mediaBox.bottomLeftY - scale(value);
      };
      var getHorizontalCoordinateString = API.__private__.getHorizontalCoordinateString = API.getHorizontalCoordinateString = function (value) {
        return f2(scale(value));
      };
      var getVerticalCoordinateString = API.__private__.getVerticalCoordinateString = API.getVerticalCoordinateString = function (value) {
        return f2(pagesContext[currentPage].mediaBox.topRightY - pagesContext[currentPage].mediaBox.bottomLeftY - scale(value));
      };
      var strokeColor = options.strokeColor || '0 G';
      /**
       *  Gets the stroke color for upcoming elements.
       *
       * @function
       * @instance
       * @returns {string} colorAsHex
       * @memberof jsPDF#
       * @name getDrawColor
       */
      var getStrokeColor = API.__private__.getStrokeColor = API.getDrawColor = function () {
        return decodeColorString(strokeColor);
      }
      /**
       * Sets the stroke color for upcoming elements.
       *
       * Depending on the number of arguments given, Gray, RGB, or CMYK
       * color space is implied.
       *
       * When only ch1 is given, "Gray" color space is implied and it
       * must be a value in the range from 0.00 (solid black) to to 1.00 (white)
       * if values are communicated as String types, or in range from 0 (black)
       * to 255 (white) if communicated as Number type.
       * The RGB-like 0-255 range is provided for backward compatibility.
       *
       * When only ch1,ch2,ch3 are given, "RGB" color space is implied and each
       * value must be in the range from 0.00 (minimum intensity) to to 1.00
       * (max intensity) if values are communicated as String types, or
       * from 0 (min intensity) to to 255 (max intensity) if values are communicated
       * as Number types.
       * The RGB-like 0-255 range is provided for backward compatibility.
       *
       * When ch1,ch2,ch3,ch4 are given, "CMYK" color space is implied and each
       * value must be a in the range from 0.00 (0% concentration) to to
       * 1.00 (100% concentration)
       *
       * Because JavaScript treats fixed point numbers badly (rounds to
       * floating point nearest to binary representation) it is highly advised to
       * communicate the fractional numbers as String types, not JavaScript Number type.
       *
       * @param {Number|String} ch1 Color channel value or {string} ch1 color value in hexadecimal, example: '#FFFFFF'.
       * @param {Number} ch2 Color channel value.
       * @param {Number} ch3 Color channel value.
       * @param {Number} ch4 Color channel value.
       *
       * @function
       * @instance
       * @returns {jsPDF}
       * @memberof jsPDF#
       * @name setDrawColor
       */
      var setStrokeColor = API.__private__.setStrokeColor = API.setDrawColor = function (ch1, ch2, ch3, ch4) {
        var options = {
          "ch1": ch1,
          "ch2": ch2,
          "ch3": ch3,
          "ch4": ch4,
          "pdfColorType": "draw",
          "precision": 2
        };
        strokeColor = encodeColorString(options);
        out(strokeColor);
        return this;
      };
      var fillColor = options.fillColor || '0 g';
      /**
       * Gets the fill color for upcoming elements.
       *
       * @function
       * @instance
       * @returns {string} colorAsHex
       * @memberof jsPDF#
       * @name getFillColor
       */
      var getFillColor = API.__private__.getFillColor = API.getFillColor = function () {
        return decodeColorString(fillColor);
      }
      /**
       * Sets the fill color for upcoming elements.
       *
       * Depending on the number of arguments given, Gray, RGB, or CMYK
       * color space is implied.
       *
       * When only ch1 is given, "Gray" color space is implied and it
       * must be a value in the range from 0.00 (solid black) to to 1.00 (white)
       * if values are communicated as String types, or in range from 0 (black)
       * to 255 (white) if communicated as Number type.
       * The RGB-like 0-255 range is provided for backward compatibility.
       *
       * When only ch1,ch2,ch3 are given, "RGB" color space is implied and each
       * value must be in the range from 0.00 (minimum intensity) to to 1.00
       * (max intensity) if values are communicated as String types, or
       * from 0 (min intensity) to to 255 (max intensity) if values are communicated
       * as Number types.
       * The RGB-like 0-255 range is provided for backward compatibility.
       *
       * When ch1,ch2,ch3,ch4 are given, "CMYK" color space is implied and each
       * value must be a in the range from 0.00 (0% concentration) to to
       * 1.00 (100% concentration)
       *
       * Because JavaScript treats fixed point numbers badly (rounds to
       * floating point nearest to binary representation) it is highly advised to
       * communicate the fractional numbers as String types, not JavaScript Number type.
       *
       * @param {Number|String} ch1 Color channel value or {string} ch1 color value in hexadecimal, example: '#FFFFFF'.
       * @param {Number} ch2 Color channel value.
       * @param {Number} ch3 Color channel value.
       * @param {Number} ch4 Color channel value.
       *
       * @function
       * @instance
       * @returns {jsPDF}
       * @memberof jsPDF#
       * @name setFillColor
       */
      var setFillColor = API.__private__.setFillColor = API.setFillColor = function (ch1, ch2, ch3, ch4) {
        var options = {
          "ch1": ch1,
          "ch2": ch2,
          "ch3": ch3,
          "ch4": ch4,
          "pdfColorType": "fill",
          "precision": 2
        };
        fillColor = encodeColorString(options);
        out(fillColor);
        return this;
      };
      var textColor = options.textColor || '0 g';
      /**
       * Gets the text color for upcoming elements.
       *
       * @function
       * @instance
       * @returns {string} colorAsHex
       * @memberof jsPDF#
       * @name getTextColor
       */
      var getTextColor = API.__private__.getTextColor = API.getTextColor = function () {
        return decodeColorString(textColor);
      }
      /**
       * Sets the text color for upcoming elements.
       *
       * Depending on the number of arguments given, Gray, RGB, or CMYK
       * color space is implied.
       *
       * When only ch1 is given, "Gray" color space is implied and it
       * must be a value in the range from 0.00 (solid black) to to 1.00 (white)
       * if values are communicated as String types, or in range from 0 (black)
       * to 255 (white) if communicated as Number type.
       * The RGB-like 0-255 range is provided for backward compatibility.
       *
       * When only ch1,ch2,ch3 are given, "RGB" color space is implied and each
       * value must be in the range from 0.00 (minimum intensity) to to 1.00
       * (max intensity) if values are communicated as String types, or
       * from 0 (min intensity) to to 255 (max intensity) if values are communicated
       * as Number types.
       * The RGB-like 0-255 range is provided for backward compatibility.
       *
       * When ch1,ch2,ch3,ch4 are given, "CMYK" color space is implied and each
       * value must be a in the range from 0.00 (0% concentration) to to
       * 1.00 (100% concentration)
       *
       * Because JavaScript treats fixed point numbers badly (rounds to
       * floating point nearest to binary representation) it is highly advised to
       * communicate the fractional numbers as String types, not JavaScript Number type.
       *
       * @param {Number|String} ch1 Color channel value or {string} ch1 color value in hexadecimal, example: '#FFFFFF'.
       * @param {Number} ch2 Color channel value.
       * @param {Number} ch3 Color channel value.
       * @param {Number} ch4 Color channel value.
       *
       * @function
       * @instance
       * @returns {jsPDF}
       * @memberof jsPDF#
       * @name setTextColor
       */
      var setTextColor = API.__private__.setTextColor = API.setTextColor = function (ch1, ch2, ch3, ch4) {
        var options = {
          "ch1": ch1,
          "ch2": ch2,
          "ch3": ch3,
          "ch4": ch4,
          "pdfColorType": "text",
          "precision": 3
        };
        textColor = encodeColorString(options);
        return this;
      };
      var activeCharSpace = options.charSpace;
      /**
       * Get global value of CharSpace.
       *
       * @function
       * @instance
       * @returns {number} charSpace
       * @memberof jsPDF#
       * @name getCharSpace
       */
      var getCharSpace = API.__private__.getCharSpace = API.getCharSpace = function () {
        return parseFloat(activeCharSpace || 0);
      };
      /**
       * Set global value of CharSpace.
       *
       * @param {number} charSpace
       * @function
       * @instance
       * @returns {jsPDF} jsPDF-instance
       * @memberof jsPDF#
       * @name setCharSpace
       */
      var setCharSpace = API.__private__.setCharSpace = API.setCharSpace = function (charSpace) {
        if (isNaN(charSpace)) {
          throw new Error('Invalid argument passed to jsPDF.setCharSpace');
        }
        activeCharSpace = charSpace;
        return this;
      };
      var lineCapID = 0;
      /**
       * Is an Object providing a mapping from human-readable to
       * integer flag values designating the varieties of line cap
       * and join styles.
       *
       * @memberof jsPDF#
       * @name CapJoinStyles
       */
      API.CapJoinStyles = {
        0: 0,
        'butt': 0,
        'but': 0,
        'miter': 0,
        1: 1,
        'round': 1,
        'rounded': 1,
        'circle': 1,
        2: 2,
        'projecting': 2,
        'project': 2,
        'square': 2,
        'bevel': 2
      };
      /**
       * Sets the line cap styles.
       * See {jsPDF.CapJoinStyles} for variants.
       *
       * @param {String|Number} style A string or number identifying the type of line cap.
       * @function
       * @instance
       * @returns {jsPDF}
       * @memberof jsPDF#
       * @name setLineCap
       */
      var setLineCap = API.__private__.setLineCap = API.setLineCap = function (style) {
        var id = API.CapJoinStyles[style];
        if (id === undefined) {
          throw new Error("Line cap style of '" + style + "' is not recognized. See or extend .CapJoinStyles property for valid styles");
        }
        lineCapID = id;
        out(id + ' J');
        return this;
      };
      var lineJoinID = 0;
      /**
       * Sets the line join styles.
       * See {jsPDF.CapJoinStyles} for variants.
       *
       * @param {String|Number} style A string or number identifying the type of line join.
       * @function
       * @instance
       * @returns {jsPDF}
       * @memberof jsPDF#
       * @name setLineJoin
       */
      var setLineJoin = API.__private__.setLineJoin = API.setLineJoin = function (style) {
        var id = API.CapJoinStyles[style];
        if (id === undefined) {
          throw new Error("Line join style of '" + style + "' is not recognized. See or extend .CapJoinStyles property for valid styles");
        }
        lineJoinID = id;
        out(id + ' j');
        return this;
      };
      var miterLimit;
      /**
       * Sets the miterLimit property, which effects the maximum miter length.
       *
       * @param {number} length The length of the miter
       * @function
       * @instance
       * @returns {jsPDF}
       * @memberof jsPDF#
       * @name setLineMiterLimit
       */
      var setLineMiterLimit = API.__private__.setLineMiterLimit = API.__private__.setMiterLimit = API.setLineMiterLimit = API.setMiterLimit = function (length) {
        length = length || 0;
        if (isNaN(length)) {
          throw new Error('Invalid argument passed to jsPDF.setLineMiterLimit');
        }
        miterLimit = parseFloat(f2(length * k));
        out(miterLimit + ' M');
        return this;
      };
      /**
      * GState
      */
      /**
       * An object representing a pdf graphics state.
       * @param parameters A parameter object that contains all properties this graphics state wants to set.
       * Supported are: opacity, stroke-opacity
       * @constructor
       */
      API.GState = function(parameters) {
        var supported = "opacity,stroke-opacity".split(",");
        for (var p in parameters) {
          if (parameters.hasOwnProperty(p) && supported.indexOf(p) >= 0) {
            this[p] = parameters[p];
          }
        }
        this.id = ""; // set by addGState()
        this.objectNumber = -1; // will be set by putGState()
      };
      API.GState.prototype.equals = function equals(other) {
        var ignore = "id,objectNumber,equals";
        var p;
        if (!other || typeof other !== typeof this) return false;
        var count = 0;
        for (p in this) {
          if (ignore.indexOf(p) >= 0) continue;
          if (this.hasOwnProperty(p) && !other.hasOwnProperty(p)) return false;
          if (this[p] !== other[p]) return false;
          count++;
        }
        for (p in other) {
          if (other.hasOwnProperty(p) && ignore.indexOf(p) < 0) count--;
        }
        return count === 0;
      };
      /**
       * Sets a either previously added {@link GState} (via {@link addGState}) or a new {@link GState}.
       * @param {String|GState} gState If type is string, a previously added GState is used, if type is GState
       * it will be added before use.
       * @function
       * @returns {jsPDF}
       * @memberof jsPDF#
       * @name setGState
       */
      API.setGState = function(gState) {
        if (typeof gState === "string") {
          gState = gStates[gStatesMap[gState]];
        } else {
          gState = addGState(null, gState);
        }
        if (!gState.equals(activeGState)) {
          out("/" + gState.id + " gs");
          activeGState = gState;
        }
      };
      /**
       * Adds a new Graphics State. Duplicates are automatically eliminated.
       * @param {String} key Might also be null, if no later reference to this gState is needed
       * @param {Object} gState The gState object
       */
      var addGState = function(key, gState) {
        // only add it if it is not already present (the keys provided by the user must be unique!)
        if (key && gStatesMap[key]) return;
        var duplicate = false;
        for (var s in gStates) {
          if (gStates.hasOwnProperty(s)) {
            if (gStates[s].equals(gState)) {
              duplicate = true;
              break;
            }
          }
        }
        if (duplicate) {
          gState = gStates[s];
        } else {
          var gStateKey = "GS" + (Object.keys(gStates).length + 1).toString(10);
          gStates[gStateKey] = gState;
          gState.id = gStateKey;
        }
        // several user keys may point to the same GState object
        key && (gStatesMap[key] = gState.id);
        events.publish("addGState", gState);
        return gState;
      };
      /**
       * Adds a new {@link GState} for later use. See {@link setGState}.
       * @param {String} key
       * @param {GState} gState
       * @function
       * @instance
       * @returns {jsPDF}
       *
       * @memberof jsPDF#
       * @name addGState
       */
      API.addGState = function(key, gState) {
        addGState(key, gState);
        return this;
      };
      /**
       * Saves the current graphics state ("pushes it on the stack"). It can be restored by {@link restoreGraphicsState}
       * later. Here, the general pdf graphics state is meant, also including the current transformation matrix,
       * fill and stroke colors etc.
       * @function
       * @returns {jsPDF}
       * @memberof jsPDF#
       * @name saveGraphicsState
       */
      API.saveGraphicsState = function() {
        out("q");
        // as we cannot set font key and size independently we must keep track of both
        fontStateStack.push({
          key: activeFontKey,
          size: activeFontSize,
          color: textColor
        });
        return this;
      };
      /**
       * Restores a previously saved graphics state saved by {@link saveGraphicsState} ("pops the stack").
       * @function
       * @returns {jsPDF}
       * @memberof jsPDF#
       * @name restoreGraphicsState
       */
      API.restoreGraphicsState = function() {
        out("Q");
        // restore previous font state
        var fontState = fontStateStack.pop();
        activeFontKey = fontState.key;
        activeFontSize = fontState.size;
        textColor = fontState.color;
        activeGState = null;
        return this;
      };
      /**
       * Appends this matrix to the left of all previously applied matrices.
       *
       * @param {Matrix} matrix
       * @function
       * @returns {jsPDF}
       * @memberof jsPDF#
       * @name setCurrentTransformationMatrix
       */
      API.setCurrentTransformationMatrix = function(matrix) {
        out(matrix.toString() + " cm");
        return this;
      };
      /**
       * Inserts a debug comment into the pdf.
       * @param {String} text
       * @returns {jsPDF}
       * @memberof jsPDF#
       * @name comment
       */
      API.comment = function(text) {
        out("#" + text);
        return this;
      };
      /**
      * Matrix
      */
      var Point = function (x, y) {
          var _x = x || 0;
          Object.defineProperty(this, 'x', {
              enumerable: true,
              get : function() {
                  return _x;
              },
              set : function(value) {
                  if (!isNaN(value)) {
                      _x = parseFloat(value);
                  }
              }
          });
          var _y = y || 0;
          Object.defineProperty(this, 'y', {
              enumerable: true,
              get : function() {
                  return _y;
              },
              set : function(value) {
                  if (!isNaN(value)) {
                      _y = parseFloat(value);
                  }
              }
          });
          var _type = 'pt';
          Object.defineProperty(this, 'type', {
              enumerable: true,
              get : function() {
                  return _type;
              },
              set : function(value) {
                  _type = value.toString();
              }
          });
          return this;
      };
      var Rectangle = function (x, y, w, h) {
          Point.call(this, x, y);
          this.type = 'rect';
          var _w = w || 0;
          Object.defineProperty(this, 'w', {
              enumerable: true,
              get : function() {
                  return _w;
              },
              set : function(value) {
                  if (!isNaN(value)) {
                      _w = parseFloat(value);
                  }
              }
          });
          var _h = h || 0;
          Object.defineProperty(this, 'h', {
              enumerable: true,
              get : function() {
                  return _h;
              },
              set : function(value) {
                  if (!isNaN(value)) {
                      _h = parseFloat(value);
                  }
              }
          });
          return this;
      };
      /**
      * FormObject/RenderTarget
      */
      var RenderTarget = function() {
        this.page = page;
        this.currentPage = currentPage;
        this.pages = pages.slice(0);
        this.pagedim = pagedim.slice(0);
        this.pagesContext = pagesContext.slice(0);
        this.x = pageX;
        this.y = pageY;
        this.matrix = pageMatrix;
        this.width = pageWidth;
        this.height = pageHeight;
        this.id = ""; // set by endFormObject()
        this.objectNumber = -1; // will be set by putXObject()
      };
      RenderTarget.prototype = {
        restore: function() {
          page = this.page;
          currentPage = this.currentPage;
          pagesContext = this.pagesContext;
          pagedim = this.pagedim;
          pages = this.pages;
          pageX = this.x;
          pageY = this.y;
          pageMatrix = this.matrix;
          pageWidth = this.width;
          pageHeight = this.height;
        }
      };
      var beginNewRenderTarget = function(x, y, width, height, matrix) {
        // save current state
        renderTargetStack.push(new RenderTarget());
        // clear pages
        page = currentPage = 0;
        pages = [];
        pageX = x;
        pageY = y;
        pageMatrix = matrix;
        beginPage(width, height);
      };
      var endFormObject = function(key) {
        // only add it if it is not already present (the keys provided by the user must be unique!)
        if (renderTargetMap[key]) return;
        // save the created xObject
        var newXObject = new RenderTarget();
        var xObjectId = "Xo" + (Object.keys(renderTargets).length + 1).toString(10);
        newXObject.id = xObjectId;
        renderTargetMap[key] = xObjectId;
        renderTargets[xObjectId] = newXObject;
        events.publish("addFormObject", newXObject);
        // restore state from stack
        renderTargetStack.pop().restore();
      };
      /**
       * Starts a new pdf form object, which means that all consequent draw calls target a new independent object
       * until {@link endFormObject} is called. The created object can be referenced and drawn later using
       * {@link doFormObject}. Nested form objects are possible.
       * x, y, width, height set the bounding box that is used to clip the content.
       *
       * @param {number} x
       * @param {number} y
       * @param {number} width
       * @param {number} height
       * @param {Matrix} matrix The matrix that will be applied to convert the form objects coordinate system to
       * the parent's.
       * @function
       * @returns {jsPDF}
       * @memberof jsPDF#
       * @name beginFormObject
       */
      API.beginFormObject = function(x, y, width, height, matrix) {
        // The user can set the output target to a new form object. Nested form objects are possible.
        // Currently, they use the resource dictionary of the surrounding stream. This should be changed, as
        // the PDF-Spec states:
        // "In PDF 1.2 and later versions, form XObjects may be independent of the content streams in which
        // they appear, and this is strongly recommended although not requiredIn PDF 1.2 and later versions,
        // form XObjects may be independent of the content streams in which they appear, and this is strongly
        // recommended although not required"
        beginNewRenderTarget(x, y, width, height, matrix);
        return this;
      };
      /**
       * Completes and saves the form object. 
       * @param {String} key The key by which this form object can be referenced.
       * @function
       * @returns {jsPDF}
       * @memberof jsPDF#
       * @name endFormObject
       */
      API.endFormObject = function(key) {
        endFormObject(key);
        return this;
      };
      /**
      * Draws the specified form object by referencing to the respective pdf XObject created with
      * {@link API.beginFormObject} and {@link endFormObject}.
      * The location is determined by matrix.
      *
      * @param {String} key The key to the form object.
      * @param {Matrix} matrix The matrix applied before drawing the form object.
      * @function
      * @returns {jsPDF}
      * @memberof jsPDF#
      * @name doFormObject
      */
      API.doFormObject = function(key, matrix) {
        var xObject = renderTargets[renderTargetMap[key]];
        out("q");
        out(matrix.toString() + " cm");
        out("/" + xObject.id + " Do");
        out("Q");
        return this;
      };
      /**
      * Returns the form object specified by key.
      * @param key {String}
      * @returns {{x: number, y: number, width: number, height: number, matrix: Matrix}}
      * @function
      * @returns {jsPDF}
      * @memberof jsPDF#
      * @name getFormObject
      */
      API.getFormObject = function(key) {
        var xObject = renderTargets[renderTargetMap[key]];
        return {
          x: xObject.x,
          y: xObject.y,
          width: xObject.width,
          height: xObject.height,
          matrix: xObject.matrix
        };
      };
      /**
       * Saves as PDF document. An alias of jsPDF.output('save', 'filename.pdf').
       * Uses FileSaver.js-method saveAs.
       *
       * @memberof jsPDF#
       * @name save
       * @function
       * @instance
       * @param  {string} filename The filename including extension.
       * @param  {Object} options An Object with additional options, possible options: 'returnPromise'.
       * @returns {jsPDF} jsPDF-instance
       */
      API.save = function (filename, options) {
        filename = filename || 'generated.pdf';
        
        options = options || {};
        options.returnPromise = options.returnPromise || false;
        
        if (options.returnPromise === false) {
            saveAs(getBlob(buildDocument()), filename);
            if (typeof saveAs.unload === 'function') {
              if (global.setTimeout) {
                setTimeout(saveAs.unload, 911);
              }
            }
        } else {
          return new Promise(function(resolve, reject) {
              try {
                  var result = saveAs(getBlob(buildDocument()), filename);
                  if (typeof saveAs.unload === 'function') {
                      if (global.setTimeout) {
                        setTimeout(saveAs.unload, 911);
                      }
                  }
                  resolve(result);
              } catch(e) {
                  reject(e.message);
              }
          });
        }
      };
      // applying plugins (more methods) ON TOP of built-in API.
      // this is intentional as we allow plugins to override
      // built-ins
      for (var plugin in jsPDF.API) {
        if (jsPDF.API.hasOwnProperty(plugin)) {
          if (plugin === 'events' && jsPDF.API.events.length) {
            (function (events, newEvents) {
              // jsPDF.API.events is a JS Array of Arrays
              // where each Array is a pair of event name, handler
              // Events were added by plugins to the jsPDF instantiator.
              // These are always added to the new instance and some ran
              // during instantiation.
              var eventname, handler_and_args, i;
              for (i = newEvents.length - 1; i !== -1; i--) {
                // subscribe takes 3 args: 'topic', function, runonce_flag
                // if undefined, runonce is false.
                // users can attach callback directly,
                // or they can attach an array with [callback, runonce_flag]
                // that's what the "apply" magic is for below.
                eventname = newEvents[i][0];
                handler_and_args = newEvents[i][1];
                events.subscribe.apply(
                  events, [eventname].concat(
                    typeof handler_and_args === 'function' ? [
                      handler_and_args
                    ] : handler_and_args));
              }
            }(events, jsPDF.API.events));
          } else {
            API[plugin] = jsPDF.API[plugin];
          }
        }
      }
      API.advancedAPI = function(body) {
         if (typeof body !== "function") {
          return this;
        }
        body(this);
          return this;
      }
      /**
       * Object exposing internal API to plugins
       * @public
       * @ignore
       */
      API.internal = {
        'pdfEscape': pdfEscape,
        'getStyle': getStyle,
        'getFont': getFontEntry,
        'getFontSize': getFontSize,
        'getCharSpace': getCharSpace,
        'getTextColor': getTextColor,
        'getLineHeight': getLineHeight,
        'getLineHeightFactor' : getLineHeightFactor,
        'write': write,
        'getHorizontalCoordinate': getHorizontalCoordinate,
        'getVerticalCoordinate': getVerticalCoordinate,
        'getCoordinateString': getHorizontalCoordinateString,
        'getVerticalCoordinateString': getVerticalCoordinateString,
        'collections': {},
        'newObject': newObject,
        'newAdditionalObject': newAdditionalObject,
        'newObjectDeferred': newObjectDeferred,
        'newObjectDeferredBegin': newObjectDeferredBegin,
        'getFilters': getFilters,
        'putStream': putStream,
        'events': events,
        // ratio that you use in multiplication of a given "size" number to arrive to 'point'
        // units of measurement.
        // scaleFactor is set at initialization of the document and calculated against the stated
        // default measurement units for the document.
        // If default is "mm", k is the number that will turn number in 'mm' into 'points' number.
        // through multiplication.
        'scaleFactor': k,
        'pageSize': {
          getWidth: function () {
            return (pagesContext[currentPage].mediaBox.topRightX - pagesContext[currentPage].mediaBox.bottomLeftX) / k;
          },
          setWidth: function (value) {
            pagesContext[currentPage].mediaBox.topRightX = (value * k) + pagesContext[currentPage].mediaBox.bottomLeftX;
          },
          getHeight: function () {
            return (pagesContext[currentPage].mediaBox.topRightY - pagesContext[currentPage].mediaBox.bottomLeftY) / k;
          },
          setHeight: function (value) {
            pagesContext[currentPage].mediaBox.topRightY = (value * k) + pagesContext[currentPage].mediaBox.bottomLeftY;
          },
        },
        'output': output,
        'getNumberOfPages': getNumberOfPages,
        'pages': pages,
        'out': out,
        'f2': f2,
        'f3': f3,
        'getPageInfo': getPageInfo,
        'getPageInfoByObjId': getPageInfoByObjId,
        'getCurrentPageInfo': getCurrentPageInfo,
        'getPDFVersion': getPdfVersion,
        'Point': Point,
        'Rectangle': Rectangle,
        'Matrix': Matrix,
        'hasHotfix': hasHotfix //Expose the hasHotfix check so plugins can also check them.
      };
      Object.defineProperty(API.internal.pageSize, 'width', {
        get: function () {
          return (pagesContext[currentPage].mediaBox.topRightX - pagesContext[currentPage].mediaBox.bottomLeftX) / k;
        },
        set: function (value) {
          pagesContext[currentPage].mediaBox.topRightX = (value * k) + pagesContext[currentPage].mediaBox.bottomLeftX;
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(API.internal.pageSize, 'height', {
        get: function () {
          return (pagesContext[currentPage].mediaBox.topRightY - pagesContext[currentPage].mediaBox.bottomLeftY) / k;
        },
        set: function (value) {
          pagesContext[currentPage].mediaBox.topRightY = (value * k) + pagesContext[currentPage].mediaBox.bottomLeftY;
        },
        enumerable: true,
        configurable: true
      });
      //////////////////////////////////////////////////////
      // continuing initialization of jsPDF Document object
      //////////////////////////////////////////////////////
      // Add the first page automatically
      addFonts(standardFonts);
      activeFontKey = 'F1';
      _addPage(format, orientation);
      events.publish('initialized');
      return API;
    }
    /**
     * jsPDF.API is a STATIC property of jsPDF class.
     * jsPDF.API is an object you can add methods and properties to.
     * The methods / properties you add will show up in new jsPDF objects.
     *
     * One property is prepopulated. It is the 'events' Object. Plugin authors can add topics,
     * callbacks to this object. These will be reassigned to all new instances of jsPDF.
     *
     * @static
     * @public
     * @memberof jsPDF#
     * @name API
     *
     * @example
     * jsPDF.API.mymethod = function(){
     *   // 'this' will be ref to internal API object. see jsPDF source
     *   // , so you can refer to built-in methods like so:
     *   //     this.line(....)
     *   //     this.text(....)
     * }
     * var pdfdoc = new jsPDF()
     * pdfdoc.mymethod() // <- !!!!!!
     */
    jsPDF.API = {
      events: []
    };
    /**
     * The version of jsPDF.
     * @name version
     * @type {string}
     * @memberof jsPDF#
     */
    jsPDF.version = '0.0.0';
    if (typeof define === 'function' && define.amd) {
      define('jsPDF', function () {
        return jsPDF;
      });
    } else if (typeof module !== 'undefined' && module.exports) {
      module.exports = jsPDF;
      module.exports.jsPDF = jsPDF;
    } else {
      global.jsPDF = jsPDF;
    }
    return jsPDF;
  }(typeof self !== "undefined" && self || typeof window !== "undefined" && window || typeof global !== "undefined" && global || Function('return typeof this === "object" && this.content')() || Function('return this')()));
  // `self` is undefined in Firefox for Android content script context
  // while `this` is nsIContentFrameMessageManager
  // with an attribute `content` that corresponds to the window
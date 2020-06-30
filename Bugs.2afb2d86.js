// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

(function(modules, cache, entry, globalName) {
  /* eslint-disable no-undef */
  var globalObject =
    typeof globalThis !== 'undefined'
      ? globalThis
      : typeof self !== 'undefined'
      ? self
      : typeof window !== 'undefined'
      ? window
      : typeof global !== 'undefined'
      ? global
      : {};
  /* eslint-enable no-undef */

  // Save the require from previous bundle to this closure if any
  var previousRequire =
    typeof globalObject.parcelRequire === 'function' &&
    globalObject.parcelRequire;
  // Do not use `require` to prevent Webpack from trying to bundle this call
  var nodeRequire =
    typeof module !== 'undefined' &&
    typeof module.require === 'function' &&
    module.require.bind(module);

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire =
          typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error("Cannot find module '" + name + "'");
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = (cache[name] = new newRequire.Module(name));

      modules[name][0].call(
        module.exports,
        localRequire,
        module,
        module.exports,
        this
      );
    }

    return cache[name].exports;

    function localRequire(x) {
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x) {
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function(id, exports) {
    modules[id] = [
      function(require, module) {
        module.exports = exports;
      },
      {},
    ];
  };

  globalObject.parcelRequire = newRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === 'object' && typeof module !== 'undefined') {
      module.exports = mainExports;

      // RequireJS
    } else if (typeof define === 'function' && define.amd) {
      define(function() {
        return mainExports;
      });

      // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }
})({"578aa57fddccb2a1264fb52bb67a9e5b":[function(require,module,exports) {
var global = arguments[3];
var HMR_HOST = null;
var HMR_PORT = 1234;
var HMR_ENV_HASH = "d751713988987e9331980363e24189ce";
module.bundle.HMR_BUNDLE_ID = "2afb2d8621c5ce0847188f2451b16fa6";
/* global HMR_HOST, HMR_PORT, HMR_ENV_HASH */

var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept, acceptedAssets; // eslint-disable-next-line no-redeclare

var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = HMR_HOST || (location.protocol.indexOf('http') === 0 ? location.hostname : 'localhost');
  var port = HMR_PORT || location.port;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + (port ? ':' + port : '') + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    acceptedAssets = {};
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      // Remove error overlay if there is one
      removeErrorOverlay();
      let assets = data.assets.filter(asset => asset.envHash === HMR_ENV_HASH); // Handle HMR Update

      var handled = false;
      assets.forEach(asset => {
        var didAccept = asset.type === 'css' || hmrAcceptCheck(global.parcelRequire, asset.id);

        if (didAccept) {
          handled = true;
        }
      });

      if (handled) {
        console.clear();
        assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });

        for (var i = 0; i < assetsToAccept.length; i++) {
          var id = assetsToAccept[i][1];

          if (!acceptedAssets[id]) {
            hmrAcceptRun(assetsToAccept[i][0], id);
          }
        }
      } else {
        window.location.reload();
      }
    }

    if (data.type === 'error') {
      // Log parcel errors to console
      for (let ansiDiagnostic of data.diagnostics.ansi) {
        let stack = ansiDiagnostic.codeframe ? ansiDiagnostic.codeframe : ansiDiagnostic.stack;
        console.error('🚨 [parcel]: ' + ansiDiagnostic.message + '\n' + stack + '\n\n' + ansiDiagnostic.hints.join('\n'));
      } // Render the fancy html overlay


      removeErrorOverlay();
      var overlay = createErrorOverlay(data.diagnostics.html);
      document.body.appendChild(overlay);
    }
  };

  ws.onerror = function (e) {
    console.error(e.message);
  };

  ws.onclose = function (e) {
    console.warn('[parcel] 🚨 Connection to the HMR server was lost');
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
    console.log('[parcel] ✨ Error resolved');
  }
}

function createErrorOverlay(diagnostics) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;
  let errorHTML = '<div style="background: black; opacity: 0.85; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; font-family: Menlo, Consolas, monospace; z-index: 9999;">';

  for (let diagnostic of diagnostics) {
    let stack = diagnostic.codeframe ? diagnostic.codeframe : diagnostic.stack;
    errorHTML += `
      <div>
        <div style="font-size: 18px; font-weight: bold; margin-top: 20px;">
          🚨 ${diagnostic.message}
        </div>
        <pre>
          ${stack}
        </pre>
        <div>
          ${diagnostic.hints.map(hint => '<div>' + hint + '</div>').join('')}
        </div>
      </div>
    `;
  }

  errorHTML += '</div>';
  overlay.innerHTML = errorHTML;
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push([bundle, k]);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function updateLink(link) {
  var newLink = link.cloneNode();

  newLink.onload = function () {
    if (link.parentNode !== null) {
      link.parentNode.removeChild(link);
    }
  };

  newLink.setAttribute('href', link.getAttribute('href').split('?')[0] + '?' + Date.now());
  link.parentNode.insertBefore(newLink, link.nextSibling);
}

var cssTimeout = null;

function reloadCSS() {
  if (cssTimeout) {
    return;
  }

  cssTimeout = setTimeout(function () {
    var links = document.querySelectorAll('link[rel="stylesheet"]');

    for (var i = 0; i < links.length; i++) {
      var absolute = /^https?:\/\//i.test(links[i].getAttribute('href'));

      if (!absolute) {
        updateLink(links[i]);
      }
    }

    cssTimeout = null;
  }, 50);
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    if (asset.type === 'css') {
      reloadCSS();
    } else {
      var fn = new Function('require', 'module', 'exports', asset.output);
      modules[asset.id] = [fn, asset.depsByBundle[bundle.HMR_BUNDLE_ID]];
    }
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (v) {
    return hmrAcceptCheck(v[0], v[1]);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached && cached.hot) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      var assetsToAlsoAccept = cb(function () {
        return getParents(global.parcelRequire, id);
      });

      if (assetsToAlsoAccept && assetsToAccept.length) {
        assetsToAccept.push.apply(assetsToAccept, assetsToAlsoAccept);
      }
    });
  }

  acceptedAssets[id] = true;
}
},{}],"c00e607576b6da73f3471278d158f50f":[function(require,module,exports) {
"use strict";

var _world = _interopRequireDefault(require("./world/world"));

var _ground = _interopRequireDefault(require("./world/entities/ground"));

var _base = _interopRequireWildcard(require("./world/entities/base"));

var _bugs = _interopRequireWildcard(require("./world/entities/vehicles/bugs"));

var _killers = _interopRequireWildcard(require("./world/entities/vehicles/killers"));

var _guards = _interopRequireWildcard(require("./world/entities/vehicles/guards"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const surface = 800;
const itemsPerLine = 200;
_bugs.Bug.size = 1 / 50;
_bugs.Bug.maxSpeed = 700;
_killers.Killer.size = 1 / 30;
_killers.Killer.maxSpeed = 500;
_guards.Guard.size = 1 / 20;
_guards.Guard.maxSpeed = 440;
_base.Base.size = 1 / 10;
_base.Base.savingRate = 0.1;
_base.Base.energyBuffer = 5;
_base.Base.defenseArea = 0.3;
const world = new _world.default(surface, 'canvas');
window.world = world;
const ground = new _ground.default(itemsPerLine);
const bases = new _base.default();
const bugs = new _bugs.default(100);
const killers = new _killers.default(2);
const guards = new _guards.default(2);
world.add(ground);
world.add(bugs);
world.add(killers);
world.add(guards);
world.add(bases);
world.animate();
},{"./world/world":"7b22a08ea0363d5d6d0130ea3525e86b","./world/entities/ground":"550e0780d25a677b8750634bbdc60ae0","./world/entities/base":"31c4cf1bed361901e16ecd4e9c1d61ef","./world/entities/vehicles/bugs":"197508393690e56cbb33a6e96f1d961c","./world/entities/vehicles/killers":"895b95b1cfe3a3b4c76b8bde7ffd2e07","./world/entities/vehicles/guards":"cc37d9245025f6d2691f5ea4a9c3f5ed"}],"7b22a08ea0363d5d6d0130ea3525e86b":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _stats = _interopRequireDefault(require("../tools/stats"));

var _cuonMatrix = require("../tools/cuon-matrix");

var _bugs = require("./entities/vehicles/bugs");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class World {
  constructor(surface, selector) {
    this.surface = surface;
    this.canvas = document.querySelector(selector);
    this.canvas.width = surface;
    this.canvas.height = surface;
    this.gl = this.canvas.getContext('webgl', {
      antialias: true
    });
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.elements = [];
    this.register = {};
    this.viewMatrix = new _cuonMatrix.Matrix4().setLookAt(0, 5, 1, 0, 0, 0, 0, 1, 0);
    this.projMatrix = new _cuonMatrix.Matrix4().setPerspective(30, this.canvas.width / this.canvas.height, 2, 100);
    this.stats = new _stats.default(60, '#stats');
  }

  add(element) {
    this.elements.push(element);
    this.register[element.constructor.name] = element;
    element.setup(this.gl, this);
  }

  draw(time) {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.viewMatrix = new _cuonMatrix.Matrix4().setLookAt(3 * Math.cos(time / 40000), 3, 3 * Math.sin(time / 40000), 0, 0, 0, 0, 1, 0);
    this.elements.forEach(element => {
      element.draw();
    });
  }

  update() {
    this.elements.forEach(element => {
      if (element.prepareUpdate) {
        element.prepareUpdate();
      }
    });
    this.elements.forEach(element => {
      element.update();
    });
  }

  animate(time) {
    requestAnimationFrame(this.animate.bind(this));
    this.generateStats(time);
    this.update();
    this.draw(time);
  }

  generateStats(time) {
    return;
    this.stats.tick(time);
    const total = this.register.Bugs.individuals.length;
    this.stats.add('bugs', total);
    const reds = this.register.Bugs.individuals.filter(b => b.team === _bugs.Bug.team.red).length;
    this.stats.add('Reds', reds);
    this.stats.add('Blues', total - reds);
    this.stats.add('Stock reds', this.register.Bases.register[_bugs.Bug.team.red].energy);
    this.stats.add('Stock blues', this.register.Bases.register[_bugs.Bug.team.blue].energy);
    this.stats.add('Average energy killers', this.register.Killers.individuals.reduce((acc, cur) => {
      acc += cur.energy;
      return acc;
    }, 0) / this.register.Killers.individuals.length);
  }

}

exports.default = World;
},{"../tools/stats":"d79efb1682fc02eaa44d3b81c9e35c26","../tools/cuon-matrix":"9cc7dc197f18cf0e49c822f8ac8018c2","./entities/vehicles/bugs":"197508393690e56cbb33a6e96f1d961c"}],"d79efb1682fc02eaa44d3b81c9e35c26":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

class Stats {
  constructor(range, selector) {
    this.total = 0;
    this.elements = [];
    this.register = {};
    if (range == null) throw new Error('The stats class needs a range!');
    this.range = range;
    this.last = 0;
    this.count = 0;
    this.domElement = this.linkToDOM(selector);
  }

  linkToDOM(selector) {
    let el = document.querySelector(selector);

    if (!el) {
      console.warn('Stats: no selector was provided. A <p> element was added to the end of <body>');
      el = document.createElement('p');
      document.querySelector('body').appendChild(el);
    }

    return el;
  }

  tick(time) {
    if (typeof time !== 'number') return 0;
    this.count++;
    const change = time - this.last;
    this.elements.push(change);
    this.total += change;
    this.last = time;

    if (this.count > this.range) {
      this.total -= this.elements.shift();
    }

    if (this.count % this.range === 0) {
      this.updateDom();
    }

    return change;
  }

  add(name, value) {
    if (typeof value !== 'number') return;

    if (!this.register[name]) {
      this.register[name] = {
        elements: [],
        last: 0,
        count: 0,
        total: 0
      };
    }

    const loc = this.register[name];
    loc.elements.push(value);
    loc.total += value;
    loc.count++;

    if (loc.count > this.range) {
      loc.total -= loc.elements.shift();
      loc.count--;
    }
  }

  updateDom() {
    const average = Math.round(1000 / (this.total / this.range));
    let message = `${average} fps`;

    for (let prop of Object.keys(this.register)) {
      const loc = this.register[prop];
      const average = Math.round(loc.total / loc.count);
      message = message + `; ${prop}: ${average}`;
    }

    this.domElement.innerHTML = message;
  }

}

exports.default = Stats;
},{}],"9cc7dc197f18cf0e49c822f8ac8018c2":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Vector3 = exports.Matrix4 = void 0;

// cuon-matrix.js (c) 2012 kanda and matsuda

/**
 * 4x4の行列を実装したクラス。
 * OpenGLの行列スタックと同等の機能を備えている。
 * 変換後の行列は、変換行列を右からかけることで計算される。
 * 計算した結果で、行列の内容が置き換えられる。
 */

/**
 * Matrix4のコンストラクタ。
 * 新しく生成される行列は、opt_srcにMatrix4のインスタンスが渡された場合、その要素がコピーされて初期化される。
 * それ以外の場合、単位行列に初期化される。
 * @param opt_src 要素をコピーしてくる行列（オプション）
 */
var Matrix4 = function (opt_src) {
  var i, s, d;

  if (opt_src && typeof opt_src === 'object' && opt_src.hasOwnProperty('elements')) {
    s = opt_src.elements;
    d = new Float32Array(16);

    for (i = 0; i < 16; ++i) {
      d[i] = s[i];
    }

    this.elements = d;
  } else {
    this.elements = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  }
};
/**
 * 単位行列に設定する。
 * @return this
 */


exports.Matrix4 = Matrix4;

Matrix4.prototype.setIdentity = function () {
  var e = this.elements;
  e[0] = 1;
  e[4] = 0;
  e[8] = 0;
  e[12] = 0;
  e[1] = 0;
  e[5] = 1;
  e[9] = 0;
  e[13] = 0;
  e[2] = 0;
  e[6] = 0;
  e[10] = 1;
  e[14] = 0;
  e[3] = 0;
  e[7] = 0;
  e[11] = 0;
  e[15] = 1;
  return this;
};
/**
 * 渡された行列の要素をコピーする。
 * @param src 要素をコピーしてくる行列
 * @return this
 */


Matrix4.prototype.set = function (src) {
  var i, s, d;
  s = src.elements;
  d = this.elements;

  if (s === d) {
    return;
  }

  for (i = 0; i < 16; ++i) {
    d[i] = s[i];
  }

  return this;
};
/**
 * 渡された行列を右からかける。
 * @param other かける行列
 * @return this
 */


Matrix4.prototype.concat = function (other) {
  var i, e, a, b, ai0, ai1, ai2, ai3; // e = a * b を計算する

  e = this.elements;
  a = this.elements;
  b = other.elements; // eとbが同じ場合、bの内容を一時的な配列にコピーする

  if (e === b) {
    b = new Float32Array(16);

    for (i = 0; i < 16; ++i) {
      b[i] = e[i];
    }
  }

  for (i = 0; i < 4; i++) {
    ai0 = a[i];
    ai1 = a[i + 4];
    ai2 = a[i + 8];
    ai3 = a[i + 12];
    e[i] = ai0 * b[0] + ai1 * b[1] + ai2 * b[2] + ai3 * b[3];
    e[i + 4] = ai0 * b[4] + ai1 * b[5] + ai2 * b[6] + ai3 * b[7];
    e[i + 8] = ai0 * b[8] + ai1 * b[9] + ai2 * b[10] + ai3 * b[11];
    e[i + 12] = ai0 * b[12] + ai1 * b[13] + ai2 * b[14] + ai3 * b[15];
  }

  return this;
};

Matrix4.prototype.multiply = Matrix4.prototype.concat;
/**
 * 渡されたベクトルをかける。
 * @param pos かける行列
 * @return この行列を掛けた結果(Float32Array)
 */

Matrix4.prototype.multiplyVector3 = function (pos) {
  var e = this.elements;
  var p = pos.elements;
  var v = new Vector3();
  var result = v.elements;
  result[0] = p[0] * e[0] + p[1] * e[4] + p[2] * e[8] + e[11];
  result[1] = p[0] * e[1] + p[1] * e[5] + p[2] * e[9] + e[12];
  result[2] = p[0] * e[2] + p[1] * e[6] + p[2] * e[10] + e[13];
  return v;
};
/**
 * 渡されたベクトルをかける。
 * @param pos かける行列
 * @return この行列を掛けた結果(Float32Array)
 */


Matrix4.prototype.multiplyVector4 = function (pos) {
  var e = this.elements;
  var p = pos.elements;
  var v = new Vector4();
  var result = v.elements;
  result[0] = p[0] * e[0] + p[1] * e[4] + p[2] * e[8] + p[3] * e[12];
  result[1] = p[0] * e[1] + p[1] * e[5] + p[2] * e[9] + p[3] * e[13];
  result[2] = p[0] * e[2] + p[1] * e[6] + p[2] * e[10] + p[3] * e[14];
  result[3] = p[0] * e[3] + p[1] * e[7] + p[2] * e[11] + p[3] * e[15];
  return v;
};
/**
 * 行列を転置する。
 * @return this
 */


Matrix4.prototype.transpose = function () {
  var e, t;
  e = this.elements;
  t = e[1];
  e[1] = e[4];
  e[4] = t;
  t = e[2];
  e[2] = e[8];
  e[8] = t;
  t = e[3];
  e[3] = e[12];
  e[12] = t;
  t = e[6];
  e[6] = e[9];
  e[9] = t;
  t = e[7];
  e[7] = e[13];
  e[13] = t;
  t = e[11];
  e[11] = e[14];
  e[14] = t;
  return this;
};
/**
 * 渡された行列の逆行列を計算して、この行列に代入する。
 * @param other 逆行列を計算する行列
 * @return this
 */


Matrix4.prototype.setInverseOf = function (other) {
  var i, s, d, inv, det;
  s = other.elements;
  d = this.elements;
  inv = new Float32Array(16);
  inv[0] = s[5] * s[10] * s[15] - s[5] * s[11] * s[14] - s[9] * s[6] * s[15] + s[9] * s[7] * s[14] + s[13] * s[6] * s[11] - s[13] * s[7] * s[10];
  inv[4] = -s[4] * s[10] * s[15] + s[4] * s[11] * s[14] + s[8] * s[6] * s[15] - s[8] * s[7] * s[14] - s[12] * s[6] * s[11] + s[12] * s[7] * s[10];
  inv[8] = s[4] * s[9] * s[15] - s[4] * s[11] * s[13] - s[8] * s[5] * s[15] + s[8] * s[7] * s[13] + s[12] * s[5] * s[11] - s[12] * s[7] * s[9];
  inv[12] = -s[4] * s[9] * s[14] + s[4] * s[10] * s[13] + s[8] * s[5] * s[14] - s[8] * s[6] * s[13] - s[12] * s[5] * s[10] + s[12] * s[6] * s[9];
  inv[1] = -s[1] * s[10] * s[15] + s[1] * s[11] * s[14] + s[9] * s[2] * s[15] - s[9] * s[3] * s[14] - s[13] * s[2] * s[11] + s[13] * s[3] * s[10];
  inv[5] = s[0] * s[10] * s[15] - s[0] * s[11] * s[14] - s[8] * s[2] * s[15] + s[8] * s[3] * s[14] + s[12] * s[2] * s[11] - s[12] * s[3] * s[10];
  inv[9] = -s[0] * s[9] * s[15] + s[0] * s[11] * s[13] + s[8] * s[1] * s[15] - s[8] * s[3] * s[13] - s[12] * s[1] * s[11] + s[12] * s[3] * s[9];
  inv[13] = s[0] * s[9] * s[14] - s[0] * s[10] * s[13] - s[8] * s[1] * s[14] + s[8] * s[2] * s[13] + s[12] * s[1] * s[10] - s[12] * s[2] * s[9];
  inv[2] = s[1] * s[6] * s[15] - s[1] * s[7] * s[14] - s[5] * s[2] * s[15] + s[5] * s[3] * s[14] + s[13] * s[2] * s[7] - s[13] * s[3] * s[6];
  inv[6] = -s[0] * s[6] * s[15] + s[0] * s[7] * s[14] + s[4] * s[2] * s[15] - s[4] * s[3] * s[14] - s[12] * s[2] * s[7] + s[12] * s[3] * s[6];
  inv[10] = s[0] * s[5] * s[15] - s[0] * s[7] * s[13] - s[4] * s[1] * s[15] + s[4] * s[3] * s[13] + s[12] * s[1] * s[7] - s[12] * s[3] * s[5];
  inv[14] = -s[0] * s[5] * s[14] + s[0] * s[6] * s[13] + s[4] * s[1] * s[14] - s[4] * s[2] * s[13] - s[12] * s[1] * s[6] + s[12] * s[2] * s[5];
  inv[3] = -s[1] * s[6] * s[11] + s[1] * s[7] * s[10] + s[5] * s[2] * s[11] - s[5] * s[3] * s[10] - s[9] * s[2] * s[7] + s[9] * s[3] * s[6];
  inv[7] = s[0] * s[6] * s[11] - s[0] * s[7] * s[10] - s[4] * s[2] * s[11] + s[4] * s[3] * s[10] + s[8] * s[2] * s[7] - s[8] * s[3] * s[6];
  inv[11] = -s[0] * s[5] * s[11] + s[0] * s[7] * s[9] + s[4] * s[1] * s[11] - s[4] * s[3] * s[9] - s[8] * s[1] * s[7] + s[8] * s[3] * s[5];
  inv[15] = s[0] * s[5] * s[10] - s[0] * s[6] * s[9] - s[4] * s[1] * s[10] + s[4] * s[2] * s[9] + s[8] * s[1] * s[6] - s[8] * s[2] * s[5];
  det = s[0] * inv[0] + s[1] * inv[4] + s[2] * inv[8] + s[3] * inv[12];

  if (det === 0) {
    return this;
  }

  det = 1 / det;

  for (i = 0; i < 16; i++) {
    d[i] = inv[i] * det;
  }

  return this;
};
/**
 * この行列の逆行列を計算して、内容を置き換える。
 * @return this
 */


Matrix4.prototype.invert = function () {
  return this.setInverseOf(this);
};
/**
 * 正射影行列に設定する。
 * @param left 左クリップ平面のX座標
 * @param right 右クリップ平面のX座標
 * @param bottom 下クリップ平面のY座標
 * @param top 上クリップ平面のY座標
 * @param near 近クリップ平面までの距離。平面が視点の後方にある場合は負数
 * @param far 遠クリップ平面までの距離。平面が視点の後方にある場合は負数
 * @return this
 */


Matrix4.prototype.setOrtho = function (left, right, bottom, top, near, far) {
  var e, rw, rh, rd;

  if (left === right || bottom === top || near === far) {
    throw 'null frustum';
  }

  rw = 1 / (right - left);
  rh = 1 / (top - bottom);
  rd = 1 / (far - near);
  e = this.elements;
  e[0] = 2 * rw;
  e[1] = 0;
  e[2] = 0;
  e[3] = 0;
  e[4] = 0;
  e[5] = 2 * rh;
  e[6] = 0;
  e[7] = 0;
  e[8] = 0;
  e[9] = 0;
  e[10] = -2 * rd;
  e[11] = 0;
  e[12] = -(right + left) * rw;
  e[13] = -(top + bottom) * rh;
  e[14] = -(far + near) * rd;
  e[15] = 1;
  return this;
};
/**
 * 正射影行列を右からかける。
 * @param left 左クリップ平面のX座標
 * @param right 右クリップ平面のX座標
 * @param bottom 下クリップ平面のY座標
 * @param top 上クリップ平面のY座標
 * @param near 近クリップ平面までの距離。平面が視点の後方にある場合は負数
 * @param far 遠クリップ平面までの距離。平面が視点の後方にある場合は負数
 * @return this
 */


Matrix4.prototype.ortho = function (left, right, bottom, top, near, far) {
  return this.concat(new Matrix4().setOrtho(left, right, bottom, top, near, far));
};
/**
 * 透視射影行列に設定する
 * @param left 近クリップ平面上における左クリップ平面のX座標
 * @param right 近クリップ平面上における右クリップ平面のX座標
 * @param bottom 近クリップ平面上における下クリップ平面のY座標
 * @param top 近クリップ平面上における上クリップ平面のY座標
 * @param near 近クリップ平面までの距離。正数でなくてはならない
 * @param far 遠クリップ平面までの距離。正数でなくてはならない
 * @return this
 */


Matrix4.prototype.setFrustum = function (left, right, bottom, top, near, far) {
  var e, rw, rh, rd;

  if (left === right || top === bottom || near === far) {
    throw 'null frustum';
  }

  if (near <= 0) {
    throw 'near <= 0';
  }

  if (far <= 0) {
    throw 'far <= 0';
  }

  rw = 1 / (right - left);
  rh = 1 / (top - bottom);
  rd = 1 / (far - near);
  e = this.elements;
  e[0] = 2 * near * rw;
  e[1] = 0;
  e[2] = 0;
  e[3] = 0;
  e[4] = 0;
  e[5] = 2 * near * rh;
  e[6] = 0;
  e[7] = 0;
  e[8] = (right + left) * rw;
  e[9] = (top + bottom) * rh;
  e[10] = -(far + near) * rd;
  e[11] = -1;
  e[12] = 0;
  e[13] = 0;
  e[14] = -2 * near * far * rd;
  e[15] = 0;
  return this;
};
/**
 * 透視射影行列を右からかける。
 * @param left 近クリップ平面上における左クリップ平面のX座標
 * @param right 近クリップ平面上における右クリップ平面のX座標
 * @param bottom 近クリップ平面上における下クリップ平面のY座標
 * @param top 近クリップ平面上における上クリップ平面のY座標
 * @param near 近クリップ平面までの距離。正数でなくてはならない
 * @param far 遠クリップ平面までの距離。正数でなくてはならない
 * @return this
 */


Matrix4.prototype.frustum = function (left, right, bottom, top, near, far) {
  return this.concat(new Matrix4().setFrustum(left, right, bottom, top, near, far));
};
/**
 * 視野角、アスペクト比を指定して透視射影行列に設定する。
 * @param fovy 垂直視野角 [度]
 * @param aspect 視野のアスペクト比（幅 / 高さ）
 * @param near 近クリップ平面までの距離。正数でなくてはならない
 * @param far 遠クリップ平面までの距離。正数でなくてはならない
 * @return this
 */


Matrix4.prototype.setPerspective = function (fovy, aspect, near, far) {
  var e, rd, s, ct;

  if (near === far || aspect === 0) {
    throw 'null frustum';
  }

  if (near <= 0) {
    throw 'near <= 0';
  }

  if (far <= 0) {
    throw 'far <= 0';
  }

  fovy = Math.PI * fovy / 180 / 2;
  s = Math.sin(fovy);

  if (s === 0) {
    throw 'null frustum';
  }

  rd = 1 / (far - near);
  ct = Math.cos(fovy) / s;
  e = this.elements;
  e[0] = ct / aspect;
  e[1] = 0;
  e[2] = 0;
  e[3] = 0;
  e[4] = 0;
  e[5] = ct;
  e[6] = 0;
  e[7] = 0;
  e[8] = 0;
  e[9] = 0;
  e[10] = -(far + near) * rd;
  e[11] = -1;
  e[12] = 0;
  e[13] = 0;
  e[14] = -2 * near * far * rd;
  e[15] = 0;
  return this;
};
/**
 * 透視射影行列を右からかける。
 * @param fovy 垂直視野角 [度]
 * @param aspect 視野のアスペクト比（幅 / 高さ）
 * @param near 近クリップ平面までの距離。正数でなくてはならない
 * @param far 遠クリップ平面までの距離。正数でなくてはならない
 * @return this
 */


Matrix4.prototype.perspective = function (fovy, aspect, near, far) {
  return this.concat(new Matrix4().setPerspective(fovy, aspect, near, far));
};
/**
 * スケーリング行列に設定する。
 * @param x X方向の倍率
 * @param y Y方向の倍率
 * @param z Z方向の倍率
 * @return this
 */


Matrix4.prototype.setScale = function (x, y, z) {
  var e = this.elements;
  e[0] = x;
  e[4] = 0;
  e[8] = 0;
  e[12] = 0;
  e[1] = 0;
  e[5] = y;
  e[9] = 0;
  e[13] = 0;
  e[2] = 0;
  e[6] = 0;
  e[10] = z;
  e[14] = 0;
  e[3] = 0;
  e[7] = 0;
  e[11] = 0;
  e[15] = 1;
  return this;
};
/**
 * スケーリング行列を右からかける。
 * @param x X方向の倍率
 * @param y Y方向の倍率
 * @param z Z方向の倍率
 * @return this
 */


Matrix4.prototype.scale = function (x, y, z) {
  var e = this.elements;
  e[0] *= x;
  e[4] *= y;
  e[8] *= z;
  e[1] *= x;
  e[5] *= y;
  e[9] *= z;
  e[2] *= x;
  e[6] *= y;
  e[10] *= z;
  e[3] *= x;
  e[7] *= y;
  e[11] *= z;
  return this;
};
/**
 * 平行移動行列に設定する。
 * @param x X方向の移動量
 * @param y Y方向の移動量
 * @param z Z方向の移動量
 * @return this
 */


Matrix4.prototype.setTranslate = function (x, y, z) {
  var e = this.elements;
  e[0] = 1;
  e[4] = 0;
  e[8] = 0;
  e[12] = x;
  e[1] = 0;
  e[5] = 1;
  e[9] = 0;
  e[13] = y;
  e[2] = 0;
  e[6] = 0;
  e[10] = 1;
  e[14] = z;
  e[3] = 0;
  e[7] = 0;
  e[11] = 0;
  e[15] = 1;
  return this;
};
/**
 * 平行移動行列を右からかける。
 * @param x X方向の移動量
 * @param y Y方向の移動量
 * @param z Z方向の移動量
 * @return this
 */


Matrix4.prototype.translate = function (x, y, z) {
  var e = this.elements;
  e[12] += e[0] * x + e[4] * y + e[8] * z;
  e[13] += e[1] * x + e[5] * y + e[9] * z;
  e[14] += e[2] * x + e[6] * y + e[10] * z;
  e[15] += e[3] * x + e[7] * y + e[11] * z;
  return this;
};
/**
 * 回転行列に設定する。
 * 回転軸の方向ベクトルは正規化されていなくても構わない。
 * @param angle 回転角 [度]
 * @param x 回転軸の方向ベクトルのX成分
 * @param y 回転軸の方向ベクトルのY成分
 * @param z 回転軸の方向ベクトルのZ成分
 * @return this
 */


Matrix4.prototype.setRotate = function (angle, x, y, z) {
  var e, s, c, len, rlen, nc, xy, yz, zx, xs, ys, zs;
  angle = Math.PI * angle / 180;
  e = this.elements;
  s = Math.sin(angle);
  c = Math.cos(angle);

  if (0 !== x && 0 === y && 0 === z) {
    // X軸まわりの回転
    if (x < 0) {
      s = -s;
    }

    e[0] = 1;
    e[4] = 0;
    e[8] = 0;
    e[12] = 0;
    e[1] = 0;
    e[5] = c;
    e[9] = -s;
    e[13] = 0;
    e[2] = 0;
    e[6] = s;
    e[10] = c;
    e[14] = 0;
    e[3] = 0;
    e[7] = 0;
    e[11] = 0;
    e[15] = 1;
  } else if (0 === x && 0 !== y && 0 === z) {
    // Y軸まわりの回転
    if (y < 0) {
      s = -s;
    }

    e[0] = c;
    e[4] = 0;
    e[8] = s;
    e[12] = 0;
    e[1] = 0;
    e[5] = 1;
    e[9] = 0;
    e[13] = 0;
    e[2] = -s;
    e[6] = 0;
    e[10] = c;
    e[14] = 0;
    e[3] = 0;
    e[7] = 0;
    e[11] = 0;
    e[15] = 1;
  } else if (0 === x && 0 === y && 0 !== z) {
    // Z軸まわりの回転
    if (z < 0) {
      s = -s;
    }

    e[0] = c;
    e[4] = -s;
    e[8] = 0;
    e[12] = 0;
    e[1] = s;
    e[5] = c;
    e[9] = 0;
    e[13] = 0;
    e[2] = 0;
    e[6] = 0;
    e[10] = 1;
    e[14] = 0;
    e[3] = 0;
    e[7] = 0;
    e[11] = 0;
    e[15] = 1;
  } else {
    // その他の任意軸まわりの回転
    len = Math.sqrt(x * x + y * y + z * z);

    if (len !== 1) {
      rlen = 1 / len;
      x *= rlen;
      y *= rlen;
      z *= rlen;
    }

    nc = 1 - c;
    xy = x * y;
    yz = y * z;
    zx = z * x;
    xs = x * s;
    ys = y * s;
    zs = z * s;
    e[0] = x * x * nc + c;
    e[1] = xy * nc + zs;
    e[2] = zx * nc - ys;
    e[3] = 0;
    e[4] = xy * nc - zs;
    e[5] = y * y * nc + c;
    e[6] = yz * nc + xs;
    e[7] = 0;
    e[8] = zx * nc + ys;
    e[9] = yz * nc - xs;
    e[10] = z * z * nc + c;
    e[11] = 0;
    e[12] = 0;
    e[13] = 0;
    e[14] = 0;
    e[15] = 1;
  }

  return this;
};
/**
 * 回転行列を右からかける。
 * 回転軸の方向ベクトルは正規化されていなくても構わない。
 * @param angle 回転角 [度]
 * @param x 回転軸の方向ベクトルのX成分
 * @param y 回転軸の方向ベクトルのY成分
 * @param z 回転軸の方向ベクトルのZ成分
 * @return this
 */


Matrix4.prototype.rotate = function (angle, x, y, z) {
  return this.concat(new Matrix4().setRotate(angle, x, y, z));
};
/**
 * 視野変換行列を設定する。
 * @param eyeX, eyeY, eyeZ 視点の位置
 * @param centerX, centerY, centerZ 標点の位置
 * @param upX, upY, upZ カメラの上方向を表す方向ベクトル
 * @return this
 */


Matrix4.prototype.setLookAt = function (eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ) {
  var e, fx, fy, fz, rlf, sx, sy, sz, rls, ux, uy, uz;
  fx = centerX - eyeX;
  fy = centerY - eyeY;
  fz = centerZ - eyeZ; // fを正規化する

  rlf = 1 / Math.sqrt(fx * fx + fy * fy + fz * fz);
  fx *= rlf;
  fy *= rlf;
  fz *= rlf; // fとupの外積を求める

  sx = fy * upZ - fz * upY;
  sy = fz * upX - fx * upZ;
  sz = fx * upY - fy * upX; // sを正規化する

  rls = 1 / Math.sqrt(sx * sx + sy * sy + sz * sz);
  sx *= rls;
  sy *= rls;
  sz *= rls; // sとfの外積を求める

  ux = sy * fz - sz * fy;
  uy = sz * fx - sx * fz;
  uz = sx * fy - sy * fx; // 代入する

  e = this.elements;
  e[0] = sx;
  e[1] = ux;
  e[2] = -fx;
  e[3] = 0;
  e[4] = sy;
  e[5] = uy;
  e[6] = -fy;
  e[7] = 0;
  e[8] = sz;
  e[9] = uz;
  e[10] = -fz;
  e[11] = 0;
  e[12] = 0;
  e[13] = 0;
  e[14] = 0;
  e[15] = 1; // 平行移動する

  return this.translate(-eyeX, -eyeY, -eyeZ);
};
/**
 * 視野変換行列を右からかける。
 * @param eyeX, eyeY, eyeZ 視点の位置
 * @param centerX, centerY, centerZ 標点の位置
 * @param upX, upY, upZ カメラの上方向を表す方向ベクトル
 * @return this
 */


Matrix4.prototype.lookAt = function (eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ) {
  return this.concat(new Matrix4().setLookAt(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ));
};
/**
 * 頂点を平面上に射影するような行列を右からかける。
 * @param plane 平面方程式 Ax + By + Cz + D = 0 の係数[A, B, C, D]を格納した配列
 * @param light 光源の同次座標を格納した配列。light[3]=0の場合、平行光源を表す
 * @return this
 */


Matrix4.prototype.dropShadow = function (plane, light) {
  var mat = new Matrix4();
  var e = mat.elements;
  var dot = plane[0] * light[0] + plane[1] * light[1] + plane[2] * light[2] + plane[3] * light[3];
  e[0] = dot - light[0] * plane[0];
  e[1] = -light[1] * plane[0];
  e[2] = -light[2] * plane[0];
  e[3] = -light[3] * plane[0];
  e[4] = -light[0] * plane[1];
  e[5] = dot - light[1] * plane[1];
  e[6] = -light[2] * plane[1];
  e[7] = -light[3] * plane[1];
  e[8] = -light[0] * plane[2];
  e[9] = -light[1] * plane[2];
  e[10] = dot - light[2] * plane[2];
  e[11] = -light[3] * plane[2];
  e[12] = -light[0] * plane[3];
  e[13] = -light[1] * plane[3];
  e[14] = -light[2] * plane[3];
  e[15] = dot - light[3] * plane[3];
  return this.concat(mat);
};
/**
 * 平行光源により頂点を平面上に射影するような行列を右からかける。
 * @param normX, normY, normZ 平面の法線ベクトル（正規化されている必要はない）
 * @param planeX, planeY, planeZ 平面上の点
 * @param lightX, lightY, lightZ ライトの方向（正規化されている必要はない）
 * @return this
 */


Matrix4.prototype.dropShadowDirectionally = function (normX, normY, normZ, planeX, planeY, planeZ, lightX, lightY, lightZ) {
  var a = planeX * normX + planeY * normY + planeZ * normZ;
  return this.dropShadow([normX, normY, normZ, -a], [lightX, lightY, lightZ, 0]);
};
/**
 * Vector3のコンストラクタ
 * 引数を指定するとその内容がコピーされる
 * @param opt_src 要素をコピーしてくるベクトル（オプション）
 */


const Vector3 = function (opt_src) {
  var v = new Float32Array(3);

  if (opt_src && typeof opt_src === 'object') {
    v[0] = opt_src[0];
    v[1] = opt_src[1];
    v[2] = opt_src[2];
  }

  this.elements = v;
};
/**
 * 正規化する。
 * @return this
 */


exports.Vector3 = Vector3;

Vector3.prototype.normalize = function () {
  var v = this.elements;
  var c = v[0],
      d = v[1],
      e = v[2],
      g = Math.sqrt(c * c + d * d + e * e);

  if (g) {
    if (g == 1) return this;
  } else {
    v[0] = 0;
    v[1] = 0;
    v[2] = 0;
    return this;
  }

  g = 1 / g;
  v[0] = c * g;
  v[1] = d * g;
  v[2] = e * g;
  return this;
};
/**
 * Vector4のコンストラクタ
 * 引数を指定するとその内容がコピーされる
 * @param opt_src 要素をコピーしてくるベクトル（オプション）
 */


var Vector4 = function (opt_src) {
  var v = new Float32Array(4);

  if (opt_src && typeof opt_src === 'object') {
    v[0] = opt_src[0];
    v[1] = opt_src[1];
    v[2] = opt_src[2];
    v[3] = opt_src[3];
  }

  this.elements = v;
};
},{}],"197508393690e56cbb33a6e96f1d961c":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Bug = void 0;

var _killers = require("./killers");

var _vehicle = require("./vehicle");

var _speciesContainer = _interopRequireDefault(require("./speciesContainer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Bug extends _vehicle.Vehicle {
  constructor(world, team, x, y) {
    super(world, team, x, y, Bug.maxSpeed, Bug.energyLimit);
    this.task = Bug.activity.gather;
  }

  alter() {
    this.energy = this.energy * 0.995 - 0.001;
    return this;
  }

  interact(species) {
    const [nearNeighboors, minTouchDistance] = species.getPotentialTouching(this);
    const manhattanMinTouchDistance = minTouchDistance ** 2;
    nearNeighboors.forEach(neighboor => {
      if (this.getManhattanDistance(neighboor) < manhattanMinTouchDistance) {
        if (neighboor.team !== this.team) {
          this.energy = this.energy * 0.98 - 0.01;
        }
      }
    });
    return this;
  }

  work() {
    if (this.task === Bug.activity.gather) {
      if (this.energy > 0.9) {
        this.task = Bug.activity.bringFood;
      } else {
        this.findFood();
      }
    }

    if (this.task === Bug.activity.bringFood) {
      this.goHome();
    }

    return this;
  }

  goHome() {
    const {
      Bases
    } = this.world.register;

    if (this.getDistance(this.home) < 0.03) {
      this.task = Bug.activity.gather;

      if (this.energy > Bug.energyTransfer) {
        Bases.register[this.team].getEnergy(Bug.energyTransfer);
        this.energy -= Bug.energyTransfer;
      } else {
        Bases.register[this.team].getEnergy(this.energy / 2);
        this.energy /= 2;
      }

      return;
    }

    super.goHome();
  }

}

exports.Bug = Bug;
Bug.team = {
  red: 0,
  blue: 1
};
Bug.activity = {
  gather: 0,
  bringFood: 1
};
Bug.energyTransfer = 0.5;
Bug.energyLimit = 1;

class Bugs extends _speciesContainer.default {
  constructor(initialPopulation) {
    super(initialPopulation, Bug);
  }

  update() {
    const {
      Bugs,
      Killers
    } = this.world.register;
    this.individuals.forEach(b => b.move());
    this.individuals.forEach(b => b.alter().interact(Bugs).interact(Killers).eat().work());
    this.individuals = this.individuals.filter(b => b.energy > 0);
  }

}

exports.default = Bugs;
},{"./killers":"895b95b1cfe3a3b4c76b8bde7ffd2e07","./vehicle":"c31e12abc417e862546939be81c36082","./speciesContainer":"3827340d19ef1aabec03a61fb3044dc8"}],"895b95b1cfe3a3b4c76b8bde7ffd2e07":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Killer = void 0;

var _webglelement = _interopRequireDefault(require("../../../tools/webglelement"));

var _bugs = require("./bugs");

var _guards = require("./guards");

var _ground = require("../ground");

var _qtree = require("../../../tools/qtree");

var _speciesContainer = _interopRequireDefault(require("./speciesContainer"));

var _vehicle = require("./vehicle");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Killer extends _vehicle.Vehicle {
  constructor(world, team, x, y) {
    super(world, team, x, y, Killer.maxSpeed, Killer.energyLimit);
    this.task = Killer.activity.gather;
  }

  alter() {
    this.energy = this.energy * 0.995 - 0.001;
    return this;
  }

  interact(species) {
    const [nearNeighboors, minTouchDistance] = species.getPotentialTouching(this);
    nearNeighboors.forEach(neighboor => {
      if (this.getDistance(neighboor) < minTouchDistance) {
        if (neighboor.team !== this.team) {
          this.energy = this.energy * 0.98 - 0.01;
        }
      }
    });
    return this;
  }

  work() {
    if (this.energy > 2) {
      this.attack();
    } else {
      this.task = Killer.activity.gather;
      this.findFood();
    }

    return this;
  }

  attack() {
    const qtreeBugs = this.world.register.Bugs.qtree;

    if (this.target && this.target.energy > 0) {
      this.goTowardsTarget(this.target);
    } else {
      const surfaceToSearch = new _qtree.Rectangle(this.x, this.y, Killer.perceptionLimit, Killer.perceptionLimit);
      const nearNeighboors = qtreeBugs.query(surfaceToSearch).filter(b => b.team !== this.team); //debugger

      const [target, dist] = nearNeighboors.reduce((nearest, cur) => {
        const dist = this.getDistance(cur);

        if (dist < nearest[1]) {
          nearest = [cur, dist];
        }

        return nearest;
      }, [null, Infinity]);

      if (target && dist < Killer.perceptionLimit) {
        this.target = target;
        this.goTowardsTarget(target);
      }
    }
  }

}

exports.Killer = Killer;
Killer.team = {
  red: 0,
  blue: 1
};
Killer.activity = {
  gather: 0,
  bringFood: 1
};
Killer.energyTransfer = 0.5;
Killer.energyLimit = 10;
Killer.perceptionLimit = 2 * 0.1; //Killer.size

class Killers extends _speciesContainer.default {
  constructor(initialPopulation) {
    super(initialPopulation, Killer);
  }

  update() {
    const {
      Guards,
      Killers
    } = this.world.register;
    this.individuals.forEach(k => k.move());
    this.individuals.forEach(k => k.alter().interact(Killers).interact(Guards).eat().work());
    this.individuals = this.individuals.filter(k => k.energy > 0);
  }

}

exports.default = Killers;
},{"../../../tools/webglelement":"2dcdceab8105a52e906f22e64cb7264f","./bugs":"197508393690e56cbb33a6e96f1d961c","./guards":"cc37d9245025f6d2691f5ea4a9c3f5ed","../ground":"550e0780d25a677b8750634bbdc60ae0","../../../tools/qtree":"23df1890c8e5f1f57d706941f82b8554","./speciesContainer":"3827340d19ef1aabec03a61fb3044dc8","./vehicle":"c31e12abc417e862546939be81c36082"}],"2dcdceab8105a52e906f22e64cb7264f":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _cuonMatrix = require("../tools/cuon-matrix");

var _cube = require("../tools/cube");

class WebGlElement {
  constructor() {
    this.program = null;
    this.vertexBuffer = null;
    this.vertexColorBuffer = null;
    this.indexBuffer = null;
    this.a_position = null;
    this.a_Color = null;
    this.a_Normal = null;
    this.u_MvpMatrix = null;
    this.u_Color = null;
    this.u_NormalMatrix = null;
    this.u_LightColor = null;
    this.u_LightDirection = null;
    this.u_AmbientLight = null;
    this.gl = null;
    this.world = null;
    this.entitySize = null;
  }

  setup(world, entitySize, positions, colors) {
    const gl = world.gl;
    this.gl = world.gl;
    this.world = world;
    this.entitySize = entitySize; //2D world
    // const vertexShader = `
    //   attribute vec4 a_Position;
    //   attribute vec4 a_Color;
    //   varying vec4 v_Color;
    //   void main() {
    //       gl_Position = a_Position*2.-1.;
    //       gl_PointSize = ${entitySize}.;
    //       v_Color = a_Color;
    //   }
    //   `
    // const fragmentShader = `
    //   precision mediump float;
    //   varying vec4 v_Color;
    //   void main() {
    //     float dist = distance(gl_PointCoord, vec2(0.5, 0.5));
    //     if (dist < 0.5 && dist>0.45-v_Color.r/2.) {
    //       gl_FragColor = vec4(1.-v_Color.g, 0., v_Color.g, 1.);
    //     } else {
    //       discard;
    //     }
    //   }
    //   `
    // 3D world with points
    // const vertexShader = `
    //   attribute vec4 a_Position;
    //   attribute vec4 a_Color;
    //   uniform mat4 u_MvpMatrix;
    //   varying vec4 v_Color;
    //   void main() {
    //       gl_Position = u_MvpMatrix * (vec4(a_Position.x* 2. -1.,0.0,a_Position.y* 2. -1., 1.) );
    //       gl_PointSize = ${entitySize}.;
    //       v_Color = a_Color;
    //   }
    //   `
    // const fragmentShader = `
    //   #ifdef GL_ES
    //   precision mediump float;
    //   #endif
    //   varying vec4 v_Color;
    //   void main() {
    //     float dist = distance(gl_PointCoord, vec2(0.5, 0.5));
    //     if (dist < 0.5 && dist>0.45-v_Color.r/2.) {
    //       gl_FragColor = vec4(1.-v_Color.g, 0., v_Color.g, 1.);
    //     } else {
    //       discard;
    //     }
    //   }
    //   `

    const vertexShader = `
      attribute vec4 a_Position;
      attribute vec4 a_Normal;
      attribute vec4 a_Color;
      uniform mat4 u_MvpMatrix;
      uniform vec4 u_Color;
      uniform mat4 u_NormalMatrix;    // Transformation matrix of normal
      uniform vec3 u_LightColor;      // Light color
      uniform vec3 u_LightDirection;  // World coordinate, normalized
      uniform vec3 u_AmbientLight;    // Ambient light color
      varying vec4 v_Color;

      void main() {
          gl_Position = u_MvpMatrix * a_Position;
          
          // Recalculate normal with normal matrix and make its length 1.0
          vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));
      
          // The dot product of the light direction and the normal
          float nDotL = max(dot(u_LightDirection, normal), 0.0);
      
          // Calculate the color due to diffuse reflection
          vec3 diffuse = u_LightColor * u_Color.rgb * nDotL;
      
          // Calculate the color due to ambient reflection
          vec3 ambient = u_AmbientLight * u_Color.rgb;
      
          // Add the surface colors due to diffuse and ambient reflection
          v_Color = vec4(diffuse + ambient, u_Color.a);
      }
      `;
    const fragmentShader = `
      #ifdef GL_ES
      precision mediump float;
      #endif
      varying vec4 v_Color;
      
      void main() {
          gl_FragColor = v_Color;
       
      }
      `;
    this.program = this.createProgramm(gl, vertexShader, fragmentShader);
    gl.useProgram(this.program); // setup vertices buffer

    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, _cube.vertices, gl.STATIC_DRAW);
    this.a_Position = gl.getAttribLocation(this.program, 'a_Position'); // setup indexes buffer

    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, _cube.indices, gl.STATIC_DRAW); // setup color buffer

    this.vertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexColorBuffer);

    if (colors) {
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    }

    this.a_Color = gl.getAttribLocation(this.program, 'a_Color'); // setup normals buffer

    this.normalsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, _cube.normals, gl.STATIC_DRAW);
    this.a_Normal = gl.getAttribLocation(this.program, 'a_Normal'); // setup uniforms

    this.u_NormalMatrix = gl.getUniformLocation(this.program, 'u_NormalMatrix');
    this.u_LightColor = gl.getUniformLocation(this.program, 'u_LightColor');
    this.u_LightDirection = gl.getUniformLocation(this.program, 'u_LightDirection');
    this.u_AmbientLight = gl.getUniformLocation(this.program, 'u_AmbientLight');
    const lightDirection = new _cuonMatrix.Vector3([1.0, 3.0, 4.0]);
    lightDirection.normalize(); // Normalize

    gl.uniform3fv(this.u_LightDirection, lightDirection.elements);
    gl.uniform3f(this.u_AmbientLight, 0.3, 0.3, 0.3);
    gl.uniform3f(this.u_LightColor, 1.0, 1.0, 1.0);
    this.u_MvpMatrix = gl.getUniformLocation(this.program, 'u_MvpMatrix');
    this.u_Color = gl.getUniformLocation(this.program, 'u_Color'); //debugger
  } // 2D
  // draw(length, newPositions, newColors) {
  //   const { gl, program } = this
  //   gl.useProgram(program)
  //   gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
  //   if (newPositions) {
  //     gl.bufferData(
  //       gl.ARRAY_BUFFER,
  //       new Float32Array(newPositions),
  //       gl.STATIC_DRAW
  //     )
  //   }
  //   gl.vertexAttribPointer(this.a_Position, 2, gl.FLOAT, false, 0, 0)
  //   gl.enableVertexAttribArray(this.a_Position)
  //   gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexColorBuffer)
  //   if (newColors) {
  //     gl.bufferData(
  //       gl.ARRAY_BUFFER,
  //       new Float32Array(newColors),
  //       gl.STATIC_DRAW
  //     )
  //   }
  //   gl.vertexAttribPointer(this.a_Color, 2, gl.FLOAT, false, 0, 0)
  //   gl.enableVertexAttribArray(this.a_Color)
  //   gl.drawArrays(gl.POINTS, 0, length)
  // }
  // // 3D Points
  // draw(length, newPositions, newColors) {
  //   const { gl, program } = this
  //   gl.useProgram(program)
  //   gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
  //   if (newPositions) {
  //     gl.bufferData(
  //       gl.ARRAY_BUFFER,
  //       new Float32Array(newPositions),
  //       gl.STATIC_DRAW
  //     )
  //   }
  //   gl.vertexAttribPointer(this.a_Position, 2, gl.FLOAT, false, 0, 0)
  //   gl.enableVertexAttribArray(this.a_Position)
  //   const mvpMatrix = new Matrix4() // Model view projection matrix
  //   const modelMatrix = new Matrix4() // Model matrix
  //   mvpMatrix
  //     .set(this.world.projMatrix)
  //     .multiply(this.world.viewMatrix)
  //     .multiply(modelMatrix)
  //   // Pass the model view projection matrix to u_MvpMatrix
  //   //debugger
  //   gl.uniformMatrix4fv(this.u_MvpMatrix, false, mvpMatrix.elements)
  //   gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexColorBuffer)
  //   if (newColors) {
  //     gl.bufferData(
  //       gl.ARRAY_BUFFER,
  //       new Float32Array(newColors),
  //       gl.STATIC_DRAW
  //     )
  //   }
  //   gl.vertexAttribPointer(this.a_Color, 2, gl.FLOAT, false, 0, 0)
  //   gl.enableVertexAttribArray(this.a_Color)
  //   gl.drawArrays(gl.POINTS, 0, length)
  // }


  draw(length, newPositions, newColors) {
    const {
      gl,
      program
    } = this;
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(this.a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.a_Position);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer);
    gl.vertexAttribPointer(this.a_Normal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.a_Normal); // gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexColorBuffer)
    // if (newColors) {
    //   gl.bufferData(
    //     gl.ARRAY_BUFFER,
    //     new Float32Array(newColors),
    //     gl.STATIC_DRAW
    //   )
    // }
    // gl.vertexAttribPointer(this.a_Color, 2, gl.FLOAT, false, 0, 0)
    // gl.enableVertexAttribArray(this.a_Color)

    const mvpMatrix = new _cuonMatrix.Matrix4(); // Model view projection matrix

    const modelMatrix = new _cuonMatrix.Matrix4(); // Model matrix

    const normalMatrix = new _cuonMatrix.Matrix4(); // Transformation matrix for normals

    for (let i = 0; i < newPositions.length; i += 2) {
      modelMatrix.setTranslate(newPositions[i] * 2 - 1, 0, newPositions[i + 1] * 2 - 1).scale(this.entitySize / 1000, this.entitySize / 1000, this.entitySize / 1000);
      mvpMatrix.set(this.world.projMatrix).multiply(this.world.viewMatrix).multiply(modelMatrix);
      gl.uniformMatrix4fv(this.u_MvpMatrix, false, mvpMatrix.elements);
      normalMatrix.setInverseOf(modelMatrix);
      normalMatrix.transpose(); // Pass the transformation matrix for normals to u_NormalMatrix

      gl.uniformMatrix4fv(this.u_NormalMatrix, false, normalMatrix.elements);
      gl.uniform4fv(this.u_Color, new Float32Array([newColors[i], newColors[i + 1], 0, 1]));
      gl.drawElements(gl.TRIANGLES, _cube.indices.length, gl.UNSIGNED_BYTE, 0);
    }
  }

  createProgramm(gl, vertexShaderSource, fragmentShaderSource) {
    const vertexShader = this.loadShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = this.loadShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    return program;
  }

  loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const isCompiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

    if (!isCompiled) {
      const decodedType = type === gl.VERTEX_SHADER ? 'vertex' : type === gl.FRAGMENT_SHADER ? 'fragment' : 'unknown type';
      console.error(`The ${decodedType} shader could not be compiled`);
    }

    return shader;
  }

  initAttributeVariable(gl, a_attribute, buffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(a_attribute, buffer.num, buffer.type, false, 0, 0);
    gl.enableVertexAttribArray(a_attribute);
  }

}

exports.default = WebGlElement;
},{"../tools/cuon-matrix":"9cc7dc197f18cf0e49c822f8ac8018c2","../tools/cube":"48117ce9c56c01016ea0e15e5450f28d"}],"48117ce9c56c01016ea0e15e5450f28d":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.normals = exports.indices = exports.vertices = void 0;
// Create a cube
//    v6----- v5
//   /|      /|
//  v1------v0|
//  | |     | |
//  | |v7---|-|v4
//  |/      |/
//  v2------v3
const vertices = new Float32Array([1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, // v0-v1-v2-v3 front
1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, // v0-v3-v4-v5 right
1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, // v0-v5-v6-v1 up
-1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, // v1-v6-v7-v2 left
-1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0, // v7-v4-v3-v2 down
1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0 // v4-v7-v6-v5 back
]); // Indices of the vertices

exports.vertices = vertices;
const indices = new Uint8Array([0, 1, 2, 0, 2, 3, // front
4, 5, 6, 4, 6, 7, // right
8, 9, 10, 8, 10, 11, // up
12, 13, 14, 12, 14, 15, // left
16, 17, 18, 16, 18, 19, // down
20, 21, 22, 20, 22, 23 // back
]); // Normal

exports.indices = indices;
const normals = new Float32Array([0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, // v0-v1-v2-v3 front
1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, // v0-v3-v4-v5 right
0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, // v0-v5-v6-v1 up
-1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, // v1-v6-v7-v2 left
0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, // v7-v4-v3-v2 down
0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0 // v4-v7-v6-v5 back
]);
exports.normals = normals;
},{}],"cc37d9245025f6d2691f5ea4a9c3f5ed":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Guard = void 0;

var _webglelement = _interopRequireDefault(require("../../../tools/webglelement"));

var _qtree = require("../../../tools/qtree");

var _killers = require("./killers");

var _base = require("../base");

var _vehicle = require("./vehicle");

var _speciesContainer = _interopRequireDefault(require("./speciesContainer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Guard extends _vehicle.Vehicle {
  constructor(world, team, x, y) {
    super(world, team, x, y, Guard.maxSpeed, Guard.energyLimit);
    this.task = Guard.activity.gather;
  }

  alter() {
    this.energy = this.energy - 0.001;
    return this;
  }

  interact(species) {
    const [nearNeighboors, minTouchDistance] = species.getPotentialTouching(this);
    nearNeighboors.forEach(neighboor => {
      if (this.getDistance(neighboor) < minTouchDistance) {
        if (neighboor.team !== this.team) {
          if (neighboor.constructor.name === 'Killer') {
            this.energy = this.energy * 0.99 - 0.008;
          } else {
            this.energy = this.energy * 0.98 - 0.01;
          }
        }
      }
    });
    return this;
  }

  work() {
    if (this.energy > 2) {
      if (this.task === Guard.activity.attack) {
        this.attack();
      } else {
        this.patrol();
      }
    } else {
      this.task = Guard.activity.goHome;
      this.goHome();
    }

    return this;
  }

  patrol() {
    const qtreeKillers = this.world.register.Killers.qtree;
    const surfaceToSearch = new _qtree.Rectangle(this.home.x, this.home.y, _base.Base.defenseArea, _base.Base.defenseArea);
    const nearNeighboors = qtreeKillers.query(surfaceToSearch).filter(k => k.team !== this.team).filter(k => k.getDistance(this.home) < _base.Base.defenseArea);
    const [target, dist] = nearNeighboors.reduce((nearest, cur) => {
      const dist = this.getDistance(cur);

      if (dist < nearest[1]) {
        nearest = [cur, dist];
      }

      return nearest;
    }, [null, Infinity]);

    if (target) {
      this.target = target;
      this.task = Guard.activity.attack;
      this.goTowardsTarget(this.target);
    }
  }

  attack() {
    if (this.target && this.target.energy > 0) {
      this.goTowardsTarget(this.target);
    } else {
      this.target = null;
      this.task = Guard.activity.patrol;
    }
  }

  goHome() {
    const Bases = this.world.register.Bases;

    if (this.getDistance(this.home) < 0.03) {
      this.energy += Bases.register[this.team].sendEnergy(Guard.energyTransfer);
      this.task = Guard.activity.patrol;
      return;
    }

    super.goHome();
  }

}

exports.Guard = Guard;
Guard.team = {
  red: 0,
  blue: 1
};
Guard.activity = {
  attack: 0,
  patrol: 1,
  goHome: 2
};
Guard.perceptionLimit = 0.1;
Guard.energyTransfer = 5;
Guard.energyLimit = 10;

class Guards extends _speciesContainer.default {
  constructor(initialPopulation) {
    super(initialPopulation, Guard);
  }

  update() {
    const {
      Guards,
      Killers,
      Bases
    } = this.world.register;
    this.individuals.forEach(k => k.move());
    this.individuals.forEach(k => {
      k.alter().interact(Guards).interact(Killers).work();
    });
    this.individuals = this.individuals.filter(k => k.energy > 0);

    if (!this.individuals.some(g => g.team === Guard.team.red)) {
      Bases.elements.find(b => b.team === Guard.team.red).saveForGuard = true;
    }

    if (!this.individuals.some(g => g.team === Guard.team.blue)) {
      Bases.elements.find(b => b.team === Guard.team.blue).saveForGuard = true;
    }
  }

}

exports.default = Guards;
},{"../../../tools/webglelement":"2dcdceab8105a52e906f22e64cb7264f","../../../tools/qtree":"23df1890c8e5f1f57d706941f82b8554","./killers":"895b95b1cfe3a3b4c76b8bde7ffd2e07","../base":"31c4cf1bed361901e16ecd4e9c1d61ef","./vehicle":"c31e12abc417e862546939be81c36082","./speciesContainer":"3827340d19ef1aabec03a61fb3044dc8"}],"23df1890c8e5f1f57d706941f82b8554":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateQuadTree = generateQuadTree;
exports.Rectangle = exports.Qtree = void 0;

function generateQuadTree(bugs, minX, minY, maxX, maxY) {
  const boundary = Qtree.getBoundary(minX, minY, maxX, maxY);
  const qt = new Qtree(boundary);

  for (let bug of bugs) {
    qt.insert(bug);
  }

  return qt;
}

class Qtree {
  static getBoundary(minX, minY, maxX, maxY) {
    const halfWidth = (maxX - minX) / 2;
    const halfHeight = (maxY - minY) / 2;
    const centerX = maxX - halfWidth;
    const centerY = maxY - halfHeight;
    const [x, y, w, h] = [centerX, centerY, halfWidth, halfHeight];
    return new Rectangle(x, y, w, h);
  }

  static getQuerySurface(x, y, w, h) {
    return new Rectangle(x, y, w / 2, h / 2);
  }

  constructor(boundary) {
    this.boundary = boundary;
    this.bucket = [];
    this.regions = {};
    this.divided = false;
    this.gathered = [];
  }

  insert(bug) {
    if (!this.boundary.contains(bug)) {
      return false;
    }

    if (!this.divided) {
      if (this.bucket.length < Qtree.capacity) {
        this.bucket.push(bug);
        return true;
      }

      this.subdivide();
      this.transferBucket();
    }

    this.passToChild(bug);
  }

  passToChild(bug) {
    if (bug.x > this.boundary.x) {
      if (bug.y > this.boundary.y) {
        return this.regions.se.insert(bug);
      } else {
        return this.regions.ne.insert(bug);
      }
    } else {
      if (bug.y > this.boundary.y) {
        return this.regions.sw.insert(bug);
      } else {
        return this.regions.nw.insert(bug);
      }
    }
  }

  subdivide() {
    const {
      x,
      y
    } = this.boundary;
    const [hW, hH] = [this.boundary.w / 2, this.boundary.h / 2];
    const nwSpace = new Rectangle(x - hW, y - hH, hW, hH);
    const neSpace = new Rectangle(x + hW, y - hH, hW, hH);
    const swSpace = new Rectangle(x - hW, y + hH, hW, hH);
    const seSpace = new Rectangle(x + hW, y + hH, hW, hH);
    this.regions.nw = new Qtree(nwSpace, Qtree.capacity);
    this.regions.ne = new Qtree(neSpace, Qtree.capacity);
    this.regions.sw = new Qtree(swSpace, Qtree.capacity);
    this.regions.se = new Qtree(seSpace, Qtree.capacity);
    this.divided = true;
  }

  transferBucket() {
    this.bucket.forEach(bug => {
      this.passToChild(bug);
    });
    this.bucket = null;
  }

  query(rect) {
    if (!this.boundary.intersects(rect)) {
      return [];
    }

    if (rect.encompasses(this.boundary)) {
      return this.gather(rect);
    }

    if (this.divided) {
      return [...this.regions.nw.query(rect), ...this.regions.ne.query(rect), ...this.regions.sw.query(rect), ...this.regions.se.query(rect)];
    } else {
      return this.bucket;
    }
  }

  gather(rect) {
    if (this.divided) {
      return [...this.regions.nw.gather(rect), ...this.regions.ne.gather(rect), ...this.regions.sw.gather(rect), ...this.regions.se.gather(rect)];
    } else {
      return this.bucket;
    }
  }

}

exports.Qtree = Qtree;

class Rectangle {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  contains(point) {
    const r = this;
    return point.x > r.x - r.w && point.x < r.x + r.w && point.y > r.y - r.h && point.y < r.y + r.h;
  }

  intersects(rect) {
    const r = this;
    return !(rect.x - rect.w > r.x + r.w || rect.x + rect.w < r.x - r.w || rect.y - rect.h > r.y + r.h || rect.y + rect.h < r.y - r.h);
  }

  encompasses(rect) {
    const r = this;
    return rect.x - rect.w >= r.x - r.w && rect.x + rect.w <= r.x + r.w && rect.y - rect.h >= r.y - r.h && rect.y + rect.h <= r.y + r.h;
  }

}

exports.Rectangle = Rectangle;
Qtree.capacity = 4;
},{}],"31c4cf1bed361901e16ecd4e9c1d61ef":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Base = void 0;

var _webglelement = _interopRequireDefault(require("../../tools/webglelement"));

var _bugs = require("./vehicles/bugs");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Base {
  constructor(world, team, x, y, energy) {
    this.x = x != null ? x : Math.random();
    this.y = y != null ? y : Math.random();
    this.world = world;
    this.energy = energy || 0;
    this.reserves = 0;
    this.team = team;
    this.saveForKiller = false;
    this.saveForGuard = false;
  }

  getEnergy(energy) {
    this.energy += energy * (1 - Base.savingRate);
    this.reserves += energy * Base.savingRate;
  }

  sendEnergy(amount) {
    let energy = 0;

    if (this.energy > amount) {
      energy = amount;
      this.energy -= amount;
    } else {
      energy = this.energy;
      this.energy = 0;
    }

    return energy;
  }

  work() {
    const {
      Bugs,
      Killers,
      Guards
    } = this.world.register;

    if (!this.saveForKiller && !this.saveForGuard) {
      if (this.energy > Base.energyBuffer) {
        Bugs.create(this.team, this.x, this.y);
        this.energy--;
      }
    } else {
      if (this.saveForKiller && this.energy > 10) {
        Killers.create(this.team, this.x, this.y);
        this.energy -= 10;
        this.saveForKiller = false;
      }

      if (this.saveForGuard && this.energy > 40) {
        Guards.create(this.team, this.x, this.y);
        this.energy -= 40;
        this.saveForGuard = false;
      }
    }

    if (this.reserves > 10) {
      Killers.create(this.team, this.x, this.y);
      this.reserves -= 10;
    }
  }

  getDistance(to) {
    return Math.sqrt((to.y - this.y) ** 2 + (to.x - this.x) ** 2);
  }

  getManhattanDistance(to) {
    return (to.y - this.y) ** 2 + (to.x - this.x) ** 2;
  }

}

exports.Base = Base;

class Bases extends _webglelement.default {
  constructor() {
    super();
    this.elements = [];
    this.register = {};
    this.world = null;
  }

  setup(gl, world) {
    this.world = world;
    const blue = new Base(this.world, _bugs.Bug.team.blue, 0.5, 0.8, 30);
    this.elements.push(blue);
    this.register[_bugs.Bug.team.blue] = blue;
    const red = new Base(this.world, _bugs.Bug.team.red, 0.5, 0.2, 30);
    this.elements.push(red);
    this.register[_bugs.Bug.team.red] = red;
    window.addEventListener('click', () => {
      red.saveForKiller = true;
    });
    const entitySize = Base.size * world.surface;
    const positions = this.getBasesPositions();
    const colors = this.getBugsTeams();
    super.setup(world, entitySize, positions, colors);
  }

  getBasesPositions() {
    const positions = [];
    this.elements.forEach(base => {
      positions.push(base.x, base.y);
    });
    return positions;
  }

  getBugsTeams() {
    const teams = [];
    this.elements.forEach(base => {
      teams.push(1, base.team);
    });
    return teams;
  }

  draw() {//super.draw(this.elements.length)
  }

  update() {
    this.elements.forEach(b => b.work());
  }

}

exports.default = Bases;
},{"../../tools/webglelement":"2dcdceab8105a52e906f22e64cb7264f","./vehicles/bugs":"197508393690e56cbb33a6e96f1d961c"}],"c31e12abc417e862546939be81c36082":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Vehicle = void 0;

var _webglelement = _interopRequireDefault(require("../../../tools/webglelement"));

var _qtree = require("../../../tools/qtree");

var _killers = require("./killers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Vehicle {
  constructor(world, team, x, y, maxSpeed, energyLimit) {
    this.x = x != null ? x : Math.random();
    this.y = y != null ? y : Math.random();
    this.vX = Math.random() - 0.5;
    this.vY = Math.random() - 0.5;
    this.engergyLimit = energyLimit;
    this.energy = Math.random() * 0.8 * energyLimit + 0.2 * energyLimit;
    this.team = team;
    this.home = {
      x: 0.5,
      y: this.team === 0 ? 0.2 : 0.8
    };
    this.maxSpeed = maxSpeed;
    this.world = world;
  }

  move() {
    this.x += this.vX / this.maxSpeed;
    this.y += this.vY / this.maxSpeed; // Check out of borders

    if (this.x < 0) {
      this.vX *= -1;
      this.x *= -1;
    } else if (this.x > 1) {
      this.vX *= -1;
      this.x = -this.x + 2;
    }

    if (this.y < 0) {
      this.vY *= -1;
      this.y *= -1;
    } else if (this.y > 1) {
      this.vY *= -1;
      this.y = -this.y + 2;
    }
  } // interact(qtree, otherSize) {
  //   const minTouchDistance = Bug.size / 2 + otherSize / 2
  //   const surfaceToSearch = new Rectangle(
  //     this.x,
  //     this.y,
  //     minTouchDistance,
  //     minTouchDistance
  //   )
  //   const nearNeighboors = qtree
  //     .query(surfaceToSearch)
  //     .filter((n) => n !== this)
  //   nearNeighboors.forEach((neighboor) => {
  //     if (this.getDistance(neighboor) < minTouchDistance) {
  //       if (neighboor.team !== this.team) {
  //         this.energy = this.energy * 0.98 - 0.01
  //       }
  //     }
  //   })
  // }


  eat() {
    const ground = this.world.register.Ground;
    const harvest = ground.collect(this);
    this.energy = Math.min(this.engergyLimit, this.energy + harvest);
    return this;
  }

  findFood() {
    const ground = this.world.register.Ground;
    const [xAttraction, yAttraction] = ground.inspectSurroundingFertility(this);
    this.vX += Math.min(1, xAttraction) / 20;
    this.vY += Math.min(1, yAttraction) / 20;
    const magnitude = this.vX ** 2 + this.vY ** 2;

    if (magnitude > 1) {
      this.vX /= magnitude;
      this.vY /= magnitude;
    }
  }

  goHome() {
    this.goTowardsTarget(this.home);
  }

  goTowardsTarget(target) {
    const [vectorX, vectorY] = this.normalize(target.x - this.x, target.y - this.y);
    const steering = {
      x: vectorX - this.vX,
      y: vectorY - this.vY
    };
    this.vX += steering.x * 0.01;
    this.vY += steering.y * 0.01;
    const [vX, vY] = this.normalize(this.vX, this.vY, true);
    this.vX = vX;
    this.vY = vY;
  }

  normalize(x, y, preserveBelowOne = false) {
    const magnitude = x ** 2 + y ** 2;

    if (preserveBelowOne && magnitude < 1) {
      return [x, y];
    }

    return [x / magnitude, y / magnitude];
  }

  getDistance(to) {
    return Math.sqrt((to.y - this.y) ** 2 + (to.x - this.x) ** 2);
  }

  getManhattanDistance(to) {
    return (to.y - this.y) ** 2 + (to.x - this.x) ** 2;
  }

}

exports.Vehicle = Vehicle;
},{"../../../tools/webglelement":"2dcdceab8105a52e906f22e64cb7264f","../../../tools/qtree":"23df1890c8e5f1f57d706941f82b8554","./killers":"895b95b1cfe3a3b4c76b8bde7ffd2e07"}],"3827340d19ef1aabec03a61fb3044dc8":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _webglelement = _interopRequireDefault(require("../../../tools/webglelement"));

var _qtree = require("../../../tools/qtree");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class SpeciesContainer extends _webglelement.default {
  constructor(initialPopulation, entityType) {
    super();
    this.individuals = [];
    this.world = null;
    this.initialPopulation = initialPopulation;
    this.entityType = entityType;
  }

  setup(gl, world) {
    this.world = world;

    for (let i = 0; i < this.initialPopulation; i += 2) {
      this.individuals.push(new this.entityType(this.world, this.entityType.team.red));
      this.individuals.push(new this.entityType(this.world, this.entityType.team.blue));
    }

    const entitySize = Math.floor(this.entityType.size * world.surface);
    super.setup(world, entitySize);
  }

  getPotentialTouching(other) {
    const minTouchDistance = this.entityType.size / 2 + other.constructor.size / 2;
    const surfaceToSearch = new _qtree.Rectangle(other.x, other.y, minTouchDistance, minTouchDistance);
    const nearNeighboors = this.qtree.query(surfaceToSearch);
    return [nearNeighboors, minTouchDistance];
  }

  getPositions() {
    const positions = [];
    this.individuals.forEach(i => {
      positions.push(i.x, i.y);
    });
    return positions;
  }

  getEnergy() {
    const energy = [];
    this.individuals.forEach(i => {
      energy.push(i.energy);
    });
    return energy;
  }

  getTeams() {
    const teams = [];
    this.individuals.forEach(i => {
      teams.push(i.team);
    });
    return teams;
  }

  draw() {
    const newPositions = this.getPositions();
    const energy = this.getEnergy();
    const teams = this.getTeams();
    const newEnergyAndTeamColors = energy.reduce((acc, energy, index) => {
      acc.push(energy, teams[index]);
      return acc;
    }, []);
    super.draw(this.individuals.length, newPositions, newEnergyAndTeamColors);
  }

  create(team, x, y) {
    this.individuals.push(new this.entityType(this.world, team, x, y));
  }

  prepareUpdate() {
    this.qtree = (0, _qtree.generateQuadTree)(this.individuals, 0, 0, 1, 1);
  }

}

exports.default = SpeciesContainer;
},{"../../../tools/webglelement":"2dcdceab8105a52e906f22e64cb7264f","../../../tools/qtree":"23df1890c8e5f1f57d706941f82b8554"}],"550e0780d25a677b8750634bbdc60ae0":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _webglelement = _interopRequireDefault(require("../../tools/webglelement"));

var _cuonMatrix = require("../../tools/cuon-matrix");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Ground extends _webglelement.default {
  constructor(itemsPerLine) {
    super();
    this.itemsPerLine = itemsPerLine;
    this.tileSize = 1 / itemsPerLine;
    this.program = null;
    this.vertexBuffer = null;
    this.vertexColorBuffer = null;
    this.a_position = null;
    this.a_Color = null;
    this.u_MvpMatrix = null;
    this.gl = null;
    this.ground = [];
    this.colors = [];
    this.world = null;
  }

  generateVerticesGround() {
    const vertices = [];
    const tileSize = this.tileSize;
    const height = -0.03;

    for (let iz = 0; iz < this.itemsPerLine; iz++) {
      for (let ix = 0; ix < this.itemsPerLine; ix++) {
        //bottom left
        let x = ix * tileSize * 2 - 1;
        let z = iz * tileSize * 2 - 1;
        vertices.push(x, height, z); // top left

        x = ix * tileSize * 2 - 1;
        z = (iz + 1) * tileSize * 2 - 1;
        vertices.push(x, height, z); //top right

        x = (ix + 1) * tileSize * 2 - 1;
        z = (iz + 1) * tileSize * 2 - 1;
        vertices.push(x, height, z); //bottom left

        x = ix * tileSize * 2 - 1;
        z = iz * tileSize * 2 - 1;
        vertices.push(x, height, z); //top right

        x = (ix + 1) * tileSize * 2 - 1;
        z = (iz + 1) * tileSize * 2 - 1;
        vertices.push(x, height, z); //bottom right

        x = (ix + 1) * tileSize * 2 - 1;
        z = iz * tileSize * 2 - 1;
        vertices.push(x, height, z);
      }
    }

    return vertices;
  }

  setup(gl, world) {
    this.gl = gl;
    this.world = world;

    for (let iy = 0; iy < this.itemsPerLine; iy++) {
      for (let ix = 0; ix < this.itemsPerLine; ix++) {
        // const x = (ix + 0.5) * this.tileSize * 2 - 1
        // const y = (iy + 0.5) * this.tileSize * 2 - 1
        // this.ground.push(x, y)
        this.colors.push(Math.random() * 0.5 + 0.1);
      }
    }

    this.ground = this.generateVerticesGround(); //this.generateGround()
    //console.table(this.ground)
    // const vertexShader = `
    // attribute vec4 a_Position;
    // attribute vec4 a_Color;
    // varying vec4 v_Color;
    // void main() {
    //     gl_Position = a_Position;
    //     gl_PointSize = ${Math.round(this.tileSize * world.surface)}.;
    //     v_Color = a_Color;
    // }
    // `
    // const fragmentShader = `
    // precision mediump float;
    // varying vec4 v_Color;
    // void main() {
    //     gl_FragColor = vec4(v_Color.r*0.2, v_Color.r, v_Color.r*0.3, 1.0);
    // }
    // `

    const vertexShader = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    uniform mat4 u_MvpMatrix;
    varying vec4 v_Color;
    void main() {
        gl_Position = u_MvpMatrix * a_Position;
        //gl_Position = u_MvpMatrix * vec4(a_Position.x,0.0,a_Position.y, 1.0);
        gl_PointSize = ${Math.round(this.tileSize * world.surface)}.;
        v_Color = a_Color;
    }
    `;
    const fragmentShader = `
    precision mediump float;
    varying vec4 v_Color;
    
    void main() {
        gl_FragColor = vec4(v_Color.r*0.2, v_Color.r, v_Color.r*0.3, 1.0);
       
    }
    `;
    this.program = this.createProgramm(gl, vertexShader, fragmentShader);
    gl.useProgram(this.program); // setup vertices buffer

    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.ground), gl.STATIC_DRAW);
    this.a_Position = gl.getAttribLocation(this.program, 'a_Position');
    this.u_MvpMatrix = gl.getUniformLocation(this.program, 'u_MvpMatrix'); // setup color buffer

    this.vertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.STATIC_DRAW);
    this.a_Color = gl.getAttribLocation(this.program, 'a_Color');
  }

  draw() {
    const {
      gl,
      program
    } = this;
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(this.a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.a_Position);
    const colorForEachVertice = new Float32Array(this.colors.length * 6);
    this.colors.forEach((color, i) => {
      const index = i * 6;
      colorForEachVertice[index] = color;
      colorForEachVertice[index + 1] = color;
      colorForEachVertice[index + 2] = color;
      colorForEachVertice[index + 3] = color;
      colorForEachVertice[index + 4] = color;
      colorForEachVertice[index + 5] = color;
    });
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colorForEachVertice, gl.STATIC_DRAW);
    gl.vertexAttribPointer(this.a_Color, 1, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.a_Color);
    const mvpMatrix = new _cuonMatrix.Matrix4(); // Model view projection matrix

    const modelMatrix = new _cuonMatrix.Matrix4(); // Model matrix

    mvpMatrix.set(this.world.projMatrix).multiply(this.world.viewMatrix).multiply(modelMatrix); // Pass the model view projection matrix to u_MvpMatrix
    //debugger

    gl.uniformMatrix4fv(this.u_MvpMatrix, false, mvpMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, 0, this.ground.length / 3);
  }

  update() {
    for (let i = 0; i < this.colors.length; i++) {
      this.colors[i] = Math.max(0, Math.min(this.colors[i] + Math.random() / 2000, 1));
    }
  }

  getColorIndex({
    x,
    y
  }) {
    const column = Math.floor(x / this.tileSize);
    const row = Math.floor(y / this.tileSize);
    const index = row * this.itemsPerLine + column;
    return index;
  }

  collect(vehicule) {
    const index = this.getColorIndex(vehicule);
    const value = this.colors[index];

    if (value > 0.05) {
      const harvest = this.colors[index] * 0.03;
      this.colors[index] -= harvest;
      return harvest;
    }

    return 0;
  }

  inspectSurroundingFertility(vehicule) {
    const index = this.getColorIndex(vehicule);
    let top = 0;
    let bottom = 0;
    let right = 0;
    let left = 0;
    bottom = (this.colors[index - this.itemsPerLine - 1] || 0) + (this.colors[index - this.itemsPerLine] || 0) + (this.colors[index - this.itemsPerLine + 1] || 0);
    top = (this.colors[index + this.itemsPerLine - 1] || 0) + (this.colors[index + this.itemsPerLine] || 0) + (this.colors[index + this.itemsPerLine + 1] || 0);
    left = (this.colors[index - this.itemsPerLine - 1] || 0) + (this.colors[index - 1] || 0) + (this.colors[index + this.itemsPerLine - 1] || 0);
    right = (this.colors[index - this.itemsPerLine + 1] || 0) + (this.colors[index + 1] || 0) + (this.colors[index + this.itemsPerLine + 1] || 0);
    const attractionX = right - left;
    const attractionY = top - bottom;
    return [attractionX, attractionY];
  }

}

exports.default = Ground;
},{"../../tools/webglelement":"2dcdceab8105a52e906f22e64cb7264f","../../tools/cuon-matrix":"9cc7dc197f18cf0e49c822f8ac8018c2"}]},{},["578aa57fddccb2a1264fb52bb67a9e5b","c00e607576b6da73f3471278d158f50f"], null)

//# sourceMappingURL=Bugs.2afb2d86.js.map

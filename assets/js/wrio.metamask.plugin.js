(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const
    state = {
        started: false
    },
    browser = require('detect-browser').detect().name,
    check_installed_interval = 1000,
    check_connected_interval = 1000,
    check_main_net_selected_interval = 1000,
    check_login_interval = 1000,
    text = {
        error: 'Transaction error. Please try again',
        done: 'The transaction link on etherscan.io',
        choose: 'Please choose the Main Ethereum Network',
        login: 'Log in to Metamask to go on with authorization'
    },
    extentionLinks = {
        opera: 'https://addons.opera.com/en/extensions/details/metamask/',
        chrome: 'https://chrome.google.com/webstore/detail/nkbihfbeogaeaoehlefnkodbefgpgknn',
        firefox: 'https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/',
        default: 'https://metamask.io/'
    },
    image = {
        pay: {
            on: 'https://raw.githubusercontent.com/MetaMask/TipButton/master/images/1_pay_mm_over.png',
            off: 'https://raw.githubusercontent.com/MetaMask/TipButton/master/images/1_pay_mm_off.png'
        },
        download: {
            on: 'https://raw.githubusercontent.com/MetaMask/faq/master/images/download-metamask-dark.png',
            off: 'https://raw.githubusercontent.com/MetaMask/faq/master/images/download-metamask.png'
        }
    },
    is_metamask_installed = () => window.web3 && window.web3.currentProvider.isMetaMask,
    is_metamask_connected = () => window.web3.isConnected(),
    is_main_net = cb => web3.version.getNetwork((err, id) => cb(!err && Number(id) === 1)),
    is_metamask_login = () => Boolean(new Web3(window.web3.currentProvider).eth.defaultAccount),
    create_download_link = id => {
        const
            container = document.getElementById(id),
            img = document.createElement('img'),
            a = document.createElement('a');

        img.src = image.download.off;
        img.onmouseenter = () => {
            img.src = image.download.on
        };
        img.onmouseout = () => {
            img.src = image.download.off
        };

        a.target = '_blank';
        a.href = extentionLinks[browser] || extentionLinks.default;
        a.appendChild(img);
        container.innerHTML = '<h2>You need the MetaMask plugin to login</h2>';
        container.appendChild(a);
    },
    create_pay_button = (id, cb) => {
        const
            container = document.getElementById(id),
            img = document.createElement('img'),
            a = document.createElement('a');

        img.src = image.pay.off;
        img.onmouseenter = () => {
            img.src = image.pay.on
        };
        img.onmouseout = () => {
            img.src = image.pay.off
        };

        a.onclick = () => {
            const
                w3 = new Web3(web3.currentProvider);

            web3.eth.sendTransaction(
                {
                    to: state.address,
                    from: w3.eth.defaultAccount,
                    value: web3.toWei(String(state.money), 'ether')
                },
                (err, tx) => {
                    let el, t;

                    if (err) {
                        if (err.message !== 'Error: MetaMask Tx Signature: User denied transaction signature.') {
                            el = document.createElement('div');
                            t = document.createTextNode(text.error);
                            el.className = 'error';
                            el.appendChild(t);
                        }
                    } else {
                        el = document.createElement('a');
                        t = document.createTextNode(text.done);
                        el.className = 'done';
                        el.href = 'https://etherscan.io/tx/' + tx;
                        el.appendChild(t);
                    }
                    document.getElementById(state.id).appendChild(el);

                    cb(err, tx)
                }
            )
        }

        a.appendChild(img);
        container.innerHTML = '';
        container.appendChild(a);
    },
    create_message_choose_main_net = id => {
        const
            container = document.getElementById(id),
            div = document.createElement('div');

        div.className = 'alert alert-warning choose';
        div.appendChild(document.createTextNode(text.choose));
        container.innerHTML = '';
        container.innerHTML = '<h2>Login with Metamask</h2><img src="../assets/images/login_tooltip.png" /><br><br>';
        container.appendChild(div);
    },
    create_message_login = id => {
        const
          container = document.getElementById(id),
          div = document.createElement('div');

        div.className = 'alert alert-warning login';
        div.appendChild(document.createTextNode(text.login));
        container.innerHTML = '<h2>Login with Metamask</h2><img src="../assets/images/login_tooltip.png" /><br><br>';
        container.appendChild(div);
    },
    installed = (id, cb) =>
        is_metamask_installed()
            ? cb()
            : setTimeout(() => installed(id, cb), check_installed_interval) && create_download_link(id),
    connected = (id, cb) =>
        is_metamask_connected()
            ? cb()
            : setTimeout(() => connected(id, cb), check_connected_interval) && create_message_choose_main_net(id),
    main_net_selected = (id, cb) =>
        is_main_net(ok =>
            ok
                ? cb()
                : setTimeout(() => main_net_selected(id, cb), check_main_net_selected_interval) && create_message_choose_main_net(id)
        ),
    metamask_login_done = (id, cb) =>
        is_metamask_login()
            ? cb()
            : setTimeout(() => metamask_login_done(id, cb), check_login_interval) && create_message_login(id),
    once = (id, cb) =>
        installed(id, () =>
            connected(id, () =>
                main_net_selected(id, () =>
                    metamask_login_done(id, () =>
                        create_pay_button(id, cb)
                    )
                )
            )
        ),
    start = (id, address, money, cb) => {
        state.id = id;
        state.address = address;
        state.money = money;

        if (!state.started) {
            state.started = true;
            once(id, cb);
        }
    };

window.wrio_metamask_plugin = start;
window.installed = installed;
window.connected = connected;
window.main_net_selected = main_net_selected;
window.metamask_login_done = metamask_login_done;

},{"detect-browser":2}],2:[function(require,module,exports){
(function (process){
function detect() {
  var nodeVersion = getNodeVersion();
  if (nodeVersion) {
    return nodeVersion;
  } else if (typeof navigator !== 'undefined') {
    return parseUserAgent(navigator.userAgent);
  }

  return null;
}

function detectOS(userAgentString) {
  var rules = getOperatingSystemRules();
  var detected = rules.filter(function (os) {
    return os.rule && os.rule.test(userAgentString);
  })[0];

  return detected ? detected.name : null;
}

function getNodeVersion() {
  var isNode = typeof navigator === 'undefined' && typeof process !== 'undefined';
  return isNode ? {
    name: 'node',
    version: process.version.slice(1),
    os: require('os').type().toLowerCase()
  } : null;
}

function parseUserAgent(userAgentString) {
  var browsers = getBrowserRules();
  if (!userAgentString) {
    return null;
  }

  var detected = browsers.map(function(browser) {
    var match = browser.rule.exec(userAgentString);
    var version = match && match[1].split(/[._]/).slice(0,3);

    if (version && version.length < 3) {
      version = version.concat(version.length == 1 ? [0, 0] : [0]);
    }

    return match && {
      name: browser.name,
      version: version.join('.')
    };
  }).filter(Boolean)[0] || null;

  if (detected) {
    detected.os = detectOS(userAgentString);
  }

  if (/alexa|bot|crawl(er|ing)|facebookexternalhit|feedburner|google web preview|nagios|postrank|pingdom|slurp|spider|yahoo!|yandex/i.test(userAgentString)) {
    detected = detected || {};
    detected.bot = true;
  }

  return detected;
}

function getBrowserRules() {
  return buildRules([
    [ 'aol', /AOLShield\/([0-9\._]+)/ ],
    [ 'edge', /Edge\/([0-9\._]+)/ ],
    [ 'yandexbrowser', /YaBrowser\/([0-9\._]+)/ ],
    [ 'vivaldi', /Vivaldi\/([0-9\.]+)/ ],
    [ 'kakaotalk', /KAKAOTALK\s([0-9\.]+)/ ],
    [ 'samsung', /SamsungBrowser\/([0-9\.]+)/ ],
    [ 'chrome', /(?!Chrom.*OPR)Chrom(?:e|ium)\/([0-9\.]+)(:?\s|$)/ ],
    [ 'phantomjs', /PhantomJS\/([0-9\.]+)(:?\s|$)/ ],
    [ 'crios', /CriOS\/([0-9\.]+)(:?\s|$)/ ],
    [ 'firefox', /Firefox\/([0-9\.]+)(?:\s|$)/ ],
    [ 'fxios', /FxiOS\/([0-9\.]+)/ ],
    [ 'opera', /Opera\/([0-9\.]+)(?:\s|$)/ ],
    [ 'opera', /OPR\/([0-9\.]+)(:?\s|$)$/ ],
    [ 'ie', /Trident\/7\.0.*rv\:([0-9\.]+).*\).*Gecko$/ ],
    [ 'ie', /MSIE\s([0-9\.]+);.*Trident\/[4-7].0/ ],
    [ 'ie', /MSIE\s(7\.0)/ ],
    [ 'bb10', /BB10;\sTouch.*Version\/([0-9\.]+)/ ],
    [ 'android', /Android\s([0-9\.]+)/ ],
    [ 'ios', /Version\/([0-9\._]+).*Mobile.*Safari.*/ ],
    [ 'safari', /Version\/([0-9\._]+).*Safari/ ],
    [ 'facebook', /FBAV\/([0-9\.]+)/],
    [ 'instagram', /Instagram\ ([0-9\.]+)/],
    [ 'ios-webview', /AppleWebKit\/([0-9\.]+).*Mobile/]
  ]);
}

function getOperatingSystemRules() {
  return buildRules([
    [ 'iOS', /iP(hone|od|ad)/ ],
    [ 'Android OS', /Android/ ],
    [ 'BlackBerry OS', /BlackBerry|BB10/ ],
    [ 'Windows Mobile', /IEMobile/ ],
    [ 'Amazon OS', /Kindle/ ],
    [ 'Windows 3.11', /Win16/ ],
    [ 'Windows 95', /(Windows 95)|(Win95)|(Windows_95)/ ],
    [ 'Windows 98', /(Windows 98)|(Win98)/ ],
    [ 'Windows 2000', /(Windows NT 5.0)|(Windows 2000)/ ],
    [ 'Windows XP', /(Windows NT 5.1)|(Windows XP)/ ],
    [ 'Windows Server 2003', /(Windows NT 5.2)/ ],
    [ 'Windows Vista', /(Windows NT 6.0)/ ],
    [ 'Windows 7', /(Windows NT 6.1)/ ],
    [ 'Windows 8', /(Windows NT 6.2)/ ],
    [ 'Windows 8.1', /(Windows NT 6.3)/ ],
    [ 'Windows 10', /(Windows NT 10.0)/ ],
    [ 'Windows ME', /Windows ME/ ],
    [ 'Open BSD', /OpenBSD/ ],
    [ 'Sun OS', /SunOS/ ],
    [ 'Linux', /(Linux)|(X11)/ ],
    [ 'Mac OS', /(Mac_PowerPC)|(Macintosh)/ ],
    [ 'QNX', /QNX/ ],
    [ 'BeOS', /BeOS/ ],
    [ 'OS/2', /OS\/2/ ],
    [ 'Search Bot', /(nuhk)|(Googlebot)|(Yammybot)|(Openbot)|(Slurp)|(MSNBot)|(Ask Jeeves\/Teoma)|(ia_archiver)/ ]
  ]);
}

function buildRules(ruleTuples) {
  return ruleTuples.map(function(tuple) {
    return {
      name: tuple[0],
      rule: tuple[1]
    };
  });
}

module.exports = {
  detect: detect,
  detectOS: detectOS,
  getNodeVersion: getNodeVersion,
  parseUserAgent: parseUserAgent
};

}).call(this,require('_process'))
},{"_process":4,"os":3}],3:[function(require,module,exports){
exports.endianness = function () { return 'LE' };

exports.hostname = function () {
    if (typeof location !== 'undefined') {
        return location.hostname
    }
    else return '';
};

exports.loadavg = function () { return [] };

exports.uptime = function () { return 0 };

exports.freemem = function () {
    return Number.MAX_VALUE;
};

exports.totalmem = function () {
    return Number.MAX_VALUE;
};

exports.cpus = function () { return [] };

exports.type = function () { return 'Browser' };

exports.release = function () {
    if (typeof navigator !== 'undefined') {
        return navigator.appVersion;
    }
    return '';
};

exports.networkInterfaces
= exports.getNetworkInterfaces
= function () { return {} };

exports.arch = function () { return 'javascript' };

exports.platform = function () { return 'browser' };

exports.tmpdir = exports.tmpDir = function () {
    return '/tmp';
};

exports.EOL = '\n';

exports.homedir = function () {
	return '/'
};

},{}],4:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[1]);

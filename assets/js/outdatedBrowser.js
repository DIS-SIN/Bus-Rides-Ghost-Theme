(function (f){
    if (typeof exports === 'object' && typeof module !== 'undefined'){
        module.exports = f();
    } else if (typeof define === 'function' && define.amd){
        define([],f);
    } else {
        var g; if (typeof window !== 'undefined'){
            g = window;
        } else if (typeof global !== 'undefined'){
            g = global;
        } else if (typeof self !== 'undefined'){
            g = self;
        } else {
            g = this;
        }g.outdatedBrowserRework = f();
    }
})(function (){
    var define,module,exports; return (function (){
        function r(e,n,t){
            function o(i,f){
                if (!n[i]){
                    if (!e[i]){
                        var c = 'function' === typeof require && require; if (!f && c) {
                            return c(i,!0);
                        } if (u) {
                            return u(i,!0);
                        } var a = new Error('Cannot find module \'' + i + '\''); throw a.code = 'MODULE_NOT_FOUND',a;
                    } var p = n[i] = {exports: {}}; e[i][0].call(p.exports,function (r){
                        var n = e[i][1][r]; return o(n || r);
                    },p,p.exports,r,e,n,t);
                } return n[i].exports;
            } for (var u = 'function' === typeof require && require,i = 0; i < t.length; i++){
                o(t[i]);
            } return o;
        } return r;
    })()({1: [function (require,module,exports){
    /* Highly dumbed down version of https://github.com/unclechu/node-deep-extend */
  
        /**
   * Extening object that entered in first argument.
   *
   * Returns extended object or false if have no target object or incorrect type.
   *
   * If you wish to clone source object (without modify it), just use empty new
   * object as first argument, like this:
   *   deepExtend({}, yourObj_1, [yourObj_N]);
   */
        module.exports = function deepExtend(/*obj_1, [obj_2], [obj_N]*/) {
            if (arguments.length < 1 || typeof arguments[0] !== 'object') {
                return false;
            }
  
            if (arguments.length < 2) {
                return arguments[0];
            }
  
            var target = arguments[0];
  
            for (var i = 1; i < arguments.length; i++) {
                var obj = arguments[i];
  
                for (var key in obj) {
                    var src = target[key];
                    var val = obj[key];
  
                    if (typeof val !== 'object' || val === null) {
                        target[key] = val;
  
                    // just clone arrays (and recursive clone objects inside)
                    } else if (typeof src !== 'object' || src === null) {
                        target[key] = deepExtend({}, val);
  
                    // source value and new value is objects both, extending...
                    } else {
                        target[key] = deepExtend(src, val);
                    }
                }
            }
  
            return target;
        };
    },{}],2: [function (require,module,exports){
        var UserAgentParser = require('ua-parser-js');
        var languageMessages = require('./languages.json');
        var deepExtend = require('./extend');
  
        var DEFAULTS = {
            Chrome: 57, // Includes Chrome for mobile devices
            Edge: 39,
            Safari: 10,
            'Mobile Safari': 10,
            Opera: 50,
            Firefox: 50,
            Vivaldi: 1,
            IE: false
        };
  
        var EDGEHTML_VS_EDGE_VERSIONS = {
            12: 0.1,
            13: 21,
            14: 31,
            15: 39,
            16: 41,
            17: 42,
            18: 44
        };
  
        var COLORS = {
            salmon: '#f25648',
            white: 'white'
        };
  
        var updateDefaults = function (defaults, updatedValues) {
            for (var key in updatedValues) {
                defaults[key] = updatedValues[key];
            }
  
            return defaults;
        };
  
        module.exports = function (options) {
            var main = function () {
            // Despite the docs, UA needs to be provided to constructor explicitly:
            // https://github.com/faisalman/ua-parser-js/issues/90
                var parsedUserAgent = new UserAgentParser(window.navigator.userAgent).getResult();
  
                // Variable definition (before ajax)
                var outdatedUI = document.getElementById('outdated');
  
                options = options || {};
  
                var browserLocale = window.navigator.language || window.navigator.userLanguage; // Everyone else, IE
  
                // Set default options
                var browserSupport = options.browserSupport ? updateDefaults(DEFAULTS, options.browserSupport) : DEFAULTS;
                // CSS property to check for. You may also like 'borderSpacing', 'boxShadow', 'transform', 'borderImage';
                var requiredCssProperty = options.requiredCssProperty || false;
                var backgroundColor = options.backgroundColor || COLORS.salmon;
                var textColor = options.textColor || COLORS.white;
                var fullscreen = options.fullscreen || false;
                var language = options.language || browserLocale.slice(0, 2); // Language code
  
                var updateSource = 'web'; // Other possible values are 'googlePlay' or 'appStore'. Determines where we tell users to go for upgrades.
  
                // Chrome mobile is still Chrome (unlike Safari which is 'Mobile Safari')
                var isAndroid = parsedUserAgent.os.name === 'Android';
                if (isAndroid) {
                    updateSource = 'googlePlay';
                }
  
                var isAndroidButNotChrome;
                if (options.requireChromeOnAndroid) {
                    isAndroidButNotChrome = isAndroid && parsedUserAgent.browser.name !== 'Chrome';
                }
  
                if (parsedUserAgent.os.name === 'iOS') {
                    updateSource = 'appStore';
                }
  
                var done = true;
  
                var changeOpacity = function (opacityValue) {
                    outdatedUI.style.opacity = opacityValue / 100;
                    outdatedUI.style.filter = 'alpha(opacity=' + opacityValue + ')';
                };
  
                var fadeIn = function (opacityValue) {
                    changeOpacity(opacityValue);
                    if (opacityValue === 1) {
                        outdatedUI.style.display = 'table';
                    }
                    if (opacityValue === 100) {
                        done = true;
                    }
                };
  
                var parseMinorVersion = function (version) {
                    return version.replace(/[^\d.]/g,'').split('.')[1];
                };
  
                var isBrowserUnsupported = function () {
                    var browserName = parsedUserAgent.browser.name;
                    var isUnsupported = false;
                    if (!(browserName in browserSupport)) {
                        if (!options.isUnknownBrowserOK) {
                            isUnsupported = true;
                        }
                    } else if (!browserSupport[browserName]) {
                        isUnsupported = true;
                    }
                    return isUnsupported;
                };
  
                var isBrowserOutOfDate = function () {
                    var browserName = parsedUserAgent.browser.name;
                    var browserMajorVersion = parsedUserAgent.browser.major;
                    if (browserName === 'Edge') {
                        browserMajorVersion = EDGEHTML_VS_EDGE_VERSIONS[browserMajorVersion];
                    }
                    var isOutOfDate = false;
                    if (isBrowserUnsupported()) {
                        isOutOfDate = true;
                    } else if (browserName in browserSupport) {
                        var minVersion = browserSupport[browserName];
                        if (typeof minVersion === 'object') {
                            var minMajorVersion = minVersion.major;
                            var minMinorVersion = minVersion.minor;
  
                            if (browserMajorVersion < minMajorVersion) {
                                isOutOfDate = true;
                            } else if (browserMajorVersion == minMajorVersion) {
                                var browserMinorVersion = parseMinorVersion(parsedUserAgent.browser.version);
  
                                if (browserMinorVersion < minMinorVersion) {
                                    isOutOfDate = true;
                                }
                            }
                        } else if (browserMajorVersion < minVersion) {
                            isOutOfDate = true;
                        }
                    }
                    return isOutOfDate;
                };
  
                // Returns true if a browser supports a css3 property
                var isPropertySupported = function (property) {
                    if (!property) {
                        return true;
                    }
                    var div = document.createElement('div');
                    var vendorPrefixes = ['khtml', 'ms', 'o', 'moz', 'webkit'];
                    var count = vendorPrefixes.length;
  
                    // Note: HTMLElement.style.hasOwnProperty seems broken in Edge
                    if (property in div.style) {
                        return true;
                    }
  
                    property = property.replace(/^[a-z]/, function (val) {
                        return val.toUpperCase();
                    });
  
                    while (count--) {
                        var prefixedProperty = vendorPrefixes[count] + property;
                        // See comment re: HTMLElement.style.hasOwnProperty above
                        if (prefixedProperty in div.style) {
                            return true;
                        }
                    }
                    return false;
                };
  
                var makeFadeInFunction = function (opacityValue) {
                    return function () {
                        fadeIn(opacityValue);
                    };
                };
  
                // Style element explicitly - TODO: investigate and delete if not needed
                var startStylesAndEvents = function () {
                    var buttonClose = document.getElementById('buttonCloseUpdateBrowser');
                    var buttonUpdate = document.getElementById('buttonUpdateBrowser');
  
                    //check settings attributes
                    outdatedUI.style.backgroundColor = backgroundColor;
                    //way too hard to put !important on IE6
                    outdatedUI.style.color = textColor;
                    outdatedUI.children[0].children[0].style.color = textColor;
                    outdatedUI.children[0].children[1].style.color = textColor;
  
                    // Update button is desktop only
                    if (buttonUpdate) {
                        buttonUpdate.style.color = textColor;
                        if (buttonUpdate.style.borderColor) {
                            buttonUpdate.style.borderColor = textColor;
                        }
  
                        // Override the update button color to match the background color
                        buttonUpdate.onmouseover = function () {
                            this.style.color = backgroundColor;
                            this.style.backgroundColor = textColor;
                        };
  
                        buttonUpdate.onmouseout = function () {
                            this.style.color = textColor;
                            this.style.backgroundColor = backgroundColor;
                        };
                    }
  
                    buttonClose.style.color = textColor;
  
                    buttonClose.onmousedown = function () {
                        outdatedUI.style.display = 'none';
                        return false;
                    };
                };
  
                var getmessage = function (lang) {
                    var defaultMessages = languageMessages[lang] || languageMessages.en;
                    var customMessages = options.messages && options.messages[lang];
                    var messages = deepExtend({}, defaultMessages, customMessages);
  
                    var updateMessages = {
                        web:
            '<p>' +
            messages.update.web +
            (messages.url ? (
                '<a id="buttonUpdateBrowser" rel="nofollow" href="' +
              messages.url +
              '">' +
              messages.callToAction +
              '</a>'
            ) : '') +
            '</p>',
                        googlePlay:
            '<p>' +
            messages.update.googlePlay +
            '<a id="buttonUpdateBrowser" rel="nofollow" href="https://play.google.com/store/apps/details?id=com.android.chrome">' +
            messages.callToAction +
            '</a></p>',
                        appStore: '<p>' + messages.update[updateSource] + '</p>'
                    };
  
                    var updateMessage = updateMessages[updateSource];
  
                    var browserSupportMessage = messages.outOfDate;
                    if (isBrowserUnsupported() && messages.unsupported) {
                        browserSupportMessage = messages.unsupported;
                    }
  
                    return (
                        '<div class="vertical-center"><h6>' +
          browserSupportMessage +
          '</h6>' +
          updateMessage +
          '<p class="last"><a href="#" id="buttonCloseUpdateBrowser" title="' +
          messages.close +
          '">&times;</a></p></div>'
                    );
                };

                // Check if user already acknowledge this session
                var alreadyAcknowledged = sessionStorage.getItem('outdated');

                if (alreadyAcknowledged === null || alreadyAcknowledged === typeof 'undefined') {
                // Check if browser is supported
                    if (isBrowserOutOfDate() || !isPropertySupported(requiredCssProperty) || isAndroidButNotChrome) {
                        // This is an outdated browser
                        if (done && outdatedUI.style.opacity !== '1') {
                            done = false;
    
                            for (var opacity = 1; opacity <= 100; opacity++) {
                                setTimeout(makeFadeInFunction(opacity), opacity * 8);
                            }
                        }
    
                        var insertContentHere = document.getElementById('outdated');
                        if (fullscreen) {
                            insertContentHere.classList.add('fullscreen');
                        }
                        insertContentHere.innerHTML = getmessage(language);
                        startStylesAndEvents();
                        sessionStorage.setItem('outdated', 'acknowledged');
                    }
                }
            };
  
            // Load main when DOM ready.
            var oldOnload = window.onload;
            if (typeof window.onload !== 'function') {
                window.onload = main;
            } else {
                window.onload = function () {
                    if (oldOnload) {
                        oldOnload();
                    }
                    main();
                };
            }
        };
    },{'./extend': 1,'./languages.json': 3,'ua-parser-js': 4}],3: [function (require,module,exports){
        module.exports = {
            br: {
                outOfDate: 'O seu navegador est&aacute; desatualizado!',
                update: {
                    web: 'Atualize o seu navegador para ter uma melhor experi&ecirc;ncia e visualiza&ccedil;&atilde;o deste site. ',
                    googlePlay: 'Please install Chrome from Google Play',
                    appStore: 'Please update iOS from the Settings App'
                },
                url: 'https://browser-update.org/update-browser.html',
                callToAction: 'Atualize o seu navegador agora',
                close: 'Fechar'
            },
            ca: {
                outOfDate: 'El vostre navegador no està actualitzat!',
                update: {
                    web: 'Actualitzeu el vostre navegador per veure correctament aquest lloc web. ',
                    googlePlay: 'Instal·leu Chrome des de Google Play',
                    appStore: 'Actualitzeu iOS des de l\'aplicació Configuració'
                },
                url: 'https://browser-update.org/update-browser.html',
                callToAction: 'Actualitzar el meu navegador ara',
                close: 'Tancar'
            },
            cn: {
                outOfDate: '您的浏览器已过时',
                update: {
                    web: '要正常浏览本网站请升级您的浏览器。',
                    googlePlay: 'Please install Chrome from Google Play',
                    appStore: 'Please update iOS from the Settings App'
                },
                url: 'https://browser-update.org/update-browser.html',
                callToAction: '现在升级',
                close: '关闭'
            },
            cz: {
                outOfDate: 'Váš prohlížeč je zastaralý!',
                update: {
                    web: 'Pro správné zobrazení těchto stránek aktualizujte svůj prohlížeč. ',
                    googlePlay: 'Nainstalujte si Chrome z Google Play',
                    appStore: 'Aktualizujte si systém iOS'
                },
                url: 'https://browser-update.org/update-browser.html',
                callToAction: 'Aktualizovat nyní svůj prohlížeč',
                close: 'Zavřít'
            },
            da: {
                outOfDate: 'Din browser er forældet!',
                update: {
                    web: 'Opdatér din browser for at få vist denne hjemmeside korrekt. ',
                    googlePlay: 'Installér venligst Chrome fra Google Play',
                    appStore: 'Opdatér venligst iOS'
                },
                url: 'https://browser-update.org/update-browser.html',
                callToAction: 'Opdatér din browser nu',
                close: 'Luk'
            },
            de: {
                outOfDate: 'Ihr Browser ist veraltet!',
                update: {
                    web: 'Bitte aktualisieren Sie Ihren Browser, um diese Website korrekt darzustellen. ',
                    googlePlay: 'Please install Chrome from Google Play',
                    appStore: 'Please update iOS from the Settings App'
                },
                url: 'https://browser-update.org/update-browser.html',
                callToAction: 'Den Browser jetzt aktualisieren ',
                close: 'Schließen'
            },
            ee: {
                outOfDate: 'Sinu veebilehitseja on vananenud!',
                update: {
                    web: 'Palun uuenda oma veebilehitsejat, et näha lehekülge korrektselt. ',
                    googlePlay: 'Please install Chrome from Google Play',
                    appStore: 'Please update iOS from the Settings App'
                },
                url: 'https://browser-update.org/update-browser.html',
                callToAction: 'Uuenda oma veebilehitsejat kohe',
                close: 'Sulge'
            },
            en: {
                outOfDate: 'Your browser is out-of-date!',
                update: {
                    web: 'Update your browser to view this website correctly. ',
                    googlePlay: 'Please install Chrome from Google Play',
                    appStore: 'Please update iOS from the Settings App'
                },
                url: 'https://browser-update.org/update-browser.html',
                callToAction: 'Update my browser now',
                close: 'Close'
            },
            es: {
                outOfDate: '¡Tu navegador está anticuado!',
                update: {
                    web: 'Actualiza tu navegador para ver esta página correctamente. ',
                    googlePlay: 'Please install Chrome from Google Play',
                    appStore: 'Please update iOS from the Settings App'
                },
                url: 'https://browser-update.org/update-browser.html',
                callToAction: 'Actualizar mi navegador ahora',
                close: 'Cerrar'
            },
            fa: {
                rightToLeft: true,
                outOfDate: 'مرورگر شما منسوخ شده است!',
                update: {
                    web: 'جهت مشاهده صحیح این وبسایت، مرورگرتان را بروز رسانی نمایید. ',
                    googlePlay: 'Please install Chrome from Google Play',
                    appStore: 'Please update iOS from the Settings App'
                },
                url: 'https://browser-update.org/update-browser.html',
                callToAction: 'همین حالا مرورگرم را بروز کن',
                close: 'Close'
            },
            fi: {
                outOfDate: 'Selaimesi on vanhentunut!',
                update: {
                    web: 'Lataa ajantasainen selain n&auml;hd&auml;ksesi t&auml;m&auml;n sivun oikein. ',
                    googlePlay: 'Asenna uusin Chrome Google Play -kaupasta',
                    appStore: 'Päivitä iOS puhelimesi asetuksista'
                },
                url: 'https://browser-update.org/update-browser.html',
                callToAction: 'P&auml;ivit&auml; selaimeni nyt ',
                close: 'Sulje'
            },
            fr: {
                outOfDate: 'Votre navigateur n\'est plus compatible !',
                update: {
                    web: 'Mettez à jour votre navigateur pour afficher correctement ce site Web. ',
                    googlePlay: 'Merci d\'installer Chrome depuis le Google Play Store',
                    appStore: 'Merci de mettre à jour iOS depuis l\'application Réglages'
                },
                url: 'https://browser-update.org/update-browser.html',
                callToAction: 'Mettre à jour maintenant ',
                close: 'Fermer'
            },
            hu: {
                outOfDate: 'A böngészője elavult!',
                update: {
                    web: 'Firssítse vagy cserélje le a böngészőjét. ',
                    googlePlay: 'Please install Chrome from Google Play',
                    appStore: 'Please update iOS from the Settings App'
                },
                url: 'https://browser-update.org/update-browser.html',
                callToAction: 'A böngészőm frissítése ',
                close: 'Close'
            },
            id: {
                outOfDate: 'Browser yang Anda gunakan sudah ketinggalan zaman!',
                update: {
                    web: 'Perbaharuilah browser Anda agar bisa menjelajahi website ini dengan nyaman. ',
                    googlePlay: 'Please install Chrome from Google Play',
                    appStore: 'Please update iOS from the Settings App'
                },
                url: 'https://browser-update.org/update-browser.html',
                callToAction: 'Perbaharui browser sekarang ',
                close: 'Close'
            },
            it: {
                outOfDate: 'Il tuo browser non &egrave; aggiornato!',
                update: {
                    web: 'Aggiornalo per vedere questo sito correttamente. ',
                    googlePlay: 'Please install Chrome from Google Play',
                    appStore: 'Please update iOS from the Settings App'
                },
                url: 'https://browser-update.org/update-browser.html',
                callToAction: 'Aggiorna ora',
                close: 'Chiudi'
            },
            lt: {
                outOfDate: 'Jūsų naršyklės versija yra pasenusi!',
                update: {
                    web: 'Atnaujinkite savo naršyklę, kad galėtumėte peržiūrėti šią svetainę tinkamai. ',
                    googlePlay: 'Please install Chrome from Google Play',
                    appStore: 'Please update iOS from the Settings App'
                },
                url: 'https://browser-update.org/update-browser.html',
                callToAction: 'Atnaujinti naršyklę ',
                close: 'Close'
            },
            nl: {
                outOfDate: 'Je gebruikt een oude browser!',
                update: {
                    web: 'Update je browser om deze website correct te bekijken. ',
                    googlePlay: 'Please install Chrome from Google Play',
                    appStore: 'Please update iOS from the Settings App'
                },
                url: 'https://browser-update.org/update-browser.html',
                callToAction: 'Update mijn browser nu ',
                close: 'Sluiten'
            },
            pl: {
                outOfDate: 'Twoja przeglądarka jest przestarzała!',
                update: {
                    web: 'Zaktualizuj swoją przeglądarkę, aby poprawnie wyświetlić tę stronę. ',
                    googlePlay: 'Proszę zainstalować przeglądarkę Chrome ze sklepu Google Play',
                    appStore: 'Proszę zaktualizować iOS z Ustawień'
                },
                url: 'https://browser-update.org/update-browser.html',
                callToAction: 'Zaktualizuj przeglądarkę już teraz',
                close: 'Zamknij'
            },
            pt: {
                outOfDate: 'O seu browser est&aacute; desatualizado!',
                update: {
                    web: 'Atualize o seu browser para ter uma melhor experi&ecirc;ncia e visualiza&ccedil;&atilde;o deste site. ',
                    googlePlay: 'Please install Chrome from Google Play',
                    appStore: 'Please update iOS from the Settings App'
                },
                url: 'https://browser-update.org/update-browser.html',
                callToAction: 'Atualize o seu browser agora',
                close: 'Fechar'
            },
            ro: {
                outOfDate: 'Browserul este învechit!',
                update: {
                    web: 'Actualizați browserul pentru a vizualiza corect acest site. ',
                    googlePlay: 'Please install Chrome from Google Play',
                    appStore: 'Please update iOS from the Settings App'
                },
                url: 'https://browser-update.org/update-browser.html',
                callToAction: 'Actualizați browserul acum!',
                close: 'Close'
            },
            ru: {
                outOfDate: 'Ваш браузер устарел!',
                update: {
                    web: 'Обновите ваш браузер для правильного отображения этого сайта. ',
                    googlePlay: 'Please install Chrome from Google Play',
                    appStore: 'Please update iOS from the Settings App'
                },
                url: 'https://browser-update.org/update-browser.html',
                callToAction: 'Обновить мой браузер ',
                close: 'Закрыть'
            },
            si: {
                outOfDate: 'Vaš brskalnik je zastarel!',
                update: {
                    web: 'Za pravilen prikaz spletne strani posodobite vaš brskalnik. ',
                    googlePlay: 'Please install Chrome from Google Play',
                    appStore: 'Please update iOS from the Settings App'
                },
                url: 'https://browser-update.org/update-browser.html',
                callToAction: 'Posodobi brskalnik ',
                close: 'Zapri'
            },
            sv: {
                outOfDate: 'Din webbläsare stödjs ej längre!',
                update: {
                    web: 'Uppdatera din webbläsare för att webbplatsen ska visas korrekt. ',
                    googlePlay: 'Please install Chrome from Google Play',
                    appStore: 'Please update iOS from the Settings App'
                },
                url: 'https://browser-update.org/update-browser.html',
                callToAction: 'Uppdatera min webbläsare nu',
                close: 'Stäng'
            },
            ua: {
                outOfDate: 'Ваш браузер застарів!',
                update: {
                    web: 'Оновіть ваш браузер для правильного відображення цього сайта. ',
                    googlePlay: 'Please install Chrome from Google Play',
                    appStore: 'Please update iOS from the Settings App'
                },
                url: 'https://browser-update.org/update-browser.html',
                callToAction: 'Оновити мій браузер ',
                close: 'Закрити'
            }
        };
    },{}],4: [function (require,module,exports){
    /*!
   * UAParser.js v0.7.21
   * Lightweight JavaScript-based User-Agent string parser
   * https://github.com/faisalman/ua-parser-js
   *
   * Copyright © 2012-2019 Faisal Salman <f@faisalman.com>
   * Licensed under MIT License
   */
  
        (function (window, undefined) {
            'use strict';
  
            //////////////
            // Constants
            /////////////
  
            var LIBVERSION = '0.7.21',
                EMPTY = '',
                UNKNOWN = '?',
                FUNC_TYPE = 'function',
                UNDEF_TYPE = 'undefined',
                OBJ_TYPE = 'object',
                STR_TYPE = 'string',
                MAJOR = 'major', // deprecated
                MODEL = 'model',
                NAME = 'name',
                TYPE = 'type',
                VENDOR = 'vendor',
                VERSION = 'version',
                ARCHITECTURE = 'architecture',
                CONSOLE = 'console',
                MOBILE = 'mobile',
                TABLET = 'tablet',
                SMARTTV = 'smarttv',
                WEARABLE = 'wearable',
                EMBEDDED = 'embedded';
  
            ///////////
            // Helper
            //////////
  
            var util = {
                extend: function (regexes, extensions) {
                    var mergedRegexes = {};
                    for (var i in regexes) {
                        if (extensions[i] && extensions[i].length % 2 === 0) {
                            mergedRegexes[i] = extensions[i].concat(regexes[i]);
                        } else {
                            mergedRegexes[i] = regexes[i];
                        }
                    }
                    return mergedRegexes;
                },
                has: function (str1, str2) {
                    if (typeof str1 === 'string') {
                        return str2.toLowerCase().indexOf(str1.toLowerCase()) !== -1;
                    } else {
                        return false;
                    }
                },
                lowerize: function (str) {
                    return str.toLowerCase();
                },
                major: function (version) {
                    return typeof (version) === STR_TYPE ? version.replace(/[^\d\.]/g,'').split('.')[0] : undefined;
                },
                trim: function (str) {
                    return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
                }
            };
  
            ///////////////
            // Map helper
            //////////////
  
            var mapper = {
  
                rgx: function (ua, arrays) {
                    var i = 0, j, k, p, q, matches, match;
  
                    // loop through all regexes maps
                    while (i < arrays.length && !matches) {
                        var regex = arrays[i], // even sequence (0,2,4,..)
                            props = arrays[i + 1]; // odd sequence (1,3,5,..)
                        j = k = 0;
  
                        // try matching uastring with regexes
                        while (j < regex.length && !matches) {
                            matches = regex[j++].exec(ua);
  
                            if (matches) {
                                for (p = 0; p < props.length; p++) {
                                    match = matches[++k];
                                    q = props[p];
                                    // check if given property is actually array
                                    if (typeof q === OBJ_TYPE && q.length > 0) {
                                        if (q.length == 2) {
                                            if (typeof q[1] === FUNC_TYPE) {
                                            // assign modified match
                                                this[q[0]] = q[1].call(this, match);
                                            } else {
                                            // assign given value, ignore regex match
                                                this[q[0]] = q[1];
                                            }
                                        } else if (q.length == 3) {
                                        // check whether function or regex
                                            if (typeof q[1] === FUNC_TYPE && !(q[1].exec && q[1].test)) {
                                            // call function (usually string mapper)
                                                this[q[0]] = match ? q[1].call(this, match, q[2]) : undefined;
                                            } else {
                                            // sanitize match using given regex
                                                this[q[0]] = match ? match.replace(q[1], q[2]) : undefined;
                                            }
                                        } else if (q.length == 4) {
                                            this[q[0]] = match ? q[3].call(this, match.replace(q[1], q[2])) : undefined;
                                        }
                                    } else {
                                        this[q] = match ? match : undefined;
                                    }
                                }
                            }
                        }
                        i += 2;
                    }
                },
  
                str: function (str, map) {
                    for (var i in map) {
                    // check if array
                        if (typeof map[i] === OBJ_TYPE && map[i].length > 0) {
                            for (var j = 0; j < map[i].length; j++) {
                                if (util.has(map[i][j], str)) {
                                    return (i === UNKNOWN) ? undefined : i;
                                }
                            }
                        } else if (util.has(map[i], str)) {
                            return (i === UNKNOWN) ? undefined : i;
                        }
                    }
                    return str;
                }
            };
  
            ///////////////
            // String map
            //////////////
  
            var maps = {
  
                browser: {
                    oldsafari: {
                        version: {
                            '1.0': '/8',
                            1.2: '/1',
                            1.3: '/3',
                            '2.0': '/412',
                            '2.0.2': '/416',
                            '2.0.3': '/417',
                            '2.0.4': '/419',
                            '?': '/'
                        }
                    }
                },
  
                device: {
                    amazon: {
                        model: {
                            'Fire Phone': ['SD', 'KF']
                        }
                    },
                    sprint: {
                        model: {
                            'Evo Shift 4G': '7373KT'
                        },
                        vendor: {
                            HTC: 'APA',
                            Sprint: 'Sprint'
                        }
                    }
                },
  
                os: {
                    windows: {
                        version: {
                            ME: '4.90',
                            'NT 3.11': 'NT3.51',
                            'NT 4.0': 'NT4.0',
                            2000: 'NT 5.0',
                            XP: ['NT 5.1', 'NT 5.2'],
                            Vista: 'NT 6.0',
                            7: 'NT 6.1',
                            8: 'NT 6.2',
                            8.1: 'NT 6.3',
                            10: ['NT 6.4', 'NT 10.0'],
                            RT: 'ARM'
                        }
                    }
                }
            };
  
            //////////////
            // Regex map
            /////////////
  
            var regexes = {
  
                browser: [[
  
                    // Presto based
                    /(opera\smini)\/([\w\.-]+)/i, // Opera Mini
                    /(opera\s[mobiletab]+).+version\/([\w\.-]+)/i, // Opera Mobi/Tablet
                    /(opera).+version\/([\w\.]+)/i, // Opera > 9.80
                    /(opera)[\/\s]+([\w\.]+)/i // Opera < 9.80
                ], [NAME, VERSION], [
  
                    /(opios)[\/\s]+([\w\.]+)/i // Opera mini on iphone >= 8.0
                ], [[NAME, 'Opera Mini'], VERSION], [
  
                    /\s(opr)\/([\w\.]+)/i // Opera Webkit
                ], [[NAME, 'Opera'], VERSION], [
  
                    // Mixed
                    /(kindle)\/([\w\.]+)/i, // Kindle
                    /(lunascape|maxthon|netfront|jasmine|blazer)[\/\s]?([\w\.]*)/i,
                    // Lunascape/Maxthon/Netfront/Jasmine/Blazer
                    // Trident based
                    /(avant\s|iemobile|slim)(?:browser)?[\/\s]?([\w\.]*)/i,
                    // Avant/IEMobile/SlimBrowser
                    /(bidubrowser|baidubrowser)[\/\s]?([\w\.]+)/i, // Baidu Browser
                    /(?:ms|\()(ie)\s([\w\.]+)/i, // Internet Explorer
  
                    // Webkit/KHTML based
                    /(rekonq)\/([\w\.]*)/i, // Rekonq
                    /(chromium|flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt|iron|vivaldi|iridium|phantomjs|bowser|quark|qupzilla|falkon)\/([\w\.-]+)/i
                // Chromium/Flock/RockMelt/Midori/Epiphany/Silk/Skyfire/Bolt/Iron/Iridium/PhantomJS/Bowser/QupZilla/Falkon
                ], [NAME, VERSION], [
  
                    /(konqueror)\/([\w\.]+)/i // Konqueror
                ], [[NAME, 'Konqueror'], VERSION], [
  
                    /(trident).+rv[:\s]([\w\.]+).+like\sgecko/i // IE11
                ], [[NAME, 'IE'], VERSION], [
  
                    /(edge|edgios|edga|edg)\/((\d+)?[\w\.]+)/i // Microsoft Edge
                ], [[NAME, 'Edge'], VERSION], [
  
                    /(yabrowser)\/([\w\.]+)/i // Yandex
                ], [[NAME, 'Yandex'], VERSION], [
  
                    /(Avast)\/([\w\.]+)/i // Avast Secure Browser
                ], [[NAME, 'Avast Secure Browser'], VERSION], [
  
                    /(AVG)\/([\w\.]+)/i // AVG Secure Browser
                ], [[NAME, 'AVG Secure Browser'], VERSION], [
  
                    /(puffin)\/([\w\.]+)/i // Puffin
                ], [[NAME, 'Puffin'], VERSION], [
  
                    /(focus)\/([\w\.]+)/i // Firefox Focus
                ], [[NAME, 'Firefox Focus'], VERSION], [
  
                    /(opt)\/([\w\.]+)/i // Opera Touch
                ], [[NAME, 'Opera Touch'], VERSION], [
  
                    /((?:[\s\/])uc?\s?browser|(?:juc.+)ucweb)[\/\s]?([\w\.]+)/i // UCBrowser
                ], [[NAME, 'UCBrowser'], VERSION], [
  
                    /(comodo_dragon)\/([\w\.]+)/i // Comodo Dragon
                ], [[NAME, /_/g, ' '], VERSION], [
  
                    /(windowswechat qbcore)\/([\w\.]+)/i // WeChat Desktop for Windows Built-in Browser
                ], [[NAME, 'WeChat(Win) Desktop'], VERSION], [
  
                    /(micromessenger)\/([\w\.]+)/i // WeChat
                ], [[NAME, 'WeChat'], VERSION], [
  
                    /(brave)\/([\w\.]+)/i // Brave browser
                ], [[NAME, 'Brave'], VERSION], [
  
                    /(qqbrowserlite)\/([\w\.]+)/i // QQBrowserLite
                ], [NAME, VERSION], [
  
                    /(QQ)\/([\d\.]+)/i // QQ, aka ShouQ
                ], [NAME, VERSION], [
  
                    /m?(qqbrowser)[\/\s]?([\w\.]+)/i // QQBrowser
                ], [NAME, VERSION], [
  
                    /(baiduboxapp)[\/\s]?([\w\.]+)/i // Baidu App
                ], [NAME, VERSION], [
  
                    /(2345Explorer)[\/\s]?([\w\.]+)/i // 2345 Browser
                ], [NAME, VERSION], [
  
                    /(MetaSr)[\/\s]?([\w\.]+)/i // SouGouBrowser
                ], [NAME], [
  
                    /(LBBROWSER)/i // LieBao Browser
                ], [NAME], [
  
                    /xiaomi\/miuibrowser\/([\w\.]+)/i // MIUI Browser
                ], [VERSION, [NAME, 'MIUI Browser']], [
  
                    /;fbav\/([\w\.]+);/i // Facebook App for iOS & Android
                ], [VERSION, [NAME, 'Facebook']], [
  
                    /safari\s(line)\/([\w\.]+)/i, // Line App for iOS
                    /android.+(line)\/([\w\.]+)\/iab/i // Line App for Android
                ], [NAME, VERSION], [
  
                    /headlesschrome(?:\/([\w\.]+)|\s)/i // Chrome Headless
                ], [VERSION, [NAME, 'Chrome Headless']], [
  
                    /\swv\).+(chrome)\/([\w\.]+)/i // Chrome WebView
                ], [[NAME, /(.+)/, '$1 WebView'], VERSION], [
  
                    /((?:oculus|samsung)browser)\/([\w\.]+)/i
                ], [[NAME, /(.+(?:g|us))(.+)/, '$1 $2'], VERSION], [ // Oculus / Samsung Browser
  
                    /android.+version\/([\w\.]+)\s+(?:mobile\s?safari|safari)*/i // Android Browser
                ], [VERSION, [NAME, 'Android Browser']], [
  
                    /(sailfishbrowser)\/([\w\.]+)/i // Sailfish Browser
                ], [[NAME, 'Sailfish Browser'], VERSION], [
  
                    /(chrome|omniweb|arora|[tizenoka]{5}\s?browser)\/v?([\w\.]+)/i
                // Chrome/OmniWeb/Arora/Tizen/Nokia
                ], [NAME, VERSION], [
  
                    /(dolfin)\/([\w\.]+)/i // Dolphin
                ], [[NAME, 'Dolphin'], VERSION], [
  
                    /(qihu|qhbrowser|qihoobrowser|360browser)/i // 360
                ], [[NAME, '360 Browser']], [
  
                    /((?:android.+)crmo|crios)\/([\w\.]+)/i // Chrome for Android/iOS
                ], [[NAME, 'Chrome'], VERSION], [
  
                    /(coast)\/([\w\.]+)/i // Opera Coast
                ], [[NAME, 'Opera Coast'], VERSION], [
  
                    /fxios\/([\w\.-]+)/i // Firefox for iOS
                ], [VERSION, [NAME, 'Firefox']], [
  
                    /version\/([\w\.]+).+?mobile\/\w+\s(safari)/i // Mobile Safari
                ], [VERSION, [NAME, 'Mobile Safari']], [
  
                    /version\/([\w\.]+).+?(mobile\s?safari|safari)/i // Safari & Safari Mobile
                ], [VERSION, NAME], [
  
                    /webkit.+?(gsa)\/([\w\.]+).+?(mobile\s?safari|safari)(\/[\w\.]+)/i // Google Search Appliance on iOS
                ], [[NAME, 'GSA'], VERSION], [
  
                    /webkit.+?(mobile\s?safari|safari)(\/[\w\.]+)/i // Safari < 3.0
                ], [NAME, [VERSION, mapper.str, maps.browser.oldsafari.version]], [
  
                    /(webkit|khtml)\/([\w\.]+)/i
                ], [NAME, VERSION], [
  
                    // Gecko based
                    /(navigator|netscape)\/([\w\.-]+)/i // Netscape
                ], [[NAME, 'Netscape'], VERSION], [
                    /(swiftfox)/i, // Swiftfox
                    /(icedragon|iceweasel|camino|chimera|fennec|maemo\sbrowser|minimo|conkeror)[\/\s]?([\w\.\+]+)/i,
                    // IceDragon/Iceweasel/Camino/Chimera/Fennec/Maemo/Minimo/Conkeror
                    /(firefox|seamonkey|k-meleon|icecat|iceape|firebird|phoenix|palemoon|basilisk|waterfox)\/([\w\.-]+)$/i,
  
                    // Firefox/SeaMonkey/K-Meleon/IceCat/IceApe/Firebird/Phoenix
                    /(mozilla)\/([\w\.]+).+rv\:.+gecko\/\d+/i, // Mozilla
  
                    // Other
                    /(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|sleipnir)[\/\s]?([\w\.]+)/i,
                    // Polaris/Lynx/Dillo/iCab/Doris/Amaya/w3m/NetSurf/Sleipnir
                    /(links)\s\(([\w\.]+)/i, // Links
                    /(gobrowser)\/?([\w\.]*)/i, // GoBrowser
                    /(ice\s?browser)\/v?([\w\._]+)/i, // ICE Browser
                    /(mosaic)[\/\s]([\w\.]+)/i // Mosaic
                ], [NAME, VERSION]
                ],
  
                cpu: [[
  
                    /(?:(amd|x(?:(?:86|64)[_-])?|wow|win)64)[;\)]/i // AMD64
                ], [[ARCHITECTURE, 'amd64']], [
  
                    /(ia32(?=;))/i // IA32 (quicktime)
                ], [[ARCHITECTURE, util.lowerize]], [
  
                    /((?:i[346]|x)86)[;\)]/i // IA32
                ], [[ARCHITECTURE, 'ia32']], [
  
                    // PocketPC mistakenly identified as PowerPC
                    /windows\s(ce|mobile);\sppc;/i
                ], [[ARCHITECTURE, 'arm']], [
  
                    /((?:ppc|powerpc)(?:64)?)(?:\smac|;|\))/i // PowerPC
                ], [[ARCHITECTURE, /ower/, '', util.lowerize]], [
  
                    /(sun4\w)[;\)]/i // SPARC
                ], [[ARCHITECTURE, 'sparc']], [
  
                    /((?:avr32|ia64(?=;))|68k(?=\))|arm(?:64|(?=v\d+[;l]))|(?=atmel\s)avr|(?:irix|mips|sparc)(?:64)?(?=;)|pa-risc)/i
                // IA64, 68K, ARM/64, AVR/32, IRIX/64, MIPS/64, SPARC/64, PA-RISC
                ], [[ARCHITECTURE, util.lowerize]]
                ],
  
                device: [[
  
                    /\((ipad|playbook);[\w\s\),;-]+(rim|apple)/i // iPad/PlayBook
                ], [MODEL, VENDOR, [TYPE, TABLET]], [
  
                    /applecoremedia\/[\w\.]+ \((ipad)/ // iPad
                ], [MODEL, [VENDOR, 'Apple'], [TYPE, TABLET]], [
  
                    /(apple\s{0,1}tv)/i // Apple TV
                ], [[MODEL, 'Apple TV'], [VENDOR, 'Apple'], [TYPE, SMARTTV]], [
  
                    /(archos)\s(gamepad2?)/i, // Archos
                    /(hp).+(touchpad)/i, // HP TouchPad
                    /(hp).+(tablet)/i, // HP Tablet
                    /(kindle)\/([\w\.]+)/i, // Kindle
                    /\s(nook)[\w\s]+build\/(\w+)/i, // Nook
                    /(dell)\s(strea[kpr\s\d]*[\dko])/i // Dell Streak
                ], [VENDOR, MODEL, [TYPE, TABLET]], [
  
                    /(kf[A-z]+)\sbuild\/.+silk\//i // Kindle Fire HD
                ], [MODEL, [VENDOR, 'Amazon'], [TYPE, TABLET]], [
                    /(sd|kf)[0349hijorstuw]+\sbuild\/.+silk\//i // Fire Phone
                ], [[MODEL, mapper.str, maps.device.amazon.model], [VENDOR, 'Amazon'], [TYPE, MOBILE]], [
                    /android.+aft([bms])\sbuild/i // Fire TV
                ], [MODEL, [VENDOR, 'Amazon'], [TYPE, SMARTTV]], [
  
                    /\((ip[honed|\s\w*]+);.+(apple)/i // iPod/iPhone
                ], [MODEL, VENDOR, [TYPE, MOBILE]], [
                    /\((ip[honed|\s\w*]+);/i // iPod/iPhone
                ], [MODEL, [VENDOR, 'Apple'], [TYPE, MOBILE]], [
  
                    /(blackberry)[\s-]?(\w+)/i, // BlackBerry
                    /(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|meizu|motorola|polytron)[\s_-]?([\w-]*)/i,
                    // BenQ/Palm/Sony-Ericsson/Acer/Asus/Dell/Meizu/Motorola/Polytron
                    /(hp)\s([\w\s]+\w)/i, // HP iPAQ
                    /(asus)-?(\w+)/i // Asus
                ], [VENDOR, MODEL, [TYPE, MOBILE]], [
                    /\(bb10;\s(\w+)/i // BlackBerry 10
                ], [MODEL, [VENDOR, 'BlackBerry'], [TYPE, MOBILE]], [
                // Asus Tablets
                    /android.+(transfo[prime\s]{4,10}\s\w+|eeepc|slider\s\w+|nexus 7|padfone|p00c)/i
                ], [MODEL, [VENDOR, 'Asus'], [TYPE, TABLET]], [
  
                    /(sony)\s(tablet\s[ps])\sbuild\//i, // Sony
                    /(sony)?(?:sgp.+)\sbuild\//i
                ], [[VENDOR, 'Sony'], [MODEL, 'Xperia Tablet'], [TYPE, TABLET]], [
                    /android.+\s([c-g]\d{4}|so[-l]\w+)(?=\sbuild\/|\).+chrome\/(?![1-6]{0,1}\d\.))/i
                ], [MODEL, [VENDOR, 'Sony'], [TYPE, MOBILE]], [
  
                    /\s(ouya)\s/i, // Ouya
                    /(nintendo)\s([wids3u]+)/i // Nintendo
                ], [VENDOR, MODEL, [TYPE, CONSOLE]], [
  
                    /android.+;\s(shield)\sbuild/i // Nvidia
                ], [MODEL, [VENDOR, 'Nvidia'], [TYPE, CONSOLE]], [
  
                    /(playstation\s[34portablevi]+)/i // Playstation
                ], [MODEL, [VENDOR, 'Sony'], [TYPE, CONSOLE]], [
  
                    /(sprint\s(\w+))/i // Sprint Phones
                ], [[VENDOR, mapper.str, maps.device.sprint.vendor], [MODEL, mapper.str, maps.device.sprint.model], [TYPE, MOBILE]], [
  
                    /(htc)[;_\s-]+([\w\s]+(?=\)|\sbuild)|\w+)/i, // HTC
                    /(zte)-(\w*)/i, // ZTE
                    /(alcatel|geeksphone|nexian|panasonic|(?=;\s)sony)[_\s-]?([\w-]*)/i
                // Alcatel/GeeksPhone/Nexian/Panasonic/Sony
                ], [VENDOR, [MODEL, /_/g, ' '], [TYPE, MOBILE]], [
  
                    /(nexus\s9)/i // HTC Nexus 9
                ], [MODEL, [VENDOR, 'HTC'], [TYPE, TABLET]], [
  
                    /d\/huawei([\w\s-]+)[;\)]/i,
                    /(nexus\s6p|vog-l29|ane-lx1|eml-l29)/i // Huawei
                ], [MODEL, [VENDOR, 'Huawei'], [TYPE, MOBILE]], [
  
                    /android.+(bah2?-a?[lw]\d{2})/i // Huawei MediaPad
                ], [MODEL, [VENDOR, 'Huawei'], [TYPE, TABLET]], [
  
                    /(microsoft);\s(lumia[\s\w]+)/i // Microsoft Lumia
                ], [VENDOR, MODEL, [TYPE, MOBILE]], [
  
                    /[\s\(;](xbox(?:\sone)?)[\s\);]/i // Microsoft Xbox
                ], [MODEL, [VENDOR, 'Microsoft'], [TYPE, CONSOLE]], [
                    /(kin\.[onetw]{3})/i // Microsoft Kin
                ], [[MODEL, /\./g, ' '], [VENDOR, 'Microsoft'], [TYPE, MOBILE]], [
  
                    // Motorola
                    /\s(milestone|droid(?:[2-4x]|\s(?:bionic|x2|pro|razr))?:?(\s4g)?)[\w\s]+build\//i,
                    /mot[\s-]?(\w*)/i,
                    /(XT\d{3,4}) build\//i,
                    /(nexus\s6)/i
                ], [MODEL, [VENDOR, 'Motorola'], [TYPE, MOBILE]], [
                    /android.+\s(mz60\d|xoom[\s2]{0,2})\sbuild\//i
                ], [MODEL, [VENDOR, 'Motorola'], [TYPE, TABLET]], [
  
                    /hbbtv\/\d+\.\d+\.\d+\s+\([\w\s]*;\s*(\w[^;]*);([^;]*)/i // HbbTV devices
                ], [[VENDOR, util.trim], [MODEL, util.trim], [TYPE, SMARTTV]], [
  
                    /hbbtv.+maple;(\d+)/i
                ], [[MODEL, /^/, 'SmartTV'], [VENDOR, 'Samsung'], [TYPE, SMARTTV]], [
  
                    /\(dtv[\);].+(aquos)/i // Sharp
                ], [MODEL, [VENDOR, 'Sharp'], [TYPE, SMARTTV]], [
  
                    /android.+((sch-i[89]0\d|shw-m380s|gt-p\d{4}|gt-n\d+|sgh-t8[56]9|nexus 10))/i,
                    /((SM-T\w+))/i
                ], [[VENDOR, 'Samsung'], MODEL, [TYPE, TABLET]], [ // Samsung
                    /smart-tv.+(samsung)/i
                ], [VENDOR, [TYPE, SMARTTV], MODEL], [
                    /((s[cgp]h-\w+|gt-\w+|galaxy\snexus|sm-\w[\w\d]+))/i,
                    /(sam[sung]*)[\s-]*(\w+-?[\w-]*)/i,
                    /sec-((sgh\w+))/i
                ], [[VENDOR, 'Samsung'], MODEL, [TYPE, MOBILE]], [
  
                    /sie-(\w*)/i // Siemens
                ], [MODEL, [VENDOR, 'Siemens'], [TYPE, MOBILE]], [
  
                    /(maemo|nokia).*(n900|lumia\s\d+)/i, // Nokia
                    /(nokia)[\s_-]?([\w-]*)/i
                ], [[VENDOR, 'Nokia'], MODEL, [TYPE, MOBILE]], [
  
                    /android[x\d\.\s;]+\s([ab][1-7]\-?[0178a]\d\d?)/i // Acer
                ], [MODEL, [VENDOR, 'Acer'], [TYPE, TABLET]], [
  
                    /android.+([vl]k\-?\d{3})\s+build/i // LG Tablet
                ], [MODEL, [VENDOR, 'LG'], [TYPE, TABLET]], [
                    /android\s3\.[\s\w;-]{10}(lg?)-([06cv9]{3,4})/i // LG Tablet
                ], [[VENDOR, 'LG'], MODEL, [TYPE, TABLET]], [
                    /(lg) netcast\.tv/i // LG SmartTV
                ], [VENDOR, MODEL, [TYPE, SMARTTV]], [
                    /(nexus\s[45])/i, // LG
                    /lg[e;\s\/-]+(\w*)/i,
                    /android.+lg(\-?[\d\w]+)\s+build/i
                ], [MODEL, [VENDOR, 'LG'], [TYPE, MOBILE]], [
  
                    /(lenovo)\s?(s(?:5000|6000)(?:[\w-]+)|tab(?:[\s\w]+))/i // Lenovo tablets
                ], [VENDOR, MODEL, [TYPE, TABLET]], [
                    /android.+(ideatab[a-z0-9\-\s]+)/i // Lenovo
                ], [MODEL, [VENDOR, 'Lenovo'], [TYPE, TABLET]], [
                    /(lenovo)[_\s-]?([\w-]+)/i
                ], [VENDOR, MODEL, [TYPE, MOBILE]], [
  
                    /linux;.+((jolla));/i // Jolla
                ], [VENDOR, MODEL, [TYPE, MOBILE]], [
  
                    /((pebble))app\/[\d\.]+\s/i // Pebble
                ], [VENDOR, MODEL, [TYPE, WEARABLE]], [
  
                    /android.+;\s(oppo)\s?([\w\s]+)\sbuild/i // OPPO
                ], [VENDOR, MODEL, [TYPE, MOBILE]], [
  
                    /crkey/i // Google Chromecast
                ], [[MODEL, 'Chromecast'], [VENDOR, 'Google'], [TYPE, SMARTTV]], [
  
                    /android.+;\s(glass)\s\d/i // Google Glass
                ], [MODEL, [VENDOR, 'Google'], [TYPE, WEARABLE]], [
  
                    /android.+;\s(pixel c)[\s)]/i // Google Pixel C
                ], [MODEL, [VENDOR, 'Google'], [TYPE, TABLET]], [
  
                    /android.+;\s(pixel( [23])?( xl)?)[\s)]/i // Google Pixel
                ], [MODEL, [VENDOR, 'Google'], [TYPE, MOBILE]], [
  
                    /android.+;\s(\w+)\s+build\/hm\1/i, // Xiaomi Hongmi 'numeric' models
                    /android.+(hm[\s\-_]*note?[\s_]*(?:\d\w)?)\s+build/i, // Xiaomi Hongmi
                    /android.+(mi[\s\-_]*(?:a\d|one|one[\s_]plus|note lte)?[\s_]*(?:\d?\w?)[\s_]*(?:plus)?)\s+build/i,    
                    // Xiaomi Mi
                    /android.+(redmi[\s\-_]*(?:note)?(?:[\s_]*[\w\s]+))\s+build/i // Redmi Phones
                ], [[MODEL, /_/g, ' '], [VENDOR, 'Xiaomi'], [TYPE, MOBILE]], [
                    /android.+(mi[\s\-_]*(?:pad)(?:[\s_]*[\w\s]+))\s+build/i // Mi Pad tablets
                ],[[MODEL, /_/g, ' '], [VENDOR, 'Xiaomi'], [TYPE, TABLET]], [
                    /android.+;\s(m[1-5]\snote)\sbuild/i // Meizu
                ], [MODEL, [VENDOR, 'Meizu'], [TYPE, MOBILE]], [
                    /(mz)-([\w-]{2,})/i
                ], [[VENDOR, 'Meizu'], MODEL, [TYPE, MOBILE]], [
  
                    /android.+a000(1)\s+build/i, // OnePlus
                    /android.+oneplus\s(a\d{4})[\s)]/i
                ], [MODEL, [VENDOR, 'OnePlus'], [TYPE, MOBILE]], [
  
                    /android.+[;\/]\s*(RCT[\d\w]+)\s+build/i // RCA Tablets
                ], [MODEL, [VENDOR, 'RCA'], [TYPE, TABLET]], [
  
                    /android.+[;\/\s]+(Venue[\d\s]{2,7})\s+build/i // Dell Venue Tablets
                ], [MODEL, [VENDOR, 'Dell'], [TYPE, TABLET]], [
  
                    /android.+[;\/]\s*(Q[T|M][\d\w]+)\s+build/i // Verizon Tablet
                ], [MODEL, [VENDOR, 'Verizon'], [TYPE, TABLET]], [
  
                    /android.+[;\/]\s+(Barnes[&\s]+Noble\s+|BN[RT])(V?.*)\s+build/i // Barnes & Noble Tablet
                ], [[VENDOR, 'Barnes & Noble'], MODEL, [TYPE, TABLET]], [
  
                    /android.+[;\/]\s+(TM\d{3}.*\b)\s+build/i // Barnes & Noble Tablet
                ], [MODEL, [VENDOR, 'NuVision'], [TYPE, TABLET]], [
  
                    /android.+;\s(k88)\sbuild/i // ZTE K Series Tablet
                ], [MODEL, [VENDOR, 'ZTE'], [TYPE, TABLET]], [
  
                    /android.+[;\/]\s*(gen\d{3})\s+build.*49h/i // Swiss GEN Mobile
                ], [MODEL, [VENDOR, 'Swiss'], [TYPE, MOBILE]], [
  
                    /android.+[;\/]\s*(zur\d{3})\s+build/i // Swiss ZUR Tablet
                ], [MODEL, [VENDOR, 'Swiss'], [TYPE, TABLET]], [
  
                    /android.+[;\/]\s*((Zeki)?TB.*\b)\s+build/i // Zeki Tablets
                ], [MODEL, [VENDOR, 'Zeki'], [TYPE, TABLET]], [
  
                    /(android).+[;\/]\s+([YR]\d{2})\s+build/i,
                    /android.+[;\/]\s+(Dragon[\-\s]+Touch\s+|DT)(\w{5})\sbuild/i // Dragon Touch Tablet
                ], [[VENDOR, 'Dragon Touch'], MODEL, [TYPE, TABLET]], [
  
                    /android.+[;\/]\s*(NS-?\w{0,9})\sbuild/i // Insignia Tablets
                ], [MODEL, [VENDOR, 'Insignia'], [TYPE, TABLET]], [
  
                    /android.+[;\/]\s*((NX|Next)-?\w{0,9})\s+build/i // NextBook Tablets
                ], [MODEL, [VENDOR, 'NextBook'], [TYPE, TABLET]], [
  
                    /android.+[;\/]\s*(Xtreme\_)?(V(1[045]|2[015]|30|40|60|7[05]|90))\s+build/i
                ], [[VENDOR, 'Voice'], MODEL, [TYPE, MOBILE]], [ // Voice Xtreme Phones
  
                    /android.+[;\/]\s*(LVTEL\-)?(V1[12])\s+build/i // LvTel Phones
                ], [[VENDOR, 'LvTel'], MODEL, [TYPE, MOBILE]], [
  
                    /android.+;\s(PH-1)\s/i
                ], [MODEL, [VENDOR, 'Essential'], [TYPE, MOBILE]], [ // Essential PH-1
  
                    /android.+[;\/]\s*(V(100MD|700NA|7011|917G).*\b)\s+build/i // Envizen Tablets
                ], [MODEL, [VENDOR, 'Envizen'], [TYPE, TABLET]], [
  
                    /android.+[;\/]\s*(Le[\s\-]+Pan)[\s\-]+(\w{1,9})\s+build/i // Le Pan Tablets
                ], [VENDOR, MODEL, [TYPE, TABLET]], [
  
                    /android.+[;\/]\s*(Trio[\s\-]*.*)\s+build/i // MachSpeed Tablets
                ], [MODEL, [VENDOR, 'MachSpeed'], [TYPE, TABLET]], [
  
                    /android.+[;\/]\s*(Trinity)[\-\s]*(T\d{3})\s+build/i // Trinity Tablets
                ], [VENDOR, MODEL, [TYPE, TABLET]], [
  
                    /android.+[;\/]\s*TU_(1491)\s+build/i // Rotor Tablets
                ], [MODEL, [VENDOR, 'Rotor'], [TYPE, TABLET]], [
  
                    /android.+(KS(.+))\s+build/i // Amazon Kindle Tablets
                ], [MODEL, [VENDOR, 'Amazon'], [TYPE, TABLET]], [
  
                    /android.+(Gigaset)[\s\-]+(Q\w{1,9})\s+build/i // Gigaset Tablets
                ], [VENDOR, MODEL, [TYPE, TABLET]], [
  
                    /\s(tablet|tab)[;\/]/i, // Unidentifiable Tablet
                    /\s(mobile)(?:[;\/]|\ssafari)/i // Unidentifiable Mobile
                ], [[TYPE, util.lowerize], VENDOR, MODEL], [
  
                    /[\s\/\(](smart-?tv)[;\)]/i // SmartTV
                ], [[TYPE, SMARTTV]], [
  
                    /(android[\w\.\s\-]{0,9});.+build/i // Generic Android Device
                ], [MODEL, [VENDOR, 'Generic']]
                ],
  
                engine: [[
  
                    /windows.+\sedge\/([\w\.]+)/i // EdgeHTML
                ], [VERSION, [NAME, 'EdgeHTML']], [
  
                    /webkit\/537\.36.+chrome\/(?!27)([\w\.]+)/i // Blink
                ], [VERSION, [NAME, 'Blink']], [
  
                    /(presto)\/([\w\.]+)/i, // Presto
                    /(webkit|trident|netfront|netsurf|amaya|lynx|w3m|goanna)\/([\w\.]+)/i,     
                    // WebKit/Trident/NetFront/NetSurf/Amaya/Lynx/w3m/Goanna
                    /(khtml|tasman|links)[\/\s]\(?([\w\.]+)/i, // KHTML/Tasman/Links
                    /(icab)[\/\s]([23]\.[\d\.]+)/i // iCab
                ], [NAME, VERSION], [
  
                    /rv\:([\w\.]{1,9}).+(gecko)/i // Gecko
                ], [VERSION, NAME]
                ],
  
                os: [[
  
                    // Windows based
                    /microsoft\s(windows)\s(vista|xp)/i // Windows (iTunes)
                ], [NAME, VERSION], [
                    /(windows)\snt\s6\.2;\s(arm)/i, // Windows RT
                    /(windows\sphone(?:\sos)*)[\s\/]?([\d\.\s\w]*)/i, // Windows Phone
                    /(windows\smobile|windows)[\s\/]?([ntce\d\.\s]+\w)/i
                ], [NAME, [VERSION, mapper.str, maps.os.windows.version]], [
                    /(win(?=3|9|n)|win\s9x\s)([nt\d\.]+)/i
                ], [[NAME, 'Windows'], [VERSION, mapper.str, maps.os.windows.version]], [
  
                    // Mobile/Embedded OS
                    /\((bb)(10);/i // BlackBerry 10
                ], [[NAME, 'BlackBerry'], VERSION], [
                    /(blackberry)\w*\/?([\w\.]*)/i, // Blackberry
                    /(tizen|kaios)[\/\s]([\w\.]+)/i, // Tizen/KaiOS
                    /(android|webos|palm\sos|qnx|bada|rim\stablet\sos|meego|sailfish|contiki)[\/\s-]?([\w\.]*)/i
                // Android/WebOS/Palm/QNX/Bada/RIM/MeeGo/Contiki/Sailfish OS
                ], [NAME, VERSION], [
                    /(symbian\s?os|symbos|s60(?=;))[\/\s-]?([\w\.]*)/i // Symbian
                ], [[NAME, 'Symbian'], VERSION], [
                    /\((series40);/i // Series 40
                ], [NAME], [
                    /mozilla.+\(mobile;.+gecko.+firefox/i // Firefox OS
                ], [[NAME, 'Firefox OS'], VERSION], [
  
                    // Console
                    /(nintendo|playstation)\s([wids34portablevu]+)/i, // Nintendo/Playstation
  
                    // GNU/Linux based
                    /(mint)[\/\s\(]?(\w*)/i, // Mint
                    /(mageia|vectorlinux)[;\s]/i, // Mageia/VectorLinux
                    /(joli|[kxln]?ubuntu|debian|suse|opensuse|gentoo|(?=\s)arch|slackware|fedora|mandriva|centos|pclinuxos|redhat|zenwalk|linpus)[\/\s-]?(?!chrom)([\w\.-]*)/i,
                    // Joli/Ubuntu/Debian/SUSE/Gentoo/Arch/Slackware
                    // Fedora/Mandriva/CentOS/PCLinuxOS/RedHat/Zenwalk/Linpus
                    /(hurd|linux)\s?([\w\.]*)/i, // Hurd/Linux
                    /(gnu)\s?([\w\.]*)/i // GNU
                ], [NAME, VERSION], [
  
                    /(cros)\s[\w]+\s([\w\.]+\w)/i // Chromium OS
                ], [[NAME, 'Chromium OS'], VERSION],[
  
                    // Solaris
                    /(sunos)\s?([\w\.\d]*)/i // Solaris
                ], [[NAME, 'Solaris'], VERSION], [
  
                    // BSD based
                    /\s([frentopc-]{0,4}bsd|dragonfly)\s?([\w\.]*)/i // FreeBSD/NetBSD/OpenBSD/PC-BSD/DragonFly
                ], [NAME, VERSION],[
  
                    /(haiku)\s(\w+)/i // Haiku
                ], [NAME, VERSION],[
  
                    /cfnetwork\/.+darwin/i,
                    /ip[honead]{2,4}(?:.*os\s([\w]+)\slike\smac|;\sopera)/i // iOS
                ], [[VERSION, /_/g, '.'], [NAME, 'iOS']], [
  
                    /(mac\sos\sx)\s?([\w\s\.]*)/i,
                    /(macintosh|mac(?=_powerpc)\s)/i // Mac OS
                ], [[NAME, 'Mac OS'], [VERSION, /_/g, '.']], [
  
                    // Other
                    /((?:open)?solaris)[\/\s-]?([\w\.]*)/i, // Solaris
                    /(aix)\s((\d)(?=\.|\)|\s)[\w\.])*/i, // AIX
                    /(plan\s9|minix|beos|os\/2|amigaos|morphos|risc\sos|openvms|fuchsia)/i,
                    // Plan9/Minix/BeOS/OS2/AmigaOS/MorphOS/RISCOS/OpenVMS/Fuchsia
                    /(unix)\s?([\w\.]*)/i // UNIX
                ], [NAME, VERSION]
                ]
            };
  
            /////////////////
            // Constructor
            ////////////////
            var UAParser = function (uastring, extensions) {
                if (typeof uastring === 'object') {
                    extensions = uastring;
                    uastring = undefined;
                }
  
                if (!(this instanceof UAParser)) {
                    return new UAParser(uastring, extensions).getResult();
                }
  
                var ua = uastring || ((window && window.navigator && window.navigator.userAgent) ? window.navigator.userAgent : EMPTY);
                var rgxmap = extensions ? util.extend(regexes, extensions) : regexes;
  
                this.getBrowser = function () {
                    var browser = {name: undefined, version: undefined};
                    mapper.rgx.call(browser, ua, rgxmap.browser);
                    browser.major = util.major(browser.version); // deprecated
                    return browser;
                };
                this.getCPU = function () {
                    var cpu = {architecture: undefined};
                    mapper.rgx.call(cpu, ua, rgxmap.cpu);
                    return cpu;
                };
                this.getDevice = function () {
                    var device = {vendor: undefined, model: undefined, type: undefined};
                    mapper.rgx.call(device, ua, rgxmap.device);
                    return device;
                };
                this.getEngine = function () {
                    var engine = {name: undefined, version: undefined};
                    mapper.rgx.call(engine, ua, rgxmap.engine);
                    return engine;
                };
                this.getOS = function () {
                    var os = {name: undefined, version: undefined};
                    mapper.rgx.call(os, ua, rgxmap.os);
                    return os;
                };
                this.getResult = function () {
                    return {
                        ua: this.getUA(),
                        browser: this.getBrowser(),
                        engine: this.getEngine(),
                        os: this.getOS(),
                        device: this.getDevice(),
                        cpu: this.getCPU()
                    };
                };
                this.getUA = function () {
                    return ua;
                };
                this.setUA = function (uastring) {
                    ua = uastring;
                    return this;
                };
                return this;
            };
  
            UAParser.VERSION = LIBVERSION;
            UAParser.BROWSER = {
                NAME: NAME,
                MAJOR: MAJOR, // deprecated
                VERSION: VERSION
            };
            UAParser.CPU = {
                ARCHITECTURE: ARCHITECTURE
            };
            UAParser.DEVICE = {
                MODEL: MODEL,
                VENDOR: VENDOR,
                TYPE: TYPE,
                CONSOLE: CONSOLE,
                MOBILE: MOBILE,
                SMARTTV: SMARTTV,
                TABLET: TABLET,
                WEARABLE: WEARABLE,
                EMBEDDED: EMBEDDED
            };
            UAParser.ENGINE = {
                NAME: NAME,
                VERSION: VERSION
            };
            UAParser.OS = {
                NAME: NAME,
                VERSION: VERSION
            };
  
            ///////////
            // Export
            //////////
  
            // check js environment
            if (typeof (exports) !== UNDEF_TYPE) {
            // nodejs env
                if (typeof module !== UNDEF_TYPE && module.exports) {
                    exports = module.exports = UAParser;
                }
                exports.UAParser = UAParser;
            } else {
            // requirejs env (optional)
                if (typeof (define) === 'function' && define.amd) {
                    define(function () {
                        return UAParser;
                    });
                } else if (window) {
                // browser env
                    window.UAParser = UAParser;
                }
            }
  
            // jQuery/Zepto specific (optional)
            // Note:
            //   In AMD env the global scope should be kept clean, but jQuery is an exception.
            //   jQuery always exports to global scope, unless jQuery.noConflict(true) is used,
            //   and we should catch that.
            var $ = window && (window.jQuery || window.Zepto);
            if ($ && !$.ua) {
                var parser = new UAParser();
                $.ua = parser.getResult();
                $.ua.get = function () {
                    return parser.getUA();
                };
                $.ua.set = function (uastring) {
                    parser.setUA(uastring);
                    var result = parser.getResult();
                    for (var prop in result) {
                        $.ua[prop] = result[prop];
                    }
                };
            }
        })(typeof window === 'object' ? window : this);
    },{}]},{},[2])(2);
});
  
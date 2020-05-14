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

        var IE_ICON = `<svg class="browserIcon" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
        viewBox="0 0 13.683 13.683" style="enable-background:new 0 0 13.683 13.683;" xml:space="preserve">
     <g>
       <path class="disabledIcon" d="M12.054,0c-0.178,0-0.355,0-0.533,0c-0.5,0.073-1.227,0.302-1.836,0.592
         c-0.506,0.241-1.082,0.761-1.482,0.83c-0.291,0.05-0.604-0.099-0.888-0.119c-3.636-0.26-5.938,2.295-6.279,5.894
         c1.25-1.476,2.987-3.855,4.976-4.591c-2.868,2.126-5.469,5.647-5.627,8.708c0,0.178,0,0.355,0,0.533
         c0.167,0.979,0.594,1.695,1.599,1.836c0.158,0,0.316,0,0.474,0c1.443-0.195,2.441-0.838,3.436-1.48
         c3.687,0.529,6.054-1.188,6.931-3.852c-1.303,0-2.607,0-3.91,0c-0.41,2.002-4.099,1.49-3.613-0.77c2.527,0,5.054,0,7.582,0
         c0.197-3.634-1.594-5.277-4.205-6.101c0.813-0.49,3.246-1.913,4.205-0.711c0.422,0.53,0.162,1.643,0.059,2.251
         c0.182-0.372,0.238-0.869,0.355-1.303c0-0.178,0-0.355,0-0.533C13.175,0.496,12.738,0.125,12.054,0z M5.596,12.112
         c-0.743,0.494-3.199,1.691-4.028,0.533c-0.585-0.816,0.115-2.072,0.415-2.783C2.845,10.954,3.97,11.784,5.596,12.112z M9.019,5.532
         L5.347,5.534C5.205,3.266,9.261,3.101,9.019,5.532z"/>
     </g>
     </svg>`;

        var EDGE_ICON = `<svg class="browserIcon" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
        viewBox="0 0 512.005 512.005" style="enable-background:new 0 0 512.005 512.005;" xml:space="preserve">
     <path style="fill:#2196F3;" d="M19.443,227.392h0.288c3.04-24.032,8.64-47.04,16.736-69.088s19.072-42.72,32.896-62.08
       s29.792-36.128,47.904-50.336s39.424-25.408,63.936-33.6S232.083,0,260.275,0c44.064,0,83.52,10.048,118.432,30.176
       s62.912,49.056,84.096,86.816c19.84,35.648,29.76,77.792,29.76,126.432v53.76H170.739c0.192,21.152,5.28,39.52,15.296,55.072
       s23.04,27.232,39.04,35.04s34.08,13.248,54.208,16.288s40.416,3.328,60.928,0.864s40.32-6.912,59.488-13.312
       c19.168-6.4,35.712-14.432,49.632-24.16v107.84c-17.536,10.496-39.424,19.264-65.632,26.304c-26.208,7.04-56,10.688-89.376,10.88
       c-33.376,0.192-63.488-4.864-90.4-15.168c-36.032-13.92-65.728-37.664-89.088-71.2S79.603,356.576,79.219,319.2
       c-0.576-46.144,10.016-85.408,31.744-117.824s52.736-57.984,92.96-76.672c-9.152,11.456-16.576,23.424-22.304,35.904
       s-10.112,27.712-13.152,45.632h181.632c1.536-14.688,0.768-28.032-2.304-40.032c-3.04-12-7.52-21.696-13.44-29.024
       s-12.64-13.696-20.16-19.008c-7.52-5.344-15.2-9.248-23.04-11.712c-7.808-2.464-14.976-4.448-21.44-5.856s-11.808-2.24-16.032-2.432
       l-6.272-0.352c-25.728,0.96-50.496,5.184-74.24,12.736s-45.024,17.504-63.904,29.888s-35.68,25.792-50.336,40.192
       S31.059,210.624,19.443,227.392z"/>
     </svg>`;

        var CHROME_ICON = `<svg class="browserIcon" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
        viewBox="0 0 512.003 512.003" style="enable-background:new 0 0 512.003 512.003;" xml:space="preserve">
     <path style="fill:#F44336;" d="M61.818,89.204c119.008-138.496,339.68-111.168,422.144,50.624c-58.08,0.032-148.992-0.032-198.24,0
       c-35.712,0-58.784-0.8-83.744,12.352c-29.344,15.456-51.52,44.096-59.232,77.76L61.818,89.204z"/>
     <path style="fill:#2196F3;" d="M170.842,256.02c0,46.944,38.176,85.12,85.088,85.12s85.088-38.176,85.088-85.12
       s-38.176-85.12-85.088-85.12C208.986,170.868,170.842,209.076,170.842,256.02z"/>
     <path style="fill:#4CAF50;" d="M288.922,367.444c-47.744,14.176-103.648-1.536-134.24-54.4
       c-23.36-40.32-85.12-147.872-113.152-196.8C-56.774,266.9,27.93,472.18,206.362,507.22L288.922,367.444z"/>
     <path style="fill:#FFC107;" d="M334.938,170.868c39.776,36.992,48.448,96.896,21.504,143.328
       c-20.288,35.008-85.088,144.352-116.48,197.28c183.84,11.328,317.856-168.832,257.312-340.64L334.938,170.868z"/>
     </svg>`;

        var FIREFOX_ICON = `<svg class="browserIcon" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
     viewBox="0 0 291.678 291.678" style="enable-background:new 0 0 291.678 291.678;" xml:space="preserve">
  <g>
    <g>
      <path style="fill:#2394BC;" d="M145.66,4.277c75.561,0,136.556,60.995,136.556,136.556S221.22,277.389,145.66,277.389
        S9.104,216.394,9.104,140.833S70.099,4.277,145.66,4.277z"/>
      <path style="fill:#EC8840;" d="M169.329,284.671c69.188-11.835,121.99-71.009,121.99-143.839l-0.91,1.821
        c1.821-13.656,1.821-26.401-0.91-36.415c-0.91,8.193-1.821,12.745-3.642,14.566c0-0.91,0-9.104-2.731-20.028
        c-0.91-8.193-2.731-16.387-5.462-23.67c0.91,3.641,0.91,6.373,0.91,9.104c-10.924-28.222-36.415-63.726-101.051-62.816
        c0,0,22.759,2.731,32.773,18.207c0,0-10.924-2.731-19.118,1.821c10.014,3.641,19.118,8.193,26.401,12.745h0.91
        c1.821,0.91,3.641,2.731,5.462,3.641c13.656,10.014,26.401,23.67,25.49,40.967c-3.641-5.462-7.283-9.104-12.745-10.014
        c6.373,24.58,6.373,44.608,1.821,60.085c-3.641-10.924-6.373-16.387-9.104-19.118c3.641,32.773-0.91,56.443-15.476,71.919
        c2.731-9.104,3.641-17.297,3.641-23.67c-17.297,25.49-36.415,39.146-58.264,40.056c-8.193,0-16.387-0.91-24.58-3.641
        c-10.924-3.641-20.939-10.014-30.042-19.118c13.656,0.91,27.311-0.91,38.236-7.283l18.207-11.835l0,0
        c2.731-0.91,4.552-0.91,7.283,0c4.552-0.91,6.373-2.731,4.552-7.283c-1.821-2.731-5.462-5.462-10.014-8.193
        c-9.104-4.552-19.118-3.641-29.132,2.731c-10.014,5.462-19.118,5.462-28.222-0.91c-5.462-3.641-11.835-9.104-17.297-16.387
        l-1.821-3.641c-0.91,8.193,0,17.297,3.641,30.042l0,0l0,0c-3.641-11.835-4.552-21.849-3.641-30.042l0,0
        c0-6.373,2.731-10.924,8.193-10.924h-1.821h2.731c6.373,0.91,12.745,1.821,20.939,4.552c0.91-7.283,0-15.476-5.462-23.67l0,0
        c7.283-7.283,13.656-11.835,19.118-14.566c2.731-0.91,3.641-3.641,4.552-6.373l0,0l0,0l0,0c1.821-3.641,0.91-5.462-0.91-7.283
        c-5.462,0-10.014,0-15.476-0.91l0,0c-1.821-0.91-4.552-2.731-8.193-5.462l-8.193-8.193l-2.731-1.821l0,0l0,0l0,0l-0.91-0.91
        l0.91-0.91c0.91-6.373,2.731-11.835,5.462-16.387l0.91-0.91c2.731-4.552,8.193-9.104,15.476-14.566
        c-14.566,1.821-27.311,8.193-39.146,19.118c-9.104-2.731-20.939-1.821-33.684,3.641l-1.821,0.91l0,0l1.821-0.91l0,0
        c-8.193-3.641-13.656-14.566-16.387-32.773C20.939,36.14,16.387,55.258,16.387,81.659l-2.731,4.552l-0.91,0.91l0,0l0,0l0,0
        c-1.821,2.731-3.641,6.373-6.373,10.924c-3.641,7.283-5.462,12.745-5.462,18.207l0,0l0,0v1.821l0,0c0,0.91,0,2.731,0,3.641
        l8.193-6.373c-2.731,8.193-5.462,16.387-6.373,24.58v3.641L0,140.833c0,30.953,10.014,60.085,26.401,83.754l0.91,0.91l0.91,0.91
        c11.835,16.387,27.311,30.042,45.519,40.967c12.745,7.283,26.401,12.745,40.967,16.387l2.731,0.91
        c2.731,0.91,6.373,0.91,9.104,1.821c2.731,0,4.552,0.91,7.283,0.91h2.731h4.552h4.552h3.641h6.373c3.641,0,7.283-0.91,10.924-0.91
        C166.598,284.671,169.329,284.671,169.329,284.671z M261.277,107.149v0.91V107.149L261.277,107.149z"/>
    </g>
  </svg>`;
        
        var SAFARI_ICON = `<svg class="browserIcon" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
        viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve">
     <style type="text/css">
       .st0{fill:#497FC1;}
       .st1{fill:#FFFFFF;}
       .st2{fill:#DE3205;}
     </style>
     <circle class="st0" cx="256" cy="256" r="256"/>
     <g>
       <rect x="253.3" y="20.3" class="st1" width="5.5" height="36.4"/>
       
         <rect x="234.2" y="20.3" transform="matrix(0.995 -9.940470e-02 9.940470e-02 0.995 -1.7521 23.6928)" class="st1" width="5.5" height="18.3"/>
       <rect x="253.3" y="455.3" class="st1" width="5.5" height="36.4"/>
       
         <rect x="272.4" y="473.5" transform="matrix(0.995 -9.940470e-02 9.940470e-02 0.995 -46.6099 29.7356)" class="st1" width="5.5" height="18.3"/>
       <rect x="219.2" y="23" transform="matrix(0.9877 -0.1564 0.1564 0.9877 -3.7125 35.2233)" class="st1" width="5.5" height="36.4"/>
       
         <rect x="198.9" y="26.1" transform="matrix(0.9672 -0.2539 0.2539 0.9672 -2.3281 52.3614)" class="st1" width="5.5" height="18.3"/>
       
         <rect x="287.3" y="452.6" transform="matrix(0.9877 -0.1564 0.1564 0.9877 -70.0672 51.1512)" class="st1" width="5.5" height="36.4"/>
       
         <rect x="307.6" y="467.7" transform="matrix(0.9672 -0.2539 0.2539 0.9672 -110.8944 94.4159)" class="st1" width="5.5" height="18.3"/>
       <rect x="186.1" y="31" transform="matrix(0.9511 -0.3089 0.3089 0.9511 -5.9534 60.7212)" class="st1" width="5.5" height="36.4"/>
       <rect x="165.1" y="37.3" transform="matrix(0.9156 -0.402 0.402 0.9156 -4.5028 71.3757)" class="st1" width="5.5" height="18.3"/>
       
         <rect x="320.5" y="444.6" transform="matrix(0.9511 -0.3089 0.3089 0.9511 -127.1658 122.4713)" class="st1" width="5.5" height="36.4"/>
       
         <rect x="341.5" y="456.4" transform="matrix(0.9156 -0.402 0.402 0.9156 -158.1331 177.6517)" class="st1" width="5.5" height="18.3"/>
       
         <rect x="154.5" y="44" transform="matrix(0.8911 -0.4538 0.4538 0.8911 -11.1044 78.1397)" class="st1" width="5.5" height="36.4"/>
       
         <rect x="133.4" y="53.6" transform="matrix(0.8414 -0.5404 0.5404 0.8414 -12.348 83.5045)" class="st1" width="5.5" height="18.3"/>
       
         <rect x="352" y="431.6" transform="matrix(0.8911 -0.4538 0.4538 0.8911 -165.4729 209.9606)" class="st1" width="5.5" height="36.4"/>
       
         <rect x="373.2" y="440.1" transform="matrix(0.8414 -0.5404 0.5404 0.8414 -183.1416 274.3779)" class="st1" width="5.5" height="18.3"/>
       
         <rect x="125.4" y="61.8" transform="matrix(0.809 -0.5878 0.5878 0.809 -22.5645 90.6251)" class="st1" width="5.5" height="36.4"/>
       
         <rect x="104.6" y="74.8" transform="matrix(0.7464 -0.6654 0.6654 0.7464 -28.6263 92.7212)" class="st1" width="5.5" height="18.3"/>
       
         <rect x="381.1" y="413.7" transform="matrix(0.809 -0.5878 0.5878 0.809 -180.5664 308.1151)" class="st1" width="5.5" height="36.4"/>
       
         <rect x="401.9" y="418.9" transform="matrix(0.7464 -0.6654 0.6654 0.7464 -182.2713 377.8145)" class="st1" width="5.5" height="18.3"/>
       
         <rect x="99.5" y="84" transform="matrix(0.7071 -0.7071 0.7071 0.7071 -42.3395 102.2167)" class="st1" width="5.5" height="36.4"/>
       
         <rect x="79.6" y="100.1" transform="matrix(0.6332 -0.774 0.774 0.6332 -54.4087 103.7736)" class="st1" width="5.5" height="18.3"/>
       
         <rect x="407" y="391.6" transform="matrix(0.7071 -0.7071 0.7071 0.7071 -169.7422 409.7809)" class="st1" width="5.5" height="36.4"/>
       
         <rect x="427" y="393.6" transform="matrix(0.6332 -0.774 0.774 0.6332 -154.0635 480.3358)" class="st1" width="5.5" height="18.3"/>
       <rect x="77.3" y="110" transform="matrix(0.5878 -0.809 0.809 0.5878 -70.6949 117.5901)" class="st1" width="5.5" height="36.4"/>
       
         <rect x="58.7" y="129.1" transform="matrix(0.5044 -0.8635 0.8635 0.5044 -88.9471 121.5914)" class="st1" width="5.5" height="18.3"/>
       
         <rect x="429.2" y="365.6" transform="matrix(0.5878 -0.809 0.809 0.5878 -132.4744 507.6503)" class="st1" width="5.5" height="36.4"/>
       
         <rect x="447.8" y="364.6" transform="matrix(0.5044 -0.8635 0.8635 0.5044 -99.4096 574.2406)" class="st1" width="5.5" height="18.3"/>
       <rect x="59.5" y="139.1" transform="matrix(0.454 -0.891 0.891 0.454 -106.1583 141.297)" class="st1" width="5.5" height="36.4"/>
       
         <rect x="42.7" y="161" transform="matrix(0.3631 -0.9318 0.9318 0.3631 -129.6051 150.7259)" class="st1" width="5.5" height="18.3"/>
       <rect x="447" y="336.5" transform="matrix(0.454 -0.891 0.891 0.454 -70.501 594.4282)" class="st1" width="5.5" height="36.4"/>
       
         <rect x="463.8" y="332.7" transform="matrix(0.3631 -0.9318 0.9318 0.3631 -21.364 652.4456)" class="st1" width="5.5" height="18.3"/>
       
         <rect x="46.4" y="170.6" transform="matrix(0.309 -0.9511 0.9511 0.309 -145.5742 177.2164)" class="st1" width="5.5" height="36.4"/>
       
         <rect x="31.9" y="195" transform="matrix(0.2128 -0.9771 0.9771 0.2128 -172.2253 194.5329)" class="st1" width="5.5" height="18.3"/>
       <rect x="460.1" y="305" transform="matrix(0.309 -0.9511 0.9511 0.309 12.4682 663.5311)" class="st1" width="5.5" height="36.4"/>
       
         <rect x="474.7" y="298.7" transform="matrix(0.2128 -0.9771 0.9771 0.2128 75.0517 708.8058)" class="st1" width="5.5" height="18.3"/>
       
         <rect x="38.5" y="203.8" transform="matrix(0.1564 -0.9877 0.9877 0.1564 -184.4782 227.9557)" class="st1" width="5.5" height="36.4"/>
       
         <rect x="26.5" y="230.3" transform="matrix(5.739721e-02 -0.9984 0.9984 5.739721e-02 -211.5105 254.8551)" class="st1" width="5.5" height="18.3"/>
       
         <rect x="468.1" y="271.8" transform="matrix(0.1564 -0.9877 0.9877 0.1564 110.7537 709.6812)" class="st1" width="5.5" height="36.4"/>
       
         <rect x="480.1" y="263.4" transform="matrix(5.739721e-02 -0.9984 0.9984 5.739721e-02 182.9584 738.9061)" class="st1" width="5.5" height="18.3"/>
       <rect x="20.3" y="253.3" class="st1" width="36.4" height="5.5"/>
       
         <rect x="20.3" y="272.4" transform="matrix(0.995 -9.940470e-02 9.940470e-02 0.995 -27.202 4.2856)" class="st1" width="18.3" height="5.5"/>
       <rect x="455.3" y="253.3" class="st1" width="36.4" height="5.5"/>
       
         <rect x="473.4" y="234.2" transform="matrix(0.995 -9.940470e-02 9.940470e-02 0.995 -21.1591 49.1433)" class="st1" width="18.3" height="5.5"/>
       <rect x="23" y="287.3" transform="matrix(0.9877 -0.1564 0.1564 0.9877 -44.855 10.0091)" class="st1" width="36.4" height="5.5"/>
       
         <rect x="26" y="307.6" transform="matrix(0.9672 -0.2539 0.2539 0.9672 -77.6384 19.1044)" class="st1" width="18.3" height="5.5"/>
       
         <rect x="452.6" y="219.3" transform="matrix(0.9877 -0.1564 0.1564 0.9877 -28.9278 76.364)" class="st1" width="36.4" height="5.5"/>
       
         <rect x="467.7" y="199" transform="matrix(0.9672 -0.2539 0.2539 0.9672 -35.5841 127.6741)" class="st1" width="18.3" height="5.5"/>
       
         <rect x="30.9" y="320.5" transform="matrix(0.9511 -0.309 0.309 0.9511 -97.4618 31.0003)" class="st1" width="36.4" height="5.5"/>
       
         <rect x="37.3" y="341.5" transform="matrix(0.9156 -0.4021 0.4021 0.9156 -134.4857 47.7082)" class="st1" width="18.3" height="5.5"/>
       
         <rect x="444.6" y="186.1" transform="matrix(0.9511 -0.309 0.309 0.9511 -35.6916 152.2496)" class="st1" width="36.4" height="5.5"/>
       
         <rect x="456.4" y="165.1" transform="matrix(0.9156 -0.4021 0.4021 0.9156 -28.1823 201.3776)" class="st1" width="18.3" height="5.5"/>
       <rect x="44" y="352" transform="matrix(0.891 -0.454 0.454 0.891 -154.2621 66.9163)" class="st1" width="36.4" height="5.5"/>
       
         <rect x="53.6" y="373.2" transform="matrix(0.8414 -0.5404 0.5404 0.8414 -193.1714 93.5421)" class="st1" width="18.3" height="5.5"/>
       <rect x="431.6" y="154.5" transform="matrix(0.891 -0.454 0.454 0.891 -22.3669 221.341)" class="st1" width="36.4" height="5.5"/>
       
         <rect x="440.1" y="133.4" transform="matrix(0.8414 -0.5404 0.5404 0.8414 -2.3048 264.3383)" class="st1" width="18.3" height="5.5"/>
       
         <rect x="61.9" y="381.1" transform="matrix(0.809 -0.5878 0.5878 0.809 -210.3248 120.3647)" class="st1" width="36.4" height="5.5"/>
       
         <rect x="74.8" y="401.9" transform="matrix(0.7465 -0.6654 0.6654 0.7465 -247.9627 158.4225)" class="st1" width="18.3" height="5.5"/>
       
         <rect x="413.7" y="125.4" transform="matrix(0.809 -0.5878 0.5878 0.809 7.1614 278.3794)" class="st1" width="36.4" height="5.5"/>
       
         <rect x="418.9" y="104.6" transform="matrix(0.7465 -0.6654 0.6654 0.7465 37.089 312.0567)" class="st1" width="18.3" height="5.5"/>
       
         <rect x="84" y="407.1" transform="matrix(0.7071 -0.7071 0.7071 0.7071 -259.8204 192.2968)" class="st1" width="36.4" height="5.5"/>
       
         <rect x="100.1" y="427" transform="matrix(0.6331 -0.7741 0.7741 0.6331 -292.5495 242.2815)" class="st1" width="18.3" height="5.5"/>
       
         <rect x="391.6" y="99.5" transform="matrix(0.7071 -0.7071 0.7071 0.7071 47.7433 319.6967)" class="st1" width="36.4" height="5.5"/>
       
         <rect x="393.6" y="79.5" transform="matrix(0.6331 -0.7741 0.7741 0.6331 84.0689 341.916)" class="st1" width="18.3" height="5.5"/>
       
         <rect x="109.9" y="429.2" transform="matrix(0.5878 -0.809 0.809 0.5878 -296.6198 281.7136)" class="st1" width="36.4" height="5.5"/>
       
         <rect x="129.1" y="447.8" transform="matrix(0.5045 -0.8634 0.8634 0.5045 -320.4942 342.6197)" class="st1" width="18.3" height="5.5"/>
       
         <rect x="365.6" y="77.3" transform="matrix(0.5878 -0.809 0.809 0.5878 93.4333 343.5102)" class="st1" width="36.4" height="5.5"/>
       
         <rect x="364.6" y="58.7" transform="matrix(0.5045 -0.8634 0.8634 0.5045 132.1001 353.1176)" class="st1" width="18.3" height="5.5"/>
       
         <rect x="139.1" y="447.1" transform="matrix(0.4538 -0.8911 0.8911 0.4538 -314.9046 385.809)" class="st1" width="36.4" height="5.5"/>
       
         <rect x="161" y="463.8" transform="matrix(0.3633 -0.9317 0.9317 0.3633 -326.356 455.5771)" class="st1" width="18.3" height="5.5"/>
       
         <rect x="336.5" y="59.5" transform="matrix(0.4538 -0.8911 0.8911 0.4538 138.3082 350.0883)" class="st1" width="36.4" height="5.5"/>
       
         <rect x="332.7" y="42.7" transform="matrix(0.3633 -0.9317 0.9317 0.3633 175.2972 347.4205)" class="st1" width="18.3" height="5.5"/>
       
         <rect x="170.6" y="460.1" transform="matrix(0.3089 -0.9511 0.9511 0.3089 -309.7188 499.435)" class="st1" width="36.4" height="5.5"/>
       
         <rect x="195" y="474.7" transform="matrix(0.2131 -0.977 0.977 0.2131 -305.8147 575.1091)" class="st1" width="18.3" height="5.5"/>
       
         <rect x="305" y="46.4" transform="matrix(0.3089 -0.9511 0.9511 0.3089 176.6193 341.3624)" class="st1" width="36.4" height="5.5"/>
       
         <rect x="298.7" y="31.9" transform="matrix(0.2131 -0.977 0.977 0.2131 208.3986 328.0042)" class="st1" width="18.3" height="5.5"/>
       
         <rect x="203.8" y="468.1" transform="matrix(0.1564 -0.9877 0.9877 0.1564 -277.7289 616.4245)" class="st1" width="36.4" height="5.5"/>
       
         <rect x="230.3" y="480" transform="matrix(5.729754e-02 -0.9984 0.9984 5.729754e-02 -256.277 694.1531)" class="st1" width="18.3" height="5.5"/>
       
         <rect x="271.8" y="38.4" transform="matrix(0.1564 -0.9877 0.9877 0.1564 204.005 321.2025)" class="st1" width="36.4" height="5.5"/>
       
         <rect x="263.4" y="26.5" transform="matrix(5.729754e-02 -0.9984 0.9984 5.729754e-02 227.7774 299.6696)" class="st1" width="18.3" height="5.5"/>
     </g>
     <polygon class="st2" points="428.8,81.2 229.9,229.9 280.1,280.1 "/>
     <polygon class="st1" points="81.2,428.8 229.9,229.9 280.1,280.1 "/>
     </svg>`;
     
        var OPERA_ICON = `
        <svg class="browserIcon" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve">
<path style="fill:#D32F2F;" d="M171.744,111.744C195.232,84,225.568,67.296,258.72,67.296c74.528,0,134.944,84.48,134.944,188.704
	S333.248,444.736,258.72,444.736c-33.152,0-63.488-16.736-86.976-44.448c36.736,47.68,91.328,77.92,152.288,77.92
	c37.504,0,72.576-11.456,102.592-31.36C479.008,399.968,512,331.84,512,256s-32.992-143.968-85.376-190.816
	c-30.016-19.904-65.088-31.36-102.592-31.36C263.072,33.792,208.448,64.064,171.744,111.744"/>
<path style="fill:#F44336;" d="M256,0C114.624,0,0,114.624,0,256c0,137.28,108.096,249.344,243.808,255.712
	C247.84,511.904,251.904,512,256,512c65.536,0,125.312-24.64,170.592-65.152c-30.016,19.904-65.088,31.36-102.592,31.36
	c-60.96,0-115.552-30.24-152.288-77.92c-28.32-33.408-46.656-82.784-47.872-138.24c0-0.128,0-11.904,0-12.064
	c1.248-55.424,19.584-104.832,47.872-138.24c36.736-47.68,91.328-77.92,152.288-77.92c37.504,0,72.576,11.456,102.592,31.36
	C381.568,24.864,322.144,0.256,256.96,0C256.64,0,256.32,0,256,0L256,0z"/>
</svg>`;
  
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

                var pageLang = function (){
                    const PATH = window.location.pathname;

                    if (PATH.includes('/tag/')){
                        return PATH.includes('/fr-') ? 'fr' : 'en';
                    }
            
                    return PATH.includes('/fr/') ? 'fr' : 'en';
                };

                options = options || {};
  
                // Set default options
                var browserSupport = options.browserSupport ? updateDefaults(DEFAULTS, options.browserSupport) : DEFAULTS;
                // CSS property to check for. You may also like 'borderSpacing', 'boxShadow', 'transform', 'borderImage';
                var requiredCssProperty = options.requiredCssProperty || false;
                var language = pageLang(); // Language code
  
                // Chrome mobile is still Chrome (unlike Safari which is 'Mobile Safari')
                var isAndroid = parsedUserAgent.os.name === 'Android';
  
                var isAndroidButNotChrome;
                if (options.requireChromeOnAndroid) {
                    isAndroidButNotChrome = isAndroid && parsedUserAgent.browser.name !== 'Chrome';
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
   
                    buttonClose.onmouseup = function () {
                        outdatedUI.style.display = 'none';
                        sessionStorage.setItem('outdated', 'acknowledged');
                        return false;
                    };
                };
  
                var getmessage = function (lang) {
                    var defaultMessages = languageMessages[lang] || languageMessages.en;
                    var customMessages = options.messages && options.messages[lang];
                    var messages = deepExtend({}, defaultMessages, customMessages);
   
                    var updateMessage = '<p>' + messages.update.web + '</p>';

                    var browserIconList = '<div class="browserList">'
                    + '<span class="browserIconContainer' + (browserSupport.IE ? '' : ' disabled') + '">'
                    + IE_ICON + '<div class="iconLabel">IE 11</div>'
                    + '</span>'
                    + '<span class="browserIconContainer' + (browserSupport.Edge ? '' : ' disabled') + '">'
                    + EDGE_ICON + '<div class="iconLabel">Edge</div>'
                    + '</span>'
                    + '<span class="browserIconContainer' + (browserSupport.Chrome ? '' : ' disabled') + '">'
                    + CHROME_ICON + '<div class="iconLabel">Chrome</div>'
                    + '</span>'
                    + '<span class="browserIconContainer' + (browserSupport.Firefox ? '' : ' disabled') + '">'
                    + FIREFOX_ICON + '<div class="iconLabel">Firefox</div>'
                    + '</span>'
                    + '<span class="browserIconContainer' + (browserSupport.Safari ? '' : ' disabled') + '">'
                    + SAFARI_ICON + '<div class="iconLabel">Safari</div>'
                    + '</span>'
                    + '<span class="browserIconContainer' + (browserSupport.Opera ? '' : ' disabled') + '">'
                    + OPERA_ICON + '<div class="iconLabel">Opera</div>'
                    + '</span></div>';
  
                    var browserSupportMessage = messages.outOfDate;
                    if (isBrowserUnsupported() && messages.unsupported) {
                        browserSupportMessage = messages.unsupported;
                    }
  
                    return (
                        '<div><div class="title">' +
                        browserSupportMessage + '</div>'
                        +
                        updateMessage + browserIconList +
                        '<button id="buttonCloseUpdateBrowser">' + messages.close + '</button></div>'
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
    
                        var insertContentHere = document.getElementById('outdated-content');
                        insertContentHere.innerHTML = getmessage(language);
                        startStylesAndEvents();
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
            en: {
                outOfDate: 'You seem to be using an unsupported web browser',
                update: {
                    web: 'To get the most out of your Busrides experience, please use one of the following supported browsers.',
                    googlePlay: 'Please install Chrome from Google Play',
                    appStore: 'Please update iOS from the Settings App'
                },
                url: 'https://browser-update.org/update-browser.html',
                callToAction: 'Update my browser now',
                close: 'GOT IT'
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
  
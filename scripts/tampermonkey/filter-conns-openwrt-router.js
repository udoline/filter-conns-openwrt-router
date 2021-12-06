// ==UserScript==
// @name         FILTER realtime connections on your router
// @namespace    https://openwrt.org/docs/guide-user/luci/start
// @updateURL    https://raw.githubusercontent.com/udoline/filter-conns-openwrt-router/main/scripts/tampermonkey/filter-conns-openwrt-router.js
// @downloadURL  https://raw.githubusercontent.com/udoline/filter-conns-openwrt-router/main/scripts/tampermonkey/filter-conns-openwrt-router.js
// @version      0.0.6
// @description  Filter some network traffic by ip-address or dns-name on your OpenWrt brick/router is running OpenWrt 21.02.0-rc3
// @author       udoline
// @match        http://192.168.1.1/cgi-bin/luci/admin/status/realtime/connections
// @match        https://192.168.1.1/cgi-bin/luci/admin/status/realtime/connections
// @match        http://openwrt.lan/cgi-bin/luci/admin/status/realtime/connections
// @match        https://openwrt.lan/cgi-bin/luci/admin/status/realtime/connections
// @icon         https://192.168.1.1/luci-static/bootstrap/favicon.png
// @grant        none
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js
// ==/UserScript==

(function () {

    /* jshint esversion: 6 */
    'use strict';

    function jquerify(jquerified) {
        if (!(window.JQuery && window.Jquery.fn.jquery === '1')) {
            let s = document.createElement('script');
            let m = "jquery/3.6.0";
            s.setAttribute('src', 'https://ajax.googleapis.com/ajax/libs/' + m + '/jquery.min.js');
            s.setAttribute('type', 'text/javascript');
            document.getElementsByTagName('head')[0].appendChild(s);
            jquerified = true;
            console.log("Web content is jquerified via " + m + " .. :" + (jquerified ? ")" : "("));
            return jquerified;
        }
    }
    jquerify(false); // call me asap ... maybe one time ...

    var $ = window.$;
    let map = new Map();
    let count = 0;

    function sortMapByKey(myMap) {
        let keys = [];
        for (const [key, value] of myMap.entries()) {
            keys.push(key);
        }

        keys.sort();
        let sortedMap = new Map();
        for (const idx in keys) {
            sortedMap.set(keys[idx], myMap.get(keys[idx]));
        }

        return sortedMap;
    }

    (function (open) {
        XMLHttpRequest.prototype.open = function () {
            this.addEventListener("readystatechange", function (h) {
                // console.log( h + " readystatechange ... " + this.readyState);
                if (this.readyState === 4 && this.status === 200 &&
                    !!this.responseText && this.responseText.length > 13) {
                    // console.log( h + " in " + "[event]'readystatechange' \n" + this.responseText );
                    $('button:contains("Enable DNS lookups")').click();
                    let str = "";
                    $('tr[class*="cbi-rowstyle"]').each(function (i) { // before div
                        // console.log( i + ' .. ' + $(this).text() );
                        let $tds = $(this).find('td[class*="col-7"]'); // before div
                        let a = "",
                            b = "",
                            dump = "";
                        $.each($tds, function (j) {
                            if (j === 0) a = $(this).text().split(/:\d+$|:undefined/)[0];
                            if (j === 1) {
                                let f = $(this).text().split(/\s*:\s*/);
                                // FILTER: remove unwants table contents of connections
                                b = f[0];
                                if (!!f[1] && ((f[1] % 100) === 53 || (f[1] % 1000) === 443)) {
                                    $(this).closest("tr").remove();
                                }
                                // console.log( i + ' .. ' + f[0] + ' : ' + f[1]);
                            }
                        });
                        const regexp = /.*dynamic.kabel-deutschland.de.*|.*OpenWrt.*|.*192\.168\.\d{1,3}\.\d{1,3}.*|.*a043.*/i;
                        if ((
                                !a.match(regexp) || b.match(regexp)) &&
                            (a.match(regexp) || !b.match(regexp))
                        ) {
                            // FILTER: only in the portless connections are interested
                            dump = a + ' > ' + b;

                            // console.log( i + ' .. dump: ' + dump );
                            if (map.get(dump) !== 1) map.set(dump, 1);
                        }
                    });

                    let i = 1;
                    for (const [key, value] of sortMapByKey(map).entries()) {
                        str += key + ", ";
                        if (i++ % 3 === 0) str += "\n";
                    }

                    $('#dynamic').remove();

                    let html = str.replace(/,/g, " ,<br>");
                    html = '<div id="dynamic" class="table" style="width:1100">' + html + '</div>';
                    $(html).insertBefore('#connections');

                    // console.log( '\n[' + count + '] ' + html );
                    if (count++ % 10 === 0) map = new Map();
                }
            }, false);
            open.apply(this, arguments);
        };
    })(XMLHttpRequest.prototype.open);

})();

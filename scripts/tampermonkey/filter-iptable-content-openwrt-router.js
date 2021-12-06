// ==UserScript==
// @name         FILTER realtime firewall state on your router
// @namespace    http://openwrt.org/docs/guide-user/luci/start
// @updateURL    https://raw.githubusercontent.com/udoline/filter-conns-openwrt-router/main/scripts/tampermonkey/filter-iptable-content-openwrt-router.js
// @downloadURL  https://raw.githubusercontent.com/udoline/filter-conns-openwrt-router/main/scripts/tampermonkey/filter-iptable-content-openwrt-router.js
// @version      0.1.3
// @description  Filter some network traffic content over the firewall by ip-address or dns-name on your OpenWrt brick/router is running OpenWrt 21.02.0-rc3
// @author       udoline
// @match        https://192.168.1.1/cgi-bin/luci/admin/status/iptables
// @match        http://192.168.1.1/cgi-bin/luci/admin/status/iptables
// @icon         https://192.168.1.1/luci-static/bootstrap/favicon.png
// @grant        none
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js
// ==/UserScript==

(function () {
    /* jshint esversion: 6 */
    'use strict';

    const map = new Map();

    function sortMapByKey(map) {
        let keys = [];
        for (const [key, value] of map.entries()) {
            keys.push(key);
        }

        keys.sort();
        let sortedMap = new Map();
        for (const idx in keys) {
            sortedMap.set(keys[idx], map.get(keys[idx]));
        }

        return sortedMap;
    }

    function getSelectVal(byBame) {
        const currSelection = $('select[name="' + byBame + '"] option:selected').toArray().map(item => {
            return item.value;
        }).toString().split(/,/);
        return currSelection;
    }

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
    jquerify(false); // call me asap ... hope maybe one time ...
    var $ = window.$;

    (function (open) {
        XMLHttpRequest.prototype.open = function () {
            this.addEventListener("readystatechange", function () {
                if (this.readyState === 4 && this.status === 200 &&
                    !!this.responseText && this.responseText.length > 13) {

                    $("button:contains('Hide empty chains')").click();

                    // delete useless data
                    $('div[data-empty="true"]').remove();
                    $('td[data-title="Pkts."]:contains("0")').each(function () {
                        // remove empty content
                        if ($(this).text().match(/^\s*0\s*$/)) {
                            $(this).closest("tr").remove();
                        }
                    });
                    // collect data
                    $('td[data-title="Source"]:not(:contains("0.0.0.0/0"))').each(function () {
                        let dump = $(this).text();
                        if (map.get(dump) !== 's')
                            map.set(dump, 's');
                    });
                    $('td[data-title="Destination"]:not(:contains("0.0.0.0/0"))').each(function () {
                        let dump = $(this).text();
                        if (map.get(dump) !== 'd')
                            map.set(dump, 'd');
                    });
                    // present collected data
                    if (map.size > 0 && !$('select[name="ip_addr_src"]').length) {
                        let html = '<select multiple name="ip_addr_src" class="cbi-button" style="max-width:143px;margin-bottom:-8pt;" ';
                        html += ' title="Filter this content by selected ipaddress ...">\n';
                        html += '<option title="Remove selected filter ..." id="empty" value=""></option>\n';
                        for (const [key, value] of sortMapByKey(map).entries()) {
                            html += '<option title="Use this as filter ..." value="' + key + '">' + key + '</option>\n';
                        }
                        html += '</select>\n<span/>\n';
                        $(html).insertBefore($('button[data-hide-empty]'));
                    } else if (map.size > 0) {
                        const oldSelection = getSelectVal("ip_addr_src");
                        $('select[name="ip_addr_src"] > option').remove();
                        let html = '<option ' + (oldSelection.includes("") ? "selected" : "") + ' title="Remove selected filter ..." id="empty" value=""></option>\n';
                        for (const [key, value] of sortMapByKey(map).entries()) {
                            html += '<option ' + (oldSelection.includes(key) ? "selected" : "") + ' title="Use this as filter ..." value="' + key + '">' + key + '</option>\n';
                        }
                        $('select[name="ip_addr_src"]').append($(html));
                    }
                    // use picked ipaddress as filter
                    let filterIpAddrs = "";
                    getSelectVal("ip_addr_src").forEach(function (item) {
                        filterIpAddrs += ':not(:contains("' + item + '"))';
                    });
                    // do action with the selection data
                    if (!!filterIpAddrs && filterIpAddrs.length > 0) {
                        $('td[data-title="Source"]' + filterIpAddrs).closest("tr").remove();
                    }
                    // detect empty content
                    const allTableHasContent = $('div[data-empty="false"][data-chain]').toArray().map(item => {
                        return $(item).attr('data-chain');
                    }).filter((value, index, _arr) => _arr.indexOf(value) == index);

                    const filterTableHasContent = $('div[data-empty="false"] .table td[data-title="Source"]').toArray().map(item => {
                        return $(item).closest("div").attr('data-chain');
                    }).filter((value, index, _arr) => _arr.indexOf(value) == index); // << unique values

                    const diffTables = $(allTableHasContent).not(filterTableHasContent).get();
                    // console.log( " ~~~ [X] text >> " + diffTables );
                    // remove detected content
                    for (const idx in diffTables) {
                        $('div[data-chain="' + diffTables[idx] + '"]').remove();
                    }
                }
            }, false);
            open.apply(this, arguments);
        };
    })(XMLHttpRequest.prototype.open);

})();

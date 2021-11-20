// ==UserScript==
// @name         FILTER realtime firewall state on your router
// @namespace    http://openwrt.org/docs/guide-user/luci/start
// @updateURL    https://raw.githubusercontent.com/udoline/filter-conns-openwrt-router/main/scripts/tampermonkey/filter-iptable-content-openwrt-router.js
// @downloadURL  https://raw.githubusercontent.com/udoline/filter-conns-openwrt-router/main/scripts/tampermonkey/filter-iptable-content-openwrt-router.js
// @version      0.0.1
// @description  Filter some network traffic content over the firewall by ip-address or dns-name on your OpenWrt brick/router is running OpenWrt 21.02.0-rc3
// @author       udoline
// @match        https://192.168.1.1/cgi-bin/luci/admin/status/iptables
// @match        http://192.168.1.1/cgi-bin/luci/admin/status/iptables
// @icon         https://192.168.1.1/luci-static/bootstrap/favicon.png
// @grant        none
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js
// ==/UserScript==

(function() {
    'use strict';

    function jquerify( jquerified ){
    if(!(window.JQuery && window.Jquery.fn.jquery === '1')){
        let s = document.createElement('script');
        let m = "jquery/3.6.0";
        s.setAttribute('src','https://ajax.googleapis.com/ajax/libs/" + m + "/jquery.min.js');
        s.setAttribute('type','text/javascript');
        document.getElementsByTagName('head')[0].appendChild(s);
        jquerified = true;
        console.log("Web content is jquerified via " + m + " .. :" + (jquerified ? ")" : "("));
        return jquerified;
    }
}
jquerify( false ); // call me asap ... hope maybe one time ...
var $ = window.$;

(function(open) {
    XMLHttpRequest.prototype.open = function() {
        this.addEventListener("readystatechange", function( h ) {
            if (this.readyState === 4 && this.status === 200
                && !!this.responseText && this.responseText.length > 13) {

				$( "button:contains('Hide empty chains')" ).click();

                $( 'td[data-title="Pkts."]:contains("0")' ).each(function() {
                    // remove empty content
					if( $(this).text().match(/^\s*0\s*$/) ) {
						$(this).closest("tr").remove();
                    }
				});
            }
        }, false);
        open.apply(this, arguments);
    };
})(XMLHttpRequest.prototype.open);
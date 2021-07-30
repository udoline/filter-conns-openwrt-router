// ==UserScript==
// @name         FILTER realtime connections on your router
// @namespace    https://openwrt.org/docs/guide-user/luci/start
// @version      0.0.1
// @description  Filter some network traffic by ip-address or dns-name on your openwrt brick/router
// @author       udoline
// @match        http://192.168.1.1/cgi-bin/luci/admin/status/realtime/connections
// @match        https://192.168.1.1/cgi-bin/luci/admin/status/realtime/connections
// @match        http://openwrt.lan/cgi-bin/luci/admin/status/realtime/connections
// @match        https://openwrt.lan/cgi-bin/luci/admin/status/realtime/connections
// @grant        none
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js
// ==/UserScript==

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
jquerify( false ); // call me asap ... maybe one time ...

var $ = window.$;
var map = new Map();
var count = 0;

function sortMapByKey(map) {
    let keys = [];
    for ( const [key, value] of map.entries() ){
        keys.push( key );
    }
	
    keys.sort();
    let sortedMap = new Map();
    for (let i = 0; i < keys.length; i++) {
       sortedMap.set( keys[i], map.get(keys[i]) ) ;
    }
	
    return sortedMap;
}

(function(open) {
    XMLHttpRequest.prototype.open = function() {
        this.addEventListener("readystatechange", function( h ) {
            // console.log( h + " readystatechange ... " + this.readyState);
            if (this.readyState === 4 && this.status === 200
                && !!this.responseText && this.responseText.length > 13) {
                // console.log( h + " in " + "[event]'readystatechange' \n" + this.responseText );
                if( $('div > button[class*="toggle-lookups"]').text() === 'Enable DNS lookups' ) {
                    console.log( h + " in [event]'readystatechange' ... botton click: " + 'Enable DNS lookups');
                    $('div > button[class*="toggle-lookups"]').click();
                }
                let s = "";
                $('tr[class*="cbi-rowstyle"]').each(function( i ) { // before div
                    // console.log( i + ' .. ' + $(this).text() );
                    let $tds = $(this).find('td[class*="col-7"]'); // before div
                    let a = "", b = "", dump = "";
                    $.each( $tds, function( j ) {
                        if( j === 0 ) a = $(this).text().split( /:\d+$|:undefined/ )[0];
                        if( j === 1 ) {
                            let f = $(this).text().split( /\s*:\s*/ );
							// FILTER: remove unwants table contents of connections
                            b = f[0];
                            if( !!f[1] && ( (f[1] % 100) === 53 || (f[1] % 1000) === 443 ) ) {
                                $(this).closest("tr").remove();
                            }
                            // console.log( i + ' .. ' + f[0] + ' : ' + f[1]);
                        }
                    });
                    if( (
                        !a.match( /.*dynamic.kabel-deutschland.de.*|.*OpenWrt.*|.*a043.*/)
                        ||
                        b.match( /.*dynamic.kabel-deutschland.de.*|.*OpenWrt.*|.*a043.*/))
                       &&
                       ( a.match( /.*dynamic.kabel-deutschland.de.*|.*OpenWrt.*|.*a043.*/)
                        ||
                        !b.match( /.*dynamic.kabel-deutschland.de.*|.*OpenWrt.*|.*a043.*/))
                      ) {
						// FILTER: only in the portless connections are interested
                        dump = a + ' > ' + b;

                        // console.log( i + ' .. dump: ' + dump );
                        if( map.get(dump) !== 1 )
                            map.set(dump, 1);
                    }
                });

                let i = 1;
                for ( const [key, value] of sortMapByKey(map).entries() ) {
                    s += key + ", ";
                    if( i++ % 3 === 0 )
                        s += "\n";
                }

                $( '#dynamic' ).remove();

                let html = s.replace( /,/g, " ,<br>" );
                html = '<div id="dynamic" class="table" style="width:1100">' + html + '</div>';
                $( html ).insertBefore( '#connections' );

                // console.log( '\n[' + count + '] ' + html );
                if ( count++ % 10 === 0 )
                    map = new Map();
            }
        }, false);
        open.apply(this, arguments);
    };
})(XMLHttpRequest.prototype.open);

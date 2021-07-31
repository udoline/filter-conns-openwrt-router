# Filter the realtime network connections via web interface [Openwrt-LuCI](https://openwrt.org/docs/guide-user/luci/start)

The motivation is *not to filter directly* on the Openwrt (brick) router, because the resources should not be used for this. 
The data content is using via [Openwrt-LuCI](https://openwrt.org/docs/guide-user/luci/start) in the user web browser client.  
This a [Tampermonkey](https://tampermonkey.net/) custom user script that runs in your web browser client chrome or firefox as an extension or add-on that takes over the filtering of the resulting send network traffic via web interface [Openwrt-LuCI](https://openwrt.org/docs/guide-user/luci/start).

## How todo this

Get the Tampermonkey extension for the supported browsers:
- [Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo/)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)

## Quick install 

Please click the extensions options page on the topbar of your choose browser

![Screenshot](https://github.com/udoline/filter-conns-openwrt-router/blob/main/doc/screenshot/OpenWrt-luci-admin-status-realtime-connections.png)

Now create a new [Tampermonkey](https://tampermonkey.net/) custom user script

![Screenshot](https://github.com/udoline/filter-conns-openwrt-router/blob/main/doc/screenshot/Tampermonkey-UserScript-NEW.png)

And then copy the content into your local [Tampermonkey](https://tampermonkey.net/) custom user script

![Screenshot](https://github.com/udoline/filter-conns-openwrt-router/blob/main/doc/screenshot/Tampermonkey-UserScript-Content-Raw.png)

And now go to your Openwrt-LuCI for realtime connections and click F5 for reload the HTML-page

![Screenshot](https://github.com/udoline/filter-conns-openwrt-router/blob/main/doc/screenshot/OpenWrt-luci-admin-status-realtime-connections-additional-output.png)

Now you can still consuming new additional information about active connections
- portless relation
- filtered content by special ports *maybe unwants ...*

## License

The content of this repository is licensed under MIT.

Copyright (c) 2021 udoline (1995)

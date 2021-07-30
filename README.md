# Filter the realtime network connections via web interface [Openwrt-Luci](https://openwrt.org/docs/guide-user/luci/start)

The motivation is *not to filter directly* on the Openwrt (brick) router, because the resources should not be used for this. 
The data content is using via [Openwrt-Luci](https://openwrt.org/docs/guide-user/luci/start) in the user web browser client.  
This a [Tampermonkey](https://tampermonkey.net/) custom user script that runs in your web browser client chrome or firefox as an extension or add-on that takes over the filtering of the resulting send network traffic via web interface [Openwrt-Luci](https://openwrt.org/docs/guide-user/luci/start).

## How todo this

Get the Tampermonkey extension for the supported browsers:
- [Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo/)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)

## License

The content of this repository is licensed under MIT.

Copyright (c) 2021 udoline (1995)

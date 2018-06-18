# Chrome extension

![Theme until 2010](https://raw.githubusercontent.com/mdvanes/auto-accept/master/images/reload_ok128.png)

Periodically check if a page shows a dialog and automatically accept

* When activated on a tab, the plugin reloads the tab every {reloadTimer} ms
* After reloading, it will check if an element that matches {pageSelector} exists and checks if it has a value of {pageValue}
* If it matches, it will click the element that matches {buttonSelector}

These options can be configured on the plugin options page.

Note that the plugin must be activated on the target tab. It will only reload that tab until and it will reload until cancelled.

Uses https://materializecss.com 


## Developer notes

* Outside background.js log with ```chrome.extension.getBackgroundPage().console.log('Interval!');```
* Authoring: https://developer.chrome.com/extensions/getstarted

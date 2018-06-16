'use strict';

chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.sync.set({ color: '#3aa757' }, function () {
    console.log('The color is green.');
  });
  chrome.storage.sync.set({ isActive: false }, function () {
    console.log('Onload isActive is false');
  });
  chrome.storage.sync.set({ acceptCounter: 0 });
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            // pageUrl: { hostEquals: 'developer.chrome.com' },
            // Note: also set in manifest.json / permissions
            pageUrl: { schemes: ['https', 'file'] }, // TODO debug, should only be https
          })
        ],
        actions: [new chrome.declarativeContent.ShowPageAction()]
      }
    ]);
  });
});

let aaInterval;

// tab id is unique for browser session, tabs[0] is the initiating tab
function setIntervalOn(tabs) {
  console.log('%csetIntervalOn', 'color: green; font-weight: bold;', 'tabs:', tabs);
  const targetTabId = tabs[0].id;

  // Only run on tab where toggle was set to true, but can be turned off anywhere
  aaInterval = setInterval(() => {
    // Reload tab
    chrome.tabs.reload(targetTabId, {bypassCache: true}, () => {
      chrome.extension.getBackgroundPage().console.log('Interval!', targetTabId);
      // Note: timeout needed to run executeScript in this callback
      setTimeout(() => {
        // Click the element
        chrome.tabs.executeScript(
          targetTabId,
          // TODO button selector in options
          {code: 'document.querySelector(\'button\').click();'}, () => {
            chrome.storage.sync.get('isActive', data => {
              chrome.storage.sync.set({ acceptCounter: data + 1 }); // TODO show in options
            });
          });
      }, 100);
    });
  }, 2000); // TODO interval in options
}

//   // if (tab.url.indexOf("http://translate.google.hu/") > -1 &&
//   //   changeInfo.url === undefined){
//   //   chrome.tabs.executeScript(tabId, {file: "program.js"} );
//   // }
// });

// TODO page match in options
// TODO only run for  supplied tab

function setIntervalOff() {
  console.log('%csetIntervalOff', 'color: red; font-weight: bold;');
  clearInterval(aaInterval);
}

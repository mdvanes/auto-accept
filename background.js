'use strict';

chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.sync.set({
    isActive: false,
    acceptCounter: 0
  });
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

// TODO unravel Pyramid of Doom
// tab id is unique for browser session, tabs[0] is the initiating tab
function setIntervalOn(tabs) {
  console.log('%csetIntervalOn', 'color: green; font-weight: bold;', 'tabs:', tabs);
  const targetTabId = tabs[0].id;

  chrome.storage.sync.get([
    'reloadTimer',
    'buttonSelector',
    'pageSelector',
    'pageValue'], data => {

    if(!data.buttonSelector || data.buttonSelector === '') {
      alert('first set button selector in options');
      return;
    }
    if(!data.pageSelector || data.pageSelector === '') {
      alert('first set page selector in options');
      return;
    }
    if(!data.pageValue || data.pageValue === '') {
      alert('first set page value in options');
      return;
    }

    // Only run on tab where toggle was set to true, but can be turned off anywhere
    aaInterval = setInterval(() => {
      // First reload tab to see if the configured page is returned
      chrome.tabs.reload(targetTabId, {bypassCache: true}, () => {
        // Check if the element is available that indicates that this is the configured page
        chrome.tabs.executeScript(
          targetTabId,
          {
            // TODO susceptible to XSS
            code: `document.querySelector('${data.pageSelector}').innerText;`
          }, pageSelectorData => {
            // Only click if the configured page is visible
            if(pageSelectorData[0] === data.pageValue) {
              // Note: timeout needed to run executeScript in this callback
              setTimeout(() => {
                console.log('Accept!');
                // Click the element
                chrome.tabs.executeScript(
                  targetTabId,
                  {
                    // TODO susceptible to XSS
                    code: `document.querySelector('${data.buttonSelector}').click();`
                  }, () => {
                    chrome.storage.sync.get('acceptCounter', acceptCounterData => {
                      chrome.storage.sync.set({ acceptCounter: acceptCounterData.acceptCounter + 1 });
                    });
                  });
              }, 100);
            } else {
              console.log('Not on configured page');
            }
          });
      });
    }, data.reloadTimer);
  });
}

//   // if (tab.url.indexOf("http://translate.google.hu/") > -1 &&
//   //   changeInfo.url === undefined){
//   //   chrome.tabs.executeScript(tabId, {file: "program.js"} );
//   // }
// });

function setIntervalOff() {
  console.log('%csetIntervalOff', 'color: red; font-weight: bold;');
  clearInterval(aaInterval);
}

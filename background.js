'use strict';

// addListener is excluded from chromeExtensionAsync, see https://github.com/KeithHenry/chromeExtensionAsync#event-listener-api
chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.sync.set({
    isActive: false,
    acceptCounter: 0
  });
  // Can't use this because switched to browserAction instead of pageAction in manifest.json
  // chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
  //   chrome.declarativeContent.onPageChanged.addRules([
  //     {
  //       conditions: [
  //         new chrome.declarativeContent.PageStateMatcher({
  //           // pageUrl: { hostEquals: 'developer.chrome.com' },
  //           // Note: also set in manifest.json / permissions
  //           pageUrl: { schemes: ['https', 'file'] }, // TODO debug, should only be https
  //         })
  //       ],
  //       actions: [new chrome.declarativeContent.ShowPageAction()]
  //     }
  //   ]);
  // });
});

function isOkProtocol(url, protocols) {
  return protocols.some(protocol => url.startsWith(`${protocol}://`) );
}

const acceptedProtocols = ['http', 'https', 'file'];
let aaInterval;

function simpleTimeout(delay) {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}

async function checkPageAndClick(targetTabId, data) {
  try {
    // Check if the element is available that indicates that this is the configured page
    const pageSelectorData = await chrome.tabs.executeScript(targetTabId, {
      // TODO susceptible to XSS
      code: `document.querySelector('${data.pageSelector}').innerText;`
    });

    // Only click if the configured page is visible
    if(pageSelectorData[0] === data.pageValue) {
      // Note: timeout needed to run executeScript in this callback
      await simpleTimeout(100);
      console.log('Accept!');

      // Click the element
      await chrome.tabs.executeScript(targetTabId, {
        // TODO susceptible to XSS
        code: `document.querySelector('${data.buttonSelector}').click();`
      });

      // Update the counter state and badge
      const acceptCounterData = await chrome.storage.sync.get('acceptCounter');
      const acceptCounter = acceptCounterData.acceptCounter + 1;
      await chrome.storage.sync.set({ acceptCounter });
      await chrome.browserAction.setBadgeText({text: `${acceptCounter}`});

      // Wait for page to load after submit
      await simpleTimeout(3000);
      // Because of service worker, it might be needed to submit one more time after succesful submit
      await chrome.tabs.executeScript( targetTabId, {
        // TODO susceptible to XSS
        code: `document.querySelector('${data.buttonSelector}').click();`
      });
    } else {
      console.log('Not on configured page');
    }
  } catch(err) {
    console.error(err);
  }
}

// tab id is unique for browser session, tabs[0] is the initiating tab
async function setIntervalOn(tabs) {
  console.log('%csetIntervalOn', 'color: green; font-weight: bold;', 'tabs:', tabs);
  const targetTabId = tabs[0].id;

  if(!isOkProtocol(tabs[0].url, acceptedProtocols)) {
    alert(`Only enabled for ${acceptedProtocols}`)
    return false;
  }

  try {
    // Do not destructure, but pass to checkPageAndClick
    const data = await chrome.storage.sync.get([
    'reloadTimer',
    'buttonSelector',
    'pageSelector',
        'pageValue']);

    if(!data.buttonSelector || data.buttonSelector === '') {
      alert('First set button selector in options');
      return false;
    }
    if(!data.pageSelector || data.pageSelector === '') {
      alert('First set page selector in options');
      return false;
    }
    if(!data.pageValue || data.pageValue === '') {
      alert('First set page value in options');
      return false;
    }

    await chrome.browserAction.setBadgeBackgroundColor({ color: [15, 160, 59, 255] });
    await chrome.browserAction.setBadgeText({text: '0'});
    await chrome.storage.sync.set({ acceptCounter: 0 });

    // Run once before interval, in case the target page is showing when the user enables the plugin
    await checkPageAndClick(targetTabId, data);

    // Only run on tab where toggle was set to true, but can be turned off anywhere
    aaInterval = setInterval(async () => {
      // First reload tab to see if the configured page is returned
      await chrome.tabs.reload(targetTabId, {bypassCache: true});
      await checkPageAndClick(targetTabId, data);
    }, data.reloadTimer);

  } catch(err) {
    console.error(err);
  }
}

//   // if (tab.url.indexOf("http://translate.google.hu/") > -1 &&
//   //   changeInfo.url === undefined){
//   //   chrome.tabs.executeScript(tabId, {file: "program.js"} );
//   // }
// });

function setIntervalOff() {
  console.log('%csetIntervalOff', 'color: red; font-weight: bold;');
  clearInterval(aaInterval);
  chrome.browserAction.setBadgeText({text: ''}); // remove badge
}

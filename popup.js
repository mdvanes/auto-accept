let activeToggle = document.getElementById('activeToggle');

chrome.storage.sync.get('isActive', function(data) {
    chrome.extension.getBackgroundPage().console.log('get isactive', data);
    if(data.isActive) {
        activeToggle.setAttribute('checked', true);
    } else {
        activeToggle.removeAttribute('checked');
    }
});

activeToggle.onclick = function(event) {
  chrome.storage.sync.set({ isActive: event.target.checked }, function () {
    if(event.target.checked) {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const result = chrome.extension.getBackgroundPage().setIntervalOn(tabs);
        // If invalid (e.g. not on https), turn off (result must be false, not undefined)
        if(result === false) {
          chrome.storage.sync.set({ isActive: false });
        }
      });
    } else {
      chrome.extension.getBackgroundPage().setIntervalOff();
    }
  });
};

// TODO is this the target page?
// TODO does it work when the target page is not the active tab?

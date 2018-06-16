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
        chrome.extension.getBackgroundPage().setIntervalOn(tabs);
      });
    } else {
      chrome.extension.getBackgroundPage().setIntervalOff();
    }
  });
};

// TODO is this the target page?
// TODO does it work when the target page is not the active tab?

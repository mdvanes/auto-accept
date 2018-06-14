let changeColor = document.getElementById('changeColor');
let activeToggle = document.getElementById('activeToggle');
let xInterval;

chrome.storage.sync.get('color', function(data) {
  changeColor.style.backgroundColor = data.color;
  changeColor.setAttribute('value', data.color);
});

changeColor.onclick = function(element) {
    let color = element.target.value;
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.executeScript(
          tabs[0].id,
          {code: 'document.body.style.backgroundColor = "' + color + '";'});
    });
  };

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
    chrome.extension.getBackgroundPage().console.log("click isActive is ", event.target.checked);
    if(event.target.checked) {
      // TODO interval breaks when popup is closed. Move to chrome.extension.getBackgroundPage().setInterval and supply tabs[0].id or something
      xInterval = setInterval(() => {
        chrome.extension.getBackgroundPage().console.log("Interval!");
      }, 2000)
    } else {
      clearInterval(xInterval);
    }
  });
}

// TODO is active on?
// TODO is this the target page?
// TODO does it work when the target page is not the active tab?
// TODO periodically log check
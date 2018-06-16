let activeToggle = document.getElementById('activeToggle');
let buttonSelector = document.getElementById('buttonSelector');
let pageSelector = document.getElementById('pageSelector');
let pageValue = document.getElementById('pageValue');

function constructOptions() {
  chrome.storage.sync.get([
    'acceptCounter',
    'reloadTimer',
    'isActive',
    'buttonSelector',
    'pageSelector',
    'pageValue'
  ], data => {
    document.getElementById('counter').innerText = data.acceptCounter;
    document.getElementById('reloadTimer').value = data.reloadTimer;
    buttonSelector.value = data.buttonSelector;
    pageSelector.value = data.pageSelector;
    pageValue.value = data.pageValue;
    if(data.isActive) {
      activeToggle.setAttribute('checked', true);
    } else {
      activeToggle.removeAttribute('checked');
    }
    M.updateTextFields();
  });

  // TODO deduplicate code with popup.js
  activeToggle.onclick = event => {
      if(event.target.checked) {
        alert('Can only be enabled on target tab by top menu button');
        return false;
      } else {
        chrome.storage.sync.set({ isActive: event.target.checked }, () => {
          chrome.extension.getBackgroundPage().setIntervalOff();
        });
      }
  };

  buttonSelector.onchange = event => {
    chrome.storage.sync.set({ buttonSelector: event.target.value });
  };

  pageSelector.onchange = event => {
    chrome.storage.sync.set({ pageSelector: event.target.value });
  };

  pageValue.onchange = event => {
    chrome.storage.sync.set({ pageValue: event.target.value });
  };

  chrome.storage.onChanged.addListener(changes => {
    console.log('a0', changes);
    if(changes.acceptCounter) {
      document.getElementById('counter').innerText = changes.acceptCounter.newValue;
    }
    if(changes.reloadTimer) {
      document.getElementById('reloadTimer').value = changes.reloadTimer.newValue;
    }
    if(changes.buttonSelector) {
      buttonSelector.value = changes.buttonSelector.newValue;
    }
    if(changes.pageSelector) {
      pageSelector.value = changes.pageSelector.newValue;
    }
    if(changes.pageValue) {
      pageValue.value = changes.pageValue.newValue;
    }
    if(changes.isActive) {
      //console.log('a1', changes.isActive.newValue)
      if(changes.isActive.newValue) {
        //console.log('a2', changes.isActive.newValue, activeToggle)
        activeToggle.setAttribute('checked', 'checked');
      } else {
        activeToggle.removeAttribute('checked');
      }
    }
  })
}
constructOptions();

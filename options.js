let page = document.getElementById('buttonDiv');
let activeToggle = document.getElementById('activeToggle');
const kButtonColors = ['#3aa757', '#e8453c', '#f9bb2d', '#4688f1'];
function constructOptions(kButtonColors) {
  for (let item of kButtonColors) {
    let button = document.createElement('button');
    button.style.backgroundColor = item;
    button.addEventListener('click', function() {
      chrome.storage.sync.set({color: item}, function() {
        console.log('color is ' + item);
      })
    });
    page.appendChild(button);
  }

  chrome.storage.sync.get(['acceptCounter', 'reloadTimer', 'isActive'], data => {
    document.getElementById('counter').innerText = data.acceptCounter;
    document.getElementById('reloadTimer').value = data.reloadTimer;
    if(data.isActive) {
      activeToggle.setAttribute('checked', true);
    } else {
      activeToggle.removeAttribute('checked');
    }
  });

  // TODO deduplicate code with popup.js
  activeToggle.onclick = event => {
    chrome.storage.sync.set({ isActive: event.target.checked }, () => {
      if(event.target.checked) {
        alert('Can only be enabled on target tab by top menu button');
        // chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        //   chrome.extension.getBackgroundPage().setIntervalOn(tabs);
        // });
      } else {
        chrome.extension.getBackgroundPage().setIntervalOff();
      }
    });
  };

  chrome.storage.onChanged.addListener(changes => {
    console.log(changes);
    if(changes.acceptCounter) {
      document.getElementById('counter').innerText = changes.acceptCounter.newValue;
    }
    if(changes.reloadTimer) {
      document.getElementById('reloadTimer').value = changes.reloadTimer.newValue;
    }
    if(changes.isActive) {
      if(changes.isActive.newValue) {
        activeToggle.setAttribute('checked', true);
      } else {
        activeToggle.removeAttribute('checked');
      }
    }
  })
}
constructOptions(kButtonColors);

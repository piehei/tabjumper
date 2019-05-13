chrome.runtime.onInstalled.addListener(function() {
  console.log('back.js onInstalled');
});

let appTab = null;

function activate(tab, notFoundCallback) {
  chrome.windows.update(tab.windowId, { focused: true }, (res) => {})
  chrome.tabs.update(tab.id, { highlighted: true, active: true }, (res) => {
    if (!res) {
      console.log('tab not found -> notFoundCallback');
      notFoundCallback();
    }
  })
  chrome.tabs.sendMessage(tab.id, { type: 'activated' });
}

let tabHistory = [];
let hIndex = 0;
let travelling = false;

function save() {
  chrome.storage.local.set({ tabHistory }, () => undefined);
}

chrome.storage.local.get(['tabHistory'], function(result) {
  console.log(result);
  if (result.tabHistory) {
    result.tabHistory.forEach(e => tabHistory.push(e));
    hIndex = tabHistory.length - 1;
  }
});

const compareTabs = (a, b) => {
  return a && a.windowId === b.windowId && a.tabId === b.tabId;
}



chrome.windows.onFocusChanged.addListener(windowId => {
  if (windowId === -1) return; // dev tools
  chrome.windows.getCurrent({ populate: true }, (res) => {
    const tab = res.tabs.filter(t => t.active === true)[0];
    tabActivatedHandler({ tabId: tab.id, windowId: tab.windowId });
  })
})

chrome.tabs.onActivated.addListener(tabActivatedHandler);

function tabActivatedHandler(tab) {
  if (travelling || compareTabs(tabHistory[tabHistory.length-1], tab)) {
    // console.log('skipping push to history');
    travelling = false;
    log();
    return;
  }
  tabHistory.push(tab);
  hIndex = tabHistory.length - 1;
  save();
  console.log('pushed to history');
  log();
}


const log = () => {
  // console.log(tabHistory.map((t, i) => {
  //   const c = i === hIndex ? '*' : '';
  //   return `${c}${t.windowId}-${t.tabId}${c}`;
  // }));
  console.log(`${hIndex}/${tabHistory.length}`);
}

const reset = () => {
  tabHistory = [];
  hIndex = 0;
}

const removeIndxFromHistory = (indx) => {
  const tab = tabHistory[indx];
  removeTabFromHistory(tab.tabId);
  save();
}

chrome.runtime.onMessage.addListener(function(message) {
  switch(message.type) {
    case 'activate':
      activate(message.tab);
      break;
    case 'removeIndxFromHistory':
      removeIndxFromHistory(message.indx);
      break;
    default:
      throw new Error('message handler not found for', message);
  }
})

const handleCommand = () => {
  if (!appTab) {
    chrome.tabs.create({
      active: true,
      url: 'tabJump.html'
    }, (newTab) => {
      appTab = newTab;
    })
  } else {
    activate(appTab);
  }
};

const travelHistory = (delta) => {
  // log();
  const maxLen = tabHistory.length - 1;
  hIndex += delta;

  if (hIndex < 0) {
    hIndex = 0;
    console.log('history::start');
    return;
  }
  if (hIndex > maxLen) {
    hIndex = maxLen;
    console.log('history::end');
    return;
  }

  const tab = tabHistory[hIndex];
  travelling = true;
  const travelAgain = () => travelHistory(delta);
  activate({ id: tab.tabId, windowId: tab.windowId }, travelAgain);
  // log();
}

chrome.commands.onCommand.addListener(cmd => {
  switch(cmd) {
    case 'prev-tab':
      travelHistory(-1);
      break;
    case 'next-tab':
      travelHistory(1);
      break;
    case 'toggle':
      handleCommand();
      break;
    default:
      throw new Error('no handler found for cmd');
  }
})

const removeTabFromHistory = (tabId) => {
  const removeIndx = tabHistory.findIndex(t => t.tabId === tabId);
  if (removeIndx > -1) {
    tabHistory = tabHistory.filter(t => t.tabId !== tabId);
    if (removeIndx <= hIndex) {
      hIndex -= 1;
    }
  }
}

chrome.tabs.onRemoved.addListener(tabId => {
  removeTabFromHistory(tabId);
  save();
  if (appTab && appTab.id === tabId) {
    appTab = null;
  }
})

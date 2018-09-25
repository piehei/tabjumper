
let appTab = null;

function activate(tab) {
  console.log('activating previous tab');
  chrome.windows.update(tab.windowId, { focused: true })
  chrome.tabs.update(tab.id, { highlighted: true, active: true })
  chrome.tabs.sendMessage(tab.id, { type: 'activated' });
}


chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  console.log('back.js')
  console.log(message)
  console.log(sender)
  if (message.type === 'activate') {
    activate(message.tab);
    return;
  }
})

const handleCommand = () => {
  console.log('COMMAND CALLED');
  if (!appTab) {
    console.log('PREV TAB NOT FOUND')
    chrome.tabs.create({
      active: true,
      url: 'tabJump.html'
    }, (newTab) => {
      console.log('CREATED');
      console.log(newTab);
      appTab = newTab;
    })
  } else {
    console.log('PREV TAB: found!!!!!!!!!!!!')
    activate(appTab);
  }
};



chrome.commands.onCommand.addListener(cmd => {
  handleCommand();
})

chrome.tabs.onRemoved.addListener((tabId, obj) => {
  console.log('onRemoved listener');
  console.log(tabId)
  console.log(obj)
  if (appTab && appTab.id === tabId) {
    console.log('appTab closed')
    appTab = null;
  }
})

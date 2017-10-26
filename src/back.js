

function activate(tab) {

  console.log('activate')
  console.log(tab)
  console.log(tab.id)
  chrome.windows.update(tab.windowId, { focused: true })
  chrome.tabs.update(tab.id, { highlighted: true, active: true })
}


chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  console.log('back.js')
  console.log(message)
  console.log(sender)

  if (message.type === 'activate') {
    activate(message.tab);
    return;
  }
  
  chrome.tabs.insertCSS(sender.tab.id, {
    file: "css.css"
  })

  chrome.tabs.query({}, function(tabs) {
    console.log(tabs)
    chrome.tabs.sendMessage(sender.tab.id, {"tabs": tabs})
    // sendResponse(tabs)
  })
})

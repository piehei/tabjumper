
let previousTab = null;

function activate(tab) {
  try {
    chrome.windows.update(tab.windowId, { focused: true })
    chrome.tabs.update(tab.id, { highlighted: true, active: true })
    chrome.tabs.sendMessage(tab.id, { type: 'activated' });
  } catch(e) {
    console.log('catch in activate');
    console.log(e);
    previousTab = null;
    handleCommand();
  }
}


chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  console.log('back.js')
  console.log(message)
  console.log(sender)

  if (message.type === 'activate') {
    activate(message.tab);
    return;
  }
//
//   // chrome.tabs.insertCSS(sender.tab.id, {
//   //   file: "css.css"
//   // })
//
//   chrome.tabs.query({}, function(tabs) {
//     console.log(tabs)
//     chrome.tabs.sendMessage(sender.tab.id, {"tabs": tabs})
//   })
})

const handleCommand = () => {
  console.log('COMMAND CALLED');
  if (!previousTab) {
    console.log('PREV TAB NOT FOUND')
    chrome.tabs.create({
      active: true,
      url: 'tabJump.html'
    }, (newTab) => {
      console.log('CREATED');
      console.log(newTab);
      previousTab = newTab;
    })
  } else {
    console.log('PREV TAB: found!!!!!!!!!!!!')
    activate(previousTab);
  }
};



chrome.commands.onCommand.addListener(cmd => {
  handleCommand();
})

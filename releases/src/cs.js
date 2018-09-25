function makeList(tabs) {

  const list = [];
  list.push('<ul class="__tabs__ul">');

  tabs.forEach((t, i, arr) => {
    console.log(i)
    list.push(`<li class="__tabs_li ${i === __TABS.down ? '__tabs_selected' : ''}">
              ${t.title} (${t.url})</li>`);
  })

  list.push('</ul>');
  console.log(list)
  return list.join("");
}

function handleInputVal(value) {
  __TABS.matches = [];
  console.log('value:')
  console.log(value)

  if (value.length > 0) {
    window.__TABS.tabs.forEach(tab => {
      if (tab.title.indexOf(value) > -1 || tab.url.indexOf(value) > -1) {
        __TABS.matches.push(tab);
        console.log(tab)
      }
    })
  } else {
    __TABS.matches = __TABS.tabs.slice();
  }

  __TABS.matches_container.innerHTML = makeList(__TABS.matches);
}

function createSearch(tabs) {
  window.__TABS = {};

  __TABS.running = true;
  __TABS.down = 0;
  __TABS.up = 0;

  __TABS.tabs = tabs;
  const div = document.createElement('div');
  div.id = "__tabs_container";

  __TABS.container = div;

  const input = document.createElement('input');
  input.id = "__tabs_input";
  div.appendChild(input)

  __TABS.input = input;

  const matches_container = document.createElement('div');
  matches_container.id = "__tabs__matches_container"; div.appendChild(matches_container);
  __TABS.matches_container = matches_container;

  // tällä hoidetaan valinta
  input.addEventListener('keydown', (evt) => {
    console.log('inputListener');
    if (evt.key !== "Enter") {
      return;
    }
    const tab = __TABS.matches[__TABS.down];
    console.log(`sending to: ${tab.url}`)

    chrome.runtime.sendMessage({ type: 'activate', tab: tab })
    close();
  })

  // listan päivitys
  input.addEventListener('input', (evt) => {
    handleInputVal(__TABS.input.value)
  })

  // nuolinäppäimet
  input.addEventListener('keydown', (evt) => {
    if (evt.key === 'ArrowDown') {
      evt.preventDefault()
      __TABS.down += 1;
      __TABS.down = __TABS.down % __TABS.matches.length;
      handleInputVal(__TABS.input.value);
    }

    if (evt.key === 'ArrowUp') {
      __TABS.down -= 1;
      evt.preventDefault()
      if (__TABS.down === -1) {
        __TABS.down = __TABS.matches.length - 1;
      }
      handleInputVal(__TABS.input.value);
    }
  })


  document.body.appendChild(div)

  __TABS.input.focus()
  handleInputVal('');
}


function popup(tabs) {
  console.log(tabs)

  const l = document.createElement("link");
  l.rel = "stylesheet";
  l.type = "text/css";
  l.href = chrome.extension.getURL("css.css")
  console.log(l);
  document.head.appendChild(l)


  createSearch(tabs)

  //chrome.runtime.getURL('/vue.html')
}

// chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
//   if (EXTENSION_PAGE) {
//     initVueApp(message.tabs);
//   } else {
//     popup(message.tabs)
//   }
// })



function initVueApp() {
  console.log('initializing Vue App');
  import('./App.js').then(module => {
    new Vue(module.default)
  })
}



function close() {
  if (__TABS.running) {
    document.body.removeChild(__TABS.container);
    __TABS = {};
  }
}

function start() {
  // chrome.runtime.sendMessage({ "j": "1" })
  console.log('start is a no-op...');
}

let prevTs = 0;

window.EXTENSION_PAGE = document.location.href.includes("chrome-extension");

if (EXTENSION_PAGE) {
  console.log('loaded on extension page --> starting');
  initVueApp();
} else {
  console.log('loaded on random page --> listening');

  document.addEventListener('keydown', (evt) => {

  if (evt.key === "Escape" && '__TABS' in window) {
    close();
  }

  if (evt.target.tagName !== "BODY" && !evt.shiftKey) {
    //console.log('ei käsitellä');
    return;
  }

  if (evt.key !== 'j' && evt.key !== 'J') {
    return;
  }

  const time = window.performance.now();

  if (time - prevTs > 1000) {
    prevTs = time;
    return;
  }
  console.log('calling START()  from cs.js')
  start();

})
}

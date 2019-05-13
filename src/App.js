export default {
  name: 'App',
  el: '#app',
  data() {
    return {
      msg: 'msgmsg',
      text: '',
      originalTabs: [],
      tabNum: 0,
      windowNum: 0,
      sIndex: 0,
      showHistory: false,
      tabHistory: [],
      detailedHistory: [],
    }
  },
  watch: {
    text: (nText) => {
      console.log(nText);
      chrome.history.search({ text: nText }, (results) => {
        console.log('QUERY RESULTS');
        console.log(results);
      })
    }
  },
  mounted() {
    console.log('mounted App.vue');
    chrome.storage.local.get(['tabHistory'], (result) => {
      console.log(result);
      this.tabHistory = result.tabHistory;
      chrome.tabs.query({}, (tabs) => {
        this.detailedHistory = this.tabHistory.map(ht => tabs.find(t => t.id === ht.tabId)).filter(t => t);
      });
    });


    this.updateTabs();

    this.$nextTick(() => {
      console.log(this.$refs)
      this.$refs.input.focus()
    })

    window.document.addEventListener('keyup', this.nextItem);
    window.document.addEventListener('visibilitychange', (evt) => {
      console.log('VUE:: vis change')
    })

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log('VUE:: msg');
      console.log(message);
      if (message.type === 'activated') {
        this.updateTabs();
        this.$refs.input.focus();
        this.text = '';
        this.sIndex = 0;
      }
    })


  },
  computed: {
    tabs() {
      if (this.text === '') {
        return this.originalTabs;
      }

      const comp = this.text.toLowerCase();

      const urlStart = this.originalTabs.filter(tab => tab.simpleUrl.startsWith(comp));
      const urlIncludes = this.originalTabs
        .filter(tab => tab.simpleUrl.includes(comp))
        .sort((t1, t2) => t1.simpleUrl.indexOf(comp) - t2.simpleUrl.indexOf(comp))

      const titleStart = this.originalTabs.filter(tab => tab.simpleTitle.startsWith(comp));
      const titleIncludes = this.originalTabs
        .filter(tab => tab.simpleTitle.includes(comp))
        .sort((t1, t2) => t1.simpleTitle.indexOf(comp) - t2.simpleTitle.indexOf(comp))

      const candidates = []
        .concat(urlStart)
        .concat(urlIncludes)
        .concat(titleStart)
        .concat(titleIncludes)

      return this.unique(candidates)
    },
  },
  methods: {
    travelHistory(indx) {
      // const travelTo = this.tabHistory.length - indx;
    },
    removeFromHistory(indx) {
      chrome.runtime.sendMessage({
        type: 'removeIndxFromHistory',
        indx: this.detailedHistory.length - 1 - indx,
      });
    },
    unique(arr) {
      return arr.filter((value, index, array) => array.indexOf(value) === index)
    },

    updateTabs() {
      console.log('VUE:: updateTabs');
      chrome.tabs.query({}, (tabs) => {
        console.log('VUE:: tabs received');
        this.originalTabs = tabs
          .filter(tab => !tab.url.includes("tabJump.html"))
          .map(tab => Object.assign({}, tab, {
            simpleUrl: this.formatUrl(tab.url),
            simpleTitle: tab.title.toLowerCase().replace(" ", "")
          }))

        this.tabNum = this.originalTabs.length;
        this.windowNum = this.originalTabs.map(t => t.windowId).filter((v, i, a) => a.indexOf(v) === i).length;
      })
    },

    formatUrl(url) {
      let sUrl = url;
      if (url.includes("chrome-extension") && url.includes("&uri")) {
        sUrl = url.split("&uri=")[1];
      }
      return sUrl.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "");
    },

    nextItem(evt) {
      // up
      if (evt.keyCode === 38) {
        this.sIndex -= 1;
        if (this.sIndex < 0) {
          this.sIndex = this.tabs.length - 1;
        }

      // down
      } else if (evt.keyCode === 40) {
        this.sIndex += 1;
        if (this.sIndex === this.tabs.length) {
          console.log(this.tabs.length);
          this.sIndex = 0;
        }

      // enter
      } else if (evt.keyCode === 13) {
        this.chooseTab(this.tabs[this.sIndex]);
      }
    },

    chooseTab(tab) {
      console.log('chooseTab');
      console.log(tab);

      chrome.runtime.sendMessage({
        type: 'activate',
        tab: tab
      });
    },

  }
}

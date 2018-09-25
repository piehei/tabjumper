export default {
  name: 'App',
  el: '#app',
  data() {
    return {
      msg: 'msgmsg',
      text: '',
      originalTabs: [],
      sIndex: 0,
    }
  },
  mounted() {
    console.log('mounted App.vue');

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
      const startsWith = this.originalTabs.filter(tab => tab.simpleUrl.startsWith(this.text));
      const includes = this.originalTabs
        .filter(tab => !startsWith.map(t => t.simpleUrl).includes(tab.simpleUrl))
        .filter(tab => tab.simpleUrl.includes(this.text))
        .sort((t1, t2) => t1.simpleUrl.indexOf(this.text) - t2.simpleUrl.indexOf(this.text))

      return [].concat(startsWith).concat(includes);
    },
  },
  methods: {

    updateTabs() {
      console.log('VUE:: updateTabs');
      chrome.tabs.query({}, (tabs) => {
        console.log('VUE:: tabs received');
        this.originalTabs = tabs
          .filter(tab => !tab.url.includes("tabJump.html"))
          .map(tab => Object.assign({}, tab, { simpleUrl: this.formatUrl(tab.url) }))
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
        this.chooseTab();
      }
    },

    chooseTab() {
      console.log('chooseTab');
      const tab = this.tabs[this.sIndex];
      console.log(tab);

      chrome.runtime.sendMessage({
        type: 'activate',
        tab: tab
      });
    },

  }
}

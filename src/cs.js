(function initVueApp() {
  import('./App.js').then(module => {
    new Vue(module.default)
  })
}());

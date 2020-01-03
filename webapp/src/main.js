import Vue from 'vue'
import App from './App.vue'
import Snotify from 'vue-snotify';
// Import the router
import router from './router';
// Import the store
import store from './store';
import './registerServiceWorker';

// Vue snotify
Vue.use(Snotify);

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
  created () {
    store.dispatch("loadCurrentSession")
    store.dispatch("loadProducts")
  },
  store,
  router
}).$mount('#app')

// any CSS you require will output into a single css file (app.css in this case)
require('../css/app.css');

import Vue from "vue";
import App from "../vue/App";
import store from "../js/store";

new Vue({
    template: '<App/>',
    components: { App },
    store
}).$mount('#app');

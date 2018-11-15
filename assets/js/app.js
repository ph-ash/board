// any CSS you require will output into a single css file (app.css in this case)
require('../css/app.css');

import Vue from "vue";
import App from "../vue/App";
import store from "../js/store";

new Vue({
    template: '<App :url="url" :realm="realm"/>',
    data() {
        return {
            url: "",
            realm: ""
        }
    },
    components: { App },
    store,
    beforeMount() {
        this.url = this.$el.dataset.url;
        this.realm = this.$el.dataset.realm;
    }
}).$mount('#app');

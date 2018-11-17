// any CSS you require will output into a single css file (app.css in this case)
import Vue from "vue";
import App from "../vue/App";
import store from "../js/store";

require("../css/app.css");

new Vue({
    components: { App },
    data() {
        return {
            url: "",
            realm: ""
        };
    },
    beforeMount() {
        this.url = this.$el.dataset.url;
        this.realm = this.$el.dataset.realm;
    },
    template: '<App :url="url" :realm="realm"/>',
    store
}).$mount("#app");

// any CSS you require will output into a single css file (app.css in this case)
import Vue from "vue";
import VueRouter from "vue-router";
import App from "../vue/App";
import store from "../js/store";

require("../css/app.css");
require("../css/bootstrap.min.css");

Vue.use(VueRouter);

const router = new VueRouter({
    routes: [
        { path: '*', component: App }
    ]
});

new Vue(
    {
        router,
        components: { App },
        data() {
            return {
                url: "",
                realm: "",
                password: ""
            };
        },
        beforeMount() {
            this.url = this.$el.dataset.url;
            this.realm = this.$el.dataset.realm;
            this.password = this.$el.dataset.password;
        },
        template: '<App :url="url" :realm="realm" :password="password"/>',
        store
    }
).$mount("#app");

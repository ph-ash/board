// any CSS you require will output into a single css file (app.css in this case)
require('../css/app.css');

import {Client} from "thruway.js";
import Vue from "vue";

const wamp = new Client('ws://localhost:8080', 'realm1');

new Vue({
    el: '#app',
    data() {
        return {
            message: "Hello Vue"
        }
    },
    mounted() {
        wamp.topic('foo').subscribe((v) => this.message = v.args.join('|'));
    }
});

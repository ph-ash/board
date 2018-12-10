import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        websocketConnected: false
    },
    mutations: {
        websocketConnected: state => {
            state.websocketConnected = true;
        },
        websocketDisconnected: state => {
            state.websocketConnected = false;
        }
    },
    actions: {
        webSocketConnected({ commit }) {
            commit("websocketConnected");
        },
        webSocketDisconnected({ commit }) {
            commit("websocketDisconnected");
        }
    }
});

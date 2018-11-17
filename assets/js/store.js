import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        websocketConnected: false,
        monitorings: {}
    },
    mutations: {
        "websocketConnected"(state) {
            state.websocketConnected = true;
        },
        "websocketDisconnected"(state) {
            state.websocketConnected = false;
        },
        "updateMonitoring"(state, data) {
            Vue.set(state.monitorings, data.id, data);
        }
    },
    actions: {
        webSocketConnected({ commit }) {
            commit("websocketConnected");
        },
        webSocketDisconnected({ commit }) {
            commit("websocketDisconnected");
        },
        updateMonitoring({ commit }, data) {
            commit("updateMonitoring", data);
        }
    }
});

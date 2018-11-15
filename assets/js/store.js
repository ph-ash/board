import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        websocketConnected: false,
        message: "Hello Vue Store"
    },
    mutations: {
        ['receiveMessage'](state, message) {
            state.message = message
        },
        ['websocketConnected'](state) {
            state.websocketConnected = true
        },
        ['websocketDisconnected'](state) {
            state.websocketConnected = false
        }
    },
    actions: {
        doReceiveMessage ({commit}, message) {
            commit('receiveMessage', message)
        },
        webSocketConnected ({commit}) {
            commit('websocketConnected')
        },
        webSocketDisconnected ({commit}) {
            commit('websocketDisconnected')
        }
    }
});

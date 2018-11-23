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
    },
    getters: {
        gridSize: state => {
            // const count = Object.keys(state.monitorings).length;
            const count = 1000;
            if (count <= 1) {
                return {width: 1, height: 1}
            }

            let sqrt = Math.sqrt(count / 2),
                width = Math.ceil(sqrt) * 2,
                height = Math.floor(sqrt);

            if (width * height < count) {
                height += 1;
            }
            return {width, height}
        }
    }
});

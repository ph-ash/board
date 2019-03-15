import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        websocketConnected: false,
        detailedMessage: "",
        initializingBoard: true,
        firstRender: true
    },
    mutations: {
        websocketConnected: state => {
            state.websocketConnected = true;
            state.detailedMessage = "";
        },
        websocketDisconnected: state => {
            state.websocketConnected = false;
            state.initializingBoard = true;
            state.firstRender = true;
        },
        webSocketUnreachable: (state, detailedMessage) => {
            state.detailedMessage = detailedMessage;
        },
        boardInitialized: state => {
            state.initializingBoard = false
        },
        firstRenderCompleted: state => {
            state.firstRender = false
        }
    },
    actions: {
        webSocketConnected({ commit }) {
            commit("websocketConnected");
        },
        webSocketDisconnected({ commit }) {
            commit("websocketDisconnected");
        },
        webSocketUnreachable({ commit }, detailedMessage) {
            commit("webSocketUnreachable", detailedMessage);
        },
        firstRenderCompleted({ commit }) {
            commit("firstRenderCompleted");
        },
        boardInitialized({ commit }) {
            commit("boardInitialized");
        }
    },
    getters: {
        showOverlay: state => {
            return !state.websocketConnected || state.initializingBoard || state.firstRender
        },
        overlayStatus: state => {
            if (!state.websocketConnected) {
                return "connecting to websocket server" + state.detailedMessage
            } else if (state.initializingBoard) {
                return "intializing board"
            } else if (state.firstRender) {
                return "preparing intial rendering"
            }
            return ""
        }
    }
});

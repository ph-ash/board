<template>
    <div class="board">
        <p v-if="!websocketConnected">KEINE VERBINDUNG! // TODO: fancy</p>
        <tile
            v-for="monitoring in monitorings"
            :key="monitoring.id"
            :monitoring-data="monitoring"
            :now="now"
            :style="cssProps"
        />
        <p v-if="Object.keys(monitorings).length === 0">LEER! // TODO: fancy</p>
    </div>
</template>

<script>
import { mapState } from "vuex";
import { Client, WebSocketTransport } from "thruway.js";
import Tile from "./Tile";

export default {
    name: "App",
    components: {
        "tile": Tile
    },
    props: [
        "url",
        "realm"
    ],
    data() {
        return {
            now: ""
        };
    },
    computed: {
        cssProps() {
            const grid = this.$store.getters.gridSize;
            return {
                "--grid-columns": grid.width,
                "--grid-rows": grid.height
            }
        },
        ...mapState(["monitorings", "websocketConnected"])
    },
    created() {
        this.updateNow();

        let self = this,
            ticker = 0;

        (function tickerLoop() {
            window.requestAnimationFrame(tickerLoop);
            ticker++;
            if (ticker > 60) { // ~ 60 fps
                self.updateNow();
                ticker = 0;
            }
        })();
    },
    mounted() {
        const ws = new WebSocketTransport(this.url, undefined, true),
            wamp = new Client(ws, this.realm);
        ws.onOpen.subscribe(() => this.$store.dispatch("webSocketConnected"));
        ws.onClose.subscribe(() => {
            if (this.$store.state.websocketConnected) {
                this.$store.dispatch("webSocketDisconnected");
            }
        });
        wamp.topic("phashtopic").subscribe((v) => this.$store.dispatch("updateMonitoring", JSON.parse(v.args[0])));
    },
    methods: {
        updateNow() {
            this.now = Date.now();
        }
    }
};
</script>

<style scoped>
    .board {
        height: 100%;
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        align-items: stretch;
        align-content: stretch;
        overflow: visible;
    }
</style>

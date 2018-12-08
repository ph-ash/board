<template>
    <div class="board">
        <p v-if="!websocketConnected">KEINE VERBINDUNG! // TODO: fancy</p>
        <treemap
            ref="treemap"
            :treeData="monitoringsAsTree" />
        <p v-if="Object.keys(monitorings).length === 0">LEER! // TODO: fancy</p>
    </div>
</template>

<script>
import Vue from "vue";
import { mapState } from "vuex";
import { Client, WebSocketTransport } from "thruway.js";
import Treemap from "./Treemap";

let cached = [];
let dirty = false;

export default {
    name: "App",
    components: {
        "treemap": Treemap
    },
    props: [
        "url",
        "realm"
    ],
    data() {
        return {
            now: "",
            monitorings: []
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
        monitoringsAsTree() {
            return {
                "name": "root",
                "children": this.monitorings.map(function(value) {
                    return {
                        "name": value.id,
                        "value": value.priority
                    }
                })
            };
        },
        ...mapState(["websocketConnected"])
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
        ws.onOpen.subscribe(() => {
            this.$store.dispatch("webSocketConnected");
            wamp.publish('phashtopic', 'boardAvailable');
        });
        ws.onClose.subscribe(() => {
            if (this.$store.state.websocketConnected) {
                this.$store.dispatch("webSocketDisconnected");
            }
        });
        wamp.topic("phashtopic").subscribe((v) => {
            let data = JSON.parse(v.args[0]);
            let index = cached.findIndex(v => v.id === data.id);
            if (index !== -1) {
                cached[index] = data;
            } else {
                cached.push(data);
            }
            dirty = true;
        });
    },
    methods: {
        updateNow() {
            this.now = new Date().getTime();
            if (dirty) {
                this.monitorings = cached.slice(0);
                dirty = false;
                Vue.nextTick(() => this.$refs.treemap.updateThisThing());
            }
        }
    }
};
</script>

<style scoped>
    .board {
        height: 100%;
        width: 100%;
        overflow: hidden;
    }
</style>

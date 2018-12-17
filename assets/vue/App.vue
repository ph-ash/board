<template>
    <div class="board">
        <p v-if="!websocketConnected">KEINE VERBINDUNG! // TODO: fancy</p>
        <p v-if="monitorings.length === 0">LEER! // TODO: fancy</p>
        <treemap
                ref="treemap"
                :treeData="monitoringsAsTree"
                :now="now"/>
    </div>
</template>

<script>
    import Vue from "vue"
    import {mapState} from "vuex"
    import {Client, WebSocketTransport} from "thruway.js"
    import moment from "moment"
    import Treemap from "./Treemap"

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
            monitoringsAsTree() {
                return {
                    "name": "Monitoring",
                    "now": this.now,
                    "children": this.monitorings.map(function (item) {
                        return {
                            "name": item.id,
                            "value": item.priority,
                            "status": item.status,
                            "threshhold": item.threshhold,
                            "payload": item.payload
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
                wamp.publish("phashcontrol", "boardAvailable");
                console.log("sent available");
            });

            ws.onClose.subscribe(() => {
                if (this.$store.state.websocketConnected) {
                    this.$store.dispatch("webSocketDisconnected");
                }
            });

            wamp.topic("phashcontrol").subscribe((v) => {
                console.log("received initial data")
            });

            wamp.topic("phashtopic").subscribe((v) => {
                let data = JSON.parse(v.args[0]),
                    index = cached.findIndex(v => v.id === data.id);

                data["threshhold"] = moment(data.date).add(data.idleTimeoutInSeconds, "s");

                if (index !== -1) {
                    cached[index] = data;
                } else {
                    cached.push(data);
                }
                console.log("dirty");
                dirty = true;
            });
        },
        methods: {
            updateNow() {
                this.now = new Date().getTime();
                if (dirty) {
                    this.monitorings = cached.slice(0);
                    Vue.nextTick(() => this.$refs.treemap.recalculateAndRender());
                    console.log("clean");
                    dirty = false;
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

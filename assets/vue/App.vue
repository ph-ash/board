<template>
    <div class="board">
        <div
                v-if="showOverlay"
                class="overlay">
            <div>
                <img src="../images/spinner.gif" alt="loading spinner"/>
                <p>{{ overlayStatus }}</p>
            </div>
        </div>
        <treemap
                ref="treemap"
                :treeData="monitoringsAsTree"
                :now="now"/>
    </div>
</template>

<script>
    import Vue from "vue"
    import {mapState, mapGetters} from "vuex"
    import {Client, WebSocketTransport} from "thruway.js"
    import moment from "moment"
    import Treemap from "./Treemap"

    let cached = [],
        dirty = false;

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
            ...mapState(["websocketConnected", "firstRender"]),
            ...mapGetters(["overlayStatus", "showOverlay"])
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
            });

            ws.onClose.subscribe(() => {
                if (this.$store.state.websocketConnected) {
                    this.$store.dispatch("webSocketDisconnected")
                }
            });

            wamp.topic("phashcontrol").subscribe((v) => {
                let data = JSON.parse(v.args[0]);
                if (data === "all data sent") {
                    this.$store.dispatch("boardInitialized")
                }
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
                dirty = true;
            });
        },
        methods: {
            updateNow() {
                this.now = new Date().getTime();
                if (dirty) {
                    this.monitorings = cached.slice(0);
                    Vue.nextTick(() => this.$refs.treemap.recalculateAndRender());
                    dirty = false;
                    if (this.$store.state.firstRender) {
                        this.$store.dispatch("firstRenderCompleted")
                    }
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

    .overlay {
        position: absolute;
        z-index: 10;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(255, 255, 255, 0.8);
        display: table;
    }

    .overlay div {
        display: table-cell;
        vertical-align: middle;
        text-align: center;
    }

    .overlay p {
        margin: 20px;
        background-color: white;
    }
</style>

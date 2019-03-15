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
                :now="now"
                v-on:delete="deleteMonitoring" />
    </div>
</template>

<script>
    import Vue from "vue"
    import {mapState, mapGetters} from "vuex"
    import autobahn from "autobahn"
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
            "realm",
            "password"
        ],
        data() {
            return {
                now: "",
                monitorings: [],
                conn: null
            };
        },
        computed: {
            monitoringsAsTree() {
                let root = {
                    "name": "Monitoring",
                    "now": this.now,
                    "children": []
                };
                this.buildTree(root, this.monitorings);
                return root;
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
            this.conn = new autobahn.Connection({
                url: this.url,
                realm: this.realm,
                authmethods: ["wampcra"],
                authid: "phash-board",
                onchallenge: (session, method, extra) => {
                    if (method === "wampcra") {
                        console.log("authenticating via '" + method + "' and challenge '" + extra.challenge + "'");
                        return autobahn.auth_cra.sign(this.password, extra.challenge);
                    } else {
                        throw "don't know how to authenticate using '" + method + "'";
                    }
                }
            });

            this.conn.onopen = (session, details) => {
                this.$store.dispatch("webSocketConnected");
                session.publish("phashcontrol", [JSON.stringify("boardAvailable")]);

                session.subscribe("phashcontrol", (args) => {
                    let data = JSON.parse(args[0]);
                    if (data === "all data sent") {
                        console.log(data);
                        this.$store.dispatch("boardInitialized")
                    }
                });

                session.subscribe("phashtopic.push", (args) => {
                    let data = JSON.parse(args[0]),
                        index = cached.findIndex(v => v.id === data.id);
                    data["threshold"] = moment(data.date).add(data.idleTimeoutInSeconds, "s");
                    if (index !== -1) {
                        cached[index] = data;
                    } else {
                        cached.push(data);
                    }
                    dirty = true;
                });

                session.subscribe("phashtopic.delete", (args) => {
                    let id = JSON.parse(args[0]),
                        index = cached.findIndex(v => v.id === id);
                    if (index !== -1) {
                        cached.splice(index, 1);
                    }
                    dirty = true;
                })
            };

            this.conn.onclose = (reason, details) => {
                if (reason === "unreachable" && this.$store.state.detailedMessage === "") {
                    this.$store.dispatch("webSocketUnreachable", " (please check if you can reach '" + this.url + "')")
                }
                if (reason === "lost" && this.$store.state.detailedMessage === "") {
                    this.$store.dispatch("webSocketUnreachable", " (lost connection to the server at '" + this.url + "')")
                }
                if (this.$store.state.websocketConnected) {
                    this.$store.dispatch("webSocketDisconnected")
                }
            };

            this.conn.open();
        },
        methods: {
            updateNow() {
                this.now = new Date().getTime();
                if (dirty) {
                    this.monitorings = cached.slice(0);
                    Vue.nextTick(() => this.$refs.treemap.recalculateAndRender());
                    dirty = false;
                }
                if (!this.$store.state.initializingBoard && this.$store.state.firstRender) {
                    this.$store.dispatch("firstRenderCompleted")
                }
            },

            buildTree(rootNode, monitoringList) {
                let that = this;

                monitoringList.forEach(function (monitoringItem) {
                    let item = JSON.parse(JSON.stringify(monitoringItem)),
                        path = item.path == null ? [] : item.path.split(".");
                    that.createChildNode(rootNode, monitoringItem, path);
                });
            },
            createChildNode(parentNode, monitoring, remainingPath) {
                if (remainingPath.length === 0) {
                    parentNode.children.push({
                        "name": monitoring.id,
                        "value": monitoring.priority,
                        "status": monitoring.status,
                        "threshold": monitoring.threshold,
                        "payload": monitoring.payload
                    })
                } else {
                    let currentNode = parentNode.children.find(x => x.name === remainingPath[0]);
                    if (currentNode === undefined) {
                        currentNode = {
                            "name": remainingPath[0],
                            "children": []
                        };
                        parentNode.children.push(currentNode)
                    }
                    this.createChildNode(currentNode, monitoring, remainingPath.splice(1))
                }
            },
            deleteMonitoring(id) {
                let args = [JSON.stringify("deleteMonitoring"), JSON.stringify(id)];
                this.conn.session.publish("phashcontrol", args);
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

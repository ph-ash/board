<template>
    <div class="treemap">
        <v-dialog width="600px" />
        <svg :height="height" style="margin-left: 0;" :width="width">
            <g style="shape-rendering: crispEdges;" transform="translate(0,20)">
                <transition-group name="list" tag="g" class="depth">
                    <g
                            v-if="selectedNode == undefined || selectedNode._children == undefined || selectedNode._children.length === 0"
                            key="no-data">
                        <text
                                dy=".65em"
                                x="50%"
                                y="50%"
                                font-size="large"
                                font-style="oblique"
                                text-anchor="middle">
                            No data to display
                        </text>
                    </g>
                    <g
                            class="children"
                            v-for="children in selectedNode._children"
                            :key="'c_' + children.id"
                            v-if="selectedNode"
                    >
                        <!-- Generate the children squares (only visible on hover of a square) -->
                        <rect
                                v-for="child in children._children"
                                class="child"
                                :id="child.id"
                                :key="child.id"
                                :height="y(child.y1) - y(child.y0)"
                                :width="x(child.x1) - x(child.x0)"
                                :x="x(child.x0)"
                                :y="y(child.y0)"
                        >
                        </rect>

                        <!-- The visible square rect element. -->
                        <rect
                                class="parent"
                                v-on:click="selectNode"
                                :id="children.id"
                                :key="children.id"
                                :x="x(children.x0)"
                                :y="y(children.y0)"
                                :width="x(children.x1 - children.x0 + children.parent.x0)"
                                :height="y(children.y1 - children.y0 + children.parent.y0)"
                                :style="{ fill: color[children.data.status] }"
                        >
                            <title>{{children.data.status}} | {{ children.data.name }}</title>
                        </rect>
                    </g>
                </transition-group>

                <!-- The top most element, representing the previous node -->
                <g class="grandparent">
                    <rect
                            :height="margin.top"
                            :width="width"
                            :y="(margin.top * -1)"
                            v-on:click="selectNode"
                            :id="parentId">
                    </rect>

                    <!-- The visible square text element with the id (basically a breadcumb, if you will) -->
                    <text
                            dy=".65em"
                            x="6"
                            y="-14"
                            v-if="selectedNode">
                        {{ selectedNode.id }}
                    </text>
                </g>
            </g>
        </svg>
    </div>
</template>

<script>
    import Vue from "vue"
    import {scaleLinear} from "d3-scale"
    import {json} from "d3-request"
    import {hierarchy, treemap} from "d3-hierarchy"

    // To be explicit about which methods are from D3 let's wrap them around an object
    // Is there a better way to do this?
    let d3 = {
        scaleLinear: scaleLinear,
        json: json,
        hierarchy: hierarchy,
        treemap: treemap
    };

    export default {
        name: "Treemap",
        props: [
            "treeData",
            "now"
        ],
        data() {
            return {
                rootNode: {},
                margin: {
                    top: 20,
                    right: 0,
                    bottom: 0,
                    left: 0
                },
                isInitializing: true,
                width: window.visualViewport.width,
                height: window.visualViewport.height,
                selected: null,
                color: {
                    "ok": "#00A000",
                    "error": "#D00000",
                    "idle": "#DDDD00",
                    "none": "#888888"
                }
            }
        },
        // You can do whatever when the selected node changes
        watch: {
            selectedNode(newData, oldData) {
                if (!this.isInitializing) {
                    this.$router.push('/' + newData.id);
                }

            },
            treeData() {
                this.isInitializing = false;
                let that = this;
                Vue.nextTick(() => that.selected = that.$route.params.pathMatch.replace("/", ""));
            },
            '$route' (to, from) {
                if (this.rootNode && this.rootNode._children) {
                    let nd = this.getNodeById(this.rootNode, to.path.replace("/", ""), this);
                    this.selected = nd.id;
                }
            }
        },
        mounted() {
            this.recalculateAndRender();
        },
        // The reactive computed variables that fire rerenders
        computed: {
            // The grandparent id
            parentId() {
                if (this.selectedNode.parent === undefined || this.selectedNode.parent === null) {
                    return this.selectedNode.id
                } else {
                    return this.selectedNode.parent.id
                }
            },
            // Returns the x position within the current domain
            // Maybe it can be replaced by a vuejs method
            x() {
                return d3.scaleLinear()
                    .domain([0, this.width])
                    .range([0, this.width])
            },
            // Returns the y position within the current domain
            // Maybe it can be replaced by a vuejs method
            y() {
                return d3.scaleLinear()
                    .domain([0, this.height - this.margin.top - this.margin.bottom])
                    .range([0, this.height - this.margin.top - this.margin.bottom])
            },
            // The D3 function that recursively subdivides an area into rectangles
            treemap() {
                return d3.treemap()
                    .size([this.width, this.height])
                    .round(false)
                    .paddingInner(0)
            },
            // The current selected node
            selectedNode() {
                let node = null;

                if (this.selected && this.treeData && this.treeData.children && this.treeData.children.length > 0) {
                    let nd = this.getNodeById(this.rootNode, this.selected, this);

                    if (nd._children || nd === this.rootNode) {
                        node = nd
                    } else {
                        node = nd.parent
                    }
                } else {
                    node = this.rootNode
                }

                // Recalculates the y and x domains
                this.x.domain([node.x0, node.x0 + (node.x1 - node.x0)]);
                this.y.domain([node.y0, node.y0 + (node.y1 - node.y0)]);

                return node
            }
        },
        methods: {
            recalculateAndRender() {
                this.initialize();
                this.accumulate(this.rootNode, this);
                this.accumulateStatus(this.rootNode, this);
                this.treemap(this.rootNode);
            },
            // Called once, to create the hierarchical data representation
            initialize() {
                if (this.treeData) {
                    this.rootNode = d3.hierarchy(this.treeData)
                        .eachBefore(function (d) {
                            d.id = (d.parent ? d.parent.id + "." : "") + d.data.name
                        })
                        .sum((d) => d.value)
                        .sort(function (a, b) {
                            return b.height - a.height || b.value - a.value
                        });
                    this.rootNode.x = this.rootNode.y = 0;
                    this.rootNode.x1 = this.width;
                    this.rootNode.y1 = this.height;
                    this.rootNode.depth = 0;
                }
            },
            // Calculates the accumulated value (sum of children values) of a node - its weight,
            // represented afterwards in the area of its square
            accumulate(node, context) {
                if (node) {
                    node._children = node.children;

                    if (node._children) {
                        node.value = node._children.reduce(function (carry, currentNode) {
                            return carry + context.accumulate(currentNode, context)
                        }, 0);
                        return node.value
                    } else {
                        return node.value
                    }
                }
                return 0
            },
            accumulateStatus(node, context) {
                if (node) {
                    node._children = node.children;
                    if (node._children) {
                        node.data.status = node._children.reduce(function (carry, currentNode) {

                            let currentStatus = context.accumulateStatus(currentNode, context);
                            if (currentStatus === "error" || carry === "error") {
                                return "error";
                            } else if (carry === "idle" || currentStatus === "idle") {
                                return "idle";
                            }
                            return currentStatus;
                        }, "none");
                    }

                    return this.getNodeStatus(node.data, context)
                }
                return "none"
            },
            getNodeStatus(data, context) {
                if (data.status === "error") {
                    return "error";
                }

                if (context.now > data.threshold) {
                    data.status = "idle";
                }
                return data.status
            },
            // Helper method - gets a node by its id attribute
            getNodeById(node, id, context) {
                if (node) {
                    if (node.id === id) {
                        return node
                    } else if (id.includes(node.id) && this.isBranch(node)) {
                        for (let i = 0; i < node._children.length; i++) {
                            if (id.includes(node._children[i].id)) {
                                let nd = context.getNodeById(node._children[i], id, context);
                                if (nd) {
                                    return nd
                                }
                            }
                        }
                    }
                }
                return this.rootNode
            },
            isBranch(node) {
                return node.hasOwnProperty("_children") && node._children
            },
            isLeaf(node) {
                return !this.isBranch(node);
            },
            // When a user clicks a square, changes the selected data attribute
            // which fires the computed selectedNode, which in turn finds the Node by the id of the square clicked
            // and the template reflects the changes
            selectNode(event) {
                this.selected = event.target.id;

                let clickedNode = this.getNodeById(this.selectedNode, event.target.id, this);
                console.log(event.target.id);
                console.log(clickedNode);
                if (this.isLeaf(clickedNode)) {
                    this.$modal.show("dialog", {
                        class: "phash-dialog",
                        title: event.target.id.split(".").slice(-1)[0],
                        text: clickedNode.data.payload,
                        buttons: [
                            {
                                title: "Close",
                                default: true
                            }
                        ]
                    })
                }
            }
        }
    }
</script>

<style scoped>

    text {
        pointer-events: none;
    }

    .grandparent text {
        font-weight: bold;
    }

    rect {
        fill: none;
        stroke: #fff;
    }

    rect.parent,
    .grandparent rect {
        stroke-width: 2px;
    }

    .grandparent rect {
        fill: orange;
    }

    .grandparent:hover rect {
        fill: #ee9700;
    }

    .children rect.parent,
    .grandparent rect {
        cursor: pointer;
    }

    .children rect.parent {
        fill: #bbb;
        fill-opacity: .8;
    }

    .children:hover rect.child {
        fill: #bbb;
    }

    .children text {
        font-size: 0.8em;
    }

    .grandparent text {
        font-size: 0.9em;
    }

    .list-enter-active, .list-leave-active {
        transition: all 1s;
    }

    .list-enter, .list-leave-to /* .list-leave-active for <2.1.8 */
    {
        opacity: 0;
    }
</style>

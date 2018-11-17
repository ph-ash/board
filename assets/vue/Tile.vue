<template>
    <div :class="currentClass">
        <p v-if="showMonitoringId" class="monitoring-id">{{ monitoringData.id }}</p>
    </div>
</template>

<script>
import moment from "moment";

export default {
    name: "Tile",
    props: [
        "monitoringData",
        "now"
    ],
    computed: {
        idleThreshold() {
            return moment(this.monitoringData.date).add(this.monitoringData.idleTimeout, "s")
        },
        isIdle() {
            return this.now > this.idleThreshold
        },
        currentStatus() {
            return (this.isIdle ? "idle" : this.monitoringData.status)
        },
        currentClass() {
            return "tile status-" + this.currentStatus
        },
        showMonitoringId() {
            return this.currentStatus !== "ok"
        }
    }
};
</script>

<style scoped>
    .tile {
        border: 1px solid black;
        margin: 2px;

        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    .tile .monitoring-id {
        text-align: center;
    }

    .status-ok {
        background-color: green;
    }

    .status-error {
        background-color: red;
    }

    .status-idle {
        background-color: yellow;
    }
</style>

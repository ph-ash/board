<template>
    <div class="tile">
        <p>{{ monitoringData.id }}</p>
        <p>{{ monitoringData.status }}</p>
        <p>{{ monitoringData.date }}</p>
        <p>{{ now }}</p>
        <p>{{ idleThreshold }}</p>
        <p>{{ isIdle }}</p>
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
            return moment(this.monitoringData.date).add(this.monitoringData.idleTimeout, "s");
        },
        isIdle() {
            return this.now > this.idleThreshold;
        }
    }
};
</script>

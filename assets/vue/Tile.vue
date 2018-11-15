<template>
    <div class="tile">
        <p>{{ monitoringData.id }}</p>
        <p>{{ monitoringData.status }}</p>
        <p>{{ secondsPassedSinceLastUpdate }}</p>
    </div>
</template>

<script>
    import moment from "moment"

    export default {
        name: 'tile',
        props: [
            'monitoringData'
        ],
        data() {
            return {
                secondsPassedSinceLastUpdate: 0
            }
        },
        created() {
            this.getSecondsPassedSinceLastUpdate();
            setInterval(this.getSecondsPassedSinceLastUpdate, 1000)
        },
        destroyed() {
            clearInterval(this.getSecondsPassedSinceLastUpdate)
        },
        methods: {
            getSecondsPassedSinceLastUpdate () {
                this.secondsPassedSinceLastUpdate = ~~(moment().diff(this.monitoringData.date) / 1000)
            }
        }
    }
</script>

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
    import moment from "moment"

    export default {
        name: 'tile',
        props: [
            'monitoringData'
        ],
        data() {
            return {
                now: ""
            }
        },
        computed: {
            idleThreshold() {
                return moment(this.monitoringData.date).add(this.monitoringData.idleTimeout, 's')
            },
            isIdle() {
                return moment(this.now).isAfter(this.idleThreshold)
            }
        },
        created() {
            this.updateNow();
            setInterval(this.updateNow, 1000)
        },
        destroyed() {
            clearInterval(this.updateNow)
        },
        methods: {
            updateNow () {
                this.now = moment()
            }
        }
    }
</script>

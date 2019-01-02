<script>
    export default {
        name: "Tile",
        props: [
            "monitoringData",
            "now"
        ],
        computed: {
            isIdle() {
                return this.now > this.monitoringData.threshold
            },
            currentStatus() {
                if (this.monitoringData.status === "error") {
                    return "error"
                }
                if (this.isIdle) {
                    return "idle"
                }
                return this.monitoringData.status
            }
        },
        render() {
            return "";
        }
    };
</script>

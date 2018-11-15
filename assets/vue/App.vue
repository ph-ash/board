<template>
    <div class="container">
        <p v-if="!websocketConnected">KEINE VERBINDUNG!</p>
        <tile v-for="monitoring in monitorings" :key="monitoring.id" :monitoringData="monitoring" />
        <p v-if="Object.keys(monitorings).length === 0">LEER!</p>
    </div>
</template>

<script>
    import { mapState } from 'vuex'
    import {Client,WebSocketTransport} from "thruway.js";
    import Tile from "./Tile";

    export default {
        name: 'app',
        components: {
            'tile': Tile
        },
        props: [
            'url',
            'realm'
        ],
        computed: {
            ...mapState(['monitorings', 'websocketConnected'])
        },
        mounted() {
            const ws = new WebSocketTransport(this.url, undefined, true);
            const wamp = new Client(ws, this.realm);
            ws.onOpen.subscribe(() => this.$store.dispatch('webSocketConnected'));
            ws.onClose.subscribe(() => {if (this.$store.state.websocketConnected) {this.$store.dispatch('webSocketDisconnected')}});
            wamp.topic('phashtopic').subscribe((v) => this.$store.dispatch('updateMonitoring', JSON.parse(v.args[0])));
        }
    }
</script>

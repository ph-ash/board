<template>
    <div class="container">
        <h1>{{ getMessage }}</h1>
    </div>
</template>

<script>
    import {Client,WebSocketTransport} from "thruway.js";

    export default {
        name: 'app',
        props: [
            'url',
            'realm'
        ],
        computed: {
            getMessage () {
                return this.$store.state.message;
            }
        },
        mounted() {
            const ws = new WebSocketTransport(this.url, undefined, true);
            const wamp = new Client(ws, this.realm);
            ws.onOpen.subscribe(() => this.$store.dispatch('webSocketConnected'));
            ws.onClose.subscribe(() => {if (this.$store.state.websocketConnected) {this.$store.dispatch('webSocketDisconnected')}});
            wamp.topic('phashtopic').subscribe((v) => this.$store.dispatch('doReceiveMessage', v.args.join(' / ')));
        }
    }
</script>

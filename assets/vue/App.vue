<template>
    <div class="container">
        <h1>{{ getMessage }}</h1>
    </div>
</template>

<script>
    import {Client,WebSocketTransport} from "thruway.js";

    export default {
        name: 'app',
        computed: {
            getMessage () {
                return this.$store.state.message;
            }
        },
        mounted() {
            const ws = new WebSocketTransport('ws://localhost:8080', undefined, true);
            const wamp = new Client(ws, 'realm1');
            ws.onOpen.subscribe(() => this.$store.dispatch('webSocketConnected'));
            ws.onClose.subscribe(() => {if (this.$store.state.websocketConnected) {this.$store.dispatch('webSocketDisconnected')}});
            wamp.topic('foo').subscribe((v) => this.$store.dispatch('doReceiveMessage', v.args.join('|')));
        }
    }
</script>

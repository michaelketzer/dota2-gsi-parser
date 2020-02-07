import WSClient from 'ws';

export default class Transport {
    ws: WSClient;
    wsURI: string;
    pingTimeout: NodeJS.Timeout | null = null;
    
    constructor(wsURI: string) {
        this.wsURI = wsURI;
        this.ws = new WSClient(this.wsURI);
        this.ws.on('open', this.heartbeat);
        this.ws.on('ping', this.heartbeat);
	    this.ws.on('close', () => this.reconnect());
    }

    heartbeat(): void {
        this.pingTimeout && clearTimeout(this.pingTimeout);
    
        // Use `WebSocket#terminate()`, which immediately destroys the connection,
        // instead of `WebSocket#close()`, which waits for the close timer.
        // Delay should be equal to the interval at which your server
        // sends out pings plus a conservative assumption of the latency.
        this.pingTimeout = setTimeout(() => {
            this.ws.terminate();
            console.log('Heartbeat failed. Terminated connection.');
        }, 30000 + 1000);
    }

    resetWS(): void {
        this.ws = new WSClient(this.wsURI);
        this.ws.on('open', this.heartbeat);
        this.ws.on('ping', this.heartbeat);
	    this.ws.on('close', () => this.reconnect());
    }

    reconnect(): void {
        this.pingTimeout && clearTimeout(this.pingTimeout);
        setTimeout(() => this.resetWS(), 500);
    }

    isReady(): boolean {
        return this.ws.readyState === this.ws.OPEN;
    }

    send(msg: string): void {
        if(this.isReady()) {
            this.ws.send(msg);
        }
    }
}

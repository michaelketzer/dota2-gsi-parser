import WSClient from 'ws';

export default class Transport {
    ws: WSClient;
    wsURI: string;
    
    constructor(wsURI: string) {
        this.wsURI = wsURI;
        this.ws = new WSClient(this.wsURI);
	this.ws.on('close', () => this.reconnect());
    }

    resetWS(): void {
        this.ws = new WSClient(this.wsURI);
	this.ws.on('close', () => this.reconnect());
    }

    reconnect(): void {
        setTimeout(() => this.resetWS(), 2500);
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

import dotenv from 'dotenv';
import * as Sentry from '@sentry/node';
import d2gsi, { Client} from 'dota2-gsi';
//@ts-ignore
import Logger from 'simple-node-logger';
import Transport from './Transport';

const log = Logger.createSimpleLogger('app.log');

dotenv.config();
const {PORT=3000, WS_URI='', SHOKZ_AUTH = '', SENTRY_DSN=null} = process.env;

/* istanbul ignore next */
if(SENTRY_DSN) {
    Sentry.init({ dsn: SENTRY_DSN });
}

const server = new d2gsi({port: +PORT});
export const ts = new Transport(WS_URI);

export function queueWSMessage(msg: string, timeout = 10000): void {
    setTimeout(() => ts.send(msg), timeout);
}

export function heroAliveStateChanged(alive: boolean): void {
    if(! alive) {
        log.info('Hero died. Broadcasting...');
        queueWSMessage(JSON.stringify({
            message: 'startfromgsi',
            type: 'feedvoting'
        }));
    }
}

export function receivedWinner(winTeam: 'radiant' | 'dire') {
    log.info(`Received winner ${winTeam}. Broadcasting...`);
    ts.send(JSON.stringify({
        winner: winTeam === 'radiant' ? 'a' : 'b',
        message: 'winnerfromcgsi',
        type: 'betting'
    }));
}

export function handleNewGSIClient(client: Client) {
    if (client.auth && client.auth.token === SHOKZ_AUTH) {
        log.info('New client successfully authorized');
        //client.on('hero:alive', heroAliveStateChanged);
        client.on('map:win_team', receivedWinner);
    }
}

server.events.on('newclient', handleNewGSIClient);
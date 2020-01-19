jest.mock('simple-node-logger', () => ({
    createSimpleLogger: () => ({
        info: jest.fn()
    })
}));
jest.mock('dota2-gsi', () => jest.fn(() => ({events: {on: jest.fn()}})));
jest.mock('ws');
jest.mock('@sentry/node', () => ({
    init: jest.fn()
}));

import * as app from "../app";
import { Client } from "dota2-gsi";
import {init} from '@sentry/node';

jest.useFakeTimers();

test('queueWSMessage', () => {
    app.ts.send = jest.fn();
    app.queueWSMessage('Test', 5000);
    jest.runAllTimers();
    expect(app.ts.send).toHaveBeenCalledWith('Test');
});

test('heroAliveStateChanged', async () => {
    app.ts.send = jest.fn();
    app.heroAliveStateChanged(true);
    jest.runAllTimers();
    expect(app.ts.send).not.toHaveBeenCalled();
    app.heroAliveStateChanged(false);
    jest.runAllTimers();
    expect(app.ts.send).toHaveBeenCalledWith('{"message":"startfromgsi","type":"feedvoting"}');
});

test('receivedWinner', async () => {
    app.ts.send = jest.fn();
    app.receivedWinner('radiant');
    expect(app.ts.send).toHaveBeenCalledWith('{"winner":"a","message":"winnerfromcgsi","type":"betting"}');
    app.receivedWinner('dire');
    expect(app.ts.send).toHaveBeenCalledWith('{"winner":"b","message":"winnerfromcgsi","type":"betting"}');
});

test('handleNewGSIClient', async () => {
    const client = {
        on: jest.fn(),
        auth: {
            token: 'sometoken'
        }
    };

    app.handleNewGSIClient(client as unknown as Client);
    expect(client.on).not.toHaveBeenCalled();
    client.auth.token = 'haselfasel';
    app.handleNewGSIClient(client as unknown as Client);
    expect(client.on).not.toHaveBeenCalled();
    client.auth.token = '';
    app.handleNewGSIClient(client as unknown as Client);
    expect(client.on).not.toHaveBeenCalledTimes(2);
});

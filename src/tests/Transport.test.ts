import WSClient from 'ws';
import Transport from '../Transport';

jest.useFakeTimers();
jest.mock('ws');

beforeEach(() => {
    (WSClient as unknown as jest.Mock<WSClient>).mockClear();
});
  
test('uri is correctly handled', () => {
    const transport = new Transport('https://examplews.com');
    expect(WSClient).toHaveBeenCalledWith('https://examplews.com');
    expect(transport.wsURI).toEqual('https://examplews.com');
});

test('testing reconnection', async () => {
    const transport = new Transport('https://examplews.com');
    transport.resetWS = jest.fn();
    transport.reconnect();
    jest.runAllTimers();

    expect(transport.resetWS).toHaveBeenCalled();
});

test('test readystate', () => {
    const transport = new Transport('https://examplews.com');
    expect(transport.isReady).toBeTruthy();
});

test('test send', () => {
    const transport = new Transport('https://examplews.com');
    transport.ws.send = jest.fn();
    //ws readystate is not given
    transport.isReady = jest.fn(() => false);
    transport.send('test');
    expect(transport.ws.send).not.toHaveBeenCalled();
    transport.isReady = jest.fn(() => true);
    transport.send('test');
    expect(transport.ws.send).toHaveBeenCalledWith('test');
});

test('test reset', () => {
    const transport = new Transport('https://examplews.com');
    transport.resetWS();
    expect(WSClient).toHaveBeenCalledTimes(2);
});
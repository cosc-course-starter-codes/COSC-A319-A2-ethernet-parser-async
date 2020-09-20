const { describe, beforeEach, it, expect } = require('@jest/globals');

const events = require('events');
const MockEthernetSocket = require('../test_fixtures/MockEthernetSocket');

const EthernetSocketProcessor = require('./EthernetSocketProcessor');

describe('EthernetSocketProcessor', () => {
  let processor, socket;
  beforeEach(() => {
    socket = new MockEthernetSocket();
    processor = new EthernetSocketProcessor(socket);
  });

  it('implements events.EventEmitter', () => {
    expect(processor).toBeInstanceOf(events.EventEmitter);
  });

  it('emits data events', (done) => {
    let frameData;
    processor.on('data', (data) => {
      expect(data).toEqual(frameData);
      done();
    });
    frameData = socket.pushEthernetII(21, 6);
  });

  it('emits a close event on connection close', (done) => {
    processor.on('data', (_data) => { });
    processor.on('close', (err) => {
      if (err) { throw err; }
      done();
    });
    socket.pushIEEE802_3(undefined, 5);
    socket.pushEthernetII(21, 6);
    socket.close();
  });

  it('emits an error event on connection error', (done) => {
    processor.on('data', (_data) => { });
    processor.on('error', (err) => {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toEqual('Yowza!');
      done();
    });
    socket.pushEthernetII(21, 6);
    socket.close(new Error('Yowza!'));
  });
});

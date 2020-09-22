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
    const frameData = {
      protocol: 'Ethernet II',
      header: {
        destinationMAC: Buffer.from([
          0x00, 0xd0, 0xb7, 0x1f, 0xfe, 0xe6
        ]),
        destination: '00:d0:b7:1f:fe:e6',
        sourceMAC: Buffer.from([
          0x00, 0x05, 0x85, 0x88, 0xcc, 0xdb
        ]),
        source: '00:05:85:88:cc:db',
        type: 0x0800,
        length: 25
      },
      payload: Buffer.from([
        0x43, 0x61, 0x6e, 0x20, 0x79, 0x6f, 0x75, 0x20,
        0x70, 0x61, 0x72, 0x73, 0x65, 0x20, 0x74, 0x68,
        0x69, 0x73, 0x20, 0x66, 0x72, 0x61, 0x6d, 0x65,
        0x3f
      ]),
      frame_check: 2755183799,
      frame_check_valid: true
    };
    processor.reportStats = true;
    processor.on('data', (data) => {
      console.log(`got data: ${data}`);
      expect(data).toEqual(frameData);
      done();
    });
    console.log(`pushed Ethernet II data: ${require('util').inspect(socket.pushEthernetII(15, 3))}`);
    socket.idle(24);
    console.log('pushed idle: length 24');
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

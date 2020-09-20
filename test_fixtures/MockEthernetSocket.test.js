const { describe, beforeEach, it, expect } = require('@jest/globals');

const stream = require('stream');
const events = require('events');

const MockEthernetSocket = require('./MockEthernetSocket');
const { doesNotMatch } = require('assert');

describe('MockEthernetSocket', () => {
  let socket;
  beforeEach(() => {
    socket = new MockEthernetSocket();
  });

  it('implements stream.Readable', () => {
    expect(socket).toBeInstanceOf(stream.Readable);
  });
  it('implements events.EventEmitter', () => {
    expect(socket).toBeInstanceOf(events.EventEmitter);
  });

  it('allows reading a specific number of bytes', () => {
    const buf = socket.read(5);
    expect(buf).toBeInstanceOf(Buffer);
    expect(buf.length).toBe(5);
  });

  it('reads a line idle signal when no data in buffer', () => {
    const buf = socket.read(10);
    expect(buf).toEqual(Buffer.from([
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff
    ]));
  });

  it('reads a random number of bytes of packet data when buffer has data', () => {
    socket.pushIEEE802_3(7, 2);
    const buf = socket.read();
    const expected = Buffer.from([
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
      0xaa, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa, 0xab,
      0x00, 0xd0, 0xb7, 0x1f, 0xfe, 0xe6, 0x00, 0x05,
      0x85, 0x88, 0xcc, 0xdb, 0x00, 0x19, 0xaa, 0xaa,
      0x03, 0x00, 0x00, 0x00, 0x08, 0x00, 0x43, 0x61,
      0x6e, 0x20, 0x79, 0x6f, 0x75, 0x20, 0x70, 0x61,
      0x72, 0x73, 0x65, 0x20, 0x74, 0x68, 0x69, 0x73,
      0x20, 0x66, 0x72, 0x61, 0x6d, 0x65, 0x3f, 0x62,
      0x63, 0xab, 0xd5, 0xff, 0xff, 0xff, 0xff, 0xff,
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
      0xff
    ]).slice(0, buf.length);

    expect(buf.length).toBeGreaterThanOrEqual(5);
    expect(buf.length).toBeLessThanOrEqual(65);
    expect(buf.equals(expected)).toBe(true);
  });

  it('emits data events', (done) => {
    socket.pushEthernetII(21, 6);
    socket.on('data', (data) => {
      expect(data).toBeInstanceOf(Buffer);
      done();
    });
    socket.pushEthernetII(0, 3);
    socket.pushIEEE802_3(5);
  });

  it('emits a close event on connection close', (done) => {
    socket.pushIEEE802_3(undefined, 5);
    socket.pushEthernetII(21, 6);
    socket.on('data', (_data) => { });
    socket.on('close', (err) => {
      if (err) { throw err; }
      done();
    });
    socket.close();
  });

  it('emits an error event on connection error', (done) => {
    socket.pushEthernetII(21, 6);
    socket.on('data', (_data) => { });
    socket.on('error', (err) => {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toEqual('Yowza!');
      done();
    });
    socket.close(new Error('Yowza!'));
  });

  it('provides socket status "open" when open', () => {
    expect(socket.status).toEqual('open');
  });

  it('provides socket status "closed" when closed', (done) => {
    socket.on('close', () => {
      expect(socket.status).toEqual('closed');
      done();
    });
    socket.close();
  });

  it('provides socket status "closed" after an error', (done) => {
    socket.on('error', (err) => {
      // ignore the error
      expect(socket.status).toEqual('closed');
      done();
    });
    socket.close(new Error('Yowza!'));
  });
});

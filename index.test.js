const { describe, beforeEach, it } = require('@jest/globals');
const MockEthernetSocket = require('./test_fixtures/MockEthernetSocket');

const { parseFrames } = require('./index');

describe('index.js', () => {
  let socket;
  beforeEach(() => {
    socket = new MockEthernetSocket();
  });

  it('returns an array', async () => {
    const frames = parseFrames(socket);
    socket.close();
    expect(await frames).toBeInstanceOf(Array);
  });

  it('ignores idle signal', async () => {
    socket.idle(35);
    const frames = parseFrames(socket);
    socket.close();
    expect(await frames).toEqual([]);
  });

  it('ignores arbitrary data with no frame preamble', async () => {
    socket.push(Buffer.from([
      0x43, 0x06, 0x10, 0x16, 0x17, 0x86, 0xa5, 0x80,
      0xaa, 0x27, 0x66, 0x87, 0x6c, 0xbb, 0x45, 0xe7,
      0x3f, 0x98, 0xed, 0x10, 0xb3, 0x34, 0x47, 0xb0,
      0x4c, 0xf0, 0x69, 0x4b, 0x79, 0x39, 0xd9, 0x0a,
      0x26, 0x9b, 0xed, 0xc8, 0x84, 0x1d, 0x81, 0xed
    ]));
    const frames = parseFrames(socket);
    socket.close();
    expect(await frames).toEqual([]);
  });

  it('returns the expected parsed ethernet frames from a stream', async () => {
    const frame1 = socket.pushEthernetII(6, 3);
    const frame2 = socket.pushIEEE802_3(3, 11);
    const frame3 = socket.pushEthernetII();
    const frames = parseFrames(socket);
    socket.close();
    expect(await frames).toEqual([frame1, frame2, frame3]);
  });
});

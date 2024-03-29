const { Readable } = require('stream');
const { performance } = require('perf_hooks');

/**
 * A mock socket that delivers binary data like an Ethernet socket
 * @class
 */
class MockEthernetSocket extends Readable {
  /**
   * @constructor
   * @param {Object} options - the options
   * @returns {MockEthernetSocket} - the mock socket
   */
  constructor (options) {
    super({
      ...options,
      highWaterMark: 0,
      emitClose: true
    });
    this.buffer = Buffer.from([]);
    this.deliveryThreshold = 200;
    this.lastDelivery = 0;
  }

  /**
   * Get the socket status
   * @property {'open'|'closed'} status - the connection state
   */
  get status () {
    return this.destroyed ? 'closed' : 'open';
  }

  /**
   * Implementation of internal _read method
   * @param {number} size - the amount of data to read
   * @returns {void}
   * @private
   */
  _read (size) {
    // console.log(`read: now = ${performance.now()}, last = ${this.lastDelivery}, thr = ${this.deliveryThreshold}, cond = ${performance.now() - this.lastDelivery > this.deliveryThreshold}`)
    if (performance.now() - this.lastDelivery > this.deliveryThreshold) {
      let bytesToPush;
      if (size && size > 0) {
        bytesToPush = size;
      } else {
        bytesToPush = Math.floor(60 * Math.random() + 5);
      }
      if (this.buffer.length < bytesToPush) {
        this.idle(bytesToPush + 1 - this.buffer.length);
      }
      this.push(this.buffer.slice(0, bytesToPush));
      this.buffer = this.buffer.slice(bytesToPush);
      this.lastDelivery = performance.now();
    }
  }

  /**
   * Flush all data and close the socket connection
   * @param {Error?} error - (optional) error sent with close
   * @returns {void}
   */
  close (error) {
    this.push(this.buffer);
    this.push(null);
    setTimeout(() => super.destroy(error), 10);
  }

  /**
   * Enqueue data into the socket's buffer to be read
   * @param {Buffer} data - the data to push onto to the socket
   * @returns {void}
   */
  enqueue (data) {
    this.buffer = Buffer.concat([this.buffer, data]);
  }

  /**
   * Push a full DIX Ethernet II frame, with preamble and trailing
   * interframe gap, onto the mock socket
   * @param {number} lead_n - added length idle preceding frame
   * @param {number} tail_n - added length idle following frame
   * @returns {{
   *   protocol: string,
   *   header: {
   *     destinationMAC: Buffer,
   *     destination: string,
   *     sourceMAC: Buffer,
   *     source: string,
   *     type: number,
   *     length: number
   *   },
   *   payload: Buffer,
   *   frame_check: number,
   *   frame_check_valid: boolean
   * }} - the parsed frame
   */
  pushEthernetII (lead_n = 0, tail_n = 0) {
    this.idle(lead_n);
    this.preamble(false);
    const parsedFrame = this.ethernet2frame();
    this.interframeGap(tail_n);
    return parsedFrame;
  }

  /**
   * Push a full IEEE 802.3 frame, with preamble and trailing
   * interframe gap, onto the mock socket
   * @param {number} lead_n - added length idle preceding frame
   * @param {number} tail_n - added length idle following frame
   * @returns {{
   *   protocol: string,
   *   header: {
   *     destinationMAC: Buffer,
   *     destination: string,
   *     sourceMAC: Buffer,
   *     source: string,
   *     type: number,
   *     length: number,
   *     llc: {
   *       dsap: number,
   *       ssap: number,
   *       control: number
   *     },
   *     snap_oui: Buffer
   *   },
   *   payload: Buffer,
   *   frame_check: number,
   *   frame_check_valid: boolean
   * }} - the parsed frame
   */
  pushIEEE802_3 (lead_n = 0, tail_n = 0) {
    this.idle(lead_n);
    this.preamble(true);
    const parsedFrame = this.ieee8023frame();
    this.interframeGap(tail_n);
    return parsedFrame;
  }

  /**
   * Enqueue the interframe gap of 12 + n bytes
   * @param {number} n - the number of additional bytes of interframe gap to add
   * @returns {void}
   */
  interframeGap (n) {
    this.idle(12 + n);
  }

  /**
   * Enqueue an idle line state for n bytes
   * @param {number} n = the number of bytes to push idle line state
   * @returns {void}
   */
  idle (n) {
    const idle = [];
    let bytes;
    for (bytes = 0; bytes < n; bytes++) {
      idle.push(0xff);
    }
    this.enqueue(Buffer.from(idle));
  }

  /**
   * Enqueue the frame preamble (with start-of-frame delimiter)
   * @param {boolean} sfd - include the start-of-frame delimiter when true
   * @returns {void}
   */
  preamble (sfd) {
    const preamble = [
      // 10101010 ... 10101010, 7 bytes
      0xaa, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa
    ];
    // Add final byte, either preamble (10101010) or start-of-frame delimiter (10101011)
    preamble.push(sfd ? 0xab : 0xaa);
    this.enqueue(Buffer.from(preamble));
  }

  /**
   * Enqueue a frame of Ethernet II data
   * @returns {{
   *   protocol: string,
   *   header: {
   *     destinationMAC: Buffer,
   *     destination: string,
   *     sourceMAC: Buffer,
   *     source: string,
   *     type: number,
   *     length: number
   *   },
   *   payload: Buffer,
   *   frame_check: number,
   *   frame_check_valid: boolean
   * }} - the parsed frame
   */
  ethernet2frame () {
    const ethernet2frame = [
      0x00, 0xd0, 0xb7, 0x1f, 0xfe, 0xe6, 0x00, 0x05,
      0x85, 0x88, 0xcc, 0xdb, 0x08, 0x00, 0x43, 0x61,
      0x6e, 0x20, 0x79, 0x6f, 0x75, 0x20, 0x70, 0x61,
      0x72, 0x73, 0x65, 0x20, 0x74, 0x68, 0x69, 0x73,
      0x20, 0x66, 0x72, 0x61, 0x6d, 0x65, 0x3f, 0xa4,
      0x38, 0xc4, 0xb7
    ];
    this.enqueue(Buffer.from(ethernet2frame));
    return (this.parsedEthernet2frame());
  }

  /**
   * Enqueue a frame of IEEE 802.3 data
   * @returns {{
   *   protocol: string,
   *   header: {
   *     destinationMAC: Buffer,
   *     destination: string,
   *     sourceMAC: Buffer,
   *     source: string,
   *     type: number,
   *     length: number,
   *     llc: {
   *       dsap: number,
   *       ssap: number,
   *       control: number
   *     },
   *     snap_oui: Buffer
   *   },
   *   payload: Buffer,
   *   frame_check: number,
   *   frame_check_valid: boolean
   * }} - the parsed frame
   */
  ieee8023frame () {
    const ieee8023frame = [
      0x00, 0xd0, 0xb7, 0x1f, 0xfe, 0xe6, 0x00, 0x05,
      0x85, 0x88, 0xcc, 0xdb, 0x00, 0x19, 0xAA, 0xAA,
      0x03, 0x00, 0x00, 0x00, 0x08, 0x00, 0x43, 0x61,
      0x6e, 0x20, 0x79, 0x6f, 0x75, 0x20, 0x70, 0x61,
      0x72, 0x73, 0x65, 0x20, 0x74, 0x68, 0x69, 0x73,
      0x20, 0x66, 0x72, 0x61, 0x6d, 0x65, 0x3f, 0x62,
      0x63, 0xab, 0xd5
    ];
    this.enqueue(Buffer.from(ieee8023frame));
    return (this.parsedIeee8023frame());
  }

  /**
   * Return the parsed version of the Ethernet II frame (for test validation)
   * @returns {{
   *   protocol: string,
   *   header: {
   *     destinationMAC: Buffer,
   *     destination: string,
   *     sourceMAC: Buffer,
   *     source: string,
   *     type: number,
   *     length: number
   *   },
   *   payload: Buffer,
   *   frame_check: number,
   *   frame_check_valid: boolean
   * }} - the parsed frame
   */
  parsedEthernet2frame () {
    return {
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
  }

  /**
   * Return the parsed version of the Ethernet II frame (for test validation)
   * @returns {{
   *   protocol: string,
   *   header: {
   *     destinationMAC: Buffer,
   *     destination: string,
   *     sourceMAC: Buffer,
   *     source: string,
   *     type: number,
   *     length: number,
   *     llc: {
   *       dsap: number,
   *       ssap: number,
   *       control: number
   *     },
   *     snap_oui: Buffer
   *   },
   *   payload: Buffer,
   *   frame_check: number,
   *   frame_check_valid: boolean
   * }} - the parsed frame
   */
  parsedIeee8023frame () {
    return {
      protocol: 'IEEE 802.3',
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
        length: 25,
        llc: {
          dsap: 0xaa,
          ssap: 0xaa,
          control: 0x03
        },
        snap_oui: Buffer.from([0x00, 0x00, 0x00])
      },
      payload: Buffer.from([
        0x43, 0x61, 0x6e, 0x20, 0x79, 0x6f, 0x75, 0x20,
        0x70, 0x61, 0x72, 0x73, 0x65, 0x20, 0x74, 0x68,
        0x69, 0x73, 0x20, 0x66, 0x72, 0x61, 0x6d, 0x65,
        0x3f
      ]),
      frame_check: 1650699221,
      frame_check_valid: true
    };
  }
}

module.exports = MockEthernetSocket;

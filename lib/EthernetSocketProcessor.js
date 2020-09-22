/**
 * A socket processor that parses ethernet frames from a data stream
 * @class
 * @implements {events.EventEmitter}
 *
 * @event EthernetSocketProcessor#data
 * @type {Object}
 * @property {string}  protocol              - the frame's protocol (either "Ethernet II" or "IEEE 802.3")
 * @property {Object}  header                - the frame's header fields
 * @property {Buffer}  header.destinationMAC - destination MAC address binary value
 * @property {string}  header.destination    - destination MAC Address in human-readable form
 * @property {Buffer}  header.sourceMAC      - source MAC address binary value
 * @property {string}  header.source         - source MAC Address in human-readable form
 * @property {number}  header.type           - the Ethertype of the frame
 * @property {number}  header.length         - the length of the payload in bytes (octets)
 * @property {Object}  [header.llc]          - the logical link control (LLC) header fields (only for IEEE 802.3)
 * @property {number}  header.llc.dsap       - the destination service access point (DSAP) LLC header field
 * @property {number}  header.llc.ssap       - the source service access point (SSAP) LLC header field
 * @property {number}  header.llc.control    - the LLC control header field
 * @property {Buffer}  [header.snap_oui]     - the SNAP organizationally unique identifier (OUI) header field
 * @property {Buffer}  payload               - the data payload of the frame (the Network-layer Protocol Data Unit)
 * @property {number}  frame_check           - the frame check sequence included with the packet
 * @property {boolean} frame_check_valid     - the result of comparing the included frame check with a computed one
 *
 * @event EthernetSocketProcessor#close
 * @type {void}
 *
 * @event EthernetSocketProcessor#error
 * @type {Error}
 */

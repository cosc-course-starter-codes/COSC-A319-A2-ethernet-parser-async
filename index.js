/* Copy your ethernet parser module from Assignment A1 into the ./lib/ethernet folder */
// const ethernet = require('./lib/ethernet');
/* Implement and export the EthernetSocketProcessor class to complete the assignment */
const EthernetSocketProcessor = require('./lib/EthernetSocketProcessor');

/**
 * Parse Ethernet packets from a socket with a stream.Readable interface
 * @param {stream.Readable} socket - the socket on which you will receive data
 * @returns {Promise<Object[]>} - a promise resolving with an array of parsed frame objects
 * @listens EthernetSocketProcessor#data - there is data to be read (a parsed frame object)
 * @listens EthernetSocketProcessor#close - the socket connection has been closed
 * @listens EthernetSocketProcessor#error - an error occurred during processing (the Error object)
 * @async
 */
async function parseFrames (socket) {
  /* Use your class and the ethernet library you wrote last assignment
   * to parse Ethernet packets from the data stream on the socket here */
}

module.exports = {
  parseFrames
};

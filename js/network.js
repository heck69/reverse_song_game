/**
 * network.js - WebRTC Peer-to-Peer Manager via PeerJS
 * Allows two devices to play over GitHub Pages with no backend server.
 */

class NetworkManager {
  constructor() {
    this.peer = null;
    this.conn = null;
    this.isHost = false;
    this.roomCode = null;
    this.isConnected = false;
    this.onMessageCallback = null;
    this.onConnectionStatusCallback = null;
    this.prefix = 'revsong-v1-';
  }

  /**
   * Generate a readable 4-character room code (e.g., "BEAT", "SING", "ROCK", etc.)
   */
  generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Initialize Host peer and wait for player 2 to join.
   * @param {string} roomCode
   * @param {string} hostPlayerName
   */
  createRoom(roomCode, hostPlayerName) {
    this.isHost = true;
    this.roomCode = roomCode.toUpperCase().trim();
    const peerId = this.prefix + this.roomCode;

    return new Promise((resolve, reject) => {
      this.peer = new Peer(peerId, {
        debug: 1,
      });

      this.peer.on('open', (id) => {
        resolve(this.roomCode);
      });

      this.peer.on('connection', (conn) => {
        this.setupConnection(conn);
      });

      this.peer.on('error', (err) => {
        console.error('PeerJS Host Error:', err);
        if (err.type === 'unavailable-id') {
          reject(new Error('Room code already in use. Please generate a new code.'));
        } else {
          reject(err);
        }
      });
    });
  }

  /**
   * Join an existing room created by Host.
   * @param {string} roomCode
   * @param {string} guestPlayerName
   */
  joinRoom(roomCode, guestPlayerName) {
    this.isHost = false;
    this.roomCode = roomCode.toUpperCase().trim();
    const hostPeerId = this.prefix + this.roomCode;

    return new Promise((resolve, reject) => {
      this.peer = new Peer({
        debug: 1,
      });

      this.peer.on('open', (id) => {
        const conn = this.peer.connect(hostPeerId, {
          reliable: true,
          metadata: { name: guestPlayerName },
        });

        conn.on('open', () => {
          this.setupConnection(conn);
          this.sendMessage({
            type: 'GUEST_JOINED',
            playerName: guestPlayerName,
          });
          resolve(this.roomCode);
        });

        conn.on('error', (err) => {
          reject(err);
        });
      });

      this.peer.on('error', (err) => {
        console.error('PeerJS Guest Error:', err);
        reject(new Error('Could not connect to room. Check code and try again.'));
      });
    });
  }

  /**
   * Setup event listeners on active WebRTC DataConnection.
   */
  setupConnection(conn) {
    this.conn = conn;
    this.isConnected = true;

    if (this.onConnectionStatusCallback) {
      this.onConnectionStatusCallback(true, conn.metadata);
    }

    this.conn.on('data', (data) => {
      this.handleIncomingData(data);
    });

    this.conn.on('close', () => {
      this.isConnected = false;
      if (this.onConnectionStatusCallback) {
        this.onConnectionStatusCallback(false, null);
      }
    });

    this.conn.on('error', (err) => {
      console.error('Connection error:', err);
    });
  }

  /**
   * Send a JSON or serialized message over the data channel.
   */
  sendMessage(payload) {
    if (this.conn && this.conn.open) {
      this.conn.send(payload);
    } else {
      console.warn('Cannot send message: WebRTC connection is not open.');
    }
  }

  /**
   * Send audio blob or buffer converted to Base64 data URI.
   */
  async sendAudio(type, blob) {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onloadend = () => {
        const base64data = reader.result;
        this.sendMessage({
          type: type,
          audioDataUri: base64data,
        });
        resolve();
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Route incoming data to the registered app callback.
   */
  handleIncomingData(data) {
    if (this.onMessageCallback) {
      this.onMessageCallback(data);
    }
  }

  disconnect() {
    if (this.conn) {
      this.conn.close();
      this.conn = null;
    }
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    this.isConnected = false;
    this.isHost = false;
  }
}

// Global network manager instance
window.networkManager = new NetworkManager();

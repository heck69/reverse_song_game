/**
 * audio.js - Web Audio API & MediaRecorder Engine
 * Handles microphone recording, AudioBuffer decoding, reversal, WAV encoding, and visualization.
 */

class AudioManager {
  constructor() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = null;
    this.AudioContextClass = AudioContextClass;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.currentStream = null;
    this.activeSourceNode = null;
    this.analyser = null;
    this.animationFrameId = null;
  }

  ensureContext() {
    if (!this.ctx) {
      this.ctx = new this.AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Request microphone permission and initialize media stream.
   * Only active while recording is taking place.
   */
  async requestMic() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      this.currentStream = stream;
      return stream;
    } catch (err) {
      console.error('Microphone access denied or unavailable:', err);
      throw new Error('Microphone permission is required to sing and play!');
    }
  }

  /**
   * Release microphone hardware tracks so orange indicator turns off immediately.
   */
  releaseMic() {
    if (this.currentStream) {
      this.currentStream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          // Ignored
        }
      });
      this.currentStream = null;
    }
  }

  /**
   * Start recording from the microphone.
   * @param {HTMLCanvasElement} [visualizerCanvas] - Optional canvas to draw real-time waveform.
   */
  async startRecording(visualizerCanvas = null) {
    this.ensureContext();
    // Freshly acquire mic stream
    const stream = await this.requestMic();
    this.audioChunks = [];

    // Setup visualizer if canvas provided
    if (visualizerCanvas) {
      this.startVisualizer(stream, visualizerCanvas);
    }

    // Determine supported mime type (optimized for iOS Safari and other browsers)
    let mimeType = '';
    const candidateTypes = [
      'audio/mp4',
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/wav'
    ];
    for (const type of candidateTypes) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(type)) {
        mimeType = type;
        break;
      }
    }

    const options = mimeType ? { mimeType } : {};
    this.mediaRecorder = new MediaRecorder(stream, options);

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.start(100); // 100ms chunks for smooth recording
  }

  /**
   * Stop recording, release microphone hardware, and return processed audio buffers.
   */
  async stopRecording() {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        this.releaseMic();
        this.stopVisualizer();
        return reject(new Error('No active recording to stop.'));
      }

      this.stopVisualizer();

      this.mediaRecorder.onstop = async () => {
        // Immediately release microphone hardware tracks
        this.releaseMic();

        try {
          const blob = new Blob(this.audioChunks, {
            type: this.mediaRecorder.mimeType || 'audio/webm',
          });
          const arrayBuffer = await blob.arrayBuffer();
          const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
          const reversedBuffer = this.reverseBuffer(audioBuffer);
          resolve({
            blob,
            audioBuffer,
            reversedBuffer,
            duration: audioBuffer.duration,
          });
        } catch (err) {
          reject(err);
        }
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Cancel any active recording and immediately release microphone.
   */
  cancelRecording() {
    this.stopVisualizer();
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch (e) {}
    }
    this.releaseMic();
    this.audioChunks = [];
  }

  /**
   * Reverses an AudioBuffer in memory.
   * @param {AudioBuffer} buffer
   * @returns {AudioBuffer} A new reversed AudioBuffer
   */
  reverseBuffer(buffer) {
    const channels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const length = buffer.length;

    const reversed = this.ctx.createBuffer(channels, length, sampleRate);

    for (let c = 0; c < channels; c++) {
      const srcData = buffer.getChannelData(c);
      const destData = reversed.getChannelData(c);
      for (let i = 0; i < length; i++) {
        destData[i] = srcData[length - 1 - i];
      }
    }

    return reversed;
  }

  /**
   * Play an AudioBuffer with customizable playback rate.
   * @param {AudioBuffer} buffer
   * @param {number} rate - Playback speed (1.0 = normal, 0.75 = slow)
   * @param {Function} onEnded - Callback when playback finishes
   * @returns {AudioBufferSourceNode}
   */
  playBuffer(buffer, rate = 1.0, onEnded = null) {
    this.stopPlayback();
    this.ensureContext();

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = rate;

    source.connect(this.ctx.destination);

    source.onended = () => {
      this.activeSourceNode = null;
      if (onEnded) onEnded();
    };

    source.start(0);
    this.activeSourceNode = source;
    return source;
  }

  /**
   * Stop any currently playing audio.
   */
  stopPlayback() {
    if (this.activeSourceNode) {
      try {
        this.activeSourceNode.stop();
      } catch (e) {
        // Ignored if already stopped
      }
      this.activeSourceNode = null;
    }
  }

  /**
   * Encodes an AudioBuffer into a WAV Blob (for easy network transmission and saving).
   * @param {AudioBuffer} buffer
   * @returns {Blob}
   */
  bufferToWavBlob(buffer) {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    let interleaved;
    if (numChannels === 2) {
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);
      interleaved = new Float32Array(left.length + right.length);
      for (let i = 0; i < left.length; i++) {
        interleaved[i * 2] = left[i];
        interleaved[i * 2 + 1] = right[i];
      }
    } else {
      interleaved = buffer.getChannelData(0);
    }

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const dataSize = interleaved.length * bytesPerSample;
    const bufferSize = 44 + dataSize;
    const arrayBuffer = new ArrayBuffer(bufferSize);
    const view = new DataView(arrayBuffer);

    // Write WAV header
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // SubChunk1Size (16 for PCM)
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true); // ByteRate
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    // Write PCM 16-bit samples
    let offset = 44;
    for (let i = 0; i < interleaved.length; i++) {
      let s = Math.max(-1, Math.min(1, interleaved[i]));
      s = s < 0 ? s * 0x8000 : s * 0x7fff;
      view.setInt16(offset, s, true);
      offset += 2;
    }

    return new Blob([view], { type: 'audio/wav' });
  }

  /**
   * Decode an ArrayBuffer or Blob into an AudioBuffer.
   */
  async decodeAudio(data) {
    this.ensureContext();
    let arrayBuffer;
    if (data instanceof Blob) {
      arrayBuffer = await data.arrayBuffer();
    } else {
      arrayBuffer = data;
    }
    return await this.ctx.decodeAudioData(arrayBuffer);
  }

  /**
   * Unlock AudioContext for iOS Safari on first user interaction.
   */
  unlockForIOS() {
    const ctx = this.ensureContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    try {
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
    } catch (e) {
      // Ignored
    }
  }

  /**
   * Real-time audio waveform/frequency visualizer on canvas.
   */
  startVisualizer(stream, canvas) {
    this.ensureContext();
    this.visualizerSource = this.ctx.createMediaStreamSource(stream);
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 128;
    this.visualizerSource.connect(this.analyser);

    // Support Retina displays on iPhone
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    if (rect.width > 0) {
      canvas.width = rect.width * dpr;
      canvas.height = (rect.height || 60) * dpr;
    }

    const canvasCtx = canvas.getContext('2d');
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      this.animationFrameId = requestAnimationFrame(draw);
      this.analyser.getByteFrequencyData(dataArray);

      const width = canvas.width;
      const height = canvas.height;
      canvasCtx.clearRect(0, 0, width, height);

      const barWidth = (width / bufferLength) * 1.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height * 0.9;

        // Clean iOS System Blue Waveform
        canvasCtx.fillStyle = '#0A84FF';
        canvasCtx.beginPath();
        canvasCtx.roundRect(x, height - barHeight, Math.max(2, barWidth - 2), barHeight, 4);
        canvasCtx.fill();

        x += barWidth;
      }
    };

    draw();
  }

  stopVisualizer() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.visualizerSource) {
      try {
        this.visualizerSource.disconnect();
      } catch (e) {}
      this.visualizerSource = null;
    }
    if (this.analyser) {
      try {
        this.analyser.disconnect();
      } catch (e) {}
      this.analyser = null;
    }
  }
}

// Global audio manager instance
window.audioManager = new AudioManager();

// Unlock iOS Web Audio on first touch/tap
const iosAudioUnlock = () => {
  if (window.audioManager) {
    window.audioManager.unlockForIOS();
  }
  window.removeEventListener('touchstart', iosAudioUnlock, true);
  window.removeEventListener('pointerdown', iosAudioUnlock, true);
  window.removeEventListener('click', iosAudioUnlock, true);
};
window.addEventListener('touchstart', iosAudioUnlock, true);
window.addEventListener('pointerdown', iosAudioUnlock, true);
window.addEventListener('click', iosAudioUnlock, true);

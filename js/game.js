/**
 * game.js - Game State Machine & Rules Engine
 * Handles player profiles, turn alternating, scoring (+1 guesser vs -1 guesser / +1 singer),
 * win conditions, and persistent leaderboard.
 */

class GameEngine {
  constructor() {
    this.mode = 'pass_play'; // 'pass_play' or 'multiplayer'
    this.localPlayerIndex = null; // 0 for Host, 1 for Guest, null for pass_play
    this.targetScore = 5; // 0 means endless
    this.players = [
      { id: 0, name: 'Player 1', score: 0 },
      { id: 1, name: 'Player 2', score: 0 },
    ];
    this.currentSingerIndex = 0;
    this.roundNumber = 0;
    this.isFirstRound = true;

    // Current round assets
    this.roundData = {
      originalBuffer: null,
      reversedBuffer: null,
      mimicBuffer: null,
      reReversedMimicBuffer: null,
      guesserAttemptedMimic: false,
    };

    this.loadLeaderboard();
  }

  get currentGuesserIndex() {
    return 1 - this.currentSingerIndex;
  }

  get singer() {
    return this.players[this.currentSingerIndex];
  }

  get guesser() {
    return this.players[this.currentGuesserIndex];
  }

  get isMyTurnToSing() {
    if (this.mode !== 'multiplayer' || this.localPlayerIndex === null) return true;
    return this.currentSingerIndex === this.localPlayerIndex;
  }

  get isMyTurnToGuess() {
    if (this.mode !== 'multiplayer' || this.localPlayerIndex === null) return true;
    return this.currentGuesserIndex === this.localPlayerIndex;
  }

  get myPlayer() {
    if (this.localPlayerIndex === null) return null;
    return this.players[this.localPlayerIndex];
  }

  get opponentPlayer() {
    if (this.localPlayerIndex === null) return null;
    return this.players[1 - this.localPlayerIndex];
  }

  /**
   * Initialize a new match with player names and target score.
   */
  startNewMatch({ player1Name, player2Name, mode = 'pass_play', targetScore = 5, localPlayerIndex = null }) {
    this.mode = mode;
    if (localPlayerIndex !== null) {
      this.localPlayerIndex = localPlayerIndex;
    }
    this.targetScore = parseInt(targetScore, 10);
    this.players[0].name = player1Name.trim() || 'Player 1';
    this.players[0].score = 0;
    this.players[1].name = player2Name.trim() || 'Player 2';
    this.players[1].score = 0;
    this.roundNumber = 0;
    this.isFirstRound = true;
    this.resetRoundData();
  }

  /**
   * Determine the starting singer (random coin flip for round 1, alternating thereafter).
   */
  determineNextSinger() {
    this.roundNumber++;
    if (this.isFirstRound) {
      // 50/50 coin flip for the first round
      this.currentSingerIndex = Math.random() < 0.5 ? 0 : 1;
      this.isFirstRound = false;
    } else {
      // Strictly alternate turns
      this.currentSingerIndex = 1 - this.currentSingerIndex;
    }
    this.resetRoundData();
    return this.currentSingerIndex;
  }

  resetRoundData() {
    this.roundData = {
      originalBuffer: null,
      reversedBuffer: null,
      mimicBuffer: null,
      reReversedMimicBuffer: null,
      guesserAttemptedMimic: false,
    };
  }

  /**
   * Store singer recording and its reversed version.
   */
  setSingerAudio(originalBuffer, reversedBuffer) {
    this.roundData.originalBuffer = originalBuffer;
    this.roundData.reversedBuffer = reversedBuffer;
  }

  /**
   * Store guesser mimic recording and its re-reversed version.
   */
  setGuesserMimicAudio(mimicBuffer, reReversedMimicBuffer) {
    this.roundData.mimicBuffer = mimicBuffer;
    this.roundData.reReversedMimicBuffer = reReversedMimicBuffer;
    this.roundData.guesserAttemptedMimic = true;
  }

  /**
   * Apply scoring based on Singer's verdict:
   * - gotIt: true -> Guesser +1
   * - gotIt: false -> Guesser -1, Singer +1
   */
  applyVerdict(gotIt) {
    const guesser = this.guesser;
    const singer = this.singer;

    let pointsDelta = {
      guesser: 0,
      singer: 0,
      winner: null,
    };

    if (gotIt) {
      guesser.score += 1;
      pointsDelta.guesser = +1;
    } else {
      guesser.score -= 1;
      singer.score += 1;
      pointsDelta.guesser = -1;
      pointsDelta.singer = +1;
    }

    // Update historical leaderboard
    this.recordScoreToLeaderboard(guesser.name, pointsDelta.guesser);
    if (pointsDelta.singer > 0) {
      this.recordScoreToLeaderboard(singer.name, pointsDelta.singer);
    }

    // Check win condition
    if (this.targetScore > 0) {
      if (guesser.score >= this.targetScore) {
        pointsDelta.winner = guesser;
      } else if (singer.score >= this.targetScore) {
        pointsDelta.winner = singer;
      }
    }

    return pointsDelta;
  }

  /**
   * Persistent Leaderboard Management via localStorage
   */
  loadLeaderboard() {
    try {
      const data = localStorage.getItem('reverse_song_leaderboard');
      this.leaderboard = data ? JSON.parse(data) : {};
    } catch (e) {
      console.warn('Failed to parse leaderboard from localStorage:', e);
      this.leaderboard = {};
    }
    return this.getSortedLeaderboard();
  }

  saveLeaderboard() {
    try {
      localStorage.setItem('reverse_song_leaderboard', JSON.stringify(this.leaderboard));
    } catch (e) {
      console.warn('Failed to save leaderboard to localStorage:', e);
    }
  }

  recordScoreToLeaderboard(playerName, delta) {
    const key = playerName.trim();
    if (!key) return;

    if (!this.leaderboard[key]) {
      this.leaderboard[key] = {
        name: key,
        totalPoints: 0,
        roundsPlayed: 0,
        correctGuesses: 0,
        stumpWins: 0,
      };
    }

    this.leaderboard[key].totalPoints += delta;
    this.leaderboard[key].roundsPlayed += 1;
    if (delta > 0) {
      this.leaderboard[key].correctGuesses += 1;
    }

    this.saveLeaderboard();
  }

  getSortedLeaderboard() {
    const list = Object.values(this.leaderboard || {});
    list.sort((a, b) => b.totalPoints - a.totalPoints);
    return list;
  }

  clearLeaderboard() {
    this.leaderboard = {};
    this.saveLeaderboard();
  }
}

// Global game engine instance
window.gameEngine = new GameEngine();

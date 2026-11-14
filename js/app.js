/**
 * app.js - UI Controller & Event Coordination (Apple iOS HIG + Supabase Auth & History)
 * Connects iOS navigation, Supabase Database, Audio engine, Game state machine, and PeerJS WebRTC.
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Screen References
  const screens = {
    auth: document.getElementById('screen-auth'),
    home: document.getElementById('screen-home'),
    history: document.getElementById('screen-history'),
    lobby: document.getElementById('screen-lobby'),
    coinflip: document.getElementById('screen-coinflip'),
    singer: document.getElementById('screen-singer'),
    pass: document.getElementById('screen-pass'),
    guesser: document.getElementById('screen-guesser'),
    score: document.getElementById('screen-score'),
    winner: document.getElementById('screen-winner'),
  };

  // iOS Navigation Bar & Modal Elements
  const iosNavBar = document.getElementById('ios-nav-bar');
  const btnIosBack = document.getElementById('btn-ios-back');
  const btnIosHome = document.getElementById('btn-ios-home');
  const btnIosHistory = document.getElementById('btn-ios-history');
  const iosNavTitle = document.getElementById('ios-nav-title');
  const appHeader = document.getElementById('app-header');
  const iosModalOverlay = document.getElementById('ios-modal-overlay');
  const btnAlertCancel = document.getElementById('btn-alert-cancel');
  const btnAlertConfirm = document.getElementById('btn-alert-confirm');

  // Auth Elements
  const btnToSignup = document.getElementById('btn-to-signup');
  const btnToLogin = document.getElementById('btn-to-login');
  const authLoginForm = document.getElementById('auth-login-form');
  const authSignupForm = document.getElementById('auth-signup-form');
  const loginUsername = document.getElementById('login-username');
  const loginPassword = document.getElementById('login-password');
  const btnSubmitLogin = document.getElementById('btn-submit-login');
  const signupUsername = document.getElementById('signup-username');
  const signupPassword = document.getElementById('signup-password');
  const signupQuestion = document.getElementById('signup-question');
  const signupAnswer = document.getElementById('signup-answer');
  const btnSubmitSignup = document.getElementById('btn-submit-signup');
  const btnOpenRecovery = document.getElementById('btn-open-recovery');
  const btnGuestLogin = document.getElementById('btn-guest-login');
  const authRecoveryCard = document.getElementById('auth-recovery-card');
  const btnCloseRecovery = document.getElementById('btn-close-recovery');
  const btnRecovTabPwd = document.getElementById('btn-recov-tab-pwd');
  const btnRecovTabUser = document.getElementById('btn-recov-tab-user');
  const recovPwdSection = document.getElementById('recov-pwd-section');
  const recovUserSection = document.getElementById('recov-user-section');
  const recovUsername = document.getElementById('recov-username');
  const btnFetchQuestion = document.getElementById('btn-fetch-question');
  const recovQuestionDisplay = document.getElementById('recov-question-display');
  const recovQuestionText = document.getElementById('recov-question-text');
  const recovAnswer = document.getElementById('recov-answer');
  const btnRevealPwd = document.getElementById('btn-reveal-pwd');
  const recovDirectAnswer = document.getElementById('recov-direct-answer');
  const btnRevealUsername = document.getElementById('btn-reveal-username');
  const recovResultBox = document.getElementById('recov-result-box');

  // Home & User Bar
  const homeUserGreeting = document.getElementById('home-user-greeting');
  const btnSignout = document.getElementById('btn-signout');
  const p2LinkBadge = document.getElementById('p2-link-badge');

  // History Screen Elements
  const btnCloseHistory = document.getElementById('btn-close-history');
  const historyItemsList = document.getElementById('history-items-list');

  // Scoreboard Elements
  const scoreboardEl = document.getElementById('game-scoreboard');
  const scoreP1NameEl = document.getElementById('score-p1-name');
  const scoreP1PtsEl = document.getElementById('score-p1-pts');
  const scoreP2NameEl = document.getElementById('score-p2-name');
  const scoreP2PtsEl = document.getElementById('score-p2-pts');
  const scoreP1Box = document.getElementById('score-p1-box');
  const scoreP2Box = document.getElementById('score-p2-box');

  // Home Controls
  const btnModeSingle = document.getElementById('btn-mode-single');
  const btnModeMulti = document.getElementById('btn-mode-multi');
  const inputP1Name = document.getElementById('input-p1-name');
  const inputP2Name = document.getElementById('input-p2-name');
  const labelP1 = document.getElementById('label-player-1');
  const groupP2 = document.getElementById('group-p2-name');
  const multiOptions = document.getElementById('multiplayer-options');
  const btnMultiCreate = document.getElementById('btn-multi-create');
  const btnMultiJoin = document.getElementById('btn-multi-join');
  const groupJoinCode = document.getElementById('group-join-code');
  const inputRoomCode = document.getElementById('input-room-code');
  const selectTargetScore = document.getElementById('select-target-score');
  const btnStartMatch = document.getElementById('btn-start-match');
  const leaderboardList = document.getElementById('leaderboard-list');
  const btnResetLeaderboard = document.getElementById('btn-reset-leaderboard');

  // Lobby Elements
  const displayRoomCode = document.getElementById('display-room-code');
  const lobbyStatusDot = document.getElementById('lobby-status-dot');
  const lobbyStatusText = document.getElementById('lobby-status-text');
  const btnCopyRoomCode = document.getElementById('btn-copy-room-code');

  // Coinflip Elements
  const coinflipTitle = document.getElementById('coinflip-title');
  const coinflipResult = document.getElementById('coinflip-result');
  const btnProceedToSinger = document.getElementById('btn-proceed-to-singer');

  // Singer Elements
  const singerTitle = document.getElementById('singer-title');
  const singerSubtitle = document.getElementById('singer-subtitle');
  const singerRecordSection = document.getElementById('singer-record-section');
  const btnSingerRecord = document.getElementById('btn-singer-record');
  const singerTimer = document.getElementById('singer-timer');
  const singerRecordHint = document.getElementById('singer-record-hint');
  const singerCanvas = document.getElementById('singer-canvas');
  const singerPreviewSection = document.getElementById('singer-preview-section');
  const btnSingerPlayback = document.getElementById('btn-singer-playback');
  const btnSingerRerecord = document.getElementById('btn-singer-rerecord');
  const btnSingerSubmit = document.getElementById('btn-singer-submit');
  const guesserWaitingSingerCard = document.getElementById('guesser-waiting-singer-card');
  const guesserWaitingTitle = document.getElementById('guesser-waiting-title');
  const guesserWaitingSubtitle = document.getElementById('guesser-waiting-subtitle');
  const singerWaitingGuesserCard = document.getElementById('singer-waiting-guesser-card');
  const singerWaitingTitle = document.getElementById('singer-waiting-title');
  const singerWaitingSubtitle = document.getElementById('singer-waiting-subtitle');

  // Pass Elements
  const passTitle = document.getElementById('pass-title');
  const btnPassReady = document.getElementById('btn-pass-ready');

  // Guesser Elements
  const guesserTitle = document.getElementById('guesser-title');
  const guesserMainControls = document.getElementById('guesser-main-controls');
  const btnPlayReversed = document.getElementById('btn-play-reversed');
  const btnSpeedNormal = document.getElementById('btn-speed-normal');
  const btnSpeedSlow = document.getElementById('btn-speed-slow');
  const btnGuesserMimicRecord = document.getElementById('btn-guesser-mimic-record');
  const mimicStatusText = document.getElementById('mimic-status-text');
  const btnPlayMimicRereversed = document.getElementById('btn-play-mimic-rereversed');
  const btnGuesserReadyToScore = document.getElementById('btn-guesser-ready-to-score');
  const guesserWaitingVerdictCard = document.getElementById('guesser-waiting-verdict-card');
  const guesserVerdictSubtitle = document.getElementById('guesser-verdict-subtitle');

  // Scoring Elements
  const verdictTitle = document.getElementById('verdict-title');
  const verdictSubtitle = document.getElementById('verdict-subtitle');
  const btnVerdictGot = document.getElementById('btn-verdict-got');
  const btnVerdictNotGot = document.getElementById('btn-verdict-not-got');
  const btnPlayOriginalCompare = document.getElementById('btn-play-original-compare');
  const btnPlayMimicCompare = document.getElementById('btn-play-mimic-compare');

  // Winner Elements
  const winnerDisplayName = document.getElementById('winner-display-name');
  const winnerSummary = document.getElementById('winner-summary');
  const btnPlayAgain = document.getElementById('btn-play-again');
  const btnBackToHome = document.getElementById('btn-back-to-home');

  // Reconnection Modal Elements
  const reconnectModalOverlay = document.getElementById('reconnect-modal-overlay');
  const reconnectCountdown = document.getElementById('reconnect-countdown');
  const btnReconnectLeave = document.getElementById('btn-reconnect-leave');

  // Toast
  const toastBanner = document.getElementById('toast-banner');

  // State flags, timers & navigation stack
  let selectedMode = 'single';
  let multiSubMode = 'create';
  let isSingerRecording = false;
  let isMimicRecording = false;
  let recordingStartTime = 0;
  let recordingInterval = null;
  let currentPlaybackRate = 1.0;
  let currentScreenKey = 'auth';
  let navStack = [];
  let p2DebounceTimer = null;
  let reconnectInterval = null;
  let reconnectSeconds = 30;

  const screenTitles = {
    auth: 'Sign In',
    home: 'Match Setup',
    history: 'Match History',
    lobby: 'Lobby',
    coinflip: 'Round Turn',
    singer: 'Singer',
    pass: 'Pass Device',
    guesser: 'Guesser',
    score: 'Scoring',
    winner: 'Victory',
  };

  // ==========================================================================
  // iOS Navigation & Screen Routing
  // ==========================================================================
  function showToast(message, duration = 2800) {
    toastBanner.textContent = message;
    toastBanner.style.display = 'block';
    setTimeout(() => {
      toastBanner.style.display = 'none';
    }, duration);
  }

  function showScreen(screenKey, isBack = false) {
    window.audioManager.stopPlayback();
    window.audioManager.cancelRecording();

    if (isSingerRecording || isMimicRecording) {
      clearInterval(recordingInterval);
      isSingerRecording = false;
      isMimicRecording = false;
      btnSingerRecord.classList.remove('recording');
    }

    if (!isBack && currentScreenKey !== screenKey && currentScreenKey !== 'winner' && currentScreenKey !== 'auth') {
      navStack.push(currentScreenKey);
    }
    currentScreenKey = screenKey;

    Object.values(screens).forEach((el) => {
      if (el) el.classList.remove('active');
    });

    if (screens[screenKey]) {
      screens[screenKey].classList.add('active');
    }

    // Toggle iOS Nav Bar vs Header
    if (screenKey === 'auth' || screenKey === 'home') {
      iosNavBar.style.display = 'none';
      appHeader.style.display = 'block';
      scoreboardEl.style.display = 'none';
      if (screenKey === 'home') {
        navStack = [];
        renderLeaderboard();
      }
    } else {
      iosNavBar.style.display = 'flex';
      appHeader.style.display = 'none';
      scoreboardEl.style.display = screenKey === 'history' ? 'none' : 'flex';
      iosNavTitle.textContent = screenTitles[screenKey] || 'Reverse Song';
      updateScoreboardUI();
    }
  }

  // Handle iOS Back Button
  btnIosBack.addEventListener('click', () => {
    if (navStack.length > 0) {
      const prev = navStack.pop();
      showScreen(prev, true);
    } else {
      showScreen('home', true);
    }
  });

  // Handle iOS Home Button
  btnIosHome.addEventListener('click', () => {
    if (currentScreenKey === 'home' || currentScreenKey === 'auth') return;
    iosModalOverlay.classList.add('active');
  });

  btnAlertCancel.addEventListener('click', () => {
    iosModalOverlay.classList.remove('active');
  });

  btnAlertConfirm.addEventListener('click', () => {
    iosModalOverlay.classList.remove('active');
    stopReconnectTimer();
    if (window.gameEngine.mode === 'multiplayer') {
      window.networkManager.disconnect();
    }
    window.gameEngine.resetRoundData();
    showScreen('home');
    showToast('Returned to Home');
  });

  // Reconnection Grace Period Handlers
  function startReconnectTimer() {
    if (reconnectInterval) clearInterval(reconnectInterval);
    reconnectSeconds = 30;
    if (reconnectCountdown) reconnectCountdown.textContent = reconnectSeconds;
    if (reconnectModalOverlay) reconnectModalOverlay.classList.add('active');

    reconnectInterval = setInterval(() => {
      reconnectSeconds--;
      if (reconnectCountdown) reconnectCountdown.textContent = reconnectSeconds;
      if (reconnectSeconds <= 0) {
        stopReconnectTimer();
        if (window.gameEngine.mode === 'multiplayer') {
          window.networkManager.disconnect();
        }
        showScreen('home');
        showToast('Opponent disconnected. Returned to Home.');
      }
    }, 1000);
  }

  function stopReconnectTimer() {
    if (reconnectInterval) {
      clearInterval(reconnectInterval);
      reconnectInterval = null;
    }
    if (reconnectModalOverlay) reconnectModalOverlay.classList.remove('active');
  }

  if (btnReconnectLeave) {
    btnReconnectLeave.addEventListener('click', () => {
      stopReconnectTimer();
      if (window.gameEngine.mode === 'multiplayer') {
        window.networkManager.disconnect();
      }
      showScreen('home');
      showToast('Match abandoned.');
    });
  }

  // ==========================================================================
  // Supabase Authentication & Recovery
  // ==========================================================================
  if (btnToSignup) {
    btnToSignup.addEventListener('click', () => {
      authLoginForm.style.display = 'none';
      authSignupForm.style.display = 'flex';
      authRecoveryCard.style.display = 'none';
    });
  }

  if (btnToLogin) {
    btnToLogin.addEventListener('click', () => {
      authSignupForm.style.display = 'none';
      authLoginForm.style.display = 'flex';
      authRecoveryCard.style.display = 'none';
    });
  }

  // Sign In Click
  btnSubmitLogin.addEventListener('click', async () => {
    const user = loginUsername.value.trim();
    const pass = loginPassword.value.trim();

    if (!user || !pass) {
      alert('Please enter both username and password.');
      return;
    }

    btnSubmitLogin.disabled = true;
    btnSubmitLogin.querySelector('span').textContent = 'Signing in...';

    try {
      const loggedUser = await window.supabaseManager.login(user, pass);
      onUserSignedIn(loggedUser.username);
    } catch (err) {
      alert('Sign In Failed: ' + err.message);
    } finally {
      btnSubmitLogin.disabled = false;
      btnSubmitLogin.querySelector('span').textContent = 'Sign In';
    }
  });

  // Sign Up Click
  btnSubmitSignup.addEventListener('click', async () => {
    const user = signupUsername.value.trim();
    const pass = signupPassword.value.trim();
    const question = signupQuestion.value.trim();
    const answer = signupAnswer.value.trim();

    if (!user || !pass || !question || !answer) {
      alert('Please fill out all fields including your security question and answer.');
      return;
    }

    btnSubmitSignup.disabled = true;
    btnSubmitSignup.querySelector('span').textContent = 'Creating account...';

    try {
      await window.supabaseManager.signUp(user, pass, question, answer);
      showToast('Account created successfully!');
      // Switch back to Login view with credentials pre-filled
      loginUsername.value = user;
      loginPassword.value = pass;
      if (btnToLogin) btnToLogin.click();
    } catch (err) {
      alert('Sign Up Failed: ' + err.message);
    } finally {
      btnSubmitSignup.disabled = false;
      btnSubmitSignup.querySelector('span').textContent = 'Create Account';
    }
  });

  // Play Offline / Guest
  btnGuestLogin.addEventListener('click', () => {
    onUserSignedIn('Player 1', true);
  });

  function onUserSignedIn(username, isGuest = false) {
    inputP1Name.value = username;
    homeUserGreeting.textContent = isGuest ? 'Guest Mode (Offline)' : `Signed in as ${username}`;
    showToast(`Welcome, ${username}!`);
    showScreen('home');
  }

  // Log Out
  btnSignout.addEventListener('click', () => {
    window.supabaseManager.logout();
    loginPassword.value = '';
    showToast('Signed out');
    showScreen('auth');
  });

  // Open / Close Recovery Card
  btnOpenRecovery.addEventListener('click', () => {
    authLoginForm.style.display = 'none';
    authRecoveryCard.style.display = 'flex';
    recovResultBox.style.display = 'none';
  });

  btnCloseRecovery.addEventListener('click', () => {
    authRecoveryCard.style.display = 'none';
    authLoginForm.style.display = 'flex';
  });

  btnRecovTabPwd.addEventListener('click', () => {
    btnRecovTabPwd.classList.add('active');
    btnRecovTabUser.classList.remove('active');
    recovPwdSection.style.display = 'flex';
    recovUserSection.style.display = 'none';
    recovResultBox.style.display = 'none';
  });

  btnRecovTabUser.addEventListener('click', () => {
    btnRecovTabUser.classList.add('active');
    btnRecovTabPwd.classList.remove('active');
    recovUserSection.style.display = 'flex';
    recovPwdSection.style.display = 'none';
    recovResultBox.style.display = 'none';
  });

  // Fetch security question for username
  btnFetchQuestion.addEventListener('click', async () => {
    const user = recovUsername.value.trim();
    if (!user) {
      alert('Please enter your username.');
      return;
    }

    try {
      const data = await window.supabaseManager.getQuestionForUser(user);
      recovQuestionText.textContent = `Question: ${data.security_question}`;
      recovQuestionDisplay.style.display = 'flex';
    } catch (err) {
      alert(err.message);
    }
  });

  // Reveal password by answer
  btnRevealPwd.addEventListener('click', async () => {
    const user = recovUsername.value.trim();
    const ans = recovAnswer.value.trim();
    if (!ans) {
      alert('Please enter your answer.');
      return;
    }

    try {
      const creds = await window.supabaseManager.verifyAnswerAndGetPassword(user, ans);
      recovResultBox.innerHTML = `<strong>Success!</strong><br>Your password is: <span style="color:#fff; font-weight:700;">${escapeHtml(creds.password)}</span>`;
      recovResultBox.style.display = 'block';
    } catch (err) {
      alert(err.message);
    }
  });

  // Forgot Username: Find by Answer Only
  btnRevealUsername.addEventListener('click', async () => {
    const ans = recovDirectAnswer.value.trim();
    if (!ans) {
      alert('Please enter the security answer.');
      return;
    }

    try {
      const results = await window.supabaseManager.recoverByAnswerOnly(ans);
      const items = results
        .map((r) => `Username: <strong>${escapeHtml(r.username)}</strong> &bull; Password: <strong>${escapeHtml(r.password)}</strong>`)
        .join('<br>');
      recovResultBox.innerHTML = `<strong>Account Found:</strong><br>${items}`;
      recovResultBox.style.display = 'block';
    } catch (err) {
      alert(err.message);
    }
  });

  // ==========================================================================
  // Auto-Match Registered Player 2 in Single-Device Mode
  // ==========================================================================
  inputP2Name.addEventListener('input', () => {
    clearTimeout(p2DebounceTimer);
    p2LinkBadge.style.display = 'none';
    const val = inputP2Name.value.trim();
    if (val.length >= 2 && window.supabaseManager.isConfigured()) {
      p2DebounceTimer = setTimeout(async () => {
        const found = await window.supabaseManager.checkRegisteredPlayer(val);
        if (found) {
          p2LinkBadge.style.display = 'inline';
          showToast(`Linked account: ${found.username} (${found.all_time_score || 0} pts)`);
        }
      }, 500);
    }
  });

  // ==========================================================================
  // History Tab & Cloud Records
  // ==========================================================================
  btnIosHistory.addEventListener('click', async () => {
    const currentUser = inputP1Name.value.trim() || 'Player 1';
    showScreen('history');
    historyItemsList.innerHTML = '<div class="empty-leaderboard">Loading matches from Supabase...</div>';

    const matches = await window.supabaseManager.getHistoryForUser(currentUser);
    if (!matches || matches.length === 0) {
      historyItemsList.innerHTML = '<div class="empty-leaderboard">No past matches recorded in Supabase yet.</div>';
      return;
    }

    historyItemsList.innerHTML = matches
      .map((m) => {
        const isWinner = m.winner.toLowerCase() === currentUser.toLowerCase();
        const dateStr = new Date(m.played_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        return `
          <div class="leaderboard-item" style="display:flex; flex-direction:column; align-items:flex-start; gap:4px; padding:10px 0;">
            <div style="display:flex; justify-content:space-between; width:100%;">
              <span style="font-weight:600; color:var(--ios-label);">${escapeHtml(m.player1_name)} vs ${escapeHtml(m.player2_name)}</span>
              <span style="font-size:12px; color:var(--ios-secondary-label);">${dateStr}</span>
            </div>
            <div style="display:flex; justify-content:space-between; width:100%; font-size:13px;">
              <span style="color:${isWinner ? '#30d158' : 'var(--ios-secondary-label)'}; font-weight:600;">
                ${isWinner ? '🏆 Won' : 'Defeat'} (${m.player1_score} - ${m.player2_score})
              </span>
              <span style="color:var(--ios-tertiary-label); font-size:11px;">
                ${m.game_mode === 'single_device' ? '📱 1 Device' : '🌐 2 Devices'}
              </span>
            </div>
          </div>
        `;
      })
      .join('');
  });

  btnCloseHistory.addEventListener('click', () => {
    showScreen('home');
  });

  // ==========================================================================
  // Gameplay Scoreboard UI
  // ==========================================================================
  function updateScoreboardUI() {
    scoreP1NameEl.textContent = window.gameEngine.players[0].name;
    scoreP1PtsEl.textContent = window.gameEngine.players[0].score;
    scoreP2NameEl.textContent = window.gameEngine.players[1].name;
    scoreP2PtsEl.textContent = window.gameEngine.players[1].score;

    if (window.gameEngine.currentSingerIndex === 0) {
      scoreP1Box.classList.add('active');
      scoreP2Box.classList.remove('active');
    } else {
      scoreP1Box.classList.remove('active');
      scoreP2Box.classList.add('active');
    }
  }

  function renderLeaderboard() {
    const list = window.gameEngine.getSortedLeaderboard();
    if (!list || list.length === 0) {
      leaderboardList.innerHTML = '<div class="empty-leaderboard">No scores recorded yet.</div>';
      return;
    }

    leaderboardList.innerHTML = list
      .map((item, idx) => `
        <div class="leaderboard-item">
          <span class="leaderboard-rank">#${idx + 1}</span>
          <span class="leaderboard-player">${escapeHtml(item.name)}</span>
          <span class="leaderboard-pts">${item.totalPoints > 0 ? '+' : ''}${item.totalPoints} pts</span>
        </div>
      `)
      .join('');
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ==========================================================================
  // Home Screen Setup & Mode Selection
  // ==========================================================================
  btnModeSingle.addEventListener('click', () => {
    selectedMode = 'single';
    btnModeSingle.classList.add('active');
    btnModeMulti.classList.remove('active');
    multiOptions.style.display = 'none';
    labelP1.textContent = 'Player 1';
    groupP2.style.display = 'flex';
    btnStartMatch.querySelector('span').textContent = 'Start Game';
  });

  btnModeMulti.addEventListener('click', () => {
    selectedMode = 'multi';
    btnModeMulti.classList.add('active');
    btnModeSingle.classList.remove('active');
    multiOptions.style.display = 'flex';
    updateMultiplayerForm();
  });

  btnMultiCreate.addEventListener('click', () => {
    multiSubMode = 'create';
    btnMultiCreate.classList.add('active');
    btnMultiJoin.classList.remove('active');
    updateMultiplayerForm();
  });

  btnMultiJoin.addEventListener('click', () => {
    multiSubMode = 'join';
    btnMultiJoin.classList.add('active');
    btnMultiCreate.classList.remove('active');
    updateMultiplayerForm();
  });

  function updateMultiplayerForm() {
    if (multiSubMode === 'create') {
      labelP1.textContent = 'Your Name (Host)';
      groupP2.style.display = 'none';
      groupJoinCode.style.display = 'none';
      btnStartMatch.querySelector('span').textContent = 'Create Room';
    } else {
      labelP1.textContent = 'Your Name';
      groupP2.style.display = 'none';
      groupJoinCode.style.display = 'flex';
      btnStartMatch.querySelector('span').textContent = 'Connect & Join';
    }
  }

  btnResetLeaderboard.addEventListener('click', () => {
    if (confirm('Reset all leaderboard scores?')) {
      window.gameEngine.clearLeaderboard();
      renderLeaderboard();
      showToast('Leaderboard reset');
    }
  });

  // Start Match
  btnStartMatch.addEventListener('click', async () => {
    const p1Name = inputP1Name.value.trim() || 'Player 1';
    const targetScore = parseInt(selectTargetScore.value, 10);

    window.audioManager.ensureContext();

    if (selectedMode === 'single') {
      const p2Name = inputP2Name.value.trim() || 'Player 2';
      window.gameEngine.startNewMatch({
        player1Name: p1Name,
        player2Name: p2Name,
        mode: 'pass_play',
        targetScore,
      });
      initiateCoinFlip();
    } else {
      // Multiplayer Mode
      if (multiSubMode === 'create') {
        const code = window.networkManager.generateRoomCode();
        displayRoomCode.textContent = code;
        lobbyStatusDot.classList.remove('connected');
        lobbyStatusText.textContent = 'Connecting...';
        showScreen('lobby');

        try {
          await window.networkManager.createRoom(code, p1Name);
          lobbyStatusText.textContent = 'Waiting for Player 2 to join...';

          window.networkManager.onConnectionStatusCallback = (connected, meta) => {
            if (connected) {
              stopReconnectTimer();
              lobbyStatusDot.classList.add('connected');
              const guestName = (meta && meta.name) ? meta.name : 'Player 2';
              lobbyStatusText.textContent = `${guestName} connected!`;

              window.gameEngine.startNewMatch({
                player1Name: p1Name,
                player2Name: guestName,
                mode: 'multiplayer',
                targetScore,
                localPlayerIndex: 0,
              });

              window.networkManager.sendMessage({
                type: 'INIT_MATCH',
                config: {
                  player1Name: p1Name,
                  player2Name: guestName,
                  targetScore,
                },
              });

              setTimeout(() => {
                initiateCoinFlip();
              }, 1000);
            } else {
              lobbyStatusDot.classList.remove('connected');
              lobbyStatusText.textContent = 'Player disconnected.';
              if (currentScreenKey !== 'home' && currentScreenKey !== 'auth' && currentScreenKey !== 'lobby') {
                startReconnectTimer();
              } else {
                showToast('Player disconnected');
              }
            }
          };
        } catch (err) {
          alert('Failed to create room: ' + err.message);
          showScreen('home');
        }
      } else {
        // Join Room
        const code = inputRoomCode.value.trim().toUpperCase();
        if (!code || code.length < 3) {
          alert('Please enter a valid room code.');
          return;
        }

        btnStartMatch.disabled = true;
        btnStartMatch.querySelector('span').textContent = 'Connecting...';

        try {
          await window.networkManager.joinRoom(code, p1Name);
          displayRoomCode.textContent = code;
          lobbyStatusDot.classList.add('connected');
          lobbyStatusText.textContent = 'Connected! Waiting for host to start match...';
          btnCopyRoomCode.style.display = 'none';
          showScreen('lobby');
          showToast('Connected to Host!');

          window.networkManager.onConnectionStatusCallback = (connected) => {
            if (connected) {
              stopReconnectTimer();
            } else {
              if (currentScreenKey !== 'home' && currentScreenKey !== 'auth' && currentScreenKey !== 'lobby') {
                startReconnectTimer();
              } else {
                showToast('Disconnected from host.');
                showScreen('home');
              }
            }
          };
        } catch (err) {
          alert('Failed to connect: ' + err.message);
          btnStartMatch.disabled = false;
          updateMultiplayerForm();
        }
      }
    }
  });

  btnCopyRoomCode.addEventListener('click', () => {
    const code = displayRoomCode.textContent;
    if (code && code !== '----') {
      navigator.clipboard.writeText(code).then(() => {
        showToast(`Copied code: ${code}`);
      }).catch(() => {
        showToast(`Code is: ${code}`);
      });
    }
  });

  // ==========================================================================
  // Coin Flip / Turn Phase
  // ==========================================================================
  function initiateCoinFlip() {
    const singerIndex = window.gameEngine.determineNextSinger();
    const singerName = window.gameEngine.players[singerIndex].name;
    const isFirst = window.gameEngine.roundNumber === 1;

    coinflipTitle.textContent = isFirst ? 'First Round' : `Round ${window.gameEngine.roundNumber}`;
    coinflipResult.textContent = `${singerName} sings this round`;

    if (window.gameEngine.mode === 'multiplayer' && window.networkManager.isHost) {
      window.networkManager.sendMessage({
        type: 'ROUND_ASSIGNMENT',
        roundNumber: window.gameEngine.roundNumber,
        singerIndex,
      });
    }

    showScreen('coinflip');
  }

  btnProceedToSinger.addEventListener('click', () => {
    if (window.gameEngine.mode === 'multiplayer') {
      if (window.gameEngine.isMyTurnToSing) {
        setupSingerScreen();
      } else {
        setupGuesserWaitingScreen();
      }
    } else {
      setupSingerScreen();
    }
  });

  // ==========================================================================
  // Singer Phase
  // ==========================================================================
  function setupSingerScreen() {
    const singer = window.gameEngine.singer;
    singerTitle.textContent = `${singer.name}, Sing!`;
    if (singerSubtitle) singerSubtitle.textContent = 'Sing a short lyric or catchy chorus';
    singerTimer.textContent = '00:00';
    singerRecordHint.textContent = 'Tap microphone to begin';
    singerPreviewSection.style.display = 'none';
    if (singerRecordSection) singerRecordSection.style.display = 'flex';
    if (guesserWaitingSingerCard) guesserWaitingSingerCard.style.display = 'none';
    if (singerWaitingGuesserCard) singerWaitingGuesserCard.style.display = 'none';
    btnSingerRecord.classList.remove('recording');
    btnSingerRecord.style.display = 'flex';
    isSingerRecording = false;

    showScreen('singer');
  }

  function setupGuesserWaitingScreen() {
    const singer = window.gameEngine.singer;
    singerTitle.textContent = `${singer.name} is Singing...`;
    if (singerSubtitle) singerSubtitle.textContent = 'Listen carefully once they reverse and send the audio!';
    if (singerRecordSection) singerRecordSection.style.display = 'none';
    if (singerPreviewSection) singerPreviewSection.style.display = 'none';
    if (singerWaitingGuesserCard) singerWaitingGuesserCard.style.display = 'none';
    if (guesserWaitingSingerCard) {
      guesserWaitingSingerCard.style.display = 'flex';
      if (guesserWaitingTitle) guesserWaitingTitle.textContent = `${singer.name} is Singing...`;
      if (guesserWaitingSubtitle) guesserWaitingSubtitle.textContent = 'Listen carefully once the reversed audio is sent!';
    }
    showScreen('singer');
  }

  function setupSingerWaitingForGuesserScreen() {
    const guesser = window.gameEngine.guesser;
    singerTitle.textContent = 'Waiting for Guesser...';
    if (singerSubtitle) singerSubtitle.textContent = 'Your reversed audio was sent';
    if (singerRecordSection) singerRecordSection.style.display = 'none';
    if (singerPreviewSection) singerPreviewSection.style.display = 'none';
    if (guesserWaitingSingerCard) guesserWaitingSingerCard.style.display = 'none';
    if (singerWaitingGuesserCard) {
      singerWaitingGuesserCard.style.display = 'flex';
      if (singerWaitingTitle) singerWaitingTitle.textContent = 'Audio Sent to Guesser!';
      if (singerWaitingSubtitle) singerWaitingSubtitle.textContent = `${guesser.name} is listening and decoding backwards...`;
    }
  }

  btnSingerRecord.addEventListener('click', async () => {
    if (!isSingerRecording) {
      try {
        await window.audioManager.startRecording(singerCanvas);
        isSingerRecording = true;
        btnSingerRecord.classList.add('recording');
        singerRecordHint.textContent = 'Recording... Tap to STOP';
        recordingStartTime = Date.now();
        recordingInterval = setInterval(updateTimerDisplay, 250);
      } catch (err) {
        alert(err.message);
      }
    } else {
      clearInterval(recordingInterval);
      btnSingerRecord.classList.remove('recording');
      singerRecordHint.textContent = 'Reversing audio...';
      btnSingerRecord.style.display = 'none';

      try {
        const { blob, audioBuffer, reversedBuffer } = await window.audioManager.stopRecording();
        window.gameEngine.setSingerAudio(audioBuffer, reversedBuffer);
        window.currentSingerBlob = blob;

        isSingerRecording = false;
        singerRecordHint.textContent = 'Recording complete.';
        singerPreviewSection.style.display = 'flex';
      } catch (err) {
        console.error('Stop recording error:', err);
        alert('Could not process recording: ' + err.message);
        btnSingerRecord.style.display = 'flex';
      }
    }
  });

  function updateTimerDisplay() {
    const elapsedSeconds = Math.floor((Date.now() - recordingStartTime) / 1000);
    const mins = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');
    const secs = String(elapsedSeconds % 60).padStart(2, '0');
    singerTimer.textContent = `${mins}:${secs}`;
  }

  btnSingerPlayback.addEventListener('click', () => {
    if (window.gameEngine.roundData.originalBuffer) {
      btnSingerPlayback.querySelector('span').textContent = 'Playing...';
      window.audioManager.playBuffer(window.gameEngine.roundData.originalBuffer, 1.0, () => {
        btnSingerPlayback.querySelector('span').textContent = 'Play My Recording';
      });
    }
  });

  btnSingerRerecord.addEventListener('click', () => {
    window.audioManager.stopPlayback();
    setupSingerScreen();
  });

  btnSingerSubmit.addEventListener('click', async () => {
    window.audioManager.stopPlayback();

    if (window.gameEngine.mode === 'pass_play') {
      setupPassScreen();
    } else {
      showToast('Sending reversed audio...');
      btnSingerSubmit.disabled = true;
      btnSingerSubmit.querySelector('span').textContent = 'Transmitting...';

      try {
        const reversedWavBlob = window.audioManager.bufferToWavBlob(window.gameEngine.roundData.reversedBuffer);
        await window.networkManager.sendAudio('REVERSED_AUDIO_PAYLOAD', reversedWavBlob);
        btnSingerSubmit.disabled = false;
        btnSingerSubmit.querySelector('span').textContent = 'Send to Guesser';
        setupSingerWaitingForGuesserScreen();
        showToast('Audio sent to Guesser!');
      } catch (err) {
        alert('Failed to transmit audio: ' + err.message);
        btnSingerSubmit.disabled = false;
        btnSingerSubmit.querySelector('span').textContent = 'Send to Guesser';
      }
    }
  });

  // ==========================================================================
  // Pass Screen Phase (Pass & Play Only)
  // ==========================================================================
  function setupPassScreen() {
    const guesser = window.gameEngine.guesser;
    passTitle.textContent = `Pass to ${guesser.name}`;
    showScreen('pass');
  }

  btnPassReady.addEventListener('click', () => {
    setupGuesserScreen();
  });

  // ==========================================================================
  // Guesser Phase (Listen to Reversed & Mimic Verification)
  // ==========================================================================
  function setupGuesserScreen() {
    const guesser = window.gameEngine.guesser;
    guesserTitle.textContent = `${guesser.name}, Decode!`;

    if (guesserMainControls) guesserMainControls.style.display = 'flex';
    if (guesserWaitingVerdictCard) guesserWaitingVerdictCard.style.display = 'none';

    btnGuesserMimicRecord.querySelector('span').textContent = 'Record Mimic';
    mimicStatusText.textContent = 'Not recorded yet';
    btnPlayMimicRereversed.style.display = 'none';
    currentPlaybackRate = 1.0;
    btnSpeedNormal.classList.add('active');
    btnSpeedSlow.classList.remove('active');

    showScreen('guesser');
  }

  btnSpeedNormal.addEventListener('click', () => {
    currentPlaybackRate = 1.0;
    btnSpeedNormal.classList.add('active');
    btnSpeedSlow.classList.remove('active');
  });

  btnSpeedSlow.addEventListener('click', () => {
    currentPlaybackRate = 0.75;
    btnSpeedSlow.classList.add('active');
    btnSpeedNormal.classList.remove('active');
  });

  btnPlayReversed.addEventListener('click', () => {
    const buffer = window.gameEngine.roundData.reversedBuffer;
    if (buffer) {
      btnPlayReversed.querySelector('span').textContent = 'Playing Backwards...';
      window.audioManager.playBuffer(buffer, currentPlaybackRate, () => {
        btnPlayReversed.querySelector('span').textContent = 'Play Reversed Song';
      });
    } else {
      showToast('No reversed audio loaded');
    }
  });

  // Guesser Mimic Recording
  btnGuesserMimicRecord.addEventListener('click', async () => {
    if (!isMimicRecording) {
      try {
        await window.audioManager.startRecording();
        isMimicRecording = true;
        btnGuesserMimicRecord.querySelector('span').textContent = 'Stop Mimic Recording';
        mimicStatusText.textContent = 'Recording your mimic...';
      } catch (err) {
        alert(err.message);
      }
    } else {
      try {
        mimicStatusText.textContent = 'Reversing your mimic forward...';
        const { blob, audioBuffer, reversedBuffer } = await window.audioManager.stopRecording();
        window.gameEngine.setGuesserMimicAudio(audioBuffer, reversedBuffer);
        window.currentMimicBlob = blob;

        isMimicRecording = false;
        btnGuesserMimicRecord.querySelector('span').textContent = 'Re-record Mimic';
        mimicStatusText.textContent = 'Mimic ready! Play forward to test:';
        btnPlayMimicRereversed.style.display = 'inline-flex';
      } catch (err) {
        alert('Mimic processing error: ' + err.message);
        btnGuesserMimicRecord.querySelector('span').textContent = 'Record Mimic';
        mimicStatusText.textContent = 'Error recording mimic';
      }
    }
  });

  btnPlayMimicRereversed.addEventListener('click', () => {
    const forwardMimicBuffer = window.gameEngine.roundData.reReversedMimicBuffer;
    if (forwardMimicBuffer) {
      btnPlayMimicRereversed.querySelector('span').textContent = 'Playing Forward...';
      window.audioManager.playBuffer(forwardMimicBuffer, 1.0, () => {
        btnPlayMimicRereversed.querySelector('span').textContent = 'Play Mimic Forward';
      });
    }
  });

  btnGuesserReadyToScore.addEventListener('click', () => {
    window.audioManager.stopPlayback();

    if (window.gameEngine.mode === 'pass_play') {
      setupScoringScreen();
    } else {
      if (window.gameEngine.roundData.reReversedMimicBuffer) {
        const mimicWav = window.audioManager.bufferToWavBlob(window.gameEngine.roundData.reReversedMimicBuffer);
        window.networkManager.sendAudio('GUESSER_MIMIC_PAYLOAD', mimicWav);
      } else {
        window.networkManager.sendMessage({ type: 'GUESSER_READY_FOR_VERDICT' });
      }
      if (guesserMainControls) guesserMainControls.style.display = 'none';
      if (guesserWaitingVerdictCard) {
        guesserWaitingVerdictCard.style.display = 'flex';
        if (guesserVerdictSubtitle) {
          guesserVerdictSubtitle.textContent = `Waiting for ${window.gameEngine.singer.name} to score your answer...`;
        }
      }
      showToast('Guess submitted! Waiting for verdict...');
    }
  });

  // ==========================================================================
  // Scoring Verdict Phase
  // ==========================================================================
  function setupScoringScreen() {
    const singer = window.gameEngine.singer;
    const guesser = window.gameEngine.guesser;

    verdictTitle.textContent = `Did ${guesser.name} Get It?`;
    verdictSubtitle.textContent = `${singer.name}, judge if the song guess was correct.`;

    showScreen('score');
  }

  btnVerdictGot.addEventListener('click', () => {
    handleVerdict(true);
  });

  btnVerdictNotGot.addEventListener('click', () => {
    handleVerdict(false);
  });

  function handleVerdict(gotIt) {
    if (window.gameEngine.mode === 'multiplayer') {
      if (!window.networkManager.isHost) {
        // Guest is the Singer: send verdict to Host to authoritatively apply and broadcast
        window.networkManager.sendMessage({
          type: 'SUBMIT_VERDICT',
          gotIt,
        });
        showToast('Verdict sent to host...');
        btnVerdictGot.disabled = true;
        btnVerdictNotGot.disabled = true;
        return;
      }
    }

    // Host or Pass & Play: apply authoritative verdict
    applyAuthoritativeVerdict(gotIt);
  }

  function applyAuthoritativeVerdict(gotIt) {
    const guesser = window.gameEngine.guesser;
    const singer = window.gameEngine.singer;
    const result = window.gameEngine.applyVerdict(gotIt);

    if (gotIt) {
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 90,
          spread: 60,
          origin: { y: 0.6 },
        });
      }
      showToast(`${guesser.name} got it! (+1 pt)`);
    } else {
      showToast(`${guesser.name} missed (-1 pt). ${singer.name} +1 pt`);
    }

    updateScoreboardUI();
    renderLeaderboard();

    if (window.gameEngine.mode === 'multiplayer') {
      window.networkManager.sendMessage({
        type: 'VERDICT_SYNC',
        gotIt,
        scores: window.gameEngine.players.map((p) => p.score),
        winner: result.winner ? result.winner.name : null,
      });
    }

    btnVerdictGot.disabled = false;
    btnVerdictNotGot.disabled = false;

    setTimeout(() => {
      if (result.winner) {
        declareWinner(result.winner);
      } else {
        initiateCoinFlip();
      }
    }, 1600);
  }

  // Track Comparison Playback
  btnPlayOriginalCompare.addEventListener('click', () => {
    if (window.gameEngine.roundData.originalBuffer) {
      btnPlayOriginalCompare.textContent = 'Playing...';
      window.audioManager.playBuffer(window.gameEngine.roundData.originalBuffer, 1.0, () => {
        btnPlayOriginalCompare.textContent = 'Original Singer';
      });
    } else {
      showToast('Original track not available');
    }
  });

  btnPlayMimicCompare.addEventListener('click', () => {
    if (window.gameEngine.roundData.reReversedMimicBuffer) {
      btnPlayMimicCompare.textContent = 'Playing...';
      window.audioManager.playBuffer(window.gameEngine.roundData.reReversedMimicBuffer, 1.0, () => {
        btnPlayMimicCompare.textContent = "Guesser's Mimic";
      });
    } else {
      showToast('No mimic recorded this round');
    }
  });

  // ==========================================================================
  // Winner Celebration Screen & Cloud Match Saving
  // ==========================================================================
  function declareWinner(winner) {
    winnerDisplayName.textContent = winner.name;
    winnerSummary.textContent = `Won the battle with ${winner.score} points!`;

    if (typeof confetti === 'function') {
      confetti({
        particleCount: 180,
        spread: 100,
        origin: { y: 0.5 },
      });
    }

    // Record match to Supabase in the background
    window.supabaseManager.recordMatch({
      player1Name: window.gameEngine.players[0].name,
      player2Name: window.gameEngine.players[1].name,
      player1Score: window.gameEngine.players[0].score,
      player2Score: window.gameEngine.players[1].score,
      winner: winner.name,
      mode: window.gameEngine.mode === 'pass_play' ? 'single_device' : 'two_device',
      targetScore: window.gameEngine.targetScore,
    });

    showScreen('winner');
  }

  btnPlayAgain.addEventListener('click', () => {
    if (window.gameEngine.mode === 'multiplayer') {
      if (window.networkManager.isHost) {
        window.gameEngine.startNewMatch({
          player1Name: window.gameEngine.players[0].name,
          player2Name: window.gameEngine.players[1].name,
          mode: 'multiplayer',
          targetScore: window.gameEngine.targetScore,
          localPlayerIndex: 0,
        });
        window.networkManager.sendMessage({ type: 'RESTART_MATCH' });
        initiateCoinFlip();
      } else {
        window.networkManager.sendMessage({ type: 'REQUEST_REMATCH' });
        showToast('Rematch request sent to Host...');
      }
    } else {
      window.gameEngine.startNewMatch({
        player1Name: window.gameEngine.players[0].name,
        player2Name: window.gameEngine.players[1].name,
        mode: window.gameEngine.mode,
        targetScore: window.gameEngine.targetScore,
      });
      initiateCoinFlip();
    }
  });

  btnBackToHome.addEventListener('click', () => {
    stopReconnectTimer();
    if (window.gameEngine.mode === 'multiplayer') {
      window.networkManager.disconnect();
    }
    showScreen('home');
  });

  // ==========================================================================
  // Multiplayer Message Routing & State Synchronization
  // ==========================================================================
  window.networkManager.onMessageCallback = async (data) => {
    if (!data || !data.type) return;

    switch (data.type) {
      case 'INIT_MATCH': {
        const { player1Name, player2Name, targetScore } = data.config;
        window.gameEngine.startNewMatch({
          player1Name,
          player2Name,
          mode: 'multiplayer',
          targetScore,
          localPlayerIndex: 1,
        });
        showToast('Game started by Host');
        break;
      }

      case 'ROUND_ASSIGNMENT': {
        window.gameEngine.roundNumber = data.roundNumber;
        window.gameEngine.currentSingerIndex = data.singerIndex;
        window.gameEngine.resetRoundData();

        const singerName = window.gameEngine.players[data.singerIndex].name;
        coinflipTitle.textContent = `Round ${data.roundNumber}`;
        coinflipResult.textContent = `${singerName} sings this round`;
        showScreen('coinflip');
        break;
      }

      case 'REVERSED_AUDIO_PAYLOAD': {
        showToast('Reversed audio received!');
        try {
          const res = await fetch(data.audioDataUri);
          const blob = await res.blob();
          const reversedBuffer = await window.audioManager.decodeAudio(blob);
          window.gameEngine.roundData.reversedBuffer = reversedBuffer;
          setupGuesserScreen();
        } catch (e) {
          console.error('Failed to decode received audio:', e);
          alert('Could not decode audio from singer.');
        }
        break;
      }

      case 'GUESSER_MIMIC_PAYLOAD': {
        try {
          const res = await fetch(data.audioDataUri);
          const blob = await res.blob();
          const mimicBuffer = await window.audioManager.decodeAudio(blob);
          window.gameEngine.roundData.reReversedMimicBuffer = mimicBuffer;
        } catch (e) {
          console.warn('Failed to decode guesser mimic payload', e);
        }
        setupScoringScreen();
        break;
      }

      case 'GUESSER_READY_FOR_VERDICT': {
        setupScoringScreen();
        break;
      }

      case 'SUBMIT_VERDICT': {
        // Host receives verdict from Guest Singer
        if (window.networkManager.isHost) {
          applyAuthoritativeVerdict(data.gotIt);
        }
        break;
      }

      case 'VERDICT_SYNC': {
        window.gameEngine.players[0].score = data.scores[0];
        window.gameEngine.players[1].score = data.scores[1];
        updateScoreboardUI();
        renderLeaderboard();

        if (data.gotIt) {
          if (typeof confetti === 'function') confetti({ particleCount: 90, spread: 60 });
          showToast('Guess was correct! (+1 pt)');
        } else {
          showToast('Guess was incorrect! (-1 pt, singer +1 pt)');
        }

        setTimeout(() => {
          if (data.winner) {
            declareWinner({ name: data.winner, score: Math.max(...data.scores) });
          } else {
            // Guesser is waiting for Host to send the next ROUND_ASSIGNMENT
            if (!window.networkManager.isHost) {
              showToast('Preparing next round...');
            }
          }
        }, 1600);
        break;
      }

      case 'REQUEST_REMATCH': {
        if (window.networkManager.isHost) {
          window.gameEngine.startNewMatch({
            player1Name: window.gameEngine.players[0].name,
            player2Name: window.gameEngine.players[1].name,
            mode: 'multiplayer',
            targetScore: window.gameEngine.targetScore,
            localPlayerIndex: 0,
          });
          window.networkManager.sendMessage({ type: 'RESTART_MATCH' });
          initiateCoinFlip();
        }
        break;
      }

      case 'RESTART_MATCH': {
        window.gameEngine.startNewMatch({
          player1Name: window.gameEngine.players[0].name,
          player2Name: window.gameEngine.players[1].name,
          mode: 'multiplayer',
          targetScore: window.gameEngine.targetScore,
          localPlayerIndex: 1,
        });
        showToast('Rematch started by Host!');
        break;
      }
    }
  };

  // Initial Load: check if session exists
  if (window.supabaseManager.currentUser) {
    onUserSignedIn(window.supabaseManager.currentUser.username);
  } else {
    showScreen('auth');
  }
});

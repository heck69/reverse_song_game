# 🎵 Reverse Song Battle

A 2-player audio party game inspired by the viral **"Reverse Karaoke / Backward Song Challenge"**! 

Play together on a **single device ("Pass & Play")** or across **two separate devices via WebRTC Peer-to-Peer** (100% serverless, zero cost, and runs directly on GitHub Pages).

---

## 🎮 How to Play

1. **Setup & Coin Flip:**
   - Choose **📱 1 Device (Pass & Play)** or **🌐 2 Devices (Online Room)**.
   - Enter player names and set the winning target score (e.g. First to 5 Points, or Endless).
   - The game randomly designates who sings first. Subsequent rounds alternate turns!

2. **Phase 1: Singer's Turn (Sing Forward):**
   - The Singer records a short lyric snippet or catchy chorus into the microphone.
   - The app instantly flips the audio waveform backward using the browser's native **Web Audio API**.

3. **Phase 2: Guesser's Turn (Decode Backwards):**
   - The Guesser receives the reversed song snippet.
   - They can listen to the backwards audio at normal speed (1.0x) or slow-motion (0.75x).
   - **Verification / Mimic Practice:** 
     - The Guesser can record themselves mimicking the weird backward syllables.
     - The app flips their mimic in reverse (which plays it forward!). If the mimic was accurate, the real forward lyrics pop out!

4. **Phase 3: Singer's Verdict & Scoring:**
   - The Guesser tells their final guess to the Singer.
   - The Singer clicks:
     - **🎉 Got It!** ➔ Guesser earns **+1 point**.
     - **❌ Not Got It!** ➔ Guesser loses **-1 point**, Singer earns **+1 point** (reward for stumping them).
   - The all-time Leaderboard updates in `localStorage`.
   - The next round starts with roles swapped!

---

## 🚀 How to Run Locally

Because the app uses the HTML5 Microphone API (`navigator.mediaDevices.getUserMedia`), it must be served from `localhost` or an `https://` origin.

Start a local server with Python:

```bash
# Python 3
python3 -m http.server 8080
```

Then open your browser to:
```
http://localhost:8080
```

---

## 🌐 How to Deploy to GitHub Pages (Free, 2 Minutes)

1. Push this folder to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Reverse Song Battle"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```

2. Enable **GitHub Pages**:
   - Go to your repository on GitHub.
   - Click **Settings** ➔ **Pages** (in the left sidebar).
   - Under **Build and deployment > Source**, select **Deploy from a branch**.
   - Choose **Branch: `main`** and folder **`/ (root)`**, then click **Save**.

3. Your game is live at `https://<your-username>.github.io/<repo-name>/`!
   - 2-device multiplayer works out-of-the-box via WebRTC (PeerJS) with zero server setup!

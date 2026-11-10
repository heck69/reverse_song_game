/**
 * ============================================================================
 * SUPABASE CONFIGURATION FILE
 * ============================================================================
 * Paste your Supabase Project URL and Publishable Key below:
 * (Both can be found in your Supabase Dashboard under: Project Settings > API)
 */

window.SUPABASE_CONFIG = {
  // 1. Paste your Project URL (e.g. 'https://xyzabcdefg.supabase.co')
  url: 'YOUR_SUPABASE_PROJECT_URL_HERE',

  // 2. Paste your Publishable Key (e.g. 'sb_publishable_...')
  anonKey: 'YOUR_SUPABASE_PUBLISHABLE_KEY_HERE',
};

// ============================================================================
// SUPABASE CLIENT & DATABASE OPERATIONS ENGINE
// ============================================================================

class SupabaseManager {
  constructor() {
    this.client = null;
    this.currentUser = null;
    this.loadSavedUserSession();
    this.initClient();
  }

  initClient() {
    const config = window.SUPABASE_CONFIG;
    // Check if user has pasted real keys
    if (
      window.supabase &&
      config &&
      config.url &&
      config.anonKey &&
      config.url !== 'YOUR_SUPABASE_PROJECT_URL_HERE' &&
      config.anonKey !== 'YOUR_SUPABASE_PUBLISHABLE_KEY_HERE'
    ) {
      try {
        this.client = window.supabase.createClient(config.url, config.anonKey);
        console.log('✅ Supabase connected successfully.');
      } catch (err) {
        console.warn('Could not initialize Supabase client:', err);
      }
    }
  }

  isConfigured() {
    return (
      this.client !== null &&
      window.SUPABASE_CONFIG.url !== 'YOUR_SUPABASE_PROJECT_URL_HERE' &&
      window.SUPABASE_CONFIG.anonKey !== 'YOUR_SUPABASE_PUBLISHABLE_KEY_HERE'
    );
  }

  loadSavedUserSession() {
    try {
      const saved = localStorage.getItem('revsong_logged_in_user');
      if (saved) {
        this.currentUser = JSON.parse(saved);
      }
    } catch (e) {
      this.currentUser = null;
    }
  }

  saveUserSession(user) {
    this.currentUser = user;
    try {
      localStorage.setItem('revsong_logged_in_user', JSON.stringify(user));
    } catch (e) {}
  }

  logout() {
    this.currentUser = null;
    try {
      localStorage.removeItem('revsong_logged_in_user');
    } catch (e) {}
  }

  /**
   * Register a new user in user_info table.
   */
  async signUp(username, password, securityQuestion, securityAnswer) {
    if (!this.isConfigured()) {
      throw new Error('Supabase is not configured yet. Please paste your keys into js/supabase-config.js.');
    }

    const usernameTrimmed = username.trim();
    const usernameLower = usernameTrimmed.toLowerCase();
    const answerClean = securityAnswer.trim().toLowerCase();

    // Check if username already exists
    const { data: existing, error: checkError } = await this.client
      .from('user_info')
      .select('id')
      .eq('username_lower', usernameLower)
      .maybeSingle();

    if (existing) {
      throw new Error('Username already taken. Please choose another.');
    }

    const { data, error } = await this.client
      .from('user_info')
      .insert([
        {
          username: usernameTrimmed,
          username_lower: usernameLower,
          password: password,
          security_question: securityQuestion.trim(),
          security_answer_lower: answerClean,
          all_time_score: 0,
          matches_played: 0,
          matches_won: 0,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Log in user with username and password.
   */
  async login(username, password) {
    if (!this.isConfigured()) {
      throw new Error('Supabase is not configured yet. Please paste your keys into js/supabase-config.js.');
    }

    const usernameLower = username.trim().toLowerCase();

    const { data: user, error } = await this.client
      .from('user_info')
      .select('*')
      .eq('username_lower', usernameLower)
      .maybeSingle();

    if (error) throw error;
    if (!user) throw new Error('Username not found.');
    if (user.password !== password) throw new Error('Incorrect password.');

    // Update last login
    await this.client
      .from('user_info')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    this.saveUserSession(user);
    return user;
  }

  /**
   * Look up user security question by username (Forgot Password flow).
   */
  async getQuestionForUser(username) {
    if (!this.isConfigured()) throw new Error('Supabase keys not configured in js/supabase-config.js.');

    const usernameLower = username.trim().toLowerCase();
    const { data, error } = await this.client
      .from('user_info')
      .select('username, security_question')
      .eq('username_lower', usernameLower)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Username not found.');
    return data;
  }

  /**
   * Verify answer for username and retrieve existing password.
   */
  async verifyAnswerAndGetPassword(username, answer) {
    if (!this.isConfigured()) throw new Error('Supabase keys not configured in js/supabase-config.js.');

    const usernameLower = username.trim().toLowerCase();
    const answerClean = answer.trim().toLowerCase();

    const { data, error } = await this.client
      .from('user_info')
      .select('username, password, security_answer_lower')
      .eq('username_lower', usernameLower)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Username not found.');
    if (data.security_answer_lower !== answerClean) {
      throw new Error('Incorrect security answer.');
    }

    return { username: data.username, password: data.password };
  }

  /**
   * Retrieve username and password by entering security answer directly (Forgot Username flow).
   */
  async recoverByAnswerOnly(answer) {
    if (!this.isConfigured()) throw new Error('Supabase keys not configured in js/supabase-config.js.');

    const answerClean = answer.trim().toLowerCase();

    const { data, error } = await this.client
      .from('user_info')
      .select('username, password')
      .eq('security_answer_lower', answerClean);

    if (error) throw error;
    if (!data || data.length === 0) {
      throw new Error('No account found matching that security answer.');
    }

    return data; // Array of { username, password }
  }

  /**
   * Check if a player name is registered in Supabase (Single-Device auto-linking).
   */
  async checkRegisteredPlayer(playerName) {
    if (!this.isConfigured()) return null;
    const nameLower = playerName.trim().toLowerCase();
    const { data } = await this.client
      .from('user_info')
      .select('id, username, all_time_score')
      .eq('username_lower', nameLower)
      .maybeSingle();
    return data;
  }

  /**
   * Record completed match to match_history and update player scores.
   */
  async recordMatch({ player1Name, player2Name, player1Score, player2Score, winner, mode = 'single_device', targetScore = 5 }) {
    if (!this.isConfigured()) return null;

    try {
      const { data: match, error } = await this.client
        .from('match_history')
        .insert([
          {
            player1_name: player1Name,
            player2_name: player2Name,
            player1_score: player1Score,
            player2_score: player2Score,
            winner: winner,
            game_mode: mode,
            target_score: targetScore,
          },
        ])
        .select()
        .single();

      if (error) {
        console.warn('Error saving match to Supabase:', error);
      }

      await this.incrementPlayerStats(player1Name, player1Score);
      await this.incrementPlayerStats(player2Name, player2Score);

      return match;
    } catch (e) {
      console.warn('Match record error:', e);
      return null;
    }
  }

  async incrementPlayerStats(username, pointsDelta) {
    const user = await this.checkRegisteredPlayer(username);
    if (!user) return;

    try {
      await this.client
        .from('user_info')
        .update({
          all_time_score: (user.all_time_score || 0) + pointsDelta,
        })
        .eq('id', user.id);
    } catch (e) {}
  }

  /**
   * Fetch match history for a user.
   */
  async getHistoryForUser(username) {
    if (!this.isConfigured()) return [];

    try {
      const { data, error } = await this.client
        .from('match_history')
        .select('*')
        .or(`player1_name.ilike.${username},player2_name.ilike.${username}`)
        .order('played_at', { ascending: false })
        .limit(50);

      if (error) {
        console.warn('Error fetching match history:', error);
        return [];
      }
      return data;
    } catch (e) {
      return [];
    }
  }
}

// Global Supabase manager instance
window.supabaseManager = new SupabaseManager();

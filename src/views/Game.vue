<template>
  <div class="game-shell">
    <ConfettiExplosion 
        v-if="showConfetti" 
        :colors="confettiColors"
        :particleCount="180"
        :force="0.7"
        :stageHeight="1000"
      />
    <div class="hud">
      <div class="hud-block">
        <span class="hud-label">Sala</span>
        <strong class="hud-value">{{ session.roomId || '----' }}</strong>
      </div>
      <div class="hud-block hud-block--right">
        <span class="hud-label">Jugador</span>
        <strong class="hud-value">{{ session.username || 'Invitado' }}</strong>
      </div>
    </div>

    <div v-if="errorMessage" class="error-toast">
      {{ errorMessage }}
    </div>

    <!-- ======== LOADING ======== -->
    <section v-if="phase === 'LOADING'" class="panel panel--center">
      <p class="eyebrow">Sincronizando</p>
      <h2 class="title">Esperando partida</h2>
      <p class="subtle">Conectando con el estado actual del juego...</p>
    </section>

    <!-- ======== COUNTDOWN 3-2-1 ======== -->
    <section v-else-if="phase === 'COUNTDOWN'" class="panel panel--center countdown-panel">
      <p class="eyebrow">La partida está por comenzar</p>
      <transition name="count-pop" mode="out-in">
        <span :key="countdownValue" class="countdown-number">
          {{ countdownValue === 0 ? '¡YA!' : countdownValue }}
        </span>
      </transition>
      <p class="subtle">¡Prepárate!</p>
    </section>

    <!-- ======== QUESTION ======== -->
    <section v-else-if="phase === 'QUESTION'" class="play-area">
      <div class="scoreboard">
        <article v-for="player in sortedPlayers" :key="player.username"
          :class="['score-card', { 'score-card--me': player.username === session.username }]">
          <div class="score-name">
            {{ player.username }}
            <span v-if="player.username === session.username">(Tú)</span>
          </div>
          <div class="score-points">{{ player.score ?? 0 }}</div>
        </article>
      </div>

      <div class="question-head">
        <span class="step-label">Pregunta {{ currentQuestionIndex }} / {{ totalQuestions }}</span>
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: progressWidth }" />
        </div>

        <!-- Timer -->
        <span class="step-label" :style="{ color: questionTimeLeft <= 3 ? '#E24B4A' : '' }">
          ⏱ {{ questionTimeLeft }}s
        </span>
      </div>

      <article class="panel question-panel">
        <h2 class="question-title">
          {{ currentQuestion?.question || 'Cargando pregunta...' }}
        </h2>

        <div class="mb-4" v-if="currentQuestion?.imageId">
          <img class="w-100" :src="`/questions/${currentQuestion.imageId}.jpg`" :alt="currentQuestion.question" />
        </div>

        <div class="options">
          <button v-for="(option, index) in currentQuestion?.options || []" :key="index" :disabled="hasAnswered"
            @click="submitAnswer(index)" :class="[
              'option-btn',
              hasAnswered && selectedAnswerIndex === index ? 'option-btn--selected' : '',
              hasAnswered && selectedAnswerIndex !== index ? 'option-btn--muted' : '',
            ]">
            <span class="opt-key">{{ optionLabel(index) }}</span>
            <span>{{ option }}</span>
          </button>
        </div>

        <p v-if="hasAnswered" class="waiting-copy">
          {{ selectedAnswerIndex !== null
            ? 'Respuesta enviada. Esperando al resto de jugadores...'
            : '⏰ Tiempo agotado. Esperando al resto de jugadores...' }}
        </p>
      </article>
    </section>

    <!-- ======== ROUND RESULT ======== -->
    <section v-else-if="phase === 'ROUND_RESULT'" class="panel">
      <p class="eyebrow">Resultado de ronda</p>
      <h2 class="title">Pregunta {{ roundResult?.questionIndex }} de {{ roundResult?.totalQuestions }}</h2>
      <p class="subtle">
        Respuesta correcta:
        <strong class="accent">{{ optionLabel(roundResult?.correctAnswer) }}</strong>
      </p>
      <p class="explanation">
        {{ roundResult?.explanation || 'Sin explicación disponible.' }}
      </p>

      <div class="round-scores">
        <div v-for="player in roundResult?.scores || []" :key="player.username" class="round-row">
          <div>
            <div class="round-name">{{ player.username }}</div>
            <span :class="roundStateClass(player.isCorrect)">
              {{ formatRoundState(player.isCorrect) }}
            </span>
          </div>
          <strong class="round-points">{{ player.score }} pts</strong>
        </div>
      </div>
    </section>

    <!-- ======== GAME OVER ======== -->
    <section v-else-if="phase === 'GAME_OVER'" class="panel">
      <p class="eyebrow">Partida finalizada</p>
      <h2 class="title">Ranking final</h2>
      <p class="subtle">Resultado oficial de la sala.</p>

      <p v-if="isWinner" class=" text-green-400">¡Ganaste la partida!</p>

      <div class="final-list">
        <div v-for="player in finalLeaderboard" :key="`${player.rank}-${player.username}`" class="final-row">
          <div class="final-left">
            <span class="rank-pill">{{ player.rank }}</span>
            <span class="final-name">{{ player.username }}</span>
          </div>
          <strong class="final-points">{{ player.score }} pts</strong>
        </div>
      </div>

      <button class="btn-primary" @click="goHome">
        Volver al inicio
      </button>
    </section>
  </div>
</template>

<script>
import socket from '../services/socket';
import { SoundService } from '../services/SoundService';
import ConfettiExplosion from "vue-confetti-explosion";



export default {
  name: 'GameView',
  components: {
    ConfettiExplosion
  },
  data() {
    return {
      showConfetti: false,
      isWinner: false,
      session: {
        roomId: '',
        username: '',
      },
      phase: 'LOADING',
      // --- countdown ---
      countdownValue: 3,
      countdownTimer: null,
      questionTimer: null,
      questionTimeLeft: 25,
      questionDuration: 25,
      // -----------------
      totalQuestions: 10,
      currentQuestionIndex: 0,
      currentQuestion: null,
      hasAnswered: false,
      selectedAnswerIndex: null,
      roundResult: null,
      finalLeaderboard: [],
      players: [],
      errorMessage: '',
      onQuestion: null,
      onRoundResult: null,
      onGameOver: null,
      onRoomData: null,
      onRoomError: null,
      onStartGame: null,
    };
  },
  computed: {
    myScore() {
      const me = this.players.find((player) => player.username === this.session.username);
      return me?.score ?? 0;
    },
    progressWidth() {
      if (!this.totalQuestions) {
        return '0%';
      }
      const value = (this.currentQuestionIndex / this.totalQuestions) * 100;
      return `${Math.min(100, Math.max(0, value))}%`;
    },
    sortedPlayers() {
      return [...this.players].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    },
  },
  mounted() {
    const savedSession = localStorage.getItem('cibergame_session');
    if (!savedSession) {
      this.$router.replace('/');
      return;
    }

    try {
      const parsed = JSON.parse(savedSession);
      if (!parsed?.roomId || !parsed?.username) {
        localStorage.removeItem('cibergame_session');
        this.$router.replace('/');
        return;
      }

      this.session.roomId = String(parsed.roomId).toUpperCase();
      this.session.username = String(parsed.username);
      this.session.reconnecting = !!parsed.gameStarted;
    } catch (error) {
      localStorage.removeItem('cibergame_session');
      this.$router.replace('/');
      return;
    }

    this.registerSocketListeners();
    socket.emit('join_room', this.session);
  },
  beforeUnmount() {
    this.unregisterSocketListeners();
    clearInterval(this.countdownTimer);
    clearInterval(this.questionTimer);
  },
  methods: {
    async triggerWinEffect() {
      this.showConfetti = false;

      await this.$nextTick();

      this.showConfetti = true;
    },
    startCountdown() {
      const saved = JSON.parse(localStorage.getItem('cibergame_session') || '{}');
      localStorage.setItem('cibergame_session', JSON.stringify({ ...saved, gameStarted: true }));

      SoundService.play('count');

      this._pendingQuestion = null;
      this.countdownValue = 3;
      this.phase = 'COUNTDOWN';

      this.countdownTimer = setInterval(() => {
        this.countdownValue--;
        if (this.countdownValue < 0) {
          clearInterval(this.countdownTimer);
          this.countdownTimer = null;

          if (this._pendingQuestion) {
            this._applyQuestion(this._pendingQuestion);
            this._pendingQuestion = null;
          } else {
            this.phase = 'QUESTION';
          }
        }
      }, 1000);
    },
    // ------------------------------

    registerSocketListeners() {
      this.onStartGame = (payload) => {
        if (payload?.roomId && payload.roomId !== this.session.roomId) return;
        if (payload?.totalQuestions) {
          this.totalQuestions = payload.totalQuestions;
        }

        if (this.session.reconnecting) {
          this.session.reconnecting = false;
          return;
        }

        this.startCountdown();
      };

      this.onLeaveRoom = (payload) => {
        if (payload && payload.username === this.session.username) {
          localStorage.removeItem('cibergame_session');
          this.$router.replace('/');
        } else {
          this.onRoomData(payload);
        }
      };

      this.onRoomData = (room) => {
        if (!room || room.roomId !== this.session.roomId) {
          return;
        }
        this.players = room.players || [];
      };

      this.onQuestion = (payload) => {
        if (!payload || payload.roomId !== this.session.roomId) {
          return;
        }
        if (this.countdownTimer) {
          this._pendingQuestion = payload;
          return;
        }
        this._applyQuestion(payload);
      };

      this.onRoundResult = (payload) => {
        clearInterval(this.questionTimer);
        this.questionTimer = null;
        if (!payload || payload.roomId !== this.session.roomId) {
          return;
        }

        this.phase = 'ROUND_RESULT';
        this.roundResult = payload;
        this.players = payload.scores || this.players;

        const meResult = payload.scores?.find((p) => p.username === this.session.username);
        if (meResult) {
          console.log(`Ronda ${payload.questionIndex}:`, meResult.isCorrect);
          if (meResult.isCorrect) {
            SoundService.play('correct');
          } else {
            SoundService.play('incorrect');
          }
        } else {
          console.error('No se pudo encontrar el resultado del jugador en la ronda.');
        }
      };

      this.onGameOver = (payload) => {
        if (!payload || payload.roomId !== this.session.roomId) {
          return;
        }

        this.phase = 'GAME_OVER';
        this.finalLeaderboard = payload.leaderboard || [];
        this.hasAnswered = false;
        this.roundResult = null;

        const isWinner = payload.leaderboard?.[0]?.username === this.session.username;
        this.isWinner = isWinner;

        if (isWinner) {
          this.triggerWinEffect();
          SoundService.play('winner2');
        } else {
          SoundService.play('incorrect3');
        }
        localStorage.removeItem('cibergame_session');
      };

      this.onRoomError = ({ message }) => {
        this.errorMessage = message || 'Ocurrió un error en la partida.';

        if (message?.includes('cerrado') || message?.includes('host')) {
          setTimeout(() => {
            localStorage.removeItem('cibergame_session');
            this.$router.replace('/');
          }, 4000);
        }
      };

      socket.on('start_game', this.onStartGame);
      socket.on('leave_room', this.onLeaveRoom);
      socket.on('room_data', this.onRoomData);
      socket.on('question', this.onQuestion);
      socket.on('round_result', this.onRoundResult);
      socket.on('game_over', this.onGameOver);
      socket.on('room_error', this.onRoomError);
    },

    _applyQuestion(payload) {
      this.phase = 'QUESTION';
      this.currentQuestion = payload.question;
      this.currentQuestionIndex = payload.index;
      this.totalQuestions = payload.total;
      this.hasAnswered = false;
      this.selectedAnswerIndex = null;
      this.roundResult = null;
      this.errorMessage = '';

      // --- timer ---
      clearInterval(this.questionTimer);
      this.questionTimeLeft = this.questionDuration;
      this.questionTimer = setInterval(() => {
        this.questionTimeLeft--;
        if (this.questionTimeLeft <= 0) {
          clearInterval(this.questionTimer);
          this.questionTimer = null;
          if (!this.hasAnswered) {
            this.hasAnswered = true;
            this.selectedAnswerIndex = null;
            socket.emit('submit_answer', {
              roomId: this.session.roomId,
              username: this.session.username,
              answerIndex: -1,
            });
          }
        }
      }, 1000);
    },

    unregisterSocketListeners() {
      if (this.onStartGame) socket.off('start_game', this.onStartGame);
      if (this.onRoomData) socket.off('room_data', this.onRoomData);
      if (this.onQuestion) socket.off('question', this.onQuestion);
      if (this.onRoundResult) socket.off('round_result', this.onRoundResult);
      if (this.onGameOver) socket.off('game_over', this.onGameOver);
      if (this.onRoomError) socket.off('room_error', this.onRoomError);
    },

    submitAnswer(index) {
      if (this.phase !== 'QUESTION' || this.hasAnswered) {
        return;
      }

      this.selectedAnswerIndex = index;
      this.hasAnswered = true;

      socket.emit('submit_answer', {
        roomId: this.session.roomId,
        username: this.session.username,
        answerIndex: index,
      });
    },

    optionLabel(index) {
      if (typeof index !== 'number' || Number.isNaN(index)) {
        return '-';
      }
      return String.fromCharCode(65 + index);
    },

    formatRoundState(isCorrect) {
      if (isCorrect === true) return 'Correcto';
      if (isCorrect === false) return 'Incorrecto';
      return 'Sin respuesta';
    },

    roundStateClass(isCorrect) {
      if (isCorrect === true) return 'state-pill state-pill--ok';
      if (isCorrect === false) return 'state-pill state-pill--bad';
      return 'state-pill';
    },

    goHome() {
      if (this.session.roomId && this.session.username) {
        socket.emit('leave_room', this.session);
      }
      this.$router.push('/');
    },
  },
};
</script>



<style scoped>
/* ======== COUNTDOWN ======== */
.countdown-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 1rem;
}

.countdown-number {
  display: block;
  font-size: 8rem;
  font-weight: 700;
  line-height: 1;
  text-align: center;
  /* hereda el color de .title o ajusta a tu paleta */
  color: inherit;
}

/* Entra: escala grande → normal */
.count-pop-enter-active {
  animation: count-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Sale: normal → pequeño y desaparece */
.count-pop-leave-active {
  animation: count-out 0.25s ease-in forwards;
}

@keyframes count-in {
  from {
    transform: scale(1.8);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes count-out {
  from {
    transform: scale(1);
    opacity: 1;
  }

  to {
    transform: scale(0.4);
    opacity: 0;
  }
}

.game-shell {
  --bg: #05101f;
  --accent: #00e5ff;
  --accent-2: #00ff9d;
  --text: #ccd6f6;
  --muted: #5b6f8d;
  min-height: 100vh;
  color: var(--text);
  padding: 20px 16px 36px;
  position: relative;
  background: radial-gradient(ellipse 70% 40% at 50% 0%, rgba(0, 229, 255, 0.08) 0%, transparent 70%), var(--bg);
}

.game-shell::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(0, 229, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 229, 255, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
}

.hud,
.play-area,
.panel,
.error-toast {
  position: relative;
  z-index: 1;
  max-width: 960px;
  margin-left: auto;
  margin-right: auto;
}

.hud {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.hud-block {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.hud-block--right {
  text-align: right;
}

.hud-label {
  color: var(--muted);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.hud-value {
  color: var(--accent);
  font-size: 26px;
  font-weight: 800;
  letter-spacing: 2px;
}

.error-toast {
  background: rgba(255, 59, 92, 0.14);
  border: 1px solid rgba(255, 59, 92, 0.35);
  border-radius: 12px;
  color: #ffc8d2;
  padding: 10px 14px;
  margin-bottom: 14px;
}

.panel {
  background: linear-gradient(180deg, rgba(19, 38, 80, 0.8), rgba(15, 32, 64, 0.92));
  border: 1px solid rgba(0, 229, 255, 0.2);
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 0 30px rgba(0, 229, 255, 0.08);
}

.panel--center {
  text-align: center;
}

.eyebrow {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: var(--accent);
  margin-bottom: 8px;
}

.title {
  margin: 0 0 8px;
  font-size: clamp(26px, 4vw, 36px);
  line-height: 1.1;
}

.subtle {
  margin: 0;
  color: var(--muted);
}

.accent {
  color: var(--accent);
}

.play-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.scoreboard {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(132px, 1fr));
  gap: 8px;
}

.score-card {
  background: rgba(15, 32, 64, 0.92);
  border: 1px solid rgba(0, 229, 255, 0.14);
  border-radius: 12px;
  padding: 12px;
}

.score-card--me {
  border-color: rgba(0, 229, 255, 0.45);
  box-shadow: 0 0 18px rgba(0, 229, 255, 0.16);
}

.score-name {
  font-size: 12px;
  color: #dbe6ff;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.score-name span {
  color: var(--accent);
  margin-left: 6px;
  font-size: 11px;
}

.score-points {
  font-size: 22px;
  line-height: 1;
  font-weight: 800;
  color: var(--accent);
}

.question-head {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 10px;
}

.step-label {
  font-size: 12px;
  color: var(--muted);
}

.progress-track {
  height: 7px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--accent-2));
  transition: width 0.3s ease;
}

.question-panel {
  padding: 20px;
}

.question-title {
  margin: 0 0 18px;
  line-height: 1.45;
  font-size: clamp(20px, 2.7vw, 30px);
}

.options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-btn {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  color: var(--text);
  padding: 13px 14px;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: border-color 0.15s ease, background-color 0.15s ease, transform 0.1s ease;
}

.option-btn:hover:enabled {
  border-color: rgba(0, 229, 255, 0.5);
  background: rgba(0, 229, 255, 0.08);
  transform: translateX(3px);
}

.option-btn:disabled {
  cursor: default;
}

.option-btn--selected {
  border-color: rgba(0, 229, 255, 0.75);
  background: rgba(0, 229, 255, 0.17);
}

.option-btn--muted {
  opacity: 0.72;
}

.opt-key {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-size: 12px;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.waiting-copy {
  margin: 16px 0 0;
  color: var(--accent);
  font-size: 14px;
  font-weight: 600;
}

.explanation {
  margin: 12px 0 18px;
  line-height: 1.6;
}

.round-scores {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.round-row {
  background: rgba(5, 16, 31, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.round-name {
  font-weight: 700;
  margin-bottom: 6px;
}

.round-points {
  color: var(--accent);
}

.state-pill {
  display: inline-flex;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 3px 9px;
  font-size: 11px;
  color: var(--muted);
}

.state-pill--ok {
  color: var(--accent-2);
  border-color: rgba(0, 255, 157, 0.35);
  background: rgba(0, 255, 157, 0.1);
}

.state-pill--bad {
  color: #ff8ea0;
  border-color: rgba(255, 59, 92, 0.35);
  background: rgba(255, 59, 92, 0.11);
}

.final-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 18px 0 22px;
}

.final-row {
  background: rgba(5, 16, 31, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.final-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rank-pill {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: rgba(0, 229, 255, 0.16);
  color: var(--accent);
  font-weight: 700;
}

.final-name {
  font-weight: 700;
}

.final-points {
  color: var(--accent);
}

.btn-primary {
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  font-weight: 800;
  cursor: pointer;
  background: var(--accent);
  color: #04121d;
  transition: transform 0.1s ease, box-shadow 0.15s ease;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 0 20px rgba(0, 229, 255, 0.4);
}

@media (max-width: 720px) {
  .game-shell {
    padding: 14px 10px 22px;
  }

  .hud-value {
    font-size: 22px;
  }

  .panel {
    padding: 16px;
    border-radius: 14px;
  }

  .question-head {
    grid-template-columns: 1fr;
    gap: 6px;
  }
}
</style>

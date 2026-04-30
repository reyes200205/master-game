<template>
  <div class="relative min-h-screen overflow-hidden font-sans" style="background: #0c2340;">

    <!-- Grid background -->
    <div class="absolute inset-0 pointer-events-none" style="
      background-image: linear-gradient(rgba(55,138,221,0.08) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(55,138,221,0.08) 1px, transparent 1px);
      background-size: 34px 34px;
    "></div>

    <!-- ======== WAITING FOR GAME ======== -->
    <div v-if="!gameStarted && !gameOver" class="flex flex-col items-center justify-center min-h-screen px-6 py-12">
      <img src="/logo-md.webp" alt="Logo" class="w-28 mb-8 opacity-80" />
      <div class="w-12 h-12 rounded-full mb-6 flex items-center justify-center"
        style="border:2px solid rgba(55,138,221,0.4);">
        <div class="w-6 h-6 rounded-full animate-ping" style="background:rgba(55,138,221,0.5);"></div>
      </div>
      <p class="text-lg font-medium mb-2" style="color:#85B7EB;">Monitor de Host activo</p>
      <p style="color:#4a7a9b;font-size:13px;">Esperando que inicie la partida...</p>
    </div>

    <!-- ======== GAME MONITOR ======== -->
    <div v-if="gameStarted && !gameOver" class="flex flex-col min-h-screen p-6 gap-4">


      <!-- Top bar -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <img src="/logo-md.webp" alt="Logo" class="w-16 opacity-80" />
          <div>
            <p class="font-semibold text-2xl" style="color:#E6F1FB;">Partida en curso - {{ roomId }}</p>
          </div>
        </div>
        <button @click="closeRoom" class="px-6 py-3 rounded-xl font-medium"
          style="background:#185FA5;border:0.5px solid #378ADD;color:#E6F1FB;font-size:14px;">
          Cerrar sala
        </button>
        <div class="flex items-center gap-2 px-3 py-1 rounded-full"
          style="background:rgba(29,158,117,0.15);border:0.5px solid rgba(29,158,117,0.4);">
          <div class="w-2 h-2 rounded-full animate-pulse" style="background:#5DCAA5;"></div>
          <span style="color:#5DCAA5;font-size:12px;">En vivo</span>
        </div>
      </div>

      <div>
        <p class="text-gray-300 text-xl">Selecciona El Modo de vista de la partida</p>
        <div class="flex p-1 rounded-xl bg-[#0d1b2a] border border-blue-900/30 w-full max-w-md">
          <button @click="gameMode = 'classic'" :class="gameMode === 'classic'
            ? 'bg-[#244689] text-white shadow-[0_0_15px_rgba(36,70,137,0.4)]'
            : 'text-gray-500 hover:text-gray-300'"
            class="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all duration-300">
            <span>🎮</span> Modo Barras
          </button>

          <button @click="gameMode = 'kahoot'" :class="gameMode === 'kahoot'
            ? 'bg-[#244689] text-white shadow-[0_0_15px_rgba(36,70,137,0.4)]'
            : 'text-gray-500 hover:text-gray-300'"
            class="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all duration-300">
            <span>🎮</span> Modo Kahoot
          </button>
        </div>

      </div>

      <!-- Question header -->
      <div v-if="gameMode == 'classic'" class="rounded-2xl p-5"
        style="background:rgba(13,45,78,0.95);border:0.5px solid rgba(55,138,221,0.25);">
        <div class="flex items-center justify-between mb-3">
          <span class="font-semibold text-xl text-gray-400" style="letter-spacing:0.08em;">
            PREGUNTA NUMERO # {{ currentQuestionIndex }} DE {{ totalQuestions }}
          </span>
          <div class="flex items-center gap-2">
            <div class="rounded-full overflow-hidden" style="width:140px;height:4px;background:rgba(55,138,221,0.15);">
              <div class="h-full rounded-full transition-all duration-700" style="background:#378ADD;"
                :style="{ width: totalQuestions ? (currentQuestionIndex / totalQuestions * 100) + '%' : '0%' }">
              </div>
            </div>
            <span style="color:#4a7a9b;font-size:11px;">{{ answeredCount }}/{{ players.length }} respondieron</span>
          </div>
        </div>
        <p class="font-medium text-xl leading-snug" style="color:#E6F1FB;">{{ currentQuestion }}</p>
      </div>

      <!-- =====================================================
           PÓDIUM EN VIVO — reemplaza el grid de cards
           ===================================================== -->



      <div v-if="gameMode == 'kahoot'" class="rounded-2xl p-5 flex-1 flex flex-col"
        style="background:rgba(13,45,78,0.95);border:0.5px solid rgba(55,138,221,0.25);">
        <p class="font-medium text-3xl leading-snug" style="color:#E6F1FB;">{{ currentQuestion }}</p>

        <div class="flex-1 flex items-center justify-center overflow-hidden">
          <img v-if="currentQuestionImage" :src="`/questions/${currentQuestionImage}.jpg`"
            alt="Imagen de prueba de Phishing"
            class="w-full z-50 h-auto max-h-[70vh] object-contain rounded-lg shadow-xl border border-blue-900/30" />
        </div>
      </div>


      <div v-if="gameMode == 'classic'" class="rounded-2xl p-5 flex-1 flex flex-col"
        style="background:rgba(13,45,78,0.95);border:0.5px solid rgba(55,138,221,0.25);">

        <!-- Barras del pódium -->
        <div class="flex items-end justify-center gap-2 flex-1" style="min-height:200px;padding-bottom:4px;">
          <div v-for="(player, rank) in sortedPlayers" :key="player.username" class="flex flex-col items-center"
            :style="{ width: barWidth }">

            <!-- Score flotante arriba de la barra -->
            <p class="font-bold transition-all duration-500 mb-1" style="font-size:15px;color:#E6F1FB;line-height:1;">
              {{ player.score }}
            </p>

            <!-- Barra animada -->
            <div class="relative rounded-t-lg overflow-hidden"
              style="width:70%; transition: height 0.8s cubic-bezier(0.34,1.56,0.64,1);" :style="{
                height: maxScore > 0 ? Math.max((player.score / maxScore) * 180, 6) + 'px' : '6px',
                background: 'rgba(55,138,221,0.12)',
                border: '0.5px solid rgba(55,138,221,0.2)'
              }">
              <!-- Fill de color del jugador -->
              <div class="absolute inset-0 rounded-t-lg" :style="{ background: playerColor(rank) }">
              </div>

              <!-- Flash al responder correcto -->
              <div v-if="player._justAnswered && player._isCorrect" class="absolute inset-0 rounded-t-lg animate-pulse"
                style="background:rgba(93,202,165,0.35);">
              </div>

              <!-- Flash al responder incorrecto -->
              <div v-if="player._justAnswered && !player._isCorrect" class="absolute inset-0 rounded-t-lg"
                style="background:rgba(226,75,74,0.25);">
              </div>

              <!-- +1 flotante -->
              <transition name="score-pop">
                <div v-if="player._scoreDelta"
                  class="absolute top-1 left-1/2 -translate-x-1/2 font-bold pointer-events-none"
                  style="color:#5DCAA5;font-size:14px;">
                  +1
                </div>
              </transition>
            </div>

            <!-- Indicador de respuesta (punto de color) -->
            <div class="w-2 h-2 rounded-full mt-1 transition-colors duration-300 flex-shrink-0" :style="{
              background: roundAnswers[player.username] !== undefined
                ? (roundAnswers[player.username]?.isCorrect ? '#5DCAA5' : '#E24B4A')
                : 'rgba(55,138,221,0.3)'
            }">
            </div>

            <!-- Nombre -->
            <p class="text-center mt-1 w-full"
              style="font-size:clamp(11px, 2vw, 18px);color:#7BAFD4;word-break:break-word;line-height:1.2;">
              {{ player.username }}
            </p>

          </div>
        </div>

        <!-- Leyenda de estado de respuestas -->
        <div class="flex items-center justify-center gap-4 mt-3 pt-3"
          style="border-top:0.5px solid rgba(55,138,221,0.15);">
          <div class="flex items-center gap-1">
            <div class="w-2 h-2 rounded-full" style="background:#5DCAA5;"></div>
            <span style="color:#4a7a9b;font-size:11px;">Correcto</span>
          </div>
          <div class="flex items-center gap-1">
            <div class="w-2 h-2 rounded-full" style="background:#E24B4A;"></div>
            <span style="color:#4a7a9b;font-size:11px;">Incorrecto</span>
          </div>
          <div class="flex items-center gap-1">
            <div class="w-2 h-2 rounded-full" style="background:rgba(55,138,221,0.3);"></div>
            <span style="color:#4a7a9b;font-size:11px;">Pensando...</span>
          </div>
        </div>
      </div>



      <!-- ===================================================== -->

      <!-- Countdown overlay -->
      <transition name="fade-slide">
        <div v-if="showCountdown" class="fixed inset-0 flex flex-col items-center justify-center z-40"
          style="background:rgba(12,35,64,0.92);backdrop-filter:blur(4px);">
          <p class="mb-4 font-medium tracking-widest" style="color:#7BAFD4;font-size:13px;">
            LA PARTIDA ESTÁ POR COMENZAR
          </p>
          <transition name="count-pop" mode="out-in">
            <span :key="countdownValue" class="font-bold" style="font-size:96px;color:#E6F1FB;line-height:1;">
              {{ countdownValue === 0 ? '¡YA!' : countdownValue }}
            </span>
          </transition>
          <p class="mt-4" style="color:#4a7a9b;font-size:13px;">¡Prepárate!</p>
        </div>
      </transition>

      <!-- Round result overlay -->
      <transition name="fade-slide">
        <div v-if="showRoundResult" class="fixed inset-0 flex items-end justify-center pb-8 pointer-events-none z-30">
          <div class="px-6 py-4 rounded-2xl text-center"
            style="background:rgba(13,45,78,0.97);border:0.5px solid rgba(55,138,221,0.4);min-width:320px;">
            <p style="color:#7BAFD4;font-size:12px;margin-bottom:4px;">Respuesta correcta</p>
            <p class="font-semibold" style="color:#5DCAA5;font-size:16px;">{{ roundCorrectAnswerText }}</p>
            <p v-if="roundExplanation" class="mt-2 text-sm" style="color:#7BAFD4;font-size:13px;">
              {{ roundExplanation }}
            </p>
          </div>
        </div>
      </transition>
    </div>

    <!-- ======== GAME OVER ======== -->
    <div v-if="gameOver" class="flex flex-col items-center justify-center min-h-screen px-6 py-12">
      <img src="/logo-md.webp" alt="Logo" class="w-24 mb-6 opacity-80" />

      <p class="text-sm tracking-widest font-medium mb-1" style="color:#378ADD;">PARTIDA TERMINADA</p>
      <h1 class="text-3xl font-bold mb-8" style="color:#E6F1FB;">Resultados finales</h1>

      <!-- Podium top 3 -->
      <div class="flex items-end gap-4 mb-8">
        <div v-for="(player, i) in leaderboard.slice(0, 3)" :key="player.username"
          class="flex flex-col items-center gap-2">
          <p class="font-medium text-center" style="color:#E6F1FB;font-size:13px;max-width:80px;">
            {{ player.username }}
          </p>
          <p class="font-bold" style="font-size:20px;" :style="podiumColor(i)">{{ player.score }}</p>
          <div class="rounded-t-lg w-16 flex items-center justify-center font-bold" :style="podiumBarStyle(i)">
            {{ i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉' }}
          </div>
        </div>
      </div>

      <!-- Full leaderboard -->
      <div class="w-full max-w-md space-y-2 mb-8">
        <div v-for="(player, i) in leaderboard" :key="player.username"
          class="flex items-center gap-3 px-4 py-3 rounded-xl" :style="i === 0
            ? 'background:rgba(55,138,221,0.15);border:0.5px solid rgba(55,138,221,0.4);'
            : 'background:rgba(255,255,255,0.03);border:0.5px solid rgba(133,183,235,0.1);'">
          <span class="font-bold w-6 text-center" style="font-size:13px;" :style="podiumColor(i)">
            {{ player.rank }}
          </span>
          <div class="w-8 h-8 rounded-full flex items-center justify-center font-medium flex-shrink-0"
            style="background:rgba(55,138,221,0.15);color:#85B7EB;font-size:12px;">
            {{ player.username.slice(0, 2).toUpperCase() }}
          </div>
          <p class="flex-1 font-medium" style="color:#E6F1FB;font-size:14px;">{{ player.username }}</p>
          <p class="font-bold" style="font-size:16px;color:#85B7EB;">{{ player.score }}</p>
        </div>
      </div>

      <button @click="closeRoom" class="px-6 py-3 rounded-xl font-medium"
        style="background:#185FA5;border:0.5px solid #378ADD;color:#E6F1FB;font-size:14px;">
        Cerrar sala
      </button>
    </div>

  </div>
</template>

<script>
import socket from '../services/socket';

export default {
  name: 'HostView',
  data() {
    return {
      currentQuestionImage: null,
      gameMode: 'classic',
      roomId: '',
      username: '',
      gameStarted: false,
      gameOver: false,
      players: [],
      roundAnswers: {},
      currentQuestion: '',
      currentQuestionIndex: 0,
      totalQuestions: 0,
      // FIX: guardar las opciones de la pregunta actual para resolver el índice de correctAnswer
      currentQuestionOptions: [],
      leaderboard: [],
      showRoundResult: false,
      roundCorrectAnswer: null,   // índice numérico que manda el backend
      roundExplanation: '',
      onRoomData: null,
      onQuestion: null,
      onRoundResult: null,
      onGameOver: null,
      onRoomError: null,
      onStartGame: null,
      countdownValue: 0,
      showCountdown: false,
      countdownTimer: null,
    };
  },
  computed: {
    maxScore() {
      return Math.max(...this.players.map(p => p.score), 1)
    },
    barWidth() {
      const n = this.players.length
      if (n <= 4) return '80px'
      if (n <= 8) return '60px'
      if (n <= 12) return '48px'
      return '36px'
    },
    sortedPlayers() {
      return [...this.players].sort((a, b) => b.score - a.score);
    },
    answeredCount() {
      return Object.keys(this.roundAnswers).length;
    },
    // FIX: resuelve el índice numérico a texto de la opción
    roundCorrectAnswerText() {
      if (this.roundCorrectAnswer === null || this.roundCorrectAnswer === undefined) return '';
      const opt = this.currentQuestionOptions[this.roundCorrectAnswer];
      return opt ?? String(this.roundCorrectAnswer);
    },
  },
  mounted() {
    try {
      const saved = JSON.parse(localStorage.getItem('cibergame_session') || '{}');
      if (saved?.roomId && saved?.username && saved?.isHost) {
        this.roomId = saved.roomId;
        this.username = saved.username;
      } else {
        this.$router.replace('/');
        return;
      }
    } catch {
      this.$router.replace('/');
      return;
    }

    this.registerListeners();
    socket.emit('join_room_host', { roomId: this.roomId, username: this.username });
  },

  beforeUnmount() {
    this.unregisterListeners();
    clearInterval(this.countdownTimer); // agregar esta línea
  },
  methods: {
    startCountdown(seconds = 3) {
      this.countdownValue = seconds;
      this.showCountdown = true;

      this.countdownTimer = setInterval(() => {
        this.countdownValue--;
        if (this.countdownValue < 0) {
          clearInterval(this.countdownTimer);
          this.countdownTimer = null;
          this.showCountdown = false;

          // ✅ Guardar flag AQUÍ, cuando el countdown ya terminó
          const saved = JSON.parse(localStorage.getItem('cibergame_session') || '{}');
          localStorage.setItem('cibergame_session', JSON.stringify({ ...saved, gameStarted: true }));
        }
      }, 1000);
    },
    playerColor(rankIndex) {
      const COLORS = [
        '#378ADD',  // azul
        '#1D9E75',  // teal
        '#EF9F27',  // ámbar
        '#D4537E',  // rosa
        '#7F77DD',  // púrpura
        '#5DCAA5',  // verde-teal
        '#F09595',  // coral
        '#85B7EB',  // azul claro
      ]
      // rankIndex es la posición en sortedPlayers; para color estable
      // busca el índice original del jugador en this.players
      const player = this.sortedPlayers[rankIndex]
      const originalIndex = this.players.findIndex(p => p.username === player.username)
      return COLORS[originalIndex % COLORS.length]
    },
    // FIX: un único método para cerrar sala desde cualquier estado
    // Emite leave_room y deja que onRoomError maneje la redirección
    closeRoom() {
      socket.emit('leave_room', {
        roomId: this.roomId,
        username: this.username,
      });
    },

    registerListeners() {
      this.onStartGame = (payload) => {
        if (payload?.roomId && payload.roomId !== this.roomId) return;

        const saved = JSON.parse(localStorage.getItem('cibergame_session') || '{}');
        if (saved.gameStarted) {
          // Reconexión: mostrar la vista de juego sin countdown
          this.gameStarted = true;
          return;
        }

        this.gameStarted = true;
        this.gameOver = false;
        this.startCountdown(payload.countdownSeconds ?? 3);
      };

      this.onRoomData = (room) => {
        if (!room || room.roomId !== this.roomId) return;
        this.players = (room.players || []).map(p => ({
          ...p,
          _justAnswered: false,
          _isCorrect: null,
          _scoreDelta: false,
        }));

        if (room.gameStarted) {
          this.currentQuestionImage = room.currentQuestionImageId ?? null;
          this.currentQuestionIndex = room.currentQuestionIndex ?? 0;
          this.totalQuestions = room.totalQuestions ?? 0;
          this.gameStarted = true;
        }
      };

      this.onQuestion = (payload) => {
        if (payload?.roomId && payload.roomId !== this.roomId) return;
        this.roundAnswers = {};
        this.showRoundResult = false;
        this.currentQuestion = payload.question?.question || '';
        this.currentQuestionImage = payload.currentQuestionImageId ?? null;
        this.currentQuestionIndex = payload.index || 0;
        this.totalQuestions = payload.total || 0;
        // FIX: guardar las opciones para poder mostrar el texto de la respuesta correcta
        this.currentQuestionOptions = payload.question?.options || [];
        this.gameStarted = true;

        this.players = this.players.map(p => ({
          ...p,
          _justAnswered: false,
          _isCorrect: null,
          _scoreDelta: false,
        }));
        console.log('Pregunta recibida:', this.currentQuestionImage);
      };

      this.onRoundResult = (payload) => {
        if (payload?.roomId && payload.roomId !== this.roomId) return;

        const scoresMap = {};
        (payload.scores || []).forEach(s => { scoresMap[s.username] = s; });

        this.players = this.players.map(p => {
          const s = scoresMap[p.username];
          if (!s) return p;
          const scoreDelta = s.score > p.score;
          return {
            ...p,
            score: s.score,
            _justAnswered: s.answered,
            _isCorrect: s.isCorrect,
            _scoreDelta: scoreDelta,
          };
        });

        (payload.scores || []).forEach(s => {
          if (s.answered) {
            this.roundAnswers[s.username] = { isCorrect: s.isCorrect };
          }
        });

        // FIX: correctAnswer es un índice numérico — guardarlo tal cual
        this.roundCorrectAnswer = payload.correctAnswer ?? null;
        this.roundExplanation = payload.explanation ?? '';
        this.showRoundResult = true;

        setTimeout(() => {
          this.players = this.players.map(p => ({ ...p, _scoreDelta: false }));
        }, 1200);
      };

      this.onGameOver = (payload) => {
        if (payload?.roomId && payload.roomId !== this.roomId) return;

        // ✅ Limpiar flag al terminar
        const saved = JSON.parse(localStorage.getItem('cibergame_session') || '{}');
        const { gameStarted, ...rest } = saved;
        localStorage.setItem('cibergame_session', JSON.stringify(rest));

        this.leaderboard = payload.leaderboard || [];
        this.gameOver = true;
        this.gameStarted = false;
        this.showRoundResult = false;
      };

      // FIX: onRoomError es el único lugar que hace la redirección
      // Cubre "cerrado" (host cerró sala) y "existe" (sala no encontrada)
      this.onRoomError = ({ message }) => {
        if (
          message?.includes('cerrado') ||
          message?.includes('existe') ||
          message?.includes('cerrada')
        ) {
          localStorage.removeItem('cibergame_session');
          this.$router.replace('/');
        }
      };

      socket.on('start_game', this.onStartGame);
      socket.on('room_data', this.onRoomData);
      socket.on('question', this.onQuestion);
      socket.on('round_result', this.onRoundResult);
      socket.on('game_over', this.onGameOver);
      socket.on('room_error', this.onRoomError);
    },

    unregisterListeners() {
      if (this.onStartGame) socket.off('start_game', this.onStartGame);
      if (this.onRoomData) socket.off('room_data', this.onRoomData);
      if (this.onQuestion) socket.off('question', this.onQuestion);
      if (this.onRoundResult) socket.off('round_result', this.onRoundResult);
      if (this.onGameOver) socket.off('game_over', this.onGameOver);
      if (this.onRoomError) socket.off('room_error', this.onRoomError);
    },

    getPlayerCardStyle(player) {
      const base = 'background:rgba(13,45,78,0.95);border:0.5px solid rgba(55,138,221,0.2);';
      if (this.roundAnswers[player.username] !== undefined) {
        if (this.roundAnswers[player.username]?.isCorrect) {
          return 'background:rgba(13,45,78,0.95);border:0.5px solid rgba(29,158,117,0.5);';
        }
        return 'background:rgba(13,45,78,0.95);border:0.5px solid rgba(226,75,74,0.4);';
      }
      return base;
    },

    getRankBadgeStyle(index) {
      if (index === 0) return 'background:rgba(212,175,55,0.2);color:#D4AF37;border:0.5px solid rgba(212,175,55,0.4);';
      if (index === 1) return 'background:rgba(192,192,192,0.2);color:#C0C0C0;border:0.5px solid rgba(192,192,192,0.3);';
      if (index === 2) return 'background:rgba(184,115,51,0.2);color:#B87333;border:0.5px solid rgba(184,115,51,0.3);';
      return 'background:rgba(55,138,221,0.1);color:#7BAFD4;border:0.5px solid rgba(55,138,221,0.2);';
    },

    podiumColor(i) {
      if (i === 0) return 'color:#D4AF37;';
      if (i === 1) return 'color:#C0C0C0;';
      if (i === 2) return 'color:#B87333;';
      return 'color:#85B7EB;';
    },

    podiumBarStyle(i) {
      const heights = ['80px', '56px', '40px'];
      const colors = [
        'background:rgba(212,175,55,0.2);border:0.5px solid rgba(212,175,55,0.4);color:#D4AF37;font-size:20px;',
        'background:rgba(192,192,192,0.15);border:0.5px solid rgba(192,192,192,0.3);color:#C0C0C0;font-size:20px;',
        'background:rgba(184,115,51,0.15);border:0.5px solid rgba(184,115,51,0.3);color:#B87333;font-size:20px;',
      ];
      return `height:${heights[i] || '30px'};${colors[i] || ''}`;
    },
  },
};
</script>

<style scoped>
.score-pop-enter-active {
  animation: scorePop 1.2s ease forwards;
}

@keyframes scorePop {
  0% {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }

  60% {
    opacity: 1;
    transform: translateX(-50%) translateY(-24px) scale(1.2);
  }

  100% {
    opacity: 0;
    transform: translateX(-50%) translateY(-40px) scale(0.8);
  }
}

.fade-slide-enter-active {
  transition: all 0.4s ease;
}

.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.count-pop-enter-active {
  animation: countPop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.count-pop-leave-active {
  animation: countPop 0.2s ease-in reverse;
}

@keyframes countPop {
  from {
    transform: scale(0.4);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
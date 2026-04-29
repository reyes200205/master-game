<template>
  <div class="relative min-h-screen w-full overflow-hidden" style="
         background-color: #030b16;
         background-image: 
           linear-gradient(90deg, rgba(55, 138, 221, 0.06) 1px, transparent 1px),
           linear-gradient(rgba(55, 138, 221, 0.06) 1px, transparent 1px), 
           radial-gradient(at 50% 40%, #0a223f 0%, #051325 60%, #030b16 100%);
         background-size: 45px 45px, 45px 45px, 100% 100%;
       ">

    <div v-if="gameState === 'HOME'"
      class="flex relative z-10 flex-col items-center justify-center min-h-screen px-6 py-12">
      <img src="/logo-md.webp" alt="Master Drilling MÉXICO Logo" class="w-28 mb-6 opacity-90 rounded-xl" />
      <p class="text-xs text-blue-400 tracking-widest font-semibold mb-1 drop-shadow-[0_0_8px_rgba(55,138,221,0.8)]">
        MASTER DRILLING MÉXICO
      </p>
      <h1 class="text-5xl text-blue-300 drop-shadow-[0_0_8px_rgba(55,138,221,0.8)] font-bold text-center mb-1">¿Real o
        Pishing?</h1>
      <p class="text-[14px] mt-1 mb-2" style="color:#4a7a9b;">Pon a prueba tu instinto de seguridad digital v.1.0</p> 

      <div class="flex p-1 rounded-xl bg-[#0d1b2a] border border-blue-900/30 w-full max-w-md">
        <button @click="role = 'player'" :class="role === 'player'
          ? 'bg-[#244689] text-white shadow-[0_0_15px_rgba(36,70,137,0.4)]'
          : 'text-gray-500 hover:text-gray-300'"
          class="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all duration-300">
          <span>🎮</span> Jugador
        </button>

        <button @click="role = 'host'" :class="role === 'host'
          ? 'bg-[#244689] text-white shadow-[0_0_15px_rgba(36,70,137,0.4)]'
          : 'text-gray-500 hover:text-gray-300'"
          class="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all duration-300">
          <span>📺</span> Anfitrión
        </button>
      </div>

      <div class="mt-4 flex items-center justify-center w-full max-w-md">
        <JoinGameModal v-if="role === 'player'" :myData="myData" :errorMessage="errorMessage" @confirmJoin="confirmJoin"
          @update:roomId="val => myData.roomId = val" @update:username="val => myData.username = val" />

        <createGameModal v-if="role === 'host'" :myData="myData" :errorMessage="errorMessage" @goHome="goHome"
          @confirmJoinHost="handleHostJoin" />
      </div>
    </div>

    <section v-if="gameState === 'LOBBY'"
      class="flex flex-col items-center justify-center min-h-screen p-10 text-center bg-[#0a192f]">

      <div class="text-[10px] uppercase tracking-[2px] text-[#7BAFD4] mb-2 opacity-80 font-mono">
        Sala de espera · Master Drilling
      </div>

      <div
        class="text-7xl md:text-8xl font-extrabold text-[#85B7EB] tracking-[14px] leading-tight drop-shadow-[0_0_24px_rgba(45,127,212,0.5)] my-3">
        {{ myData.roomId }}
      </div>

      <div class="text-[0.76em] text-[#7BAFD4] mb-6 font-mono tracking-wider">
        Comparte este código con los jugadores
      </div>

      <div class="w-full max-w-[300px] h-1 bg-white/5 rounded-full mb-8 relative">
        <div class="h-full bg-[#2d7fd4] shadow-[0_0_10px_#2d7fd4] transition-all duration-500 rounded-full"
          :style="{ width: (readyCount / players.length * 100) + '%' }"></div>
        <span class="absolute -bottom-5 right-0 text-[10px] text-[#7BAFD4] tracking-tighter">
          {{ readyCount }}/{{ players.length }} LISTOS
        </span>
      </div>

      <div class="flex flex-wrap justify-center gap-2 max-w-[580px] mb-10">
        <div v-for="player in players" :key="player.username"
          class="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full py-1.5 pl-2 pr-4 animate-[chipIn_0.3s_ease-out]">
          <div
            class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white transition-colors"
            :class="player.ready ? 'bg-[#10b981]' : 'bg-[#1e3a6e]'">
            {{ player.username.slice(0, 1).toUpperCase() }}
          </div>

          <span class="text-[13px] font-semibold text-[#E6F1FB]">
            {{ player.username }}
            <span v-if="player.username === myData.username"
              class="text-[10px] text-[#85B7EB] ml-1 font-normal">(Tú)</span>
          </span>

          <div v-if="player.ready" class="w-1.5 h-1.5 rounded-full bg-[#10b981] shadow-[0_0_5px_#10b981] animate-pulse">
          </div>
        </div>
      </div>

      <div class="flex flex-col items-center gap-4">

        <button v-if="isHost" @click="startHostGame"
          class="font-black text-[0.95em] text-white bg-gradient-to-br from-[#1e3a6e] to-[#2d7fd4] px-10 py-3 rounded-lg shadow-[0_4px_20px_rgba(30,58,110,0.5)] hover:-translate-y-0.5 transition-transform active:scale-95">
           Iniciar partida
        </button>

        <button v-if="!isHost && !isCurrentPlayerReady" @click="setReady"
          class="font-bold text-sm text-white bg-[#10b981] px-8 py-3 rounded-lg shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:brightness-110 active:scale-95">
          ✓ Estoy listo
        </button>

        <p v-if="readyCount < players.length" class="text-[11px] text-[#7BAFD4] italic">
          Esperando a que todos estén listos...
        </p>

        <button @click="logout"
          class="text-[0.8em] font-semibold text-[#7BAFD4] bg-transparent border border-white/10 px-5 py-2 rounded-lg hover:border-[#85B7EB] hover:text-white transition-colors mt-2">
          {{ isHost ? '← Cerrar Sala' : '← Salir' }}
        </button>
      </div>

    </section>



    <div v-if="errorMessage && gameState === 'LOBBY'"
      class="fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl whitespace-nowrap"
      style="background:rgba(226,75,74,0.12);border:0.5px solid rgba(240,149,149,0.4);color:#F09595;font-size:13px;">
      {{ errorMessage }}
    </div>

  </div>
</template>

<script>
import socket from '../services/socket';
import CreateGameModal from '../components/CreateGameModal.vue';
import buttonCreate from '../components/buttonCreate.vue';
import buttonJoin from '../components/buttonJoin.vue';
import JoinGameModal from '../components/JoinGameModal.vue';

export default {
  name: 'HomeComponent',
  components: {
    CreateGameModal,
    buttonCreate,
    buttonJoin,
    JoinGameModal
  },
  data() {
    return {
      role: 'player',
      gameState: 'HOME',
      myData: {
        roomId: '',
        username: '',
        isHost: false,
      },
      players: [],
      errorMessage: '',
      onRoomCreated: null,
      host: null,
      onRoomData: null,
      onRoomError: null,
      onStartGame: null,
      openCreateGameModal: false,
    };
  },
  computed: {
    isHost() {
      if (this.myData.isHost) return true;
      return this.host && this.host.username === this.myData.username;
    },
    readyCount() {
      return this.players.filter((p) => p.ready).length;
    },
    currentPlayer() {
      return this.players.find((p) => p.username === this.myData.username);
    },
    isCurrentPlayerReady() {
      const me = this.players.find(p => p.username === this.myData.username);
      return me ? me.ready : false;
    },
    isCurrentPlayerInRoom() {
      return this.players.some(p => p.username === this.myData.username);
    },
    allReady() {
      return this.players.length > 0 && this.players.every((p) => p.ready);
    },
  },
  mounted() {
    console.log("🏠 Home mounted, registrando listeners y verificando sesión guardada.");
    this.registerSocketListeners();

    const savedSession = localStorage.getItem('cibergame_session');
    if (!savedSession) return;

    try {
      const parsed = JSON.parse(savedSession);
      if (!parsed?.roomId || !parsed?.username) {
        localStorage.removeItem('cibergame_session');
        return;
      }
      this.myData.roomId = String(parsed.roomId).toUpperCase();
      this.myData.username = String(parsed.username);
      this.gameState = 'LOBBY';
      socket.emit('join_room', this.myData);
    } catch {
      localStorage.removeItem('cibergame_session');
    }
  },
  beforeUnmount() {
    this.unregisterSocketListeners();
  },
  methods: {
    registerSocketListeners() {
      this.onRoomCreated = ({ roomId }) => {
        this.myData.roomId = roomId;
        this.gameState = 'MODAL_CREATE';
        this.errorMessage = '';
      };

      this.onRoomData = (room) => {
        if (!room || room.roomId !== this.myData.roomId) return;
        this.players = room.players || [];
        this.host = room.host || null;
        this.gameState = 'LOBBY';

        if (this.isHost || this.isCurrentPlayerInRoom) {
          localStorage.setItem('cibergame_session', JSON.stringify({
            ...this.myData,
            isHost: this.isHost
          }));
        }
      };

      this.onStartGame = (payload) => {
        if (payload?.roomId && payload.roomId !== this.myData.roomId) return;

        if (this.myData.isHost) {
          this.$router.push('/host');
        } else {
          this.$router.push('/game');
        }
      };

      this.onRoomError = ({ message }) => {
        this.errorMessage = message || 'No se pudo completar la acción.';
      };

      socket.on('room_created', this.onRoomCreated);
      socket.on('room_data', this.onRoomData);
      socket.on('start_game', this.onStartGame);
      socket.on('room_error', this.onRoomError);
    },
    unregisterSocketListeners() {
      if (this.onRoomCreated) socket.off('room_created', this.onRoomCreated);
      if (this.onRoomData) socket.off('room_data', this.onRoomData);
      if (this.onStartGame) socket.off('start_game', this.onStartGame);
      if (this.onRoomError) socket.off('room_error', this.onRoomError);
    },
    createRoom() {
      this.errorMessage = '';
      this.myData.roomId = '';
      socket.emit('create_room');
    },
    openJoinModal() {
      this.errorMessage = '';
      this.gameState = 'MODAL_JOIN';
    },
    confirmJoin() {
      const roomId = String(this.myData.roomId || '').trim().toUpperCase();
      const username = String(this.myData.username || '').trim();
      if (!roomId || !username) {
        this.errorMessage = 'Debes ingresar un nombre.';
        return;
      }
      this.myData.roomId = roomId;
      this.myData.username = username;
      this.errorMessage = '';
      socket.emit('join_room', this.myData);
    },
    handleHostJoin() {
      console.log("Host intentando crear sala con datos:", this.myData);
      const roomId = String(this.myData.roomId || '').trim().toUpperCase();
      const username = String(this.myData.username || 'host').trim();
      if (!roomId || !username) {
        this.errorMessage = 'Debes ingresar un nombre.';
        return;
      }
      localStorage.setItem('cibergame_session', JSON.stringify({
        roomId: this.myData.roomId,
        username: this.myData.username,
        isHost: true,
      }));

      this.myData.roomId = roomId;
      this.myData.username = username;
      this.myData.isHost = true;
      this.errorMessage = '';
      socket.emit('join_room_host', this.myData);
    },
    startHostGame() {
      if (this.players.length === 0) {
        this.errorMessage = 'No hay jugadores en la sala.';
        return;
      }
      socket.emit('host_start_game', { roomId: this.myData.roomId });
    },
    setReady() {
      socket.emit('player_ready', {
        roomId: this.myData.roomId,
        username: this.myData.username,
      });
    },
    goHome() {
      this.gameState = 'HOME';
      this.errorMessage = '';
    },
    logout() {
      if (this.myData.roomId && this.myData.username) {
        socket.emit('leave_room', this.myData);
      }
      localStorage.removeItem('cibergame_session');
      this.players = [];
      this.myData = { roomId: '', username: '' };
      this.gameState = 'HOME';
      this.errorMessage = '';
    },
  },
};
</script>

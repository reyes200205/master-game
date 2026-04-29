import { io } from "socket.io-client";

// Esta constante detecta si estás en producción o local automáticamente
const isProduction = false;
let SOCKET_URL = null;

if (isProduction) {
    SOCKET_URL = 'https://game-sheq-day-production.up.railway.app';
} else {
    SOCKET_URL = 'http://localhost:3000'; 
}

console.log("🔌 Conectando al socket en:", SOCKET_URL);

const socket = io(SOCKET_URL, {
    transports: ["websocket"],
    // Esto evita que se quede intentando conectar si falla el primer handshake
    forceNew: true 
});

export default socket;
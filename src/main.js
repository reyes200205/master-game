import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import VueConfetti from 'vue-confetti' // Importas la librería
import './style.css'

const app = createApp(App)

// Registras los plugins aquí
app.use(router)
app.use(VueConfetti) // <--- Aquí entra el registro de confetti

app.mount('#app')
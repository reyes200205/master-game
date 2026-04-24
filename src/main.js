import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import './style.css' // <--- Asegúrate de que esta línea exista y apunte al archivo correcto

createApp(App).use(router).mount('#app')
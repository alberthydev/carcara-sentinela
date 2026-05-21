import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/main.css' // <-- CERTIFIQUE-SE DE QUE ESSA LINHA EXISTE E ESTÁ COM O CAMINHO CORRETO

const app = createApp(App)
app.use(router)
app.mount('#app')

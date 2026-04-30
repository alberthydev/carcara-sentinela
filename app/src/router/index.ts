import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import CadastroVisitanteView from '@/views/userRegisterView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/cadastroVisitante',
      name: 'cadastroVisitante',
      component: CadastroVisitanteView
    }
  ]
})

export default router
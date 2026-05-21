import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import CadastroVisitanteView from '@/views/userRegisterView.vue'
import UserLoginView from '@/views/userLoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'userLogin',
      component: UserLoginView,
    },
    {
      path: '/register',
      name: 'userRegister',
      component: CadastroVisitanteView,
    },
  ],
})

export default router

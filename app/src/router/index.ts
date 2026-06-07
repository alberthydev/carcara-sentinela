import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import CadastroVisitanteView from '@/views/userRegisterView.vue'
import UserLoginView from '@/views/userLoginView.vue'
import DashboardVisitante from '../views/DashboardVisitante.vue'
import DashboardInterno from '../views/DashboardInterno.vue'

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
    {
      path: '/painel-visitante',
      name: 'Visitante',
      component: DashboardVisitante
    },
    {
      path: '/painel-interno',
      name: 'Interno',
      component: DashboardInterno
    },
  ],
})

// Porteiro de rotas: verifica se o usuário tem token antes de acessar o dashboard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
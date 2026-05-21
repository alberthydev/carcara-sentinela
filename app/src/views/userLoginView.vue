<template>
  <div class="min-h-screen w-full bg-white flex font-sans antialiased">
    <div
      class="w-full lg:w-1/2 min-h-screen flex flex-col justify-center items-center px-8 sm:px-16 lg:px-24 py-12 bg-white text-carcara-marrom"
    >
      <div class="w-full max-w-md flex flex-col items-center">
        <div class="w-full flex flex-col items-center gap-2 text-center relative">
          <img
            src="../assets/img/carcara.png"
            alt="Logo Carcará Sentinela"
            class="h-35 w-35 object-contain"
          />
          <h1 class="text-5xl font-serif tracking-wide text-carcara-marrom">
            Carcará <span class="text-carcara-laranja font-medium">Sentinela</span>
          </h1>
          <p class="text-sm font-serif tracking-wider text-carcara-laranja">
            Visão que antecipa. Monitoramento que informa
          </p>
          <div class="h-[2px] w-35 bg-carcara-laranja my-8"></div>
        </div>

        <div class="w-full text-left mb-6">
          <h2 class="text-3xl font-serif font-normal text-carcara-marrom mb-1">Bem-vindo</h2>
          <p class="text-sm font-light text-gray-500">Acesse sua conta para continuar</p>
        </div>

        <div class="w-full flex flex-col gap-3 mb-6">
          <button
            type="button"
            class="w-full flex items-center justify-center gap-3 border border-gray-200 py-3 px-4 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <svg class="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5.04c1.65 0 3.13.57 4.3 1.69l3.22-3.22C17.56 1.62 14.98 1 12 1 7.35 1 3.39 3.65 1.5 7.5l3.6 2.8C6.01 7.05 8.78 5.04 12 5.04z"
              />
              <path
                fill="#4285F4"
                d="M23.45 12.3c0-.82-.07-1.6-.2-2.3H12v4.4h6.43c-.28 1.44-1.1 2.66-2.33 3.48l3.6 2.8c2.1-1.94 3.3-4.8 3.3-8.3z"
              />
              <path
                fill="#FBBC05"
                d="M5.1 14.7c-.25-.75-.39-1.55-.39-2.37s.14-1.62.39-2.37l-3.6-2.8C.54 8.72 0 10.3 0 12s.54 3.28 1.5 4.87l3.6-2.8z"
              />
              <path
                fill="#34A564"
                d="M12 23c3.24 0 5.97-1.08 7.96-2.9l-3.6-2.8c-1.1.74-2.52 1.18-4.36 1.18-3.22 0-6-2.01-6.97-4.96l-3.6 2.8C3.39 20.35 7.35 23 12 23z"
              />
            </svg>
            Continuar com Google
          </button>

          <button
            type="button"
            class="w-full flex items-center justify-center gap-3 bg-black text-white py-3 px-4 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.63.73-1.18 1.87-1.03 2.97 1.12.09 2.27-.57 2.97-1.4M"
              />
            </svg>
            Continuar com Apple
          </button>
        </div>

        <div class="w-full flex items-center gap-4 mb-6">
          <div class="h-[1px] flex-grow bg-gray-200"></div>
          <span class="text-xs text-gray-400 uppercase tracking-widest font-medium">ou</span>
          <div class="h-[1px] flex-grow bg-gray-200"></div>
        </div>

        <form @submit.prevent="handleLogin" class="w-full flex flex-col gap-4">
          <div class="flex flex-col items-start gap-1">
            <label for="cpf" class="text-sm font-semibold text-carcara-marrom">CPF</label>
            <input
              id="cpf"
              v-model="loginForm.cpf"
              type="text"
              v-maska="'###.###.###-##'"
              placeholder="111.222.333-44"
              class="w-full bg-[#F9F9F9] border border-gray-200 rounded-lg py-3 px-4 text-base outline-none focus:border-carcara-laranja focus:bg-white transition-all"
              required
            />
          </div>

          <div class="flex flex-col items-start gap-1">
            <label for="password" class="text-sm font-semibold text-carcara-marrom">Senha</label>
            <input
              id="password"
              v-model="loginForm.password"
              type="password"
              placeholder="••••••••"
              class="w-full bg-[#F9F9F9] border border-gray-200 rounded-lg py-3 px-4 text-base outline-none focus:border-carcara-laranja focus:bg-white transition-all"
              required
            />
          </div>

          <div class="w-full flex justify-between items-center text-sm mt-1">
            <label
              class="flex items-center gap-2 text-carcara-marrom font-medium cursor-pointer select-none"
            >
              <input
                v-model="loginForm.rememberMe"
                type="checkbox"
                class="rounded border-gray-300 text-carcara-laranja focus:ring-carcara-laranja h-4 w-4 accent-carcara-laranja"
              />
              Lembrar-me
            </label>
            <a
              href="#"
              @click.prevent="forgotPassword"
              class="text-carcara-laranja hover:underline font-medium"
            >
              Esqueceu a sua senha?
            </a>
          </div>

          <button
            type="submit"
            class="w-full bg-carcara-laranja text-white font-semibold py-3.5 px-4 rounded-lg mt-4 shadow-sm hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer text-center"
          >
            Entrar
          </button>
        </form>

        <p class="text-sm text-carcara-marrom mt-8 font-medium">
          Não tem uma conta?
          <a
            href="#"
            @click.prevent="goToRegistry"
            class="text-carcara-laranja hover:underline font-bold"
          >
            Cadastre-se
          </a>
        </p>
      </div>
    </div>

    <div class="hidden lg:block lg:w-1/2 min-h-screen bg-carcara-laranja"></div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const loginForm = reactive({
  cpf: '',
  password: '',
  rememberMe: false,
})

const handleLogin = () => {
  // Lógica de autenticação futura será centralizada aqui
  console.log('Dados de login submetidos:', loginForm)
}

const goToRegistry = () => {
  router.push('/register')
}

const forgotPassword = () => {
  console.log('Fluxo de recuperação acionado')
}
</script>

<style scoped></style>

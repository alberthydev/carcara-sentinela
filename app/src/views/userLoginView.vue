<template>
  <div class="min-h-screen w-full bg-white flex font-sans antialiased">
    <div
      class="w-full lg:w-1/2 min-h-screen flex flex-col justify-center items-center px-8 sm:px-16 lg:px-24 py-12 bg-white text-carcara-marrom"
    >
      <div class="w-full max-w-md flex flex-col items-center">
        <a
          href="/"
          class="absolute top-6 left-6 flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-carcara-laranja transition-colors group z-10"
        >
          <svg
            class="h-5 w-5 transform group-hover:-translate-x-1 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>

          Voltar para o início
        </a>
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
            @click="loginComGoogle"
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
            class="w-full flex items-center justify-center gap-3 border border-gray-200 py-3 px-4 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clip-path="url(#clip0_268_220)">
                <path d="M7.60413 7.60413H0V0H7.60413V7.60413Z" fill="#F1511B" />
                <path d="M16.0001 7.60413H8.396V0H16.0001V7.60413Z" fill="#80CC28" />
                <path d="M7.60394 16.0001H0V8.396H7.60394V16.0001Z" fill="#00ADEF" />
                <path d="M16.0001 16.0001H8.396V8.396H16.0001V16.0001Z" fill="#FBBC09" />
              </g>
              <defs>
                <clipPath id="clip0_268_220">
                  <rect width="16" height="16" fill="white" />
                </clipPath>
              </defs>
            </svg>
            Continuar com Microsoft
          </button>
        </div>

        <div
          v-if="mensagem"
          :class="[
            'p-4 rounded-lg text-center font-bold text-sm border transition-all my-4 w-full',
            tipoAlerta === 'sucesso'
              ? 'bg-green-50 text-green-800 border-green-200'
              : 'bg-red-50 text-red-800 border-red-200',
          ]"
        >
          {{ mensagem }}
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
              @input="aplicarMascaraCpf"
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

    <div
      v-if="promptCpfVinculo"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn"
    >
      <div
        class="bg-white w-full max-w-md p-8 rounded-2xl shadow-2xl border border-gray-100 flex flex-col gap-5 text-left m-4 relative"
      >
        <button
          @click="promptCpfVinculo = false"
          class="absolute top-4 right-4 text-gray-400 hover:text-carcara-marrom text-xl font-bold cursor-pointer"
        >
          &times;
        </button>

        <div>
          <h3 class="text-2xl font-serif font-bold text-carcara-marrom mb-1">Falta pouco!</h3>
          <p class="text-sm text-gray-500 leading-relaxed">
            Identificamos sua conta Google com sucesso. Para concluir o seu vínculo de acesso ao
            Carcará, informe o seu CPF abaixo.
          </p>
        </div>

        <div class="flex flex-col items-start gap-1">
          <label for="cpfVinculo" class="text-sm font-semibold text-carcara-marrom">CPF</label>
          <input
            id="cpfVinculo"
            v-model="loginForm.cpf"
            type="text"
            @input="aplicarMascaraCpf"
            placeholder="111.222.333-44"
            class="w-full bg-[#F9F9F9] border border-gray-200 rounded-lg py-3 px-4 text-base outline-none focus:border-carcara-laranja focus:bg-white transition-all"
            required
          />
        </div>

        <button
          type="button"
          :disabled="carregando"
          @click="concluirVinculoGoogle"
          class="w-full bg-carcara-laranja text-white font-semibold py-3.5 px-4 rounded-lg shadow-md hover:opacity-95 transition-all cursor-pointer text-center"
        >
          {{ carregando ? 'Vinculando...' : 'Concluir e Entrar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const loginForm = reactive({
  cpf: '',
  password: '',
  rememberMe: false,
})

const aplicarMascaraCpf = (event: Event) => {
  const input = event.target as HTMLInputElement
  let valor = input.value.replace(/\D/g, '')

  if (valor.length > 11) {
    valor = valor.slice(0, 11)
  }

  valor = valor.replace(/(\d{3})(\d)/, '$1.$2')
  valor = valor.replace(/(\d{3})(\d)/, '$1.$2')
  valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2')

  loginForm.cpf = valor
}

const mensagem = ref('')
const tipoAlerta = ref('')
const carregando = ref(false)

const promptCpfVinculo = ref(false)
const tokenTemporario = ref('')

const handleLogin = async () => {
  carregando.value = true
  mensagem.value = ''

  try {
    const resposta = await fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cpf: loginForm.cpf,
        password: loginForm.password,
      }),
    })

    const dados = await resposta.json()

    if (resposta.ok) {
      const tipo = dados.usuario.tipo

      localStorage.setItem('user', JSON.stringify(dados.usuario))
      localStorage.setItem('token', dados.token || 'token-provisorio')

      mensagem.value = 'Login realizado com sucesso!'
      tipoAlerta.value = 'sucesso'

      setTimeout(() => {
        if (tipo === 'visitante') {
          router.push('/dashboard')
        } else {
          router.push('/dashboard')
        }
      }, 1500)
    } else {
      mensagem.value = dados.erro || 'CPF ou senha incorretos.'
      tipoAlerta.value = 'erro'
    }
  } catch (err: unknown) {
    mensagem.value = `Erro ao conectar ao servidor. ${err}`
    tipoAlerta.value = 'erro'
  } finally {
    carregando.value = false
  }
}

interface GoogleAuthResponse {
  credential: string
}

const handleGoogleLoginResponse = async (response: GoogleAuthResponse) => {
  carregando.value = true
  mensagem.value = ''

  try {
    const tokenGoogle = response.credential
    tokenTemporario.value = tokenGoogle

    const respostaBackend = await fetch('/api/users/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: tokenGoogle,
        cpf: loginForm.cpf || null,
      }),
    })

    const dados = await respostaBackend.json()

    if (respostaBackend.status === 202 && dados.vinculoPendente) {
      mensagem.value =
        'Olá! Identificamos sua conta Google, mas precisamos do seu CPF para concluir o acesso.'
      tipoAlerta.value = 'sucesso'
      promptCpfVinculo.value = true
      return
    }

    if (respostaBackend.ok) {
      const tipo = dados.usuario?.tipo || 'visitante'
      localStorage.setItem('user', JSON.stringify(dados.usuario))
      localStorage.setItem('token', dados.token || tokenGoogle)

      mensagem.value = `Bem-vindo de volta, ${dados.usuario?.nome || 'Usuário'}!`
      tipoAlerta.value = 'sucesso'

      setTimeout(() => {
        if (tipo === 'visitante') {
          router.push('/dashboard')
        } else {
          router.push('/dashboard')
        }
      }, 1500)
    } else {
      mensagem.value = dados.erro || 'Erro ao validar acesso com o Google.'
      tipoAlerta.value = 'erro'
    }
  } catch (error: unknown) {
    mensagem.value = `Falha na comunicação com o servidor backend. ${error instanceof Error ? error.message : String(error)}`
    tipoAlerta.value = 'erro'
  } finally {
    carregando.value = false
  }
}

onMounted(() => {
  const clientIdReal = String(import.meta.env.VITE_GOOGLE_CLIENT_ID).trim()

  const inicializarGoogleAuth = () => {
    // @ts-expect-error : O objeto 'google' não está definido no escopo global
    if (typeof google !== 'undefined' && google.accounts?.id) {
      try {
        // @ts-expect-error : O método 'initialize' não está definido no objeto 'id' do 'google.accounts'
        google.accounts.id.initialize({
          client_id: clientIdReal,
          callback: handleGoogleLoginResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        })
      } catch (err) {
        console.error('Erro ao inicializar Google Auth no Login:', err)
      }
    }
  }

  setTimeout(inicializarGoogleAuth, 200)
})

const loginComGoogle = () => {
  // @ts-expect-error : O método 'prompt' não está definido no objeto 'id' do 'google.accounts'
  if (typeof google !== 'undefined') {
    // @ts-expect-error : O método 'prompt' não está definido no objeto 'id' do 'google.accounts'
    google.accounts.id.prompt()
  } else {
    alert('SDK do Google não carregado. Verifique os scripts do index.html.')
  }
}

const goToRegistry = () => {
  router.push('/register')
}

const forgotPassword = () => {
  console.log('Fluxo de recuperação acionado')
}

const concluirVinculoGoogle = async () => {
  if (!loginForm.cpf) {
    alert('Por favor, digite o seu CPF para finalizar o vínculo.')
    return
  }

  carregando.value = true
  mensagem.value = ''

  try {
    const reply = await fetch('/api/users/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: tokenTemporario.value,
        cpf: loginForm.cpf,
      }),
    })

    const dados = await reply.json()

    if (reply.ok) {
      const tipo = dados.usuario?.tipo || 'visitante'
      localStorage.setItem('user', JSON.stringify(dados.usuario))
      localStorage.setItem('token', dados.token || tokenTemporario.value)

      mensagem.value = `Vínculo realizado com sucesso! Bem-vindo, ${dados.usuario?.nome || 'Usuário'}!`
      tipoAlerta.value = 'sucesso'

      promptCpfVinculo.value = false
      tokenTemporario.value = ''

      setTimeout(() => {
        if (tipo === 'visitante') {
          router.push('/dashboard')
        } else {
          router.push('/dashboard')
        }
      }, 1500)
    } else {
      mensagem.value = dados.erro || 'Não foi possível concluir o vínculo.'
      tipoAlerta.value = 'erro'
    }
  } catch {
    mensagem.value = 'Falha na comunicação com o servidor backend.'
    tipoAlerta.value = 'erro'
  } finally {
    carregando.value = false
  }
}
</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.2s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>

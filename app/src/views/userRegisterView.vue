<template>
  <div class="min-h-screen w-full bg-[#fafafa] flex flex-col lg:flex-row font-sans antialiased text-carcara-marrom">
    
    <div
      class="w-full lg:w-1/2 min-h-[50vh] lg:min-h-screen flex flex-col justify-between items-center px-6 sm:px-12 lg:px-20 py-8 lg:py-12 bg-white relative"
    >
      <a
        href="#"
        @click.prevent="router.push('/login')"
        class="absolute top-4 left-4 lg:top-6 lg:left-6 flex items-center gap-2 text-xs lg:text-sm font-semibold text-gray-500 hover:text-carcara-laranja transition-colors group z-10"
      >
        <svg class="h-4 w-4 lg:h-5 lg:w-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Voltar para o login
      </a>

      <div class="w-full flex flex-col items-center gap-2 text-center relative mt-8 lg:mt-0">
        <button
          type="button"
          @click="mockarDadosIFC"
          class="absolute top-0 right-0 bg-gray-500 text-white text-[10px] uppercase font-bold px-3 py-1.5 rounded hover:bg-gray-600 cursor-pointer hidden lg:block"
        >
          Mock Admin
        </button>

        <img src="../assets/img/carcara.png" alt="Logo Carcará Sentinela" class="h-24 w-24 lg:h-35 lg:w-35 object-contain" />
        <h1 class="text-4xl lg:text-6xl font-serif tracking-wide text-carcara-marrom">
          Carcará <span class="text-carcara-laranja font-medium">Sentinela</span>
        </h1>
        <p class="text-xs lg:text-sm font-serif tracking-wider text-carcara-laranja">
          Visão que antecipa. Monitoramento que informa
        </p>
        <div class="h-[2px] w-24 lg:w-35 bg-carcara-laranja mt-6 lg:mt-10"></div>
      </div>

      <div class="w-full max-w-md my-auto flex flex-col gap-5 lg:gap-6 text-left py-8">
        <div>
          <h2 class="text-3xl lg:text-4xl font-serif font-bold text-carcara-marrom mb-1">Cadastro</h2>
          <p class="text-base lg:text-xl font-light text-carcara-marrom leading-relaxed">
            Escolha seu perfil e faça a validação para liberar os dados do formulário.
          </p>
        </div>

        <div class="flex flex-col gap-1">
          <div class="relative">
            <select
              v-model="form.tipo"
              class="w-full bg-[#F9F9F9] border border-gray-200 rounded-lg py-3 px-4 text-sm lg:text-base outline-none focus:border-carcara-laranja appearance-none cursor-pointer text-gray-700"
              :disabled="validadoNoIFC"
            >
              <option value="" disabled>Selecione o seu perfil</option>
              <option value="visitante">Visitante</option>
              <option value="aluno">Aluno</option>
              <option value="servidor">Servidor</option>
            </select>
          </div>
        </div>

        <div v-if="form.tipo" class="flex flex-col gap-4 animate-fadeIn">
          <div class="flex flex-col gap-1">
            <label class="text-xs lg:text-sm font-semibold text-carcara-marrom">CPF:</label>
            <input
              v-model="form.cpf"
              type="text"
              @input="aplicarMascaraCpf"
              placeholder="123.456.789-00"
              class="w-full bg-[#F9F9F9] border border-gray-200 rounded-lg py-3 px-4 text-sm lg:text-base outline-none focus:border-carcara-laranja disabled:bg-gray-100 disabled:cursor-not-allowed"
              :disabled="validadoNoIFC"
            />
          </div>

          <div v-if="form.tipo === 'aluno' || form.tipo === 'servidor'" class="flex flex-col gap-3">
            <div class="flex flex-col gap-1">
              <label class="text-xs lg:text-sm font-semibold text-carcara-marrom">Matrícula Acadêmica / SIAPE:</label>
              <input
                v-model="form.matricula"
                type="text"
                placeholder="Ex: 2021101..."
                class="w-full bg-[#F9F9F9] border border-gray-200 rounded-lg py-3 px-4 text-sm lg:text-base outline-none focus:border-carcara-laranja disabled:bg-gray-100 disabled:cursor-not-allowed"
                :disabled="validadoNoIFC"
              />
            </div>

            <button
              v-if="!validadoNoIFC"
              type="button"
              @click="validarComIFC"
              class="w-full bg-carcara-laranja text-white font-bold py-3 px-4 rounded-lg hover:opacity-95 transition-all cursor-pointer text-xs lg:text-sm tracking-wider uppercase"
            >
              Validar no Sistema IFC
            </button>

            <button
              v-else
              type="button"
              @click="resetarValidacao"
              class="w-full bg-amber-500 text-carcara-marrom font-bold py-3 px-4 rounded-lg hover:bg-amber-600 transition-all cursor-pointer text-xs lg:text-sm tracking-wider uppercase"
            >
              Voltar / Corrigir
            </button>
          </div>
        </div>

        <div
          v-if="mensagem"
          :class="[
            'p-3 lg:p-4 rounded-lg text-center font-bold text-xs lg:text-sm border transition-all',
            tipoAlerta === 'sucesso' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200',
          ]"
        >
          {{ mensagem }}
        </div>
      </div>

      <div class="text-[10px] lg:text-xs text-gray-400 pb-4 lg:pb-0 text-center">
        Desenvolvido pelo Instituto Federal de Santa Catarina - Campus Videira
      </div>
    </div>

    <div
      class="w-full lg:w-1/2 min-h-[50vh] lg:min-h-screen bg-carcara-laranja-bg flex flex-col justify-center items-center px-6 sm:px-12 lg:px-24 py-12 text-white"
    >
      <div
        class="w-full max-w-lg flex flex-col items-center transition-all duration-300"
        :class="{'opacity-30 pointer-events-none select-none': form.tipo !== 'visitante' && !validadoNoIFC}"
      >
        <div class="w-full flex flex-col gap-3 mb-6">
          <button
            type="button"
            @click="loginComGoogle"
            class="w-full flex items-center justify-center gap-3 bg-white text-carcara-marrom py-3 px-4 rounded-lg text-xs lg:text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <svg class="h-4 w-4 lg:h-5 lg:w-5" viewBox="0 0 24 24">
               <path fill="#EA4335" d="M12 5.04c1.65 0 3.13.57 4.3 1.69l3.22-3.22C17.56 1.62 14.98 1 12 1 7.35 1 3.39 3.65 1.5 7.5l3.6 2.8C6.01 7.05 8.78 5.04 12 5.04z"/>
               <path fill="#4285F4" d="M23.45 12.3c0-.82-.07-1.6-.2-2.3H12v4.4h6.43c-.28 1.44-1.1 2.66-2.33 3.48l3.6 2.8c2.1-1.94 3.3-4.8 3.3-8.3z"/>
               <path fill="#FBBC05" d="M5.1 14.7c-.25-.75-.39-1.55-.39-2.37s.14-1.62.39-2.37l-3.6-2.8C.54 8.72 0 10.3 0 12s.54 3.28 1.5 4.87l3.6-2.8z"/>
               <path fill="#34A564" d="M12 23c3.24 0 5.97-1.08 7.96-2.9l-3.6-2.8c-1.1.74-2.52 1.18-4.36 1.18-3.22 0-6-2.01-6.97-4.96l-3.6 2.8C3.39 20.35 7.35 23 12 23z"/>
            </svg>
            Cadastrar com Google
          </button>
        </div>

        <div class="w-full flex items-center gap-4 mb-6">
          <div class="h-[1px] flex-grow bg-white/30"></div>
          <span class="text-[10px] lg:text-xs text-white/60 uppercase tracking-widest font-medium">ou</span>
          <div class="h-[1px] flex-grow bg-white/30"></div>
        </div>

        <form @submit.prevent="realizarCadastro" class="w-full flex flex-col gap-4 text-carcara-marrom">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="flex flex-col items-start gap-1">
              <label class="text-xs lg:text-sm font-semibold text-carcara-marrom">Nome</label>
              <input
                v-model="form.nome"
                type="text"
                placeholder="Ana"
                class="w-full bg-white rounded-lg py-2.5 px-4 text-sm lg:text-base outline-none disabled:bg-white/80 disabled:opacity-80 disabled:cursor-not-allowed"
                :disabled="validadoNoIFC"
                required
              />
            </div>
            <div class="flex flex-col items-start gap-1">
              <label class="text-xs lg:text-sm font-semibold text-carcara-marrom">Sobrenome</label>
              <input
                v-model="form.sobrenome"
                type="text"
                placeholder="Silva"
                class="w-full bg-white rounded-lg py-2.5 px-4 text-sm lg:text-base outline-none disabled:bg-white/80 disabled:opacity-80 disabled:cursor-not-allowed"
                :disabled="validadoNoIFC"
                required
              />
            </div>
          </div>

          <div class="flex flex-col items-start gap-1">
            <label class="text-xs lg:text-sm font-semibold text-carcara-marrom">Senha</label>
            <input
              v-model="form.senha"
              type="password"
              placeholder="••••••••"
              class="w-full bg-white rounded-lg py-2.5 px-4 text-sm lg:text-base outline-none transition-all duration-200 focus:ring-2 focus:ring-white/50"
              @focus="senhaFocada = true"
              @blur="senhaFocada = false"
              required
            />
            
            <div 
              class="overflow-hidden transition-all duration-300 ease-in-out w-full"
              :class="senhaFocada ? 'max-h-24 opacity-100 mt-1' : 'max-h-0 opacity-0 mt-0'"
            >
              <div class="text-[10px] lg:text-xs text-carcara-marrom font-medium bg-white/40 px-3 py-2 rounded-md border border-white/50 shadow-sm leading-tight backdrop-blur-sm">
                Mín. 8 caracteres. Deve conter: letra maiúscula, letra minúscula, número e símbolo (@$!%*?&).
              </div>
            </div>
          </div>

          <label class="flex items-start gap-2 text-xs lg:text-sm text-carcara-marrom font-medium mt-1 cursor-pointer select-none text-left leading-tight">
            <input type="checkbox" class="mt-0.5 rounded border-gray-300 accent-carcara-marrom h-3 w-3 lg:h-4 lg:w-4 shrink-0" required />
            <span>Concordo com os <a href="#" class="underline">Termos de Serviço</a> e <a href="#" class="underline">Políticas de Privacidade</a>.</span>
          </label>

          <button
            type="submit"
            :disabled="carregando"
            class="w-full bg-carcara-marrom text-white font-semibold py-3 lg:py-3.5 px-4 rounded-lg mt-2 shadow-md hover:opacity-95 disabled:bg-carcara-marrom/50 disabled:cursor-not-allowed transition-all cursor-pointer text-center text-sm lg:text-base"
          >
            {{ carregando ? 'Enviando...' : 'Concluir Cadastro' }}
          </button>
        </form>

        <p class="text-xs lg:text-sm text-carcara-marrom mt-6 font-medium pb-8 lg:pb-0">
          Já tem uma conta?
          <a href="#" @click.prevent="goToLogin" class="text-white hover:underline font-bold">Iniciar sessão.</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = ref({
  cpf: '',
  matricula: '',
  nome: '',
  sobrenome: '',
  tipo: '',
  senha: '',
  fotoUrl: '',
})

const mensagem = ref('')
const tipoAlerta = ref('')
const carregando = ref(false)
const senhaFocada = ref(false)
const validadoNoIFC = ref(false)

watch(
  () => form.value.tipo,
  () => {
    validadoNoIFC.value = false
    mensagem.value = ''
    form.value.nome = ''
    form.value.sobrenome = ''
    form.value.matricula = ''
    form.value.cpf = ''
  },
)

const mockarDadosIFC = async () => {
  const nome = prompt('Nome do Aluno:')
  const cpf = prompt('CPF do Aluno (Digite com a pontuação: 000.000.000-00):')
  const matricula = prompt('Matrícula do Aluno:')

  if (nome && cpf && matricula) {
    try {
      const response = await fetch('/api/users/admin/mock-estudante', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, cpf, matricula }),
      })

      if (response.ok) {
        alert("Dados integrados ao 'Sistema IFC' com sucesso!")
      } else {
        const erroData = await response.json().catch(() => ({}))
        alert(`Falha ao criar Mock: ${erroData.erro || response.statusText}. Você tem permissão de Admin?`)
      }
    } catch (error) {
      alert(`Erro de conexão ao tentar salvar o Mock. ${error}`)
    }
  }
}

const validarComIFC = async () => {
  if (!form.value.cpf || !form.value.matricula) {
    alert('Preencha CPF e Matrícula primeiro.')
    return
  }

  try {
    const res = await fetch(`/api/users/validar-ifc/${form.value.cpf}/${form.value.matricula}`)
    const dados = await res.json()

    if (res.ok) {
      validadoNoIFC.value = true

      const partesNome = dados.nome.split(' ')
      form.value.nome = partesNome[0]
      form.value.sobrenome = partesNome.slice(1).join(' ') || ''

      mensagem.value = `Bem-vindo, ${dados.nome}! Identidade confirmada pelo IFC.`
      tipoAlerta.value = 'sucesso'
    } else {
      validadoNoIFC.value = false
      mensagem.value = dados.erro || 'Falha na validação.'
      tipoAlerta.value = 'erro'
    }
  } catch (err: unknown) {
    mensagem.value = 'Erro ao consultar o Sistema IFC.'
    tipoAlerta.value = 'erro'
    if (err instanceof Error) {
      mensagem.value = `Erro ao consultar o Sistema IFC. info=${err.message}`
    }
  }
}

const resetarValidacao = () => {
  validadoNoIFC.value = false
  mensagem.value = ''
  tipoAlerta.value = ''
  form.value.nome = ''
  form.value.sobrenome = ''
}

const realizarCadastro = async () => {
  carregando.value = true
  mensagem.value = ''

  const nomeCompleto = `${form.value.nome} ${form.value.sobrenome}`.trim()
  const avatarPlaceholder = `https://ui-avatars.com/api/?name=${encodeURIComponent(nomeCompleto)}&background=5A3D2B&color=fff&fake=.png`

  const payload = {
    cpf: form.value.cpf,
    matricula: form.value.matricula,
    nome: form.value.nome,
    sobrenome: form.value.sobrenome,
    tipo: form.value.tipo,
    senha: form.value.senha,
    fotoUrl: form.value.fotoUrl || avatarPlaceholder, 
  }

  try {
    const resposta = await fetch('/api/users/cadastro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const dados = await resposta.json()

    if (resposta.ok) {
      mensagem.value = dados.mensagem || 'Cadastro realizado!'
      tipoAlerta.value = 'sucesso'
      setTimeout(() => {
        form.value = {
          cpf: '',
          matricula: '',
          nome: '',
          sobrenome: '',
          tipo: '',
          senha: '',
          fotoUrl: '',
        }
        router.push('/login')
      }, 3000)
    } else {
      mensagem.value = dados.erro || 'Erro ao cadastrar.'
      tipoAlerta.value = 'erro'
    }
  } catch (erro) {
    mensagem.value = `Erro de conexão. A API está ligada no Docker? error: ${erro}`
    tipoAlerta.value = 'erro'
  } finally {
    carregando.value = false
  }
}

interface GoogleAuthResponse {
  credential: string
  client_id: string
}

const handleCredentialResponse = async (response: GoogleAuthResponse) => {
  if (!form.value.cpf) {
    mensagem.value = 'Por favor, digite o seu CPF antes de continuar com o Google.'
    tipoAlerta.value = 'erro'
    return
  }

  carregando.value = true
  mensagem.value = ''

  try {
    const tokenGoogle = response.credential

    const respostaBackend = await fetch('/api/users/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: tokenGoogle,
        tipo: form.value.tipo,
        cpf: form.value.cpf,
      }),
    })

    const dados = await respostaBackend.json()

    if (respostaBackend.ok) {
      mensagem.value = 'Autenticação com Google realizada com sucesso!'
      tipoAlerta.value = 'sucesso'

      if (dados.usuario) {
        const partesNome = dados.usuario.nome.split(' ')
        form.value.nome = partesNome[0]
        form.value.sobrenome = partesNome.slice(1).join(' ') || ''
        form.value.fotoUrl = dados.usuario.fotoUrl || ''
      }

      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } else {
      mensagem.value = dados.erro || 'Erro ao processar login com Google.'
      tipoAlerta.value = 'erro'
    }
  } catch (error: unknown) {
    mensagem.value = 'Falha na comunicação com o servidor backend.'
    tipoAlerta.value = 'erro'
    if (error instanceof Error) {
      mensagem.value = `Falha na comunicação com o servidor backend. type=${error.message}`
    }
  }
}

onMounted(() => {
  const clientIdReal = String(import.meta.env.VITE_GOOGLE_CLIENT_ID).trim()

  console.log('DEBUG CLIENT ID FIXO:', clientIdReal)

  const inicializarGoogleAuth = () => {
    // @ts-expect-error : google é definido no script externo
    if (typeof google !== 'undefined' && google.accounts?.id) {
      try {
        // @ts-expect-error : google.accounts.id.initialize é definido no script externo
        google.accounts.id.initialize({
          client_id: clientIdReal,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        })

        console.log('Google Auth inicializado com sucesso no script!')
      } catch (err) {
        console.error('Erro interno ao rodar o initialize do Google:', err)
      }
    }
  }

  setTimeout(() => {
    inicializarGoogleAuth()
  }, 200)
})

const loginComGoogle = () => {
  if (!form.value.tipo) {
    alert('Por favor, selecione seu perfil antes de continuar com o Google!')
    return
  }

  if (!form.value.cpf) {
    alert('Por favor, insira o seu CPF antes de continuar com o Google!')
    return
  }

  if ((form.value.tipo === 'aluno' || form.value.tipo === 'servidor') && !validadoNoIFC.value) {
    alert('Por favor, valide sua identidade no Sistema IFC antes de vincular sua conta Google.')
    return
  }

  // @ts-expect-error : google.accounts.id.prompt é definido no script externo
  if (typeof google !== 'undefined') {
    // @ts-expect-error : google.accounts.id.prompt é definido no script externo do Google, mas o ESLint não consegue detectar
    google.accounts.id.prompt()
  } else {
    alert('Erro ao carregar SDK do Google. Verifique sua conexão.')
  }
}

const aplicarMascaraCpf = (event: Event) => {
  const input = event.target as HTMLInputElement
  let valor = input.value.replace(/\D/g, '')

  if (valor.length > 11) {
    valor = valor.slice(0, 11)
  }

  valor = valor.replace(/(\d{3})(\d)/, '$1.$2')
  valor = valor.replace(/(\d{3})(\d)/, '$1.$2')
  valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2')

  form.value.cpf = valor
}
const goToLogin = () => {
  router.push('/login')
}

</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.3s ease-in-out forwards;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

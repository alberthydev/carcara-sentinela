<template>
  <div class="min-h-screen w-full bg-carcara-white flex font-sans antialiased text-carcara-marrom">
    <div
      class="w-full lg:w-1/2 min-h-screen flex flex-col justify-between items-center px-8 sm:px-16 lg:px-20 py-12 bg-carcara-white"
    >
      <div class="w-full flex flex-col items-center gap-2 text-center relative">
        <button
          type="button"
          @click="mockarDadosIFC"
          class="absolute top-0 right-0 bg-gray-500 text-white text-[10px] uppercase font-bold px-3 py-1.5 rounded hover:bg-gray-600 cursor-pointer"
        >
          Mock Admin
        </button>
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

      <div class="w-full max-w-md my-auto flex flex-col gap-6 text-left">
        <div>
          <h2 class="text-4xl font-serif font-bold text-carcara-marrom mb-1">Cadastro</h2>
          <p class="text-xl font-light text-carcara-marrom leading-relaxed">
            Escolha seu perfil e faça a validação para liberar os dados do formulário.
          </p>
        </div>

        <div class="flex flex-col gap-1">
          <div class="relative">
            <select
              v-model="form.tipo"
              class="w-full bg-[#F9F9F9] border border-gray-200 rounded-lg py-3 px-4 text-base outline-none focus:border-carcara-laranja appearance-none cursor-pointer text-gray-700"
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
            <label class="text-sm font-semibold text-carcara-marrom">CPF:</label>
            <input
              v-model="form.cpf"
              type="text"
              placeholder="123.456.789-00"
              class="w-full bg-[#F9F9F9] border border-gray-200 rounded-lg py-3 px-4 text-base outline-none focus:border-carcara-laranja disabled:bg-gray-100 disabled:cursor-not-allowed"
              :disabled="validadoNoIFC"
            />
          </div>

          <div v-if="form.tipo === 'aluno' || form.tipo === 'servidor'" class="flex flex-col gap-3">
            <div class="flex flex-col gap-1">
              <label class="text-sm font-semibold text-carcara-marrom"
                >Matrícula Acadêmica / SIAPE:</label
              >
              <input
                v-model="form.matricula"
                type="text"
                placeholder="Ex: 2021101..."
                class="w-full bg-[#F9F9F9] border border-gray-200 rounded-lg py-3 px-4 text-base outline-none focus:border-carcara-laranja disabled:bg-gray-100 disabled:cursor-not-allowed"
                :disabled="validadoNoIFC"
              />
            </div>

            <button
              v-if="!validadoNoIFC"
              type="button"
              @click="validarComIFC"
              class="w-full bg-carcara-laranja text-white font-bold py-3 px-4 rounded-lg hover:opacity-95 transition-all cursor-pointer text-sm tracking-wider uppercase"
            >
              Validar no Sistema IFC
            </button>

            <button
              v-else
              type="button"
              @click="resetarValidacao"
              class="w-full bg-amber-500 text-carcara-marrom font-bold py-3 px-4 rounded-lg hover:bg-amber-600 transition-all cursor-pointer text-sm tracking-wider uppercase"
            >
              Voltar / Corrigir
            </button>
          </div>
        </div>

        <div
          v-if="mensagem"
          :class="[
            'p-4 rounded-lg text-center font-bold text-sm border transition-all',
            tipoAlerta === 'sucesso'
              ? 'bg-green-50 text-green-800 border-green-200'
              : 'bg-red-50 text-red-800 border-red-200',
          ]"
        >
          {{ mensagem }}
        </div>
      </div>

      <div class="text-xs text-gray-400">
        Desenvolvido pelo Instituto Federal de Santa Catarina - Campus Videira
      </div>
    </div>

    <div
      class="w-full lg:w-1/2 min-h-screen bg-carcara-laranja-bg flex flex-col justify-center items-center px-8 sm:px-16 lg:px-24 py-12 text-white"
    >
      <div
        class="w-full max-w-lg flex flex-col items-center transition-all duration-300"
        :class="{
          'opacity-30 pointer-events-none select-none': form.tipo !== 'visitante' && !validadoNoIFC,
        }"
      >
        <div class="w-full flex flex-col gap-3 mb-6 text-carcara-marrom">
          <button
            type="button"
            class="w-full flex items-center justify-center gap-3 border border-gray-200 bg-gray-50 py-3 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer"
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
            class="w-full flex items-center justify-center border-gray-200 border-1 gap-3 bg-gray-50 py-3 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <svg class="h-5 w-5" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 0H11V11H0V0Z" fill="#F25022" />
              <path d="M12 0H23V11H12V0Z" fill="#7FBA00" />
              <path d="M0 12H11V23H0V12Z" fill="#00A4EF" />
              <path d="M12 12H23V23H12V12Z" fill="#FFB900" />
            </svg>
            Continuar com Microsoft
          </button>
        </div>

        <div class="w-full flex items-center gap-4 mb-6">
          <div class="h-[1px] flex-grow bg-white/30"></div>
          <span class="text-xs text-white/60 uppercase tracking-widest font-medium">ou</span>
          <div class="h-[1px] flex-grow bg-white/30"></div>
        </div>

        <div class="flex flex-col items-center gap-2 mb-6 text-center">
          <div
            class="relative w-24 h-24 rounded-full bg-white/20 border-2 border-dashed border-white/40 flex flex-col items-center justify-center p-2 cursor-pointer hover:bg-white/30 transition-all"
          >
            <span class="text-[10px] font-medium leading-tight opacity-90"
              >Defina uma imagem de perfil</span
            >
          </div>
        </div>

        <form
          @submit.prevent="realizarCadastro"
          class="w-full flex flex-col gap-4 text-carcara-marrom"
        >
          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col items-start gap-1">
              <label class="text-sm font-semibold text-carcara-marrom">Nome</label>
              <input
                v-model="form.nome"
                type="text"
                placeholder="Ana"
                class="w-full bg-white rounded-lg py-2.5 px-4 text-base outline-none disabled:bg-white/80 disabled:opacity-80 disabled:cursor-not-allowed"
                :disabled="validadoNoIFC"
                required
              />
            </div>
            <div class="flex flex-col items-start gap-1">
              <label class="text-sm font-semibold text-carcara-marrom">Sobrenome</label>
              <input
                v-model="form.sobrenome"
                type="text"
                placeholder="Silva"
                class="w-full bg-white rounded-lg py-2.5 px-4 text-base outline-none disabled:bg-white/80 disabled:opacity-80 disabled:cursor-not-allowed"
                :disabled="validadoNoIFC"
                required
              />
            </div>
          </div>

          <div class="flex flex-col items-start gap-1">
            <label class="text-sm font-semibold text-carcara-marrom"
              >Senha (Mínimo 8 caracteres)</label
            >
            <input
              v-model="form.senha"
              type="password"
              placeholder="••••••••"
              class="w-full bg-white rounded-lg py-2.5 px-4 text-base outline-none"
              required
            />
          </div>

          <label
            class="flex items-start gap-2 text-sm text-carcara-marrom font-medium mt-1 cursor-pointer select-none text-left leading-tight"
          >
            <input
              type="checkbox"
              class="mt-0.5 rounded border-gray-300 accent-carcara-marrom h-4 w-4"
              required
            />
            Concordo com os Termos de Serviço e Políticas de Privacidade.
          </label>

          <button
            type="submit"
            :disabled="carregando"
            class="w-full bg-carcara-marrom text-white font-semibold py-3.5 px-4 rounded-lg mt-2 shadow-md hover:bg-amber-900 disabled:bg-carcara-marrom/50 disabled:cursor-not-allowed transition-all cursor-pointer text-center"
          >
            {{ carregando ? 'Enviando...' : 'Concluir Cadastro' }}
          </button>
        </form>

        <p class="text-sm text-carcara-marrom mt-6 font-medium">
          Já tem uma conta?
          <a href="#" @click.prevent="goToLogin" class="text-white hover:underline font-bold">
            Iniciar sessão.
          </a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
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
const validadoNoIFC = ref(false)

// Reseta estados quando o tipo de perfil muda (idêntico ao seu watch anterior)
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
  const cpf = prompt('CPF do Aluno:')
  const matricula = prompt('Matrícula do Aluno:')

  if (nome && cpf && matricula) {
    await fetch('http://localhost:3000/api/users/admin/mock-estudante', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, cpf, matricula }),
    })
    alert("Dados integrados ao 'Sistema IFC' com sucesso!")
  }
}

const validarComIFC = async () => {
  if (!form.value.cpf || !form.value.matricula) {
    alert('Preencha CPF e Matrícula primeiro.')
    return
  }

  try {
    const res = await fetch(
      `http://localhost:3000/api/users/validar-ifc/${form.value.cpf}/${form.value.matricula}`,
    )
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
  } catch (err) {
    mensagem.value = 'Erro ao consultar o Sistema IFC.'
    tipoAlerta.value = 'erro'
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

  const payload = {
    cpf: form.value.cpf,
    matricula: form.value.matricula,
    nome: form.value.nome,
    sobrenome: form.value.sobrenome,
    tipo: form.value.tipo,
    senha: form.value.senha,
    fotoUrl: form.value.fotoUrl,
  }

  try {
    const resposta = await fetch('http://localhost:3000/api/users/cadastro', {
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
    mensagem.value = 'Erro de conexão. A API está ligada no Docker?'
    tipoAlerta.value = 'erro'
  } finally {
    carregando.value = false
  }
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

<template>
  <div class="min-h-screen bg-carcara-creme text-carcara-marrom flex flex-col justify-between">
    <header class="max-w-6xl mx-auto w-full px-6 py-8 flex flex-col justify-between flex-1">
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-2">
          <img
            src="../assets/carcara.png"
            alt="Logo Carcará Sentinela"
            class="h-17 w-17 object-contain"
          />
          <h1 class="text-5xl font-normal tracking-wide text-carcara-marrom font-serif">
            Carcará <span class="text-carcara-laranja font-medium">Sentinela</span>
          </h1>
        </div>
        <nav class="flex gap-6 text-sm font-semibold">
          <a
            href="#equipe"
            class="hover:text-carcara-laranja transition-colors underline decoration-carcara-laranja underline-offset-4"
            >Equipe</a
          >
          <a href="#sobre" class="hover:text-carcara-laranja transition-colors">Sobre</a>
          <a href="#contato" class="hover:text-carcara-laranja transition-colors">Contato</a>
        </nav>
      </div>

      <div class="max-w-xl my-auto py-12">
        <h2 class="text-5xl font-serif font-medium leading-tight mb-4 text-carcara-marrom">
          Monitoramento que <span class="text-carcara-laranja">informa</span>.<br />
          Segurança que <span class="text-carcara-laranja">acolhe</span>.<br />
          Visão que <span class="text-carcara-laranja">antecipa</span>.
        </h2>
        <p class="text-lg font-light text-gray-600 mb-8 leading-relaxed">
          Um sistema feito sob medida para proteger quem ensina, quem aprende e quem visita.
        </p>
        <button
          @click="registry"
          class="border border-carcara-laranja text-carcara-laranja text-xs font-bold uppercase tracking-widest px-8 py-3 rounded-none hover:bg-carcara-laranja hover:text-white transition-all duration-300"
        >
          Acessar o Sistema
        </button>
      </div>
    </header>

    <section id="sobre" class="bg-carcara-laranja text-white py-16 px-6">
      <div class="max-w-4xl mx-auto text-center">
        <div class="flex items-center justify-center gap-4 mb-6">
          <div class="h-[1px] w-16 bg-white/50"></div>
          <span class="text-sm tracking-widest uppercase font-light"
            >Acesso rápido, segurança total: o sentinela que não pisca.</span
          >
          <div class="h-[1px] w-16 bg-white/50"></div>
        </div>

        <h3 class="text-6xl font-serif mb-6 text-carcara-marrom">Sobre</h3>
        <p class="text-carcara-marrom text-lg font-light max-w-2xl mx-auto mb-12 leading-relaxed">
          Sistema inteligente de autenticação e controle de acesso veicular para instituições de
          ensino. Monitoramento em tempo real, segurança preventiva e transparência para toda a
          comunidade acadêmica.
        </p>

        <div class="grid md:grid-cols-3 gap-6 text-left">
          <div
            class="bg-white p-6 rounded-lg border border-carcara-marrom shadow-sm text-carcara-marrom"
          >
            <h4 class="font-bold text-lg mb-2 text-carcara-marrom">Monitoramento LPR</h4>
            <p class="text-sm font-light text-carcara-marrom">
              Integração com câmeras LPR para leitura automática de placas em tempo real.
            </p>
          </div>

          <div
            class="bg-white p-6 rounded-lg shadow-sm text-carcara-marrom flex flex-col justify-between"
          >
            <div>
              <h4 class="font-bold text-lg mb-2 text-carcara-marrom">Controle Inteligente</h4>
              <p class="text-sm font-light text-gray-600 mb-4">
                Identificação automática de veículos cadastrados e sistema de whitelist.
              </p>
            </div>
          </div>

          <div class="bg-white p-6 rounded-lg shadow-sm text-carcara-marrom">
            <h4 class="font-bold text-lg mb-2 text-carcara-marrom">Gestão Simplificada</h4>
            <p class="text-sm font-light text-gray-600">
              Cadastro fácil de veículos via app mobile para servidores, alunos e visitantes.
            </p>
          </div>
        </div>

        <div
          v-if="usersList.length > 0"
          class="mt-12 bg-white/10 p-6 rounded-lg text-left text-carcara-marrom"
        >
          <h4 class="font-bold text-white mb-4">📋 Usuários na Whitelist (Banco de Dados):</h4>
          <ul class="space-y-2 max-h-40 overflow-y-auto pr-2">
            <li
              v-for="v in usersList"
              :key="v._id"
              class="bg-white/90 p-2 rounded text-sm shadow-sm flex justify-between"
            >
              <span
                ><strong>{{ v.nome }} {{ v.sobrenome }}</strong> (CPF: {{ v.cpf }})</span
              >
              <span class="text-xs text-gray-500">Matrícula: {{ v.matricula || 'Visitante' }}</span>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <footer id="contato" class="bg-carcara-marrom text-carcara-creme py-16 px-6">
      <div class="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
        <div>
          <h3 class="text-3xl font-serif mb-4 text-carcara-creme">
            Voe mais alto conosco.<br />Entre em contato.
          </h3>
          <div class="flex gap-4 mt-8 text-xl opacity-80">
            <a
              href="https://instagram.com"
              target="_blank"
              class="hover:text-carcara-laranja text-carcara-creme transition-colors"
            >
              <Instagram class="w-6 h-6" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              class="hover:text-carcara-laranja text-carcara-creme transition-colors"
            >
              <Linkedin class="w-6 h-6" />
            </a>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-6 text-sm font-light opacity-90">
          <div>
            <h4 class="font-bold uppercase tracking-wider text-carcara-laranja mb-2">
              Informação de Contatos
            </h4>
            <p>+55 49 3566-4444</p>
            <p>info@carcara.com.br</p>
          </div>
          <div>
            <h4 class="font-bold uppercase tracking-wider text-carcara-laranja mb-2">Endereço</h4>
            <p>Rod. SC 135, Km 125 - S/N</p>
            <p>Campo Experimental, Videira - SC</p>
            <p>89564-590</p>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Instagram, Linkedin, Shield } from 'lucide-vue-next'
import XIcon from './components/XIcon.vue'

interface User {
  _id: string
  matricula?: string
  nome: string
  sobrenome: string
  cpf: string
}

const router = useRouter()
const usersList = ref<User[]>([])

const registry = () => {
  router.push('/userRegistry')
}

const buscarTodos = async () => {
  try {
    const resposta = await fetch('http://localhost:3000/api/users/todos')
    const dados = await resposta.json()
    usersList.value = dados
  } catch (erro) {
    console.error('Erro ao buscar dados da API')
  }
}
</script>

<style scoped></style>

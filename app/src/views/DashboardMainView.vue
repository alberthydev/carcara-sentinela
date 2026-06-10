<template>
  <div class="min-h-screen bg-[#FAFBFC] font-sans text-[#1E0D01]">
    <header
      class="w-full h-[113px] bg-[#FAFBFC] border-b border-[#FDEEE8] flex items-center justify-between px-[52px] relative z-20"
    >
      <div class="flex items-center gap-4">
        <img src="@/assets/img/carcara.png" alt="Logo" class="w-[38px] h-[50px] object-contain" />
        <h1 class="font-serif text-[29px] text-[#1E0D01]">
          Carcará <span class="text-[#F79347]">Sentinela</span>
        </h1>
      </div>

      <div
        class="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center w-[423px] h-[40px] bg-[#FDEEE8] border border-[#F79347] rounded-full"
      >
        <span class="text-[#1E0D01] text-base font-medium">{{ textoPainel }}</span>
      </div>

      <div class="flex items-center gap-3 relative">
        <button
          class="w-[41px] h-[39px] rounded-lg border-[1.3px] border-[#F79347] flex items-center justify-center bg-[#FAFBFC] hover:bg-[#FDEEE8] transition-colors cursor-pointer text-[#F79347]"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        </button>

        <button
          @click="isModalPerfilAberto = true"
          class="w-[41px] h-[39px] rounded-lg border-[1.3px] border-[#F79347] flex items-center justify-center bg-[#FAFBFC] hover:bg-[#FDEEE8] transition-colors cursor-pointer text-[#F79347]"
          title="Configurações do Perfil"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="3"></circle>
            <path
              d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
            ></path>
          </svg>
        </button>

        <button
          @click="isDropdownAberto = !isDropdownAberto"
          class="w-[41px] h-[39px] rounded-lg border-[1.3px] border-[#FD7917] flex items-center justify-center bg-[#FDEEE8] text-[#FD7917] font-bold cursor-pointer transition-transform active:scale-95"
          title="Menu do Usuário"
        >
          {{ tipoUsuario[0].toUpperCase() }}
        </button>

        <div
          v-if="isDropdownAberto"
          class="absolute right-0 top-[48px] w-[240px] bg-[#D17836] text-white rounded-2xl p-4 shadow-xl flex flex-col text-left z-30 animate-scaleUp"
        >
          <div
            class="text-xs opacity-75 font-medium px-2 mb-2 pb-2 border-b border-white/20 capitalize"
          >
            Sessão: {{ tipoUsuario }}
          </div>

          <template v-if="tipoUsuario === 'servidor'">
            <button
              @click="acaoAdmin('usuarios')"
              class="w-full text-left py-2 px-2 hover:bg-white/10 rounded-lg text-sm transition-colors cursor-pointer"
            >
              Usuarios
            </button>
            <button
              @click="acaoAdmin('escala')"
              class="w-full text-left py-2 px-2 hover:bg-white/10 rounded-lg text-sm transition-colors cursor-pointer"
            >
              Escala de Funcionários
            </button>
            <button
              @click="acaoAdmin('relatorios')"
              class="w-full text-left py-2 px-2 hover:bg-white/10 rounded-lg text-sm transition-colors cursor-pointer border-b border-white/20 pb-3 mb-2"
            >
              Relatórios
            </button>
          </template>

          <button
            @click="alternarTipoTeste"
            class="w-full text-left py-2 px-2 hover:bg-white/10 rounded-lg text-xs transition-colors cursor-pointer text-orange-200 font-bold mb-2"
          >
            Alternar Papel (Dev)
          </button>

          <button
            @click="handleLogout"
            class="w-full text-left py-2 px-2 hover:bg-red-600 rounded-lg text-sm transition-colors cursor-pointer font-semibold flex items-center justify-between"
          >
            <span>Sair</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>
    </header>

    <main
      class="w-[92%] max-w-[1600px] mx-auto py-10 flex justify-between items-stretch animate-fadeIn"
    >
      <component :is="componenteFilho" @abrir-cadastro="isModalVeiculoAberto = true" />

      <aside class="w-[26%] shrink-0 flex flex-col gap-[24px] mt-[46px]">
        <div
          v-if="tipoUsuario === 'servidor'"
          class="w-full bg-white border border-[#FDEEE8] shadow-[0px_2px_12px_rgba(0,0,0,0.04)] rounded-2xl p-6 flex flex-col justify-center text-left"
        >
          <h3 class="text-[16px] font-semibold text-[#1E0D01] mb-4">Segurança</h3>

          <div class="flex items-center gap-4">
            <div
              class="w-[48px] h-[48px] rounded-full bg-[#FDEEE8] border border-[#F79347] flex items-center justify-center text-[#FD7917]"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div class="flex flex-col">
              <span class="text-[15px] font-semibold text-[#1E0D01]">Fernando Torres</span>
              <span class="text-[12px] text-[#AAB1BD]">Segurança Ativo</span>
            </div>
          </div>

          <div
            class="mt-4 pt-4 border-t border-[#FDEEE8] flex flex-col gap-2 text-[13px] text-[#1E0D01]"
          >
            <div class="flex justify-between">
              <strong>Turno:</strong><span class="text-gray-500">Manhã e Tarde</span>
            </div>
            <div class="flex justify-between">
              <strong>Escala:</strong><span class="text-gray-500">Segunda, Quarta, Sexta</span>
            </div>
            <div class="flex justify-between">
              <strong>Acesso ao Sistema:</strong
              ><span class="text-[#FD7917] font-semibold">06:03:45</span>
            </div>
          </div>
        </div>

        <div
          v-else
          class="w-full aspect-[360/252] bg-white border border-[#FDEEE8] shadow-[0px_2px_12px_rgba(0,0,0,0.04)] rounded-2xl p-6 flex flex-col justify-center text-left"
        >
          <h3 class="text-[16px] font-semibold text-[#1E0D01] mb-4">
            {{ tipoUsuario === 'visitante' ? 'Acesso Automático' : 'Avisos do Campus' }}
          </h3>
          <p class="text-[13px] font-medium text-[#1E0D01] leading-relaxed">
            <template v-if="tipoUsuario === 'visitante'">
              No dia da sua visita, dirija-se à cancela. Nossa câmera fará a leitura da placa
              cadastrada e a liberação será automática.
            </template>
            <template v-else>
              Ex: Estacionamento do bloco B fechado para manutenção amanhã.
            </template>
          </p>
        </div>

        <div
          class="w-full aspect-[360/208] bg-gradient-to-br from-[#FD7917] to-[#F79347] shadow-[0px_8px_32px_rgba(253,121,23,0.3)] rounded-2xl p-6 flex flex-col justify-center gap-4 text-left"
        >
          <h3 class="text-[16px] font-semibold text-white">Quantitativo de Vagas</h3>
          <div class="flex items-center justify-between mt-2">
            <div class="relative w-[120px] h-[120px] shrink-0">
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="45" fill="none" stroke="#FDEEE8" stroke-width="20" />
                <circle
                  cx="60"
                  cy="60"
                  r="45"
                  fill="none"
                  stroke="#613613"
                  stroke-width="20"
                  stroke-dasharray="282.7"
                  stroke-dashoffset="155"
                  transform="rotate(-90 60 60)"
                />
              </svg>
            </div>
            <div class="flex flex-col gap-4">
              <div class="flex items-start gap-3">
                <div
                  class="w-4 h-4 rounded border-2 border-[#613613] bg-[#613613] shrink-0 mt-0.5"
                ></div>
                <div class="flex flex-col">
                  <span class="text-[12px] text-white/80 leading-tight">Total de Vagas</span
                  ><span class="text-[22px] font-bold text-white leading-tight">276</span>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div
                  class="w-4 h-4 rounded border-2 border-white/30 bg-[#FDEEE8] shrink-0 mt-0.5"
                ></div>
                <div class="flex flex-col">
                  <span class="text-[12px] text-white/80 leading-tight">Vagas Ocupadas</span
                  ><span class="text-[22px] font-bold text-white leading-tight">124</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </main>

    <ModalCadastrarVeiculo
      :is-open="isModalVeiculoAberto"
      @close="isModalVeiculoAberto = false"
      @save="receberNovoVeiculo"
    />
    <ModalPerfilUsuario :is-open="isModalPerfilAberto" @close="isModalPerfilAberto = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

import DashVisitante from '../components/DashVisitante.vue'
import DashAlunoServidor from '../components/DashAlunoServidor.vue'
import DashAdmin from '../components/DashAdmin.vue'
import ModalCadastrarVeiculo from '../components/ModalCadastrarVeiculo.vue'
import ModalPerfilUsuario from '../components/ModalPerfilUsuario.vue'

const tipoUsuario = ref<'visitante' | 'aluno' | 'servidor'>('aluno')
const isModalVeiculoAberto = ref(false)
const isModalPerfilAberto = ref(false)
const isDropdownAberto = ref(false)

const mapasDeComponente = {
  visitante: DashVisitante,
  aluno: DashAlunoServidor,
  servidor: DashAdmin,
}

interface VeiculoPayload {
  placa: string
  marca: string
  modelo: string
  ano: string
  cor: string
}

const componenteFilho = computed(() => {
  return mapasDeComponente[tipoUsuario.value] || DashAlunoServidor
})

const textoPainel = computed(() => {
  if (tipoUsuario.value === 'visitante') return 'Painel de Visitas'
  if (tipoUsuario.value === 'servidor') return 'Dashboard Administrador'
  return 'Dashboard do Usuário'
})

const handleLogout = () => {
  isDropdownAberto.value = false
  window.location.href = '/'
}

const acaoAdmin = (contexto: string) => {
  isDropdownAberto.value = false
  alert(`Menu Administrativo acionado: [${contexto}]. Em breve traremos a lógica dele!`)
}

const receberNovoVeiculo = (dadosVeiculo: VeiculoPayload) => {
  console.log('Veículo recebido na View principal:', dadosVeiculo)
}

const alternarTipoTeste = () => {
  if (tipoUsuario.value === 'aluno') tipoUsuario.value = 'visitante'
  else if (tipoUsuario.value === 'visitante') tipoUsuario.value = 'servidor'
  else tipoUsuario.value = 'aluno'
  isDropdownAberto.value = false
}
</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.3s ease-out forwards;
}
.animate-scaleUp {
  animation: scaleUp 0.15s ease-out forwards;
  transform-origin: top right;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes scaleUp {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>

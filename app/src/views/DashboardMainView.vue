<template>
  <div class="min-h-screen bg-[#FAFBFC] font-sans text-[#1E0D01]">
    <!-- HEADER COMPARTILHADO -->
    <header
      class="w-full h-[113px] bg-[#FAFBFC] border-b border-[#FDEEE8] flex items-center justify-between px-[52px] relative z-10"
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

      <div class="flex items-center gap-3">
        <!-- Seus 3 botões de ação do Header -->
        <button
          class="w-[41px] h-[39px] rounded-lg border-[1.3px] border-[#F79347] flex items-center justify-center bg-[#FAFBFC] hover:bg-[#FDEEE8] text-[#F79347] cursor-pointer"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        </button>
        <button
          class="w-[41px] h-[39px] rounded-lg border-[1.3px] border-[#F79347] flex items-center justify-center bg-[#FAFBFC] hover:bg-[#FDEEE8] text-[#F79347] cursor-pointer"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="3"></circle>
            <path
              d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
            ></path>
          </svg>
        </button>
        <button
          @click="alternarTipoTeste"
          class="w-[41px] h-[39px] rounded-lg border-[1.3px] border-[#FD7917] flex items-center justify-center bg-[#FDEEE8] text-[#FD7917] font-bold cursor-pointer title='Clique para alternar papel e testar'"
        >
          {{ tipoUsuario[0].toUpperCase() }}
        </button>
      </div>
    </header>

    <!-- GRID PRINCIPAL -->
    <main
      class="w-[92%] max-w-[1600px] mx-auto py-10 flex justify-between items-stretch animate-fadeIn"
    >
      <!-- 🔄 INJEÇÃO DINÂMICA DO MIOLO DO DASHBOARD -->
      <component :is="componenteFilho" />

      <!-- ASIDE DA DIREITA (CHAVEIA OS BLOCOS COMPARTILHADOS / ESPECÍFICOS) -->
      <aside class="w-[26%] shrink-0 flex flex-col gap-[24px] mt-[46px]">
        <!-- Bloco de Segurança - Exclusivo do Admin -->
        <div
          v-if="tipoUsuario === 'servidor'"
          class="w-full bg-white border border-[#FDEEE8] shadow-[0px_2px_12px_rgba(0,0,0,0.04)] rounded-2xl p-6 flex flex-col text-left"
        >
          <h3 class="text-[16px] font-semibold text-[#1E0D01] mb-4">Segurança</h3>
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600"
            >
              FT
            </div>
            <div>
              <p class="text-[14px] font-bold text-[#1E0D01]">Fernando Torres</p>
              <p class="text-[11px] text-[#AAB1BD]">Segurança Ativo</p>
            </div>
          </div>
          <div class="mt-4 text-[12px] flex flex-col gap-2 border-t border-gray-50 pt-3">
            <p><strong>Turno:</strong> Manhã e Tarde</p>
            <p><strong>Escala:</strong> Segunda, Quarta, Sexta</p>
          </div>
        </div>

        <!-- Bloco de Avisos ou Regras (Chaveia conforme o tipo) -->
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

        <!-- Quantitativo de Vagas (COMPARTILHADO POR TODOS!) -->
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import DashVisitante from '../components/DashVisitante.vue'
import DashAlunoServidor from '../components/DashAlunoServidor.vue'
import DashAdmin from '../components/DashAdmin.vue'

const tipoUsuario = ref<'visitante' | 'aluno' | 'servidor'>('aluno')

const mapasDeComponente = {
  visitante: DashVisitante,
  aluno: DashAlunoServidor,
  servidor: DashAdmin,
}

const componenteFilho = computed(() => {
  return mapasDeComponente[tipoUsuario.value] || DashAlunoServidor
})

const textoPainel = computed(() => {
  if (tipoUsuario.value === 'visitante') return 'Painel de Visitas'
  if (tipoUsuario.value === 'servidor') return 'Dashboard Administrador'
  return 'Dashboard do Usuário'
})

const alternarTipoTeste = () => {
  if (tipoUsuario.value === 'aluno') tipoUsuario.value = 'visitante'
  else if (tipoUsuario.value === 'visitante') tipoUsuario.value = 'servidor'
  else tipoUsuario.value = 'aluno'
}
</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.3s ease-out forwards;
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
</style>

<template>
  <div class="w-[71%] shrink-0 flex flex-col animate-fadeIn">
    <section
      class="w-full flex-1 border border-[#F79347] rounded-2xl p-6 bg-[#FAFBFC] flex flex-col shadow-sm"
    >
      <div class="flex items-center gap-2 mb-5 shrink-0">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#FD7917"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
        </svg>
        <h2 class="text-[20px] font-medium text-black">Histórico de Acesso - Geral</h2>
      </div>

      <div class="w-full flex-1 flex flex-col">
        <div
          class="grid grid-cols-[1.5fr_1fr_2fr_1fr] px-6 mb-3 text-[14px] font-bold text-[#1E0D01] shrink-0 border-b border-transparent"
        >
          <div>Usuário</div>
          <div>Tipo</div>
          <div>Carro</div>
          <div>Hora (Entrada/Saída)</div>
        </div>

        <div
          v-if="historicoGeral.length === 0"
          class="flex flex-col items-center justify-center h-[100px] text-gray-400 text-sm font-medium gap-2"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          Nenhum acesso registrado no sistema hoje.
        </div>

        <div class="flex flex-col gap-1.5">
          <div
            v-for="(hist, index) in historicoGeral"
            :key="hist._id || index"
            :class="[
              'grid grid-cols-[1.5fr_1fr_2fr_1fr] px-6 py-2.5 min-h-[36px] rounded-full text-[13px] items-center transition-colors',
              index % 2 === 0 ? 'bg-[#FDEEE8]' : 'bg-transparent hover:bg-gray-50',
            ]"
          >
            <div class="font-bold text-[#1E0D01] truncate pr-2">{{ hist.nome }}</div>
            <div class="text-gray-600 font-medium capitalize">
              {{ hist.tipo === 'servidor' ? 'Servidor/Aluno' : hist.tipo }}
            </div>
            <div class="text-gray-500 font-mono text-[11px] truncate pr-2">{{ hist.carro }}</div>
            <div class="text-gray-600 font-mono font-bold flex items-center gap-1">
              <span class="text-green-600">{{ hist.horaEntrada }}</span>
              <span v-if="hist.horaSaida" class="text-gray-400">/</span>
              <span v-if="hist.horaSaida" class="text-[#FD7917]">{{ hist.horaSaida }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface RegistroAdmin {
  _id: string
  nome: string
  tipo: string
  carro: string
  horaEntrada: string
  horaSaida: string | null
}

const historicoGeral = ref<RegistroAdmin[]>([])

const fetchHistoricoGeral = async () => {
  try {
    const res = await fetch('/api/users/admin/acessos')
    if (res.ok) {
      historicoGeral.value = await res.json()
    }
  } catch (e) {
    console.error('Erro ao buscar histórico do admin:', e)
  }
}

onMounted(() => {
  fetchHistoricoGeral()
})
</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.4s ease-out forwards;
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

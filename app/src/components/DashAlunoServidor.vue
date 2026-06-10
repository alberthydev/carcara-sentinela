<template>
  <div class="w-[71%] shrink-0 flex flex-col">
    <section>
      <h2 class="text-[22px] font-semibold text-[#1E0D01] mb-[13px] h-[33px] flex items-center">
        Meus Veículos
      </h2>
      <div class="w-full grid grid-cols-3 gap-5">
        <div
          v-for="(veiculo, index) in meusVeiculos"
          :key="index"
          class="w-full aspect-[293/149] bg-[#FDEEE8] rounded-2xl p-5 shadow-[0px_2px_12px_rgba(253,121,23,0.12)] flex flex-col justify-between group relative overflow-hidden"
        >
          <div class="flex items-center gap-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FD7917"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="8" width="18" height="12" rx="2" ry="2"></rect>
              <path d="M16 8v-2a4 4 0 0 0-8 0v2"></path>
            </svg>
            <span class="text-[#FD7917] font-semibold text-base">Carro {{ index + 1 }}</span>
          </div>
          <div class="grid grid-cols-2 gap-y-4 gap-x-2 mt-1">
            <div>
              <p class="text-[11px] font-semibold text-[#1E0D01]">Marca</p>
              <p class="text-[12px] text-[#AAB1BD] truncate">{{ veiculo.marca }}</p>
            </div>
            <div>
              <p class="text-[11px] font-semibold text-[#1E0D01]">Cor</p>
              <p class="text-[12px] text-[#AAB1BD] truncate">{{ veiculo.cor }}</p>
            </div>
            <div>
              <p class="text-[11px] font-semibold text-[#1E0D01]">Modelo</p>
              <p class="text-[12px] text-[#AAB1BD] truncate">{{ veiculo.modelo }}</p>
            </div>
            <div>
              <p class="text-[11px] font-semibold text-[#1E0D01]">Placa</p>
              <p class="text-[12px] text-[#AAB1BD] truncate">{{ veiculo.placa }}</p>
            </div>
          </div>
        </div>
        <button
          @click="$emit('abrir-cadastro')"
          class="w-full aspect-[293/149] bg-gradient-to-br from-[#FD7917] to-[#F79347] rounded-2xl p-5 shadow-[0px_4px_20px_rgba(253,121,23,0.35)] flex flex-col items-center justify-center gap-2 hover:opacity-95 transition-opacity cursor-pointer active:scale-[0.98]"
        >
          <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FFFFFF"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          <span class="text-white font-semibold text-sm">Adicionar Veículo</span>
        </button>
      </div>
    </section>

    <!-- Histórico de Acessos -->
    <section
      class="w-full mt-[28px] flex-1 border border-[#F79347] rounded-2xl p-6 bg-[#FAFBFC] flex flex-col"
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
        <h2 class="text-[20px] font-medium text-black">Meu Histórico de Acesso</h2>
      </div>
      <div class="w-full flex-1 flex flex-col">
        <div class="grid grid-cols-4 px-6 mb-3 text-[15px] font-medium text-black shrink-0">
          <div>Veículo (Placa)</div>
          <div>Data</div>
          <div>Hora de Entrada</div>
          <div>Hora de Saída</div>
        </div>
        <div class="flex flex-col gap-[6px]">
          <div
            v-for="(hist, index) in historicoAcesso"
            :key="index"
            :class="[
              'grid grid-cols-4 px-6 h-[31px] rounded-full text-[12px] font-medium text-[#1E0D01] items-center',
              index % 2 !== 0 ? 'bg-[#FDEEE8]' : 'bg-transparent',
            ]"
          >
            <div>{{ hist.placa }}</div>
            <div>{{ hist.data }}</div>
            <div>{{ hist.entrada }}</div>
            <div>{{ hist.saida }}</div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineEmits(['abrir-cadastro'])
const meusVeiculos = ref([
  { marca: 'Chevrolet', cor: 'Branco', modelo: 'Onix', placa: 'ABC1D23' },
  { marca: 'Chevrolet', cor: 'Branco', modelo: 'Onix', placa: 'ABC1D23' },
])
const historicoAcesso = ref([
  { placa: 'ABC1D23', data: '20/01/2026', entrada: '06:32:57', saida: '10:25:34' },
  { placa: 'ABC1D23', data: '21/01/2026', entrada: '06:28:35', saida: '11:24:54' },
  { placa: 'ABC1D23', data: '22/01/2026', entrada: '06:35:49', saida: '12:56:34' },
])
</script>

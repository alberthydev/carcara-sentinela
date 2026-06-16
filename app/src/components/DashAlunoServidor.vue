<template>
  <div class="w-[71%] shrink-0 flex flex-col animate-fadeIn">
    <section>
      <h2 class="text-[22px] font-semibold text-[#1E0D01] mb-[13px] h-[33px] flex items-center">
        Meus Veículos
      </h2>
      <div class="w-full grid grid-cols-3 gap-5">
        <div
          v-for="(veiculo, index) in meusVeiculos.slice(0, 2)"
          :key="veiculo.placa || index"
          class="w-full aspect-[293/149] bg-[#FDEEE8] rounded-2xl p-5 shadow-[0px_2px_12px_rgba(253,121,23,0.12)] flex flex-col justify-between group relative overflow-hidden"
        >
          <div class="absolute top-4 right-4 flex items-center gap-3">
            <button
              @click="abrirEdicao(veiculo)"
              class="text-gray-400 hover:text-blue-500 transition-colors"
              title="Editar"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button
              @click="deletarVeiculo(veiculo.placa)"
              class="text-gray-400 hover:text-red-500 transition-colors text-2xl leading-none cursor-pointer"
              title="Remover Veículo"
            >
              &times;
            </button>
          </div>

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
            <span class="text-[#FD7917] font-semibold text-base">Veículo {{ index + 1 }}</span>
          </div>
          <div class="grid grid-cols-2 gap-y-4 gap-x-2 mt-1">
            <div>
              <p class="text-[11px] font-bold text-[#1E0D01] uppercase tracking-wider">Marca</p>
              <p class="text-[12px] text-[#AAB1BD] truncate">{{ veiculo.marca }}</p>
            </div>
            <div>
              <p class="text-[11px] font-bold text-[#1E0D01] uppercase tracking-wider">Cor</p>
              <p class="text-[12px] text-[#AAB1BD] truncate">{{ veiculo.cor }}</p>
            </div>
            <div>
              <p class="text-[11px] font-bold text-[#1E0D01] uppercase tracking-wider">Modelo</p>
              <p class="text-[12px] text-[#AAB1BD] truncate">{{ veiculo.modelo }}</p>
            </div>
            <div>
              <p class="text-[11px] font-bold text-[#1E0D01] uppercase tracking-wider">Placa</p>
              <p class="text-[12px] text-[#FD7917] truncate font-mono font-bold">
                {{ veiculo.placa }}
              </p>
            </div>
          </div>
        </div>

        <div v-if="meusVeiculos.length >= 2" class="w-full aspect-[293/149] flex flex-col gap-3">
          <button
            @click="$emit('abrir-cadastro')"
            class="flex-1 bg-gradient-to-br from-[#FD7917] to-[#F79347] rounded-[16px] flex items-center justify-center gap-2 text-white font-bold text-sm shadow-[0px_4px_12px_rgba(253,121,23,0.25)] hover:opacity-95 transition-all cursor-pointer"
          >
            <span class="text-xl leading-none">+</span> Adicionar Veículo
          </button>

          <button
            @click="isModalListarAberto = true"
            class="flex-1 bg-white border-2 border-[#FDEEE8] text-[#FD7917] rounded-[16px] flex items-center justify-center gap-2 font-bold text-sm shadow-sm hover:bg-[#FDEEE8]/30 transition-all cursor-pointer"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
            Meus Veículos
          </button>
        </div>

        <button
          v-else
          @click="$emit('abrir-cadastro')"
          class="w-full aspect-[293/149] bg-gradient-to-br from-[#FD7917] to-[#F79347] rounded-2xl p-5 shadow-[0px_4px_20px_rgba(253,121,23,0.35)] flex flex-col items-center justify-center gap-2 hover:opacity-95 transition-opacity cursor-pointer"
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

    <section
      class="w-full mt-[28px] flex-1 border border-[#F79347] rounded-2xl p-6 bg-[#FAFBFC] flex flex-col shadow-sm"
    >
      <div class="flex items-center justify-between mb-5 shrink-0">
        <h2 class="text-[20px] font-medium text-black flex items-center gap-2">
          Meu Histórico de Acesso
        </h2>
        <span class="text-xs text-gray-400">{{ historicoAcesso.length }} registros</span>
      </div>

      <div class="w-full flex-1 flex flex-col">
        <div
          class="grid grid-cols-4 px-6 mb-3 text-[14px] font-bold text-[#1E0D01] shrink-0 border-b border-transparent"
        >
          <div>Veículo (Placa)</div>
          <div>Data</div>
          <div>Hora de Entrada</div>
          <div>Hora de Saída</div>
        </div>

        <div
          v-if="historicoAcesso.length === 0"
          class="flex flex-col items-center justify-center h-[100px] text-gray-400 text-sm font-medium gap-2"
        >
          Nenhum acesso registrado.
        </div>

        <div class="flex flex-col gap-1.5">
          <div
            v-for="(hist, index) in historicoAcesso"
            :key="hist._id || index"
            :class="[
              'grid grid-cols-4 px-6 py-2.5 h-[36px] rounded-full text-[13px] items-center transition-colors',
              index % 2 === 0 ? 'bg-[#FDEEE8]' : 'bg-transparent hover:bg-gray-50',
            ]"
          >
            <div class="font-mono font-bold text-[#1E0D01]">{{ hist.placa }}</div>
            <div class="text-gray-600 font-medium">{{ hist.data }}</div>
            <div class="text-green-600 font-bold font-mono">{{ hist.horaEntrada || '--:--' }}</div>
            <div class="text-gray-400 font-mono">{{ hist.horaSaida || '--:--' }}</div>
          </div>
        </div>
      </div>
    </section>

    <Teleport to="body">
      <ModalListarVeiculos
        :is-open="isModalListarAberto"
        :veiculos="meusVeiculos"
        @close="isModalListarAberto = false"
        @deletar="deletarVeiculo"
        @editar="abrirEdicao"
      />
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import ModalListarVeiculos from './ModalListarVeiculos.vue'

const props = defineProps<{ usuarioId?: string }>()
const emit = defineEmits(['abrir-cadastro', 'abrir-edicao'])

const isModalListarAberto = ref(false)
const meusVeiculos = ref<any[]>([])
const historicoAcesso = ref<any[]>([])

const fetchVeiculos = async () => {
  if (!props.usuarioId) return
  try {
    const res = await fetch(`/api/users/${props.usuarioId}/veiculos`)
    if (res.ok) meusVeiculos.value = await res.json()
  } catch (e) {
    console.error('Erro ao buscar veículos:', e)
  }
}

const fetchHistorico = async () => {
  if (!props.usuarioId) return
  try {
    const res = await fetch(`/api/users/${props.usuarioId}/acessos`)
    if (res.ok) historicoAcesso.value = await res.json()
  } catch (e) {
    console.error('Erro ao buscar histórico:', e)
  }
}

watch(
  () => props.usuarioId,
  (newId) => {
    if (newId) {
      fetchVeiculos()
      fetchHistorico()
    }
  },
  { immediate: true },
)

const deletarVeiculo = async (placa: string) => {
  if (!confirm('Tem certeza que deseja remover este veículo?')) return

  try {
    const res = await fetch(`/api/users/${props.usuarioId}/veiculos/${placa}`, { method: 'DELETE' })
    if (res.ok) {
      alert('Veículo removido com sucesso!')
      fetchVeiculos()
    }
  } catch (e) {
    console.error(e)
  }
}

const abrirEdicao = (veiculo: any) => {
  isModalListarAberto.value = false
  emit('abrir-edicao', veiculo)
}
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

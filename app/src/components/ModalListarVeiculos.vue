<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn"
  >
    <div
      class="w-full max-w-[800px] bg-white rounded-[24px] p-8 shadow-xl flex flex-col text-left border border-gray-100 relative max-h-[85vh] overflow-hidden"
    >
      <div class="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h3 class="text-[22px] font-serif font-bold text-[#1E0D01] text-carcara-laranja">
            Meus Veículos
          </h3>
          <p class="text-sm text-gray-500 mt-1">
            Gerencie todos os veículos cadastrados na sua conta.
          </p>
        </div>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-[#FD7917] text-2xl font-bold cursor-pointer transition-colors"
        >
          &times;
        </button>
      </div>

      <div class="w-full flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div
          class="grid grid-cols-[1fr_1.5fr_1fr_1fr] px-4 mb-3 text-[13px] font-bold text-[#1E0D01] border-b border-gray-100 pb-2"
        >
          <div>Placa</div>
          <div>Veículo</div>
          <div>Cor</div>
          <div class="text-right">Ações</div>
        </div>

        <div
          v-if="veiculos.length === 0"
          class="py-8 text-center text-sm text-gray-400 font-medium"
        >
          Nenhum veículo encontrado.
        </div>

        <div class="flex flex-col gap-2">
          <div
            v-for="(veiculo, index) in veiculos"
            :key="veiculo.placa || index"
            :class="[
              'grid grid-cols-[1fr_1.5fr_1fr_1fr] px-4 py-3 rounded-xl text-[13px] items-center transition-colors',
              index % 2 === 0 ? 'bg-[#FDEEE8]/50' : 'bg-transparent hover:bg-gray-50',
            ]"
          >
            <div class="font-bold font-mono text-[#FD7917]">{{ veiculo.placa }}</div>
            <div class="font-bold text-[#1E0D01]">{{ veiculo.marca }} {{ veiculo.modelo }}</div>
            <div class="text-gray-600 font-medium">{{ veiculo.cor }}</div>
            <div class="flex items-center justify-end gap-2">
              <button
                @click="$emit('editar', veiculo)"
                class="p-1.5 text-gray-400 hover:text-blue-500 bg-white rounded-lg shadow-sm border border-gray-100 transition-colors"
                title="Editar"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button
                @click="$emit('deletar', veiculo.placa)"
                class="p-1.5 text-gray-400 hover:text-red-500 bg-white rounded-lg shadow-sm border border-gray-100 transition-colors"
                title="Remover Veículo"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path
                    d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ isOpen: boolean; veiculos: any[] }>()
defineEmits(['close', 'editar', 'deletar'])
</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.2s ease-out forwards;
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
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #fdeee8;
  border-radius: 4px;
}
</style>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
    <div class="w-full max-w-[700px] bg-white rounded-3xl shadow-xl flex flex-col text-left border border-gray-100 relative overflow-hidden">
      <div class="bg-[#F79347] px-8 py-5">
        <h3 class="text-2xl font-serif text-white">Relatórios</h3>
      </div>
      
      <div class="p-8 flex flex-col gap-6">
        <p class="text-[15px] text-[#1E0D01] font-medium">Exporte relatórios dos acessos veiculares ao campus.</p>

        <div class="flex items-center gap-4 mt-2">
          <div class="flex items-center gap-2">
            <span class="text-sm font-bold text-[#1E0D01]">De:</span>
            <div class="border border-gray-200 rounded-md px-3 py-1.5 flex items-center gap-2 text-sm text-gray-400 bg-white">
              19/02/2024 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm font-bold text-[#1E0D01]">Até:</span>
            <div class="border border-gray-200 rounded-md px-3 py-1.5 flex items-center gap-2 text-sm text-gray-400 bg-white">
              19/02/2024 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            </div>
          </div>
          
          <button class="w-8 h-8 bg-[#FD7917] rounded flex items-center justify-center text-white hover:opacity-90">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          </button>
          
          <button @click="mostrarAvançado = !mostrarAvançado" class="w-8 h-8 bg-[#FD7917] rounded flex items-center justify-center text-white hover:opacity-90">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
          </button>
        </div>

        <div v-if="mostrarAvançado" class="border border-[#F79347] rounded-xl p-5 mt-4">
          <div class="flex justify-between items-start mb-3">
            <div>
              <h4 class="font-bold text-[#1E0D01] text-sm">Filtro Avançado</h4>
              <p class="text-xs text-gray-500 mt-1">Selecione quais informações irão para o relatório:</p>
            </div>
          </div>
          <div class="flex flex-wrap gap-3 mt-4">
            <span class="px-4 py-1.5 bg-[#FD7917] text-white text-xs font-semibold rounded-full cursor-pointer hover:opacity-80">Usuário</span>
            <span class="px-4 py-1.5 bg-[#FD7917] text-white text-xs font-semibold rounded-full cursor-pointer hover:opacity-80">Carro - Modelo</span>
            <span class="px-4 py-1.5 bg-[#FD7917] text-white text-xs font-semibold rounded-full cursor-pointer hover:opacity-80">Carro - Cor</span>
            <span class="px-4 py-1.5 bg-[#FD7917] text-white text-xs font-semibold rounded-full cursor-pointer hover:opacity-80">Carro - Placa</span>
            <span class="px-4 py-1.5 bg-[#FD7917] text-white text-xs font-semibold rounded-full cursor-pointer hover:opacity-80">Acesso</span>
          </div>
        </div>

        <div class="flex justify-end mt-4">
          <button @click="$emit('close')" class="w-[140px] h-[44px] bg-[#FD7917] text-white font-semibold rounded-full text-sm hover:opacity-90">Fechar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
defineProps<{ isOpen: boolean }>()
defineEmits(['close'])

const mostrarAvançado = ref(false)
</script>
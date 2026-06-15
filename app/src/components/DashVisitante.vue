<template>
  <div class="w-[71%] shrink-0 flex flex-col animate-fadeIn">
    
    <section>
      <h2 class="text-[22px] font-semibold text-[#1E0D01] mb-[13px] h-[33px] flex items-center">
        Minhas Visitas Futuras
      </h2>
      <div class="w-full grid grid-cols-3 gap-5">
        
        <div v-for="(visita, index) in visitasFuturas" :key="visita._id || index" class="w-full aspect-[293/149] bg-[#FDEEE8] rounded-2xl p-5 shadow-[0px_2px_12px_rgba(253,121,23,0.12)] flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FD7917" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16"></path></svg>
              <span class="text-[#FD7917] font-semibold text-base">Visita {{ index + 1 }}</span>
            </div>
            <button class="text-gray-400 hover:text-red-500 transition-colors" title="Cancelar Visita">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          
          <div class="grid grid-cols-2 gap-y-3 mt-1 text-left">
            <div>
              <p class="text-[10px] font-bold text-[#1E0D01] uppercase tracking-wider">Setor da Visita</p>
              <p class="text-[12px] text-[#AAB1BD] truncate">{{ visita.setorDestino }}</p>
            </div>
            <div>
              <p class="text-[10px] font-bold text-[#1E0D01] uppercase tracking-wider">Veículo (Placa)</p>
              <p class="text-[12px] text-[#AAB1BD] font-mono">{{ visita.veiculo.placa }}</p>
            </div>
            <div>
              <p class="text-[10px] font-bold text-[#1E0D01] uppercase tracking-wider">Data</p>
              <p class="text-[12px] text-[#FD7917] font-bold">{{ visita.dataVisita }}</p>
            </div>
            <div>
              <p class="text-[10px] font-bold text-[#1E0D01] uppercase tracking-wider">Hora Estimada</p>
              <p class="text-[12px] text-[#AAB1BD]">{{ visita.horaVisita }}</p>
            </div>
          </div>
        </div>

        <button @click="$emit('abrir-cadastro')" class="w-full aspect-[293/149] bg-gradient-to-br from-[#FD7917] to-[#F79347] rounded-2xl p-5 shadow-[0px_4px_20px_rgba(253,121,23,0.35)] flex flex-col items-center justify-center gap-2 hover:opacity-95 transition-all active:scale-[0.98] cursor-pointer">
          <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </div>
          <span class="text-white font-semibold text-sm">Agendar Visita</span>
        </button>
      </div>
    </section>

    <section class="w-full mt-[28px] flex-1 border border-[#F79347] rounded-2xl p-6 bg-[#FAFBFC] flex flex-col shadow-sm">
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-[20px] font-medium text-black flex items-center gap-2">
          Meu Histórico de Visitas
        </h2>
        <span class="text-xs text-gray-400">{{ historicoVisitas.length }} registros</span>
      </div>
      
      <div class="w-full flex-1 flex flex-col">
        <div class="grid grid-cols-4 px-6 mb-3 text-[14px] font-bold text-[#1E0D01] border-b border-transparent">
          <div>Veículo (Placa)</div>
          <div>Data</div>
          <div>Hora de Entrada</div>
          <div>Hora de Saída</div>
        </div>

        <div v-if="historicoVisitas.length === 0" class="flex flex-col items-center justify-center h-[100px] text-gray-400 text-sm font-medium gap-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          Nenhuma visita realizada ainda.
        </div>

        <div class="flex flex-col gap-1.5">
          <div v-for="(hist, idx) in historicoVisitas" :key="idx" :class="['grid grid-cols-4 px-6 py-2.5 rounded-full text-[13px] items-center transition-colors', idx % 2 === 0 ? 'bg-[#FDEEE8]' : 'bg-transparent hover:bg-gray-50']">
            <div class="font-mono font-bold text-[#1E0D01]">{{ hist.veiculo?.placa }}</div>
            <div class="text-gray-600 font-medium">{{ hist.dataVisita }}</div>
            <div class="text-green-600 font-bold font-mono">{{ hist.horaEntrada || '--:--' }}</div>
            <div class="text-gray-400 font-mono">{{ hist.horaSaida || '--:--' }}</div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{ usuarioId?: string }>()
defineEmits(['abrir-cadastro'])

const visitas = ref<any[]>([])

const fetchVisitas = async () => {
  if (!props.usuarioId) return;
  
  try {
    const res = await fetch(`/api/users/${props.usuarioId}/visitas`)
    if (res.ok) {
      visitas.value = await res.json()
    }
  } catch (e) {
    console.error("Erro ao buscar visitas:", e)
  }
}

watch(() => props.usuarioId, (newId) => {
  if (newId) fetchVisitas()
}, { immediate: true })

const visitasFuturas = computed(() => {
  return visitas.value.filter(v => v.status === 'agendada' && !v.horaEntrada)
})

const historicoVisitas = computed(() => {
  return visitas.value.filter(v => v.horaEntrada || v.status !== 'agendada')
})
</script>

<style scoped>
.animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
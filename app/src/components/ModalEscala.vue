<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
    <div class="w-full max-w-[800px] bg-white rounded-3xl shadow-xl flex flex-col text-left border border-gray-100 relative overflow-hidden">
      <div class="bg-[#F79347] px-8 py-5">
        <h3 class="text-2xl font-serif text-white">Escala de segurança</h3>
      </div>
      
      <div class="p-8 flex flex-col gap-6">
        <p class="text-[15px] text-[#1E0D01] font-medium">Veja a escala dos funcionários responsáveis pela segurança e os acessos desses usuários ao sistema.</p>

        <div class="w-full flex flex-col mt-2">
          <div class="grid grid-cols-4 px-4 mb-3 text-[14px] font-bold text-[#1E0D01]">
            <div>Usuário</div>
            <div>Turno</div>
            <div>Dias</div>
            <div>Acesso ao sistema</div>
          </div>
          
          <div v-for="(item, index) in escala" :key="index" :class="['grid grid-cols-4 px-4 h-[44px] rounded-full text-[13px] items-center font-medium text-[#1E0D01]', index % 2 !== 0 ? 'bg-[#FFF5F0]' : '']">
            <div>{{ item.nome }}</div>
            <div>{{ item.turno }}</div>
            <div>{{ item.dias }}</div>
            <div>{{ item.horario }}</div>
          </div>
        </div>

        <div class="flex justify-end mt-4">
          <button @click="$emit('close')" class="px-8 h-[44px] bg-[#FD7917] text-white font-semibold rounded-full text-sm hover:opacity-90 transition-opacity">Fechar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ isOpen: boolean }>()
defineEmits(['close'])

const escala = [
  { nome: 'Sérgio Carvalho', turno: 'M - T', dias: 'Seg - Qua - Sex', horario: 'De 06:00 até 18:00' },
  { nome: 'Carlos Silva', turno: 'N', dias: 'Seg - Qua - Sex', horario: 'De 18:00 até 6:00' },
  { nome: 'Vinícius Santos', turno: 'M - T', dias: 'Terça - Quinta - Sábado', horario: 'De 06:00 até 18:00' },
  { nome: 'Jorge Amado', turno: 'N', dias: 'Terça - Quinta - Sábado', horario: 'De 18:00 até 6:00' },
  { nome: 'José Felipe', turno: 'M - T', dias: 'Domingo', horario: 'De 06:00 até 18:00' },
  { nome: 'Pedro Tavares', turno: 'N', dias: 'Domingo', horario: 'De 18:00 até 6:00' }
]
</script>
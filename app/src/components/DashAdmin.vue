<template>
  <div class="w-[71%] shrink-0 flex flex-col animate-fadeIn">
    <div class="w-full flex flex-col border border-[#F79347] rounded-3xl p-6 bg-white shadow-sm h-max">
      <div class="flex items-center gap-2 mb-6">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FD7917" stroke-width="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
        <h2 class="text-lg font-bold text-[#1E0D01]">Histórico de Acesso - Hoje</h2>
      </div>

      <div class="w-full">
        <div class="grid grid-cols-4 px-4 pb-3 text-sm font-bold text-[#1E0D01] border-b border-transparent">
          <div class="col-span-1">Usuário</div>
          <div class="col-span-1">Tipo</div>
          <div class="col-span-1">Carro</div>
          <div class="col-span-1 text-right">Hora</div>
        </div>
        
        <div class="flex flex-col">
          <div v-for="(item, index) in historico" :key="index" :class="['grid grid-cols-4 px-4 py-3 rounded-xl text-[13px] items-center text-[#1E0D01]', index % 2 !== 0 ? 'bg-[#FFF5F0]' : 'bg-white']">
            <div class="col-span-1 truncate pr-2">{{ item.usuario }}</div>
            <div class="col-span-1 text-gray-600">{{ item.tipo }}</div>
            <div class="col-span-1 text-gray-600 truncate pr-2">{{ item.carro }}</div>
            <div class="col-span-1 text-right font-mono font-medium">{{ item.hora }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const historico = [
  { usuario: 'Ana Silva', tipo: 'Visitante', carro: 'Chevrolet | Onix | Branco | ABC1D23', hora: '10:25:34' },
  { usuario: 'Hygor Marques', tipo: 'Servidor/Aluno', carro: 'Volkswagen | Gol | Branco | BCD2E34', hora: '11:24:54' },
  { usuario: 'Isadora Menezes', tipo: 'Servidor/Aluno', carro: 'Fiat | Uno | Vermelho | CDE3F45', hora: '12:56:34' },
  { usuario: 'Carlos Alberto', tipo: 'Visitante', carro: 'Renault | Sandero | Preto | DEF4G56', hora: '14:30:46' },
  { usuario: 'Jorge Castelo', tipo: 'Servidor/Aluno', carro: 'Citroen | C4 | Branco | EFG5H67', hora: '17:15:59' }
]
</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.4s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
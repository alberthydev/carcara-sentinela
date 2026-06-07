<template>
  <div class="min-h-screen bg-[#FAFBFC] font-sans text-[#1E0D01]">
    
    <!-- HEADER -->
    <header class="w-full h-[113px] bg-[#FAFBFC] border-b border-[#FDEEE8] flex items-center justify-between px-[52px] relative z-10">
      
      <div class="flex items-center gap-4">
        <img src="@/assets/img/carcara.png" alt="Logo" class="w-[38px] h-[50px] object-contain" />
        <h1 class="font-serif text-[29px] text-[#1E0D01]">Carcará <span class="text-[#F79347]">Sentinela</span></h1>
      </div>

      <div class="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center w-[423px] h-[40px] bg-[#FDEEE8] border border-[#F79347] rounded-full">
        <span class="text-[#1E0D01] text-base font-medium">Painel de Visitas</span>
      </div>

      <div class="flex items-center gap-3">
        
        <button class="w-[41px] h-[39px] rounded-lg border-[1.3px] border-[#F79347] flex items-center justify-center bg-[#FAFBFC] hover:bg-[#FDEEE8] transition-colors cursor-pointer text-[#F79347]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            <path d="M2 8c0-2.2.8-4.3 2.2-5.8"></path>
            <path d="M22 8c0-2.2-.8-4.3-2.2-5.8"></path>
          </svg>
        </button>

        <button class="w-[41px] h-[39px] rounded-lg border-[1.3px] border-[#F79347] flex items-center justify-center bg-[#FAFBFC] hover:bg-[#FDEEE8] transition-colors cursor-pointer text-[#F79347]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>

        <button class="w-[41px] h-[39px] rounded-lg border-[1.3px] border-[#F79347] flex items-center justify-center bg-[#FAFBFC] hover:bg-[#FDEEE8] transition-colors cursor-pointer text-[#F79347]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </button>

      </div>
    </header>

    <!-- CONTEÚDO PRINCIPAL VISITANTE -->
    <main class="w-[92%] max-w-[1600px] mx-auto py-10 flex justify-between items-stretch animate-fadeIn">
    
      <div class="w-[71%] shrink-0 flex flex-col">
          
          <section>
            <h2 class="text-[22px] font-semibold text-[#1E0D01] mb-[13px] h-[33px] flex items-center">Minhas Visitas</h2>
            
            <div class="w-full grid grid-cols-3 gap-5">
              <div v-for="(visita, index) in visitasFuturas" :key="index" class="w-full aspect-[293/149] bg-[#FDEEE8] rounded-2xl p-5 shadow-[0px_2px_12px_rgba(253,121,23,0.12)] flex flex-col justify-between group relative overflow-hidden">
                <div class="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FD7917" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="12" rx="2" ry="2"></rect><path d="M16 8v-2a4 4 0 0 0-8 0v2"></path></svg>
                  <span class="text-[#FD7917] font-semibold text-base">Visita {{ index + 1 }}</span>
                </div>
                <div class="grid grid-cols-2 gap-y-4 gap-x-2 mt-1">
                  <div>
                    <p class="text-[11px] font-semibold text-[#1E0D01]">Setor da Visita</p>
                    <p class="text-[12px] text-[#AAB1BD] truncate">{{ visita.setor }}</p>
                  </div>
                  <div>
                    <p class="text-[11px] font-semibold text-[#1E0D01]">Veículo (Placa)</p>
                    <p class="text-[12px] text-[#AAB1BD] truncate">{{ visita.placa }}</p>
                  </div>
                  <div>
                    <p class="text-[11px] font-semibold text-[#1E0D01]">Data</p>
                    <p class="text-[12px] text-[#AAB1BD] truncate">{{ visita.data }}</p>
                  </div>
                  <div>
                    <p class="text-[11px] font-semibold text-[#1E0D01]">Hora</p>
                    <p class="text-[12px] text-[#AAB1BD] truncate">{{ visita.hora }}</p>
                  </div>
                </div>
              </div>

              <button class="w-full aspect-[293/149] bg-gradient-to-br from-[#FD7917] to-[#F79347] rounded-2xl p-5 shadow-[0px_4px_20px_rgba(253,121,23,0.35)] flex flex-col items-center justify-center gap-2 hover:opacity-95 transition-opacity cursor-pointer active:scale-[0.98]">
                <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </div>
                <span class="text-white font-semibold text-sm">Agendar Visita</span>
              </button>
            </div>
          </section>

          <section class="w-full mt-[28px] flex-1 border border-[#F79347] rounded-2xl p-6 bg-[#FAFBFC] flex flex-col">
            
            <div class="flex items-center gap-2 mb-5 shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FD7917" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
              <h2 class="text-[20px] font-medium text-black">Meu Histórico de Visitas</h2>
            </div>

            <div class="w-full flex-1 flex flex-col">
              <div class="grid grid-cols-4 px-6 mb-3 text-[15px] font-medium text-black shrink-0">
                <div>Veículo (Placa)</div>
                <div>Data</div>
                <div>Hora de Entrada</div>
                <div>Hora de Saída</div>
              </div>
              
              <div class="flex flex-col gap-[6px]">
                <div v-for="(hist, index) in historicoVisitas" :key="index" 
                     :class="['grid grid-cols-4 px-6 h-[31px] rounded-full text-[12px] font-medium text-[#1E0D01] items-center', index % 2 !== 0 ? 'bg-[#FDEEE8]' : 'bg-transparent']">
                  <div>{{ hist.placa }}</div>
                  <div>{{ hist.data }}</div>
                  <div>{{ hist.entrada }}</div>
                  <div>{{ hist.saida }}</div>
                </div>
              </div>
            </div>
          </section>

      </div>

      <aside class="w-[26%] shrink-0 flex flex-col gap-[24px] mt-[46px]">
        
        <div class="w-full aspect-[360/252] bg-white border border-[#FDEEE8] shadow-[0px_2px_12px_rgba(0,0,0,0.04)] rounded-2xl p-6 flex flex-col justify-center">
          <h3 class="text-[16px] font-semibold text-[#1E0D01] mb-4">Acesso Automático</h3>
          <p class="text-[13px] font-medium text-[#1E0D01] leading-relaxed">
            No dia da sua visita, dirija-se à cancela. Nossa câmera fará a leitura da placa cadastrada e a liberação será automática.
          </p>
        </div>

        <div class="w-full aspect-[360/208] bg-gradient-to-br from-[#FD7917] to-[#F79347] shadow-[0px_8px_32px_rgba(253,121,23,0.3)] rounded-2xl p-6 flex flex-col justify-center gap-4">
          <h3 class="text-[16px] font-semibold text-white">Quantitativo de Vagas</h3>
          
          <div class="flex items-center justify-between mt-2">
            <div class="relative w-[120px] h-[120px] shrink-0">
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="45" fill="none" stroke="#FDEEE8" stroke-width="20" />
                <circle cx="60" cy="60" r="45" fill="none" stroke="#613613" stroke-width="20" stroke-dasharray="282.7" stroke-dashoffset="155" transform="rotate(-90 60 60)" class="transition-all duration-1000 ease-out" />
              </svg>
            </div>

            <div class="flex flex-col gap-4">
              <div class="flex items-start gap-3">
                <div class="w-4 h-4 rounded border-2 border-[#613613] bg-[#613613] shrink-0 mt-0.5"></div>
                <div class="flex flex-col">
                  <span class="text-[12px] text-white/80 leading-tight">Total de Vagas</span>
                  <span class="text-[22px] font-bold text-white leading-tight">276</span>
                </div>
              </div>
              
              <div class="flex items-start gap-3">
                <div class="w-4 h-4 rounded border-2 border-white/30 bg-[#FDEEE8] shrink-0 mt-0.5"></div>
                <div class="flex flex-col">
                  <span class="text-[12px] text-white/80 leading-tight">Vagas Ocupadas</span>
                  <span class="text-[22px] font-bold text-white leading-tight">124</span>
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
import { ref } from 'vue'

const visitasFuturas = ref([
  {
    setor: 'Biblioteca',
    placa: 'ABC1D23',
    data: '05/06/2026',
    hora: '08:30:00'
  },
  {
    setor: 'Biblioteca',
    placa: 'ABC1D23',
    data: '13/06/2026',
    hora: '08:30:00'
  }
])

const historicoVisitas = ref([
  { placa: 'ABC1D23', data: '20/01/2026', entrada: '06:32:57', saida: '10:25:34' },
  { placa: 'ABC1D23', data: '21/01/2026', entrada: '06:28:35', saida: '11:24:54' },
  { placa: 'ABC1D23', data: '22/01/2026', entrada: '06:35:49', saida: '12:56:34' },
  { placa: 'ABC1D23', data: '23/01/2026', entrada: '06:40:12', saida: '14:30:46' },
  { placa: 'ABC1D23', data: '24/01/2026', entrada: '06:31:51', saida: '17:15:59' },
])
</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.3s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
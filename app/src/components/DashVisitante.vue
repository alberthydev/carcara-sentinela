<template>
  <div class="w-[71%] shrink-0 flex flex-col">
    <section>
      <h2 class="text-[22px] font-semibold text-[#1E0D01] mb-[13px] h-[33px] flex items-center">
        Minhas Visitas Futuras
      </h2>
      <div class="w-full grid grid-cols-3 gap-5">
        <!-- Visita 1 -->
        <div
          class="w-full aspect-[293/149] bg-[#FDEEE8] rounded-2xl p-5 shadow-[0px_2px_12px_rgba(253,121,23,0.12)] flex flex-col justify-between"
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
              <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16"></path>
            </svg>
            <span class="text-[#FD7917] font-semibold text-base">Visita 1</span>
          </div>
          <div class="grid grid-cols-2 gap-y-3 mt-1 text-left">
            <div>
              <p class="text-[10px] font-bold text-[#1E0D01]">Setor da Visita</p>
              <p class="text-[12px] text-[#AAB1BD] truncate">Biblioteca</p>
            </div>
            <div>
              <p class="text-[10px] font-bold text-[#1E0D01]">Veículo (Placa)</p>
              <p class="text-[12px] text-[#AAB1BD] truncate">ABC1D23</p>
            </div>
            <div>
              <p class="text-[10px] font-bold text-[#1E0D01]">Data</p>
              <p class="text-[12px] text-[#FD7917] font-semibold">05/06/2026</p>
            </div>
            <div>
              <p class="text-[10px] font-bold text-[#1E0D01]">Hora</p>
              <p class="text-[12px] text-[#AAB1BD]">08:30:00</p>
            </div>
          </div>
        </div>
        <!-- Botão Agendar -->
        <button
          class="w-full aspect-[293/149] bg-gradient-to-br from-[#FD7917] to-[#F79347] rounded-2xl p-5 shadow-[0px_4px_20px_rgba(253,121,23,0.35)] flex flex-col items-center justify-center gap-2 hover:opacity-95 transition-opacity cursor-pointer"
        >
          <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FFFFFF"
              stroke-width="2"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          <span class="text-white font-semibold text-sm">Agendar Visita</span>
        </button>
      </div>
    </section>

    <!-- Histórico de Visitas -->
    <section
      class="w-full mt-[28px] flex-1 border border-[#F79347] rounded-2xl p-6 bg-[#FAFBFC] flex flex-col"
    >
      <div class="flex items-center gap-2 mb-5">
        <h2 class="text-[20px] font-medium text-black">Meu Histórico de Visitas</h2>
      </div>
      <div class="w-full flex-1 flex flex-col">
        <div class="grid grid-cols-4 px-6 mb-3 text-[15px] font-medium text-black">
          <div>Veículo (Placa)</div>
          <div>Data</div>
          <div>Hora de Entrada</div>
          <div>Hora de Saída</div>
        </div>
        <div
          class="grid grid-cols-4 px-6 h-[31px] rounded-full text-[12px] items-center bg-[#FDEEE8]"
        >
          <div>ABC1D23</div>
          <div>20/01/2026</div>
          <div>06:32:57</div>
          <div>10:25:34</div>
        </div>
      </div>
    </section>
  </div>
</template>

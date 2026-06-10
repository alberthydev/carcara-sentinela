<template>
  <div class="w-[71%] shrink-0 flex flex-col">
    <section>
      <h2 class="text-[22px] font-semibold text-[#1E0D01] mb-[13px] h-[33px] flex items-center">
        Estacionamento
      </h2>
      <div class="w-full grid grid-cols-3 gap-5">
        <!-- Vagas Detectadas/Carros Ativos -->
        <div
          class="w-full aspect-[293/149] bg-white border border-[#F79347] rounded-2xl p-5 shadow-[0px_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between"
        >
          <div class="flex items-center gap-2">
            <span class="text-[#FD7917] font-semibold text-base">Carro 1</span>
          </div>
          <div class="grid grid-cols-2 gap-y-2 mt-1 text-left">
            <div>
              <p class="text-[11px] font-semibold text-[#1E0D01]">Marca</p>
              <p class="text-[12px] text-[#AAB1BD]">Chevrolet</p>
            </div>
            <div>
              <p class="text-[11px] font-semibold text-[#1E0D01]">Placa</p>
              <p class="text-[12px] text-[#AAB1BD]">ABC1D23</p>
            </div>
          </div>
        </div>
        <button
          class="w-full aspect-[293/149] bg-gradient-to-br from-[#FD7917] to-[#F79347] rounded-2xl p-5 shadow-[0px_4px_20px_rgba(253,121,23,0.35)] flex flex-col items-center justify-center gap-2"
        >
          <span class="text-white font-semibold text-sm">Ver mais</span>
        </button>
      </div>
    </section>

    <!-- Histórico de hoje Geral -->
    <section
      class="w-full mt-[28px] flex-1 border border-[#F79347] rounded-2xl p-6 bg-[#FAFBFC] flex flex-col"
    >
      <div class="flex items-center gap-2 mb-5">
        <h2 class="text-[20px] font-medium text-black">Histórico de Acesso - Hoje</h2>
      </div>
      <div class="w-full flex-1 flex flex-col">
        <div class="grid grid-cols-4 px-6 mb-3 text-[15px] font-medium text-black">
          <div>Usuário</div>
          <div>Tipo</div>
          <div>Carro</div>
          <div>Hora</div>
        </div>
        <div
          class="grid grid-cols-4 px-6 h-[40px] rounded-full text-[12px] items-center bg-[#FDEEE8]"
        >
          <div class="font-bold">Ana Silva</div>
          <div>Visitante</div>
          <div>Chevrolet | Onix | ABC1D23</div>
          <div>10:25:34</div>
        </div>
      </div>
    </section>
  </div>
</template>

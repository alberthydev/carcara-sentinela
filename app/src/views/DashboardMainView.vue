<template>
  <div class="min-h-screen bg-[#FAFBFC] font-sans text-[#1E0D01]">
    <header class="w-full h-[113px] bg-[#FAFBFC] border-b border-[#FDEEE8] flex items-center justify-between px-[52px] relative z-20">
      <div class="flex items-center gap-4">
        <img src="@/assets/img/carcara.png" alt="Logo" class="w-[38px] h-[50px] object-contain" />
        <h1 class="font-serif text-[29px] text-[#1E0D01]">
          Carcará <span class="text-[#F79347]">Sentinela</span>
        </h1>
      </div>

      <div class="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center w-[423px] h-[40px] bg-[#FDEEE8] border border-[#F79347] rounded-full">
        <span class="text-[#1E0D01] text-base font-medium">{{ textoPainel }}</span>
      </div>

      <div class="flex items-center gap-3 relative">
        <button class="w-[41px] h-[39px] rounded-lg border-[1.3px] border-[#F79347] flex items-center justify-center bg-[#FAFBFC] hover:bg-[#FDEEE8] transition-colors cursor-pointer text-[#F79347]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
        </button>

        <button v-if="tipoUsuario !== 'seguranca'" @click="abrirConfiguracaoHeader" class="w-[41px] h-[39px] rounded-lg border-[1.3px] border-[#F79347] flex items-center justify-center bg-[#FAFBFC] hover:bg-[#FDEEE8] transition-colors cursor-pointer text-[#F79347]" title="Configurações">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
        </button>

        <button @click="isDropdownAberto = !isDropdownAberto" class="w-[41px] h-[39px] rounded-lg border-[1.3px] border-[#FD7917] flex items-center justify-center bg-[#FDEEE8] text-[#FD7917] font-bold cursor-pointer transition-transform active:scale-95" title="Menu do Usuário">
          {{ inicialUsuario }}
        </button>

        <div v-if="isDropdownAberto" class="absolute right-0 top-[48px] w-[240px] bg-[#D17836] text-white rounded-2xl p-4 shadow-xl flex flex-col text-left z-30 animate-scaleUp">
          <div class="text-xs opacity-75 font-medium px-2 mb-2 pb-2 border-b border-white/20 capitalize">
            Sessão: {{ tipoUsuario }}
          </div>

          <template v-if="tipoUsuario === 'admin'">
            <button @click="acaoAdmin('usuarios')" class="w-full text-left py-2 px-2 hover:bg-white/10 rounded-lg text-sm transition-colors cursor-pointer">Usuarios</button>
            <button @click="acaoAdmin('escala')" class="w-full text-left py-2 px-2 hover:bg-white/10 rounded-lg text-sm transition-colors cursor-pointer">Escala de Funcionários</button>
            <button @click="acaoAdmin('relatorios')" class="w-full text-left py-2 px-2 hover:bg-white/10 rounded-lg text-sm transition-colors cursor-pointer border-b border-white/20 pb-3 mb-2">Relatórios</button>
          </template>

          <button v-if="isDevMode" @click="alternarTipoTeste" class="w-full text-left py-2 px-2 hover:bg-white/10 rounded-lg text-xs transition-colors cursor-pointer text-orange-200 font-bold mb-2">
            Alternar Papel (Dev)
          </button>

          <button @click="handleLogout" class="w-full text-left py-2 px-2 hover:bg-red-600 rounded-lg text-sm transition-colors cursor-pointer font-semibold flex items-center justify-between">
            <span>Sair</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          </button>
        </div>
      </div>
    </header>

    <main class="w-[92%] max-w-[1600px] mx-auto py-10 flex justify-between items-stretch animate-fadeIn">
      
      <component 
        :is="componenteFilho" 
        :usuario-id="usuarioLogado?.id" 
        :total-vagas="totalVagasGlobal" 
        :vagas-ocupadas="vagasOcupadas"
        @abrir-cadastro="abrirCadastroNormal"
        @abrir-cadastro-rapido="abrirCadastroRapido" 
        @acesso-registrado="registrarAcesso"
      />

      <aside class="w-[26%] shrink-0 flex flex-col gap-6 mt-[46px]">
        
        <div v-if="tipoUsuario === 'admin' || tipoUsuario === 'seguranca'" class="bg-white rounded-[24px] p-6 shadow-sm border border-[#FDEEE8] flex flex-col text-left">
          <h3 class="font-bold text-[#1E0D01] mb-5 text-[16px]">Segurança em Turno</h3>
          
          <div v-if="segurancaAtivo" class="flex items-center gap-4 mb-6">
            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-lg">
              {{ segurancaAtivo.nome.charAt(0) }}
            </div>
            <div class="flex flex-col">
              <h4 class="font-bold text-[#1E0D01] leading-tight text-[15px]">{{ segurancaAtivo.nome }}</h4>
              <span class="text-[12px] text-green-600 font-medium mt-0.5">Segurança Ativo</span>
            </div>
          </div>
          <div v-else class="text-sm text-gray-400 italic mb-6">Nenhum segurança escalado no momento.</div>

          <div v-if="segurancaAtivo" class="flex flex-col gap-3 text-[13px]">
            <div class="flex justify-between items-center border-b border-gray-50 pb-2">
              <span class="text-[#AAB1BD] font-medium">Turno</span>
              <span class="font-bold text-[#1E0D01]">{{ segurancaAtivo.turno }}</span>
            </div>
            <div class="flex justify-between items-center border-b border-gray-50 pb-2">
              <span class="text-[#AAB1BD] font-medium">Horário</span>
              <span class="font-bold text-[#1E0D01]">{{ segurancaAtivo.horaInicio }} as {{ segurancaAtivo.horaFim }}</span>
            </div>
          </div>
        </div>

        <div v-if="tipoUsuario === 'aluno' || tipoUsuario === 'servidor' || tipoUsuario === 'visitante'" class="w-full aspect-[360/252] bg-white border border-[#FDEEE8] shadow-sm rounded-[24px] p-6 flex flex-col justify-center text-left">
          <h3 class="text-[16px] font-semibold text-[#1E0D01] mb-4">
            {{ tipoUsuario === 'visitante' ? 'Acesso Automático' : 'Avisos do Campus' }}
          </h3>
          <p class="text-[13px] font-medium text-[#1E0D01] leading-relaxed">
            <template v-if="tipoUsuario === 'visitante'">
              No dia da sua visita, dirija-se à cancela. Nossa câmera fará a leitura da placa cadastrada e a liberação será automática.
            </template>
            <template v-else>Ex: Estacionamento do bloco B fechado para manutenção amanhã.</template>
          </p>
        </div>

        <div class="w-full bg-[#FD7917] shadow-[0px_8px_32px_rgba(253,121,23,0.3)] rounded-[24px] p-6 flex flex-col gap-4 text-left">
          <h3 class="text-[16px] font-bold text-white">Quantitativo de Vagas</h3>
          <div class="flex items-center gap-6 mt-2">
            <div class="relative w-[110px] h-[110px] shrink-0 flex items-center justify-center">
              <svg width="110" height="110" viewBox="0 0 120 120" class="transform -rotate-90">
                <circle cx="60" cy="60" r="45" fill="none" stroke="#FDEEE8" stroke-width="20" />
                <circle 
                  cx="60" cy="60" r="45" fill="none" stroke="#613613" stroke-width="20" 
                  :stroke-dasharray="282.7" 
                  :stroke-dashoffset="dashOffsetVagas" 
                  class="transition-all duration-500 ease-out"
                />
              </svg>
              <span class="absolute text-white font-bold text-lg">{{ percentualOcupacao }}%</span>
            </div>
            <div class="flex flex-col gap-4">
              <div class="flex items-start gap-3">
                <div class="w-3.5 h-3.5 rounded bg-[#613613] shrink-0 mt-1"></div>
                <div class="flex flex-col">
                  <span class="text-[11px] font-semibold text-white/80 leading-tight">Total</span>
                  <span class="text-[20px] font-bold text-white leading-tight">{{ totalVagasGlobal }}</span>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-3.5 h-3.5 rounded bg-[#FDEEE8] shrink-0 mt-1"></div>
                <div class="flex flex-col">
                  <span class="text-[11px] font-semibold text-white/80 leading-tight">Ocupadas</span>
                  <span class="text-[20px] font-bold text-white leading-tight">{{ vagasOcupadas }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <template v-if="tipoUsuario === 'seguranca'">
          <div class="w-full bg-white border border-[#FDEEE8] rounded-[24px] p-6 shadow-[0px_2px_12px_rgba(0,0,0,0.02)] flex flex-col text-left">
            <h3 class="text-[16px] font-bold text-[#1E0D01] mb-4">Acessos Hoje</h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-green-50 rounded-2xl py-4 flex flex-col items-center justify-center gap-1 border border-green-100/50">
                <span class="text-[24px] font-bold text-green-600">{{ acessosAuto }}</span>
                <span class="text-[12px] font-semibold text-green-600/60">Autorizados</span>
              </div>
              <div class="bg-orange-50 rounded-2xl py-4 flex flex-col items-center justify-center gap-1 border border-orange-100/50">
                <span class="text-[24px] font-bold text-[#FD7917]">{{ acessosManual }}</span>
                <span class="text-[12px] font-semibold text-[#FD7917]/60">Manuais</span>
              </div>
            </div>
          </div>
          
          <div class="w-full bg-white border border-[#FDEEE8] rounded-[24px] p-6 shadow-[0px_2px_12px_rgba(0,0,0,0.02)] flex flex-col text-left">
            <h3 class="text-[16px] font-bold text-[#1E0D01] mb-5">Stream da Câmera</h3>
            <div class="flex flex-col gap-3 text-[13px]">
              <div class="flex justify-between items-center">
                <span class="font-semibold text-gray-400">Protocolo</span>
                <span class="font-bold text-[#1E0D01]">SSE (HTTP/2)</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="font-semibold text-gray-400">Endpoint</span>
                <span class="font-bold text-[#1E0D01]">/events/cancela-01</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="font-semibold text-gray-400">Câmera</span>
                <span class="font-bold text-[#1E0D01]">LPR-CAM-01</span>
              </div>
              <div class="flex justify-between items-center mt-1">
                <span class="font-semibold text-gray-400">Status</span>
                <span class="font-bold text-green-500">Online</span>
              </div>
            </div>
          </div>
        </template>
      </aside>
    </main>

    <ModalCadastrarVeiculo 
      :is-open="isModalVeiculoAberto" 
      :tipo-usuario-visualizando="tipoUsuario" 
      @close="fecharModalVeiculo" 
      @save="receberNovoVeiculo" 
    />
    <ModalPerfilUsuario :is-open="isModalPerfilAberto" @close="isModalPerfilAberto = false" />
    <ModalConfigCampus :is-open="isModalConfigCampusAberto" :vagas-atuais="totalVagasGlobal" @close="isModalConfigCampusAberto = false" @save="salvarConfigCampus" />
    <ModalEscala :is-open="isModalEscalaAberto" @close="isModalEscalaAberto = false" />
    <ModalUsuarios :is-open="isModalUsuariosAberto" @close="isModalUsuariosAberto = false" />
    <ModalRelatorios :is-open="isModalRelatoriosAberto" @close="isModalRelatoriosAberto = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

import DashVisitante from '../components/DashVisitante.vue'
import DashAlunoServidor from '../components/DashAlunoServidor.vue'
import DashAdmin from '../components/DashAdmin.vue'
import DashSeguranca from '../components/DashSeguranca.vue'

import ModalCadastrarVeiculo from '../components/ModalCadastrarVeiculo.vue'
import ModalPerfilUsuario from '../components/ModalPerfilUsuario.vue'
import ModalConfigCampus from '../components/ModalConfigCampus.vue'
import ModalEscala from '../components/ModalEscala.vue'
import ModalUsuarios from '../components/ModalUsuarios.vue'
import ModalRelatorios from '../components/ModalRelatorios.vue'

const usuarioLogado = ref<any>(null)
const tipoUsuario = ref<string>('visitante')

const isDevMode = computed(() => usuarioLogado.value?.tipo === 'dev')

const isModalVeiculoAberto = ref(false)
const isModalPerfilAberto = ref(false)
const isModalConfigCampusAberto = ref(false)
const isModalEscalaAberto = ref(false)
const isModalUsuariosAberto = ref(false)
const isModalRelatoriosAberto = ref(false)
const isDropdownAberto = ref(false)

const dadosCamera = ref<{ placa: string; marca: string; modelo: string; cor: string } | null>(null)

const totalVagasGlobal = ref(200) 
const vagasOcupadas = ref(0)
const acessosAuto = ref(0)
const acessosManual = ref(0)
const segurancaAtivo = ref<any>(null)

const mapasDeComponente: Record<string, any> = {
  visitante: DashVisitante,
  aluno: DashAlunoServidor,
  servidor: DashAlunoServidor, 
  admin: DashAdmin,
  seguranca: DashSeguranca 
}

const buscarConfiguracao = async () => {
  try {
    const res = await fetch('/api/users/configuracao')
    const data = await res.json()
    if (data && data.totalVagas) totalVagasGlobal.value = data.totalVagas
  } catch (e) { console.error("Erro banco vagas", e) }
}

const buscarSegurancaAtivo = async () => {
  try {
    const res = await fetch('/api/users/escala/ativa')
    if (res.ok) segurancaAtivo.value = await res.json()
  } catch (e) { console.error("Erro banco seguranca", e) }
}

onMounted(() => {
  const userStorage = localStorage.getItem('user')
  
  if (userStorage) {
    usuarioLogado.value = JSON.parse(userStorage)
    
    if (usuarioLogado.value.tipo === 'dev') {
      tipoUsuario.value = 'admin' 
    } else {
      tipoUsuario.value = usuarioLogado.value.tipo
    }
  }

  buscarConfiguracao()
  buscarSegurancaAtivo()
})

const salvarConfigCampus = async (novasVagas: number) => {
  try {
    await fetch('/api/users/configuracao', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ totalVagas: novasVagas }) })
    totalVagasGlobal.value = novasVagas
    isModalConfigCampusAberto.value = false
  } catch (e) { console.error(e) }
}

const percentualOcupacao = computed(() => Math.round((vagasOcupadas.value / totalVagasGlobal.value) * 100))
const dashOffsetVagas = computed(() => {
  const circunferencia = 282.7 
  return circunferencia - (circunferencia * (percentualOcupacao.value / 100))
})

const registrarAcesso = (tipo: 'auto' | 'manual') => {
  if (vagasOcupadas.value < totalVagasGlobal.value) vagasOcupadas.value++
  if (tipo === 'auto') acessosAuto.value++
  else acessosManual.value++
}

const componenteFilho = computed(() => mapasDeComponente[tipoUsuario.value] || DashVisitante)

const textoPainel = computed(() => {
  if (tipoUsuario.value === 'visitante') return 'Painel de Visitas'
  if (tipoUsuario.value === 'admin') return 'Dashboard Administrador'
  if (tipoUsuario.value === 'seguranca') return 'Controle de Segurança'
  return 'Dashboard do Usuário'
})

const inicialUsuario = computed(() => {
  const p = tipoUsuario.value
  if (p === 'visitante') return 'V'
  if (p === 'admin') return 'A'
  if (p === 'seguranca') return 'S'
  if (p === 'servidor') return 'S'
  if (p === 'aluno') return 'A'
  return 'U'
})

const abrirConfiguracaoHeader = () => {
  if (tipoUsuario.value === 'admin') isModalConfigCampusAberto.value = true
  else isModalPerfilAberto.value = true
}

const acaoAdmin = (contexto: string) => {
  isDropdownAberto.value = false
  if (contexto === 'usuarios') isModalUsuariosAberto.value = true
  else if (contexto === 'escala') isModalEscalaAberto.value = true
  else if (contexto === 'relatorios') isModalRelatoriosAberto.value = true
}

const handleLogout = () => { 
  localStorage.clear()
  window.location.href = '/' 
}

const abrirCadastroNormal = () => { dadosCamera.value = null; isModalVeiculoAberto.value = true }
const abrirCadastroRapido = (dados: any) => { dadosCamera.value = dados; isModalVeiculoAberto.value = true }
const fecharModalVeiculo = () => { isModalVeiculoAberto.value = false; dadosCamera.value = null }
const receberNovoVeiculo = async (dadosFormulario: any) => {
  const userId = usuarioLogado.value?.id;
  
  if (!userId) {
    alert("Erro: ID do usuário não carregado na sessão.");
    return;
  }

  try {
    let url = `/api/users/${userId}/veiculos`;
    if (dadosFormulario.isAgendamento) {
      url = `/api/users/${userId}/visitas`;
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dadosFormulario)
    });

    const data = await res.json();

    if (!res.ok) {
      alert(`Erro do Servidor: ${data.erro || 'Verifique o terminal do backend'}`);
      console.error("Resposta de erro do Node:", data);
      return; 
    }

    alert(dadosFormulario.isAgendamento ? 'Visita agendada com sucesso!' : 'Veículo salvo com sucesso!');
    window.location.reload(); 
    
  } catch (error) {
    console.error("Erro fatal no fetch:", error);
    alert('Falha de conexão com a API. O Backend está rodando?');
  }
}

const alternarTipoTeste = () => {
  if (tipoUsuario.value === 'aluno') tipoUsuario.value = 'visitante'
  else if (tipoUsuario.value === 'visitante') tipoUsuario.value = 'servidor'
  else if (tipoUsuario.value === 'servidor') tipoUsuario.value = 'seguranca'
  else if (tipoUsuario.value === 'seguranca') tipoUsuario.value = 'admin'
  else tipoUsuario.value = 'aluno'
  
  isDropdownAberto.value = false
}
</script>

<style scoped>
.animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
.animate-scaleUp { animation: scaleUp 0.15s ease-out forwards; transform-origin: top right; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes scaleUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
</style>
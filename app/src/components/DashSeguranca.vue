<template>
  <div class="w-[71%] shrink-0 flex flex-col gap-[20px] animate-fadeIn">
    <div class="flex items-center gap-4">
      <h2 class="text-[22px] font-bold text-[#1E0D01] flex items-center gap-2">
        Controle de Acesso — Cancela
      </h2>
      <div class="flex items-center gap-2 text-sm font-semibold">
        <span class="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
        <span class="text-green-600">Câmera online</span>
      </div>
      <span class="text-[#FD7917] text-sm font-medium ml-2"> — {{ textoStatusCamera }} </span>
    </div>

    <div
      class="w-full flex gap-5 bg-white border border-[#FDEEE8] rounded-2xl p-4 shadow-[0px_2px_12px_rgba(0,0,0,0.02)]"
    >
      <div
        class="w-[280px] h-[160px] bg-[#1A1C23] rounded-xl relative overflow-hidden flex flex-col items-center justify-center shrink-0"
      >
        <div class="absolute top-3 left-3 flex items-center gap-2 text-xs font-bold text-white/70">
          <span class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span> AO VIVO
        </div>

        <div v-if="eventoLPR" class="flex flex-col items-center gap-2 mt-4">
          <div
            :class="[
              'px-6 py-2 border-2 rounded-lg font-mono text-2xl tracking-widest font-bold',
              eventoLPR.status === 'conhecido'
                ? 'border-green-500 text-green-400'
                : 'border-red-500 text-red-400',
            ]"
          >
            {{ formatarPlaca(eventoLPR.placa) }}
          </div>
          <span class="text-white/50 text-xs">{{ eventoLPR.horaStr }}</span>
        </div>

        <div v-else class="flex flex-col items-center gap-2 text-white/30">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242M12 12v9" />
            <path d="m8 17 4 4 4-4" />
          </svg>
          <span class="text-sm">Sem veículo</span>
        </div>
      </div>

      <div class="flex flex-col justify-center flex-1 py-2">
        <h3 class="text-lg font-bold text-[#1E0D01]">Câmera da Cancela</h3>
        <p class="text-[13px] text-[#AAB1BD] mt-1" v-if="eventoLPR">
          Placa {{ eventoLPR.placa }} identificada - {{ eventoLPR.horaStr }}
        </p>
        <p class="text-[13px] text-[#AAB1BD] mt-1" v-else>
          Monitorando — aguardando próximo veículo.
        </p>

        <div class="flex items-center gap-4 mt-4 text-[13px]">
          <div class="flex items-center gap-1.5 text-green-600 font-semibold">
            <span class="w-2 h-2 bg-green-500 rounded-full"></span> Câmera online
          </div>
          <span class="text-gray-400">SSE - cancela-01</span>
        </div>

        <button
          v-if="eventoLPR"
          @click="resetarLeitura"
          class="mt-4 px-4 py-1.5 border border-[#F79347] text-[#FD7917] rounded-lg text-sm font-semibold w-max hover:bg-[#FDEEE8] transition-colors"
        >
          Próximo
        </button>
      </div>
    </div>

    <div class="min-h-[180px] flex flex-col justify-center">
      <div
        v-if="!eventoLPR"
        class="w-full bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex items-center gap-4"
      >
        <div
          class="w-12 h-12 bg-orange-50 text-[#FD7917] rounded-full flex items-center justify-center shrink-0"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <div>
          <h3 class="font-bold text-[#1E0D01]">Monitoramento ativo</h3>
          <p class="text-sm text-gray-400 mt-1">Próxima leitura simulada em ~15s</p>
        </div>
      </div>

      <div
        v-else-if="eventoLPR.status === 'conhecido'"
        class="w-full bg-[#F6FDF8] border border-[#D1F4E0] rounded-2xl p-6"
      >
        <div class="flex items-center gap-3 mb-6">
          <div
            class="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center shadow-sm"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <h3 class="font-bold text-green-700">Acesso Liberado Automaticamente</h3>
            <p class="text-xs text-green-600/70">
              Placa registrada no sistema - {{ eventoLPR.horaStr }}
            </p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-8 border-t border-green-100 pt-5">
          <div>
            <h4 class="text-[11px] font-bold text-[#FD7917] tracking-wider mb-4 uppercase">
              Veículo
            </h4>
            <div class="grid grid-cols-2 gap-y-4 text-sm">
              <div>
                <span class="block text-xs font-bold text-[#1E0D01]">Marca</span
                ><span class="text-gray-500">{{ eventoLPR.veiculo?.marca }}</span>
              </div>
              <div>
                <span class="block text-xs font-bold text-[#1E0D01]">Modelo</span
                ><span class="text-gray-500">{{ eventoLPR.veiculo?.modelo }}</span>
              </div>
              <div>
                <span class="block text-xs font-bold text-[#1E0D01]">Cor</span
                ><span class="text-gray-500">{{ eventoLPR.veiculo?.cor }}</span>
              </div>
              <div>
                <span class="block text-xs font-bold text-[#1E0D01]">Placa</span
                ><span class="text-gray-500">{{ eventoLPR.placa }}</span>
              </div>
            </div>
          </div>
          <div class="border-l border-green-100 pl-8">
            <h4 class="text-[11px] font-bold text-[#FD7917] tracking-wider mb-4 uppercase">
              Usuário Vinculado
            </h4>
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                <img
                  v-if="eventoLPR.usuario?.fotoUrl"
                  :src="eventoLPR.usuario.fotoUrl"
                  class="w-full h-full object-cover"
                />
                <svg
                  v-else
                  class="w-full h-full text-gray-400 p-2"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                  />
                </svg>
              </div>
              <div>
                <h5 class="font-bold text-[#1E0D01] text-base">{{ eventoLPR.usuario?.nome }}</h5>
                <span
                  class="text-[11px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold"
                  >{{ eventoLPR.usuario?.tipo }}</span
                >
              </div>
            </div>
            <div class="space-y-2 text-xs">
              <div class="flex justify-between border-b border-green-50 pb-1">
                <span class="font-bold text-[#1E0D01]">Matrícula</span
                ><span class="text-gray-500">{{ eventoLPR.usuario?.matricula || '-' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-else-if="eventoLPR.status === 'desconhecido'"
        class="w-full bg-[#FFF5F5] border border-[#FDE2E2] rounded-2xl p-6"
      >
        <div class="flex items-center gap-3 mb-6">
          <div
            class="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm font-bold text-lg"
          >
            !
          </div>
          <div>
            <h3 class="font-bold text-red-600">Placa Não Cadastrada - Intervenção Necessária</h3>
            <p class="text-xs text-red-500/70">
              Placa {{ eventoLPR.placa }} não encontrada - {{ eventoLPR.horaStr }}
            </p>
          </div>
        </div>

        <div class="flex items-center justify-between border-t border-red-100 pt-5">
          <p class="text-sm text-gray-500">Oriente o motorista e escolha como prosseguir:</p>
          <div class="flex items-center gap-3">
            <button
              @click="acaoCadastrarLiberar"
              class="bg-gradient-to-r from-[#FD7917] to-[#F79347] text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-[0px_4px_12px_rgba(253,121,23,0.2)] hover:opacity-90 transition-opacity"
            >
              Cadastrar e Liberar
            </button>
            <button
              @click="acaoLiberarSemCadastro"
              class="bg-white border border-[#FD7917] text-[#FD7917] px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-orange-50 transition-colors"
            >
              Liberar sem Cadastro
            </button>
          </div>
        </div>
      </div>
    </div>

    <section
      class="w-full border border-gray-100 rounded-2xl p-6 bg-white shadow-sm flex flex-col flex-1"
    >
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-[16px] font-bold text-[#1E0D01] flex items-center gap-2">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FD7917"
            stroke-width="2"
          >
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          Histórico de Acesso — Hoje
        </h2>
        <span class="text-xs text-gray-400 font-medium">{{ historico.length }} registros</span>
      </div>

      <div class="w-full flex flex-col gap-2">
        <div
          class="grid grid-cols-5 px-4 mb-2 text-[12px] font-bold text-gray-400 uppercase tracking-wider"
        >
          <div class="col-span-1">Usuário</div>
          <div class="col-span-1">Tipo</div>
          <div class="col-span-2">Veículo</div>
          <div class="col-span-1 text-right">Hora</div>
        </div>

        <div
          v-if="historico.length === 0"
          class="flex items-center justify-center h-[100px] text-gray-400 text-sm font-medium"
        >
          Nenhum acesso registrado ainda.
        </div>

        <div
          v-for="(item, index) in historico"
          :key="index"
          class="grid grid-cols-5 px-4 h-[46px] rounded-xl text-[13px] items-center transition-colors hover:bg-gray-50 border border-transparent hover:border-gray-100"
          :class="index % 2 === 0 ? 'bg-[#FAFBFC]' : 'bg-white'"
        >
          <div class="font-bold text-[#1E0D01] col-span-1 truncate pr-2">
            {{ item.usuario || '—' }}
          </div>
          <div class="text-gray-500 col-span-1 capitalize">{{ item.tipo }}</div>
          <div class="text-gray-500 col-span-2 truncate pr-2">{{ item.veiculo }}</div>
          <div
            class="col-span-1 flex items-center justify-end gap-3 text-[#1E0D01] font-medium font-mono"
          >
            {{ item.hora }}
            <span
              :class="[
                'px-2 py-0.5 rounded text-[10px] uppercase font-bold w-16 text-center',
                item.status === 'Autorizado'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-orange-100 text-orange-700',
              ]"
            >
              {{ item.status === 'Autorizado' ? 'Auto' : 'Manual' }}
            </span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['abrir-cadastro-rapido', 'acesso-registrado'])

interface EventoLPR {
  placa: string
  status: 'conhecido' | 'desconhecido'
  horaStr: string
  veiculo?: { marca: string; modelo: string; cor: string }
  usuario?: { nome: string; tipo: string; matricula?: string; fotoUrl?: string }
}

interface HistoricoItem {
  usuario: string
  tipo: string
  veiculo: string
  hora: string
  status: 'Autorizado' | 'Manual'
}

const eventoLPR = ref<EventoLPR | null>(null)
const filaLPR = ref<EventoLPR[]>([])
let eventSource: EventSource | null = null

const historico = ref<HistoricoItem[]>([])
const placasCadastradas = ref<string[]>([])

const textoStatusCamera = computed(() => {
  if (filaLPR.value.length > 0 && !eventoLPR.value) return 'processando fila...'
  if (filaLPR.value.length > 0) return `+${filaLPR.value.length} na fila`
  if (!eventoLPR.value) return 'próxima leitura em breve'
  if (eventoLPR.value.status === 'conhecido') return 'veículo liberado'
  return 'aguardando resolução'
})

const formatarPlaca = (placa: string) => {
  if (placa.length === 7) {
    return `${placa.slice(0, 3)}-${placa.slice(3, 7)}`
  }
  return placa
}

const processarFila = () => {
  if (!eventoLPR.value && filaLPR.value.length > 0) {
    eventoLPR.value = filaLPR.value.shift() || null

    if (eventoLPR.value?.status === 'conhecido') {
      emit('acesso-registrado', 'auto')
      fetchHistoricoSeguranca()

      setTimeout(() => {
        resetarLeitura()
      }, 5000)
    }
  }
}

const acaoCadastrarLiberar = () => {
  emit('abrir-cadastro-rapido', {
    placa: eventoLPR.value?.placa,
    marca: eventoLPR.value?.veiculo?.marca || '',
    cor: eventoLPR.value?.veiculo?.cor || '',
    modelo: eventoLPR.value?.veiculo?.modelo || '',
  })
  resetarLeitura()
}

const fetchHistoricoSeguranca = async () => {
  try {
    const res = await fetch('/api/users/admin/acessos')
    if (res.ok) {
      const dados = await res.json()
      historico.value = dados.map((d: any) => ({
        usuario: d.nome !== 'Desconhecido' ? d.nome : '—',
        tipo: d.tipo,
        veiculo: d.carro,
        hora: d.horaEntrada,
        status: d.isManual ? 'Manual' : 'Autorizado',
      }))
    }
  } catch (e) {
    console.error('Erro ao buscar histórico:', e)
  }
}

const acaoLiberarSemCadastro = async () => {
  if (!eventoLPR.value) return

  try {
    const res = await fetch('/api/users/admin/acesso-manual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        placa: eventoLPR.value.placa,
        marca: eventoLPR.value.veiculo?.marca || 'Desconhecida',
        modelo: eventoLPR.value.veiculo?.modelo || 'Desconhecido',
        cor: eventoLPR.value.veiculo?.cor || 'Desconhecida',
        isModoPortaria: true,
      }),
    })

    if (res.ok) {
      emit('acesso-registrado', 'manual')
      resetarLeitura()
      fetchHistoricoSeguranca()
    } else {
      alert('Erro ao registrar liberação manual.')
    }
  } catch (e) {
    console.error(e)
  }
}

const resetarLeitura = () => {
  eventoLPR.value = null
  processarFila()
}

const carregarPlacasReais = async () => {
  try {
    const res = await fetch('/api/users/placas-simulacao')
    if (res.ok) placasCadastradas.value = await res.json()
  } catch (e) {
    console.error('Erro ao carregar placas para simulação', e)
  }
}

const conectarSSE = () => {
  eventSource = new EventSource('/api/users/stream')
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data)

    filaLPR.value.push({
      placa: data.placa,
      status: data.status,
      horaStr: new Date(data.timestamp).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      veiculo: { marca: data.marca, modelo: data.modelo, cor: data.cor },
      usuario: data.motorista
        ? { nome: data.motorista.nome, tipo: data.motorista.tipo }
        : undefined,
    })

    processarFila()
  }
}

const gerarPlacaAleatoria = () => {
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numeros = '0123456789'
  let placa = ''
  for (let i = 0; i < 3; i++) placa += letras.charAt(Math.floor(Math.random() * letras.length))
  for (let i = 0; i < 4; i++) placa += numeros.charAt(Math.floor(Math.random() * numeros.length))
  return placa
}

let simuladorInterval: any = null

const iniciarSimuladorRobo = () => {
  simuladorInterval = setInterval(() => {
    if (filaLPR.value.length < 2 && !eventoLPR.value) {
      let placaAlvo = gerarPlacaAleatoria()

      if (placasCadastradas.value.length > 0 && Math.random() > 0.5) {
        const indexAleatorio = Math.floor(Math.random() * placasCadastradas.value.length)
        placaAlvo = placasCadastradas.value[indexAleatorio]
      }

      fetch('/api/users/evento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placa: placaAlvo }),
      }).catch((e) => console.error('Falha ao simular LPR:', e))
    }
  }, 10000)
}

onMounted(() => {
  fetchHistoricoSeguranca()
  carregarPlacasReais()
  conectarSSE()
  iniciarSimuladorRobo()
})

onUnmounted(() => {
  if (eventSource) eventSource.close()
  if (simuladorInterval) clearInterval(simuladorInterval)
})
</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
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

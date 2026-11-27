<template>
  <div class="portaria w-full min-w-0 shrink-0 lg:w-[71%]">
    <header class="portaria-cabecalho">
      <div>
        <h2>Portaria</h2>
        <p>Controle de acesso de veículos</p>
      </div>
      <span class="portaria-status" :class="leituraDisponivel ? 'is-success' : 'is-warning'" role="status">
        <Radio v-if="leituraDisponivel" :size="16" aria-hidden="true" />
        <WifiOff v-else :size="16" aria-hidden="true" />
        {{ leituraDisponivel ? 'Leitura disponível' : 'Leitura indisponível' }}
      </span>
    </header>

    <section class="portaria-card atendimento" aria-labelledby="atendimento-titulo">
      <div class="portaria-card-topo">
        <h3 id="atendimento-titulo">Atendimento atual</h3>
        <span v-if="filaLPR.length" class="portaria-status is-neutral">
          {{ filaLPR.length }} na fila
        </span>
      </div>

      <div class="atendimento-grade">
        <div class="atendimento-conteudo">
          <div class="atendimento-estado" aria-live="polite">
            <span class="portaria-status" :class="estadoAtendimento.classe">
              <component :is="estadoAtendimento.icone" :size="16" aria-hidden="true" />
              {{ estadoAtendimento.rotulo }}
            </span>
            <p v-if="eventoLPR" class="atendimento-placa">{{ formatarPlaca(eventoLPR.placa) }}</p>
            <p v-else-if="leituraSemPlaca" class="atendimento-sem-placa">Nenhuma placa identificada</p>
            <p v-else class="atendimento-sem-placa">{{ leituraDisponivel ? 'Nenhum veículo em atendimento' : 'Leitura temporariamente indisponível' }}</p>
            <p v-if="eventoLPR || leituraSemPlaca" class="atendimento-hora">
              <Clock3 :size="16" aria-hidden="true" />
              {{ eventoLPR?.horaStr || leituraSemPlaca }}
            </p>
            <p class="atendimento-orientacao">{{ estadoAtendimento.orientacao }}</p>
          </div>

          <dl v-if="eventoLPR?.usuario || dadosVeiculo" class="atendimento-dados">
            <div v-if="eventoLPR?.usuario">
              <dt>Motorista</dt>
              <dd>{{ eventoLPR.usuario.nome }} <span v-if="eventoLPR.usuario.tipo">· {{ eventoLPR.usuario.tipo }}</span></dd>
            </div>
            <div v-if="dadosVeiculo">
              <dt>Veículo</dt>
              <dd>{{ dadosVeiculo }}</dd>
            </div>
          </dl>

          <div v-if="eventoLPR?.status === 'revisao'" class="portaria-acoes">
            <button class="portaria-botao is-primary" type="button" :disabled="registrandoAcesso"
              @click="acaoLiberarSemCadastro('entrada')">
              <ArrowDownLeft :size="19" aria-hidden="true" />
              Registrar entrada
            </button>
            <button class="portaria-botao" type="button" :disabled="registrandoAcesso"
              @click="acaoLiberarSemCadastro('saida')">
              <ArrowUpRight :size="19" aria-hidden="true" />
              Registrar saída
            </button>
          </div>

          <div v-else-if="eventoLPR?.status === 'desconhecido'" class="portaria-acoes">
            <button class="portaria-botao is-primary" type="button" :disabled="registrandoAcesso"
              @click="acaoCadastrarLiberar">
              Cadastrar e liberar
            </button>
            <button class="portaria-botao" type="button" :disabled="registrandoAcesso"
              @click="acaoLiberarSemCadastro()">
              Liberar sem cadastro
            </button>
          </div>
        </div>

        <figure v-if="imagemPlaca" class="atendimento-imagem">
          <img :src="imagemPlaca" alt="Recorte da placa no vídeo enviado" @error="imagemFalhou = true" />
          <figcaption>Recorte da leitura</figcaption>
        </figure>
        <div v-else class="atendimento-imagem is-empty">
          <ScanLine :size="34" aria-hidden="true" />
          <span>{{ eventoLPR || leituraSemPlaca ? 'Sem imagem desta leitura' : 'O recorte aparece quando disponível' }}</span>
        </div>
      </div>

      <div v-if="eventoLPR || leituraSemPlaca || mensagemRegistro || erroRegistro" class="atendimento-rodape">
        <p v-if="registrandoAcesso" role="status">Registrando acesso…</p>
        <p v-else-if="erroRegistro" class="portaria-erro" role="alert">{{ erroRegistro }}</p>
        <p v-else-if="mensagemRegistro" class="portaria-confirmacao" role="status">
          <CircleCheck :size="19" aria-hidden="true" /> {{ mensagemRegistro }}
        </p>
        <button v-if="eventoLPR || leituraSemPlaca" class="portaria-link" type="button"
          :disabled="registrandoAcesso" @click="resetarLeitura">
          Próximo veículo <ArrowRight :size="17" aria-hidden="true" />
        </button>
      </div>
    </section>

    <section class="portaria-card portaria-historico" aria-labelledby="historico-titulo" :aria-busy="carregandoHistorico">
      <div class="portaria-card-topo">
        <h3 id="historico-titulo">{{ historicoAberto ? 'Histórico de acessos' : 'Últimos acessos' }}</h3>
        <button class="portaria-link" type="button" :aria-expanded="historicoAberto"
          aria-controls="filtros-historico" @click="alternarHistorico">
          {{ historicoAberto ? 'Fechar histórico' : 'Ver histórico' }}
          <ChevronDown :size="17" :class="{ 'rotate-180': historicoAberto }" aria-hidden="true" />
        </button>
      </div>

      <div id="filtros-historico" v-show="historicoAberto" class="historico-filtros">
        <label>Buscar placa
          <input v-model.trim="buscaPlaca" type="search" maxlength="9" placeholder="Ex. ABC1D23" />
        </label>
        <label>Sentido
          <select v-model="filtroSentido">
            <option value="">Todos</option>
            <option value="entrada">Entrada</option>
            <option value="saida">Saída</option>
          </select>
        </label>
      </div>

      <p v-if="carregandoHistorico && !acessosVisiveis.length" class="historico-vazio" role="status">Carregando acessos…</p>
      <div v-else-if="erroHistorico" class="historico-vazio">
        <p role="alert">Não foi possível atualizar os acessos.</p>
        <button class="portaria-link" type="button" @click="fetchHistoricoSeguranca">Tentar novamente</button>
      </div>
      <p v-else-if="!acessosVisiveis.length" class="historico-vazio">
        {{ historicoAberto && (buscaPlaca || filtroSentido) ? 'Nenhum acesso para esses filtros.' : 'Nenhum acesso registrado.' }}
      </p>
      <table v-else class="historico-tabela">
        <thead>
          <tr><th scope="col">Placa</th><th scope="col">Horário</th><th scope="col">Sentido</th><th scope="col">Registro</th></tr>
        </thead>
        <tbody>
          <tr v-for="item in acessosVisiveis" :key="item.id">
            <td class="historico-placa">{{ formatarPlaca(item.placa) }}</td>
            <td class="historico-hora"><span v-if="item.data">{{ item.data.slice(0, 5) }} · </span>{{ item.hora.slice(0, 5) }}</td>
            <td><span class="historico-sentido">
              <ArrowDownLeft v-if="item.direcao === 'entrada'" :size="16" aria-hidden="true" />
              <ArrowUpRight v-else :size="16" aria-hidden="true" />
              {{ item.direcao === 'entrada' ? 'Entrada' : 'Saída' }}
            </span></td>
            <td class="historico-modo">{{ item.modo }}</td>
          </tr>
        </tbody>
      </table>
      <nav v-if="historicoAberto && (paginaHistorico > 1 || proximaPagina)" class="historico-paginacao"
        aria-label="Páginas do histórico">
        <button class="portaria-link" type="button" :disabled="paginaHistorico === 1 || carregandoHistorico"
          @click="mudarPagina(-1)">Anterior</button>
        <span>Página {{ paginaHistorico }}</span>
        <button class="portaria-link" type="button" :disabled="!proximaPagina || carregandoHistorico"
          @click="mudarPagina(1)">Próxima</button>
      </nav>
    </section>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import {
  ArrowDownLeft, ArrowUpRight, ArrowRight, ChevronDown, CircleCheck,
  Clock3, Radio, ScanLine, TriangleAlert, WifiOff,
} from 'lucide-vue-next'
import { fetchApi } from '../utils/api'
import { getAuthToken } from '@/utils/authStorage'
import { notify } from '@/utils/feedback'

const emit = defineEmits(['abrir-cadastro-rapido', 'acesso-registrado', 'limpar-resultado'])
const props = defineProps<{
  camada?: number
  visionResult?: {
    placa_recomendada?: string | null
    imagem_placa?: string
    status?: 'conhecido' | 'desconhecido' | 'revisao'
    isSaida?: boolean
  } | null
}>()
const camada = computed(() => props.camada ?? 1)
const visionResult = computed(() => props.visionResult ?? null)

interface EventoLPR {
  placa: string
  status: 'conhecido' | 'desconhecido' | 'revisao'
  isSaida?: boolean
  registrado?: boolean
  horaStr: string
  veiculo?: { marca: string; modelo: string; cor: string }
  usuario?: { nome: string; tipo: string }
}

interface RegistroHistorico {
  _id: string
  placa: string
  data?: string
  horaEntrada: string
  horaSaida?: string | null
  dataSaida?: string | null
  isManual: boolean
  saidaManual?: boolean | null
}

type Direcao = 'entrada' | 'saida'

interface AcessoHistorico {
  id: string
  placa: string
  data?: string
  hora: string
  direcao: Direcao
  modo: string
}

const eventoLPR = ref<EventoLPR | null>(null)
const leituraSemPlaca = ref('')
const imagemFalhou = ref(false)
const registrandoAcesso = ref(false)
const mensagemRegistro = ref('')
const erroRegistro = ref('')
let confirmacaoId: string | undefined
const filaLPR = ref<EventoLPR[]>([])
let eventSource: EventSource | null = null
const sseConectado = ref(false)
const workerOnline = ref(false)
let reconexaoTimer: number | null = null
let tentativasReconexao = 0
let workerHealthTimer: number | null = null
let avancoTimer: number | null = null
let ultimaConsultaHistorico = 0

const horaLocal = (data: Date) => data.toLocaleTimeString('pt-BR', {
  timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', second: '2-digit',
})

watch(
  visionResult,
  (resultado) => {
    if (camada.value !== 2) return
    confirmacaoId = undefined
    imagemFalhou.value = false
    leituraSemPlaca.value = ''
    erroRegistro.value = ''
    if (resultado) mensagemRegistro.value = ''
    if (!resultado?.placa_recomendada || !resultado.status) {
      eventoLPR.value = null
      if (resultado?.status) leituraSemPlaca.value = horaLocal(new Date())
      return
    }

    eventoLPR.value = {
      placa: resultado.placa_recomendada,
      status: resultado.status,
      isSaida: resultado.isSaida,
      horaStr: horaLocal(new Date()),
    }
  },
  { immediate: true },
)

const historico = ref<RegistroHistorico[]>([])
const historicoPaginado = ref<RegistroHistorico[]>([])
const historicoAberto = ref(false)
const paginaHistorico = ref(1)
const proximaPagina = ref(false)
const carregandoHistorico = ref(false)
const erroHistorico = ref(false)
const buscaPlaca = ref('')
const filtroSentido = ref<Direcao | ''>('')
const placasCadastradas = ref<string[]>([])

const leituraDisponivel = computed(() => camada.value === 2 ? workerOnline.value : sseConectado.value)
const imagemPlaca = computed(() => {
  const imagem = visionResult.value?.imagem_placa
  if (camada.value !== 2 || imagemFalhou.value || (!eventoLPR.value && !leituraSemPlaca.value)
    || typeof imagem !== 'string' || imagem.length > 80_023) return null
  return /^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(imagem) ? imagem : null
})
const dadosVeiculo = computed(() => {
  const veiculo = eventoLPR.value?.veiculo
  return veiculo ? [veiculo.marca, veiculo.modelo, veiculo.cor].filter(Boolean).join(' · ') : ''
})

const estadoAtendimento = computed(() => {
  switch (eventoLPR.value?.status) {
    case 'conhecido':
      if (!eventoLPR.value.registrado) {
        return {
          classe: 'is-success', icone: CircleCheck, rotulo: 'Placa reconhecida',
          orientacao: 'Placa identificada no controle de acesso.',
        }
      }
      return {
        classe: 'is-success', icone: CircleCheck, rotulo: 'Registrado',
        orientacao: eventoLPR.value.isSaida ? 'Saída registrada automaticamente.' : 'Entrada registrada automaticamente.',
      }
    case 'revisao':
      return {
        classe: 'is-warning', icone: TriangleAlert, rotulo: 'Em revisão',
        orientacao: 'Confira a placa e o sentido da passagem antes de registrar.',
      }
    case 'desconhecido':
      return {
        classe: 'is-warning', icone: TriangleAlert, rotulo: 'Placa não cadastrada',
        orientacao: 'Confira a passagem e escolha como registrar o acesso.',
      }
  }
  if (leituraSemPlaca.value) {
    return {
      classe: 'is-warning', icone: TriangleAlert, rotulo: 'Sem leitura de placa',
      orientacao: 'Confira o veículo na portaria. Nenhum acesso foi registrado.',
    }
  }
  return leituraDisponivel.value
    ? {
        classe: 'is-neutral', icone: Clock3, rotulo: 'Aguardando veículo',
        orientacao: 'As próximas leituras serão exibidas aqui.',
      }
    : {
        classe: 'is-warning', icone: WifiOff, rotulo: 'Aguardando conexão',
        orientacao: 'Acompanhe as passagens pela portaria enquanto a leitura estiver indisponível.',
      }
})

const acessosVisiveis = computed(() => {
  const modo = (manual?: boolean | null) => manual == null ? 'Não informado' : manual ? 'Manual' : 'Automático'
  const ordem = (item: AcessoHistorico) => `${item.data?.split('/').reverse().join('') ?? ''}${item.hora}`
  const acessos: AcessoHistorico[] = []
  const registros = historicoAberto.value ? historicoPaginado.value : historico.value
  for (const item of registros) {
    acessos.push({
      id: item._id + '-entrada', placa: item.placa, data: item.data,
      hora: item.horaEntrada, direcao: 'entrada', modo: modo(item.isManual),
    })
    if (item.horaSaida) {
      acessos.push({
        id: item._id + '-saida', placa: item.placa, data: item.dataSaida || item.data,
        hora: item.horaSaida, direcao: 'saida', modo: modo(item.saidaManual),
      })
    }
  }
  acessos.sort((a, b) => ordem(b).localeCompare(ordem(a)) || Number(b.direcao === 'saida') - Number(a.direcao === 'saida'))
  if (!historicoAberto.value) return acessos.slice(0, 5)
  return acessos.filter((item) => !filtroSentido.value || item.direcao === filtroSentido.value)
})

watch(camada, (novaCamada, camadaAnterior) => {
  if (novaCamada === camadaAnterior) return
  eventoLPR.value = null
  leituraSemPlaca.value = ''
  mensagemRegistro.value = ''
  erroRegistro.value = ''
  if (avancoTimer) window.clearTimeout(avancoTimer)
  if (novaCamada === 2) {
    verificarWorker()
    workerHealthTimer = window.setInterval(verificarWorker, 15000)
    if (reconexaoTimer) window.clearTimeout(reconexaoTimer)
    if (eventSource) eventSource.close()
    eventSource = null
    sseConectado.value = false
    pausarSimuladorRobo()
    filaLPR.value = []
  } else {
    workerOnline.value = false
    if (workerHealthTimer) window.clearInterval(workerHealthTimer)
    conectarSSE()
    iniciarSimuladorRobo()
  }
})

const verificarWorker = async () => {
  if (camada.value !== 2) return
  try {
    const resposta = await fetch(`${import.meta.env.VITE_VISION_WORKER_URL || 'http://localhost:8000'}/health`)
    workerOnline.value = resposta.ok
  } catch {
    workerOnline.value = false
  }
}

const formatarPlaca = (placa: string) => {
  if (/^[A-Z]{3}[0-9]{4}$/.test(placa)) {
    return `${placa.slice(0, 3)}-${placa.slice(3, 7)}`
  }
  return placa
}

const processarFila = () => {
  if (!eventoLPR.value && filaLPR.value.length > 0) {
    eventoLPR.value = filaLPR.value.shift() || null

    if (eventoLPR.value?.status === 'conhecido') {
      const exibido = eventoLPR.value
      emit('acesso-registrado', 'auto')
      fetchHistoricoSeguranca()

      avancoTimer = window.setTimeout(() => {
        if (eventoLPR.value === exibido) resetarLeitura()
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
    modoCadastro: true,
  })
}

const fetchHistoricoSeguranca = async () => {
  const consulta = ++ultimaConsultaHistorico
  carregandoHistorico.value = true
  erroHistorico.value = false
  try {
    const consultaPaginada = historicoAberto.value
    const parametros = new URLSearchParams({ ordem: 'atividade' })
    if (consultaPaginada) {
      parametros.set('pagina', String(paginaHistorico.value))
      parametros.set('placa', buscaPlaca.value)
      parametros.set('sentido', filtroSentido.value)
    }
    const res = await fetchApi(`/api/users/admin/acessos?${parametros}`)
    if (!res.ok) throw new Error('Histórico indisponível')
    const dados = await res.json()
    if (consulta !== ultimaConsultaHistorico) return
    if (consultaPaginada) {
      historicoPaginado.value = dados.registros
      proximaPagina.value = dados.proxima
    } else {
      historico.value = dados
    }
  } catch {
    if (consulta === ultimaConsultaHistorico) erroHistorico.value = true
  } finally {
    if (consulta === ultimaConsultaHistorico) carregandoHistorico.value = false
  }
}

let filtroTimer: number | undefined
const recarregarPagina = () => {
  window.clearTimeout(filtroTimer)
  historicoPaginado.value = []
  fetchHistoricoSeguranca()
}

const alternarHistorico = () => {
  historicoAberto.value = !historicoAberto.value
  paginaHistorico.value = 1
  proximaPagina.value = false
  recarregarPagina()
}

const mudarPagina = (delta: number) => {
  paginaHistorico.value += delta
  recarregarPagina()
}

watch([buscaPlaca, filtroSentido], () => {
  window.clearTimeout(filtroTimer)
  if (historicoAberto.value) {
    paginaHistorico.value = 1
    proximaPagina.value = false
    filtroTimer = window.setTimeout(recarregarPagina, 220)
  }
})

const acaoLiberarSemCadastro = async (direcao?: Direcao) => {
  const atendimento = eventoLPR.value
  if (!atendimento || registrandoAcesso.value) return
  if (atendimento.status !== (direcao ? 'revisao' : 'desconhecido')) return
  registrandoAcesso.value = true
  erroRegistro.value = ''
  mensagemRegistro.value = ''
  if (direcao) {
    confirmacaoId ??= Array.from(crypto.getRandomValues(new Uint8Array(16)),
      (byte) => byte.toString(16).padStart(2, '0')).join('')
  }

  try {
    const res = await fetchApi('/api/users/admin/acesso-manual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        placa: atendimento.placa,
        marca: atendimento.veiculo?.marca || 'Desconhecida',
        modelo: atendimento.veiculo?.modelo || 'Desconhecido',
        cor: atendimento.veiculo?.cor || 'Desconhecida',
        isModoPortaria: true,
        ...(direcao && { confirmacao_visao: { id: confirmacaoId, direcao } }),
      }),
    })

    const retorno = await res.json().catch(() => ({}))
    if (res.ok) {
      emit('acesso-registrado', 'manual')
      fetchHistoricoSeguranca()
      if (eventoLPR.value !== atendimento) return
      const sentido = retorno.direcao ?? direcao
      const horario = typeof retorno.hora === 'string' ? ` às ${retorno.hora.slice(0, 5)}` : ''
      const acao = sentido === 'saida' ? 'Saída registrada' : sentido === 'entrada' ? 'Entrada registrada' : 'Acesso registrado'
      resetarLeitura()
      mensagemRegistro.value = `${acao}${horario} · ${formatarPlaca(atendimento.placa)}`
    } else {
      if (eventoLPR.value === atendimento) erroRegistro.value = retorno.erro || 'Não foi possível registrar o acesso.'
    }
  } catch {
    if (eventoLPR.value === atendimento) erroRegistro.value = 'Falha de comunicação. Confira a conexão e tente novamente.'
  } finally {
    registrandoAcesso.value = false
  }
}

const resetarLeitura = () => {
  if (avancoTimer) window.clearTimeout(avancoTimer)
  avancoTimer = null
  eventoLPR.value = null
  leituraSemPlaca.value = ''
  erroRegistro.value = ''
  if (camada.value === 2 && visionResult.value) emit('limpar-resultado')
  processarFila()
}

const carregarPlacasReais = async () => {
  try {
    const res = await fetchApi('/api/users/placas-simulacao')
    if (res.ok) placasCadastradas.value = await res.json()
  } catch (e) {
    notify('Não foi possível carregar as placas para simulação.', 'error')
  }
}

const conectarSSE = () => {
  if (camada.value !== 1 || eventSource) return
  const token = getAuthToken() || ''

  eventSource = new EventSource(`/api/users/stream?token=${token}`)

  eventSource.onopen = () => {
    sseConectado.value = true
    tentativasReconexao = 0
  }

  eventSource.onerror = () => {
    sseConectado.value = false
    eventSource?.close()
    eventSource = null
    if (camada.value !== 1 || reconexaoTimer) return
    const atraso = Math.min(30000, 1000 * 2 ** tentativasReconexao)
    tentativasReconexao += 1
    reconexaoTimer = window.setTimeout(() => {
      reconexaoTimer = null
      conectarSSE()
    }, atraso)
  }

  eventSource.onmessage = (event) => {
    let data: {
      placa: string
      status: EventoLPR['status']
      timestamp: string
      isSaida?: boolean
      registrado?: boolean
      marca?: string
      modelo?: string
      cor?: string
      motorista?: { nome: string; tipo: string }
    }
    try {
      data = JSON.parse(event.data)
    } catch {
      notify('A câmera enviou um evento inválido.', 'error')
      return
    }

    filaLPR.value.push({
      placa: data.placa,
      status: data.status,
      isSaida: data.isSaida,
      registrado: data.registrado,
      horaStr: horaLocal(new Date(data.timestamp)),
      veiculo: { marca: data.marca ?? '', modelo: data.modelo ?? '', cor: data.cor ?? '' },
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

const gerarCarroAleatorio = () => {
  const baseModelos: Record<string, string[]> = {
    Chevrolet: ['Onix', 'Prisma', 'Cruze', 'Tracker', 'S10', 'Celta', 'Corsa'],
    Fiat: ['Uno', 'Palio', 'Mobi', 'Argo', 'Cronos', 'Toro', 'Strada', 'Idea'],
    Volkswagen: ['Gol', 'Fox', 'Polo', 'Virtus', 'T-Cross', 'Nivus', 'Saveiro', 'Jetta'],
    Ford: ['Ka', 'Fiesta', 'Focus', 'EcoSport', 'Ranger'],
    Toyota: ['Corolla', 'Etios', 'Yaris', 'Hilux', 'SW4'],
    Honda: ['Civic', 'Fit', 'City', 'HR-V'],
    Renault: ['Sandero', 'Logan', 'Duster', 'Kwid', 'Fluence'],
    Hyundai: ['HB20', 'HB20S', 'Creta', 'Tucson', 'I30'],
  }

  const cores = ['Branco', 'Preto', 'Cinza', 'Prata', 'Vermelho', 'Azul', 'Verde', 'Amarelo']

  const marcas = Object.keys(baseModelos)
  const marcaSorteada = marcas[Math.floor(Math.random() * marcas.length)] || 'Chevrolet'

  const modelosDaMarca = baseModelos[marcaSorteada] || ['Onix']
  const modeloSorteado = modelosDaMarca[Math.floor(Math.random() * modelosDaMarca.length)] || 'Onix'

  const corSorteada = cores[Math.floor(Math.random() * cores.length)]

  return {
    marca: marcaSorteada,
    modelo: modeloSorteado,
    cor: corSorteada,
  }
}

let simuladorInterval: any = null
const simuladorAtivo = ref(false)

const iniciarSimuladorRobo = () => {
  if (simuladorInterval || camada.value !== 1) return

  simuladorInterval = setInterval(() => {
    if (filaLPR.value.length < 2 && !eventoLPR.value) {
      let placaAlvo = gerarPlacaAleatoria()
      const carroMock = gerarCarroAleatorio()

      const carrosDentro = historico.value.filter((h) => !h.horaSaida && h.placa)

      const chance = Math.random()

      if (carrosDentro.length > 0 && chance < 0.4) {
        const indexAleatorio = Math.floor(Math.random() * carrosDentro.length)
        const carroSorteado = carrosDentro[indexAleatorio]

        if (carroSorteado?.placa) {
          placaAlvo = carroSorteado.placa
        }
      } else if (placasCadastradas.value.length > 0 && chance < 0.8) {
        const indexAleatorio = Math.floor(Math.random() * placasCadastradas.value.length)
        placaAlvo = placasCadastradas.value[indexAleatorio] || placaAlvo
      }

      fetchApi('/api/users/evento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placa: placaAlvo,
          marca: carroMock.marca,
          modelo: carroMock.modelo,
          cor: carroMock.cor,
        }),
      }).catch(() => notify('Falha ao simular a leitura da placa.', 'error'))
    }
  }, 10000)
  simuladorAtivo.value = true
}

const pausarSimuladorRobo = () => {
  if (simuladorInterval) clearInterval(simuladorInterval)
  simuladorInterval = null
  simuladorAtivo.value = false
}

const alternarSimuladorRobo = () => {
  if (simuladorAtivo.value) {
    pausarSimuladorRobo()
  } else {
    iniciarSimuladorRobo()
  }
}

onMounted(() => {
  fetchHistoricoSeguranca()
  if (camada.value === 1) {
    carregarPlacasReais()
    conectarSSE()
    iniciarSimuladorRobo()
  } else {
    verificarWorker()
    workerHealthTimer = window.setInterval(verificarWorker, 15000)
  }
})

onUnmounted(() => {
  if (eventSource) {
    eventSource.close()
    sseConectado.value = false
  }
  if (reconexaoTimer) window.clearTimeout(reconexaoTimer)
  if (workerHealthTimer) window.clearInterval(workerHealthTimer)
  if (avancoTimer) window.clearTimeout(avancoTimer)
  window.clearTimeout(filtroTimer)
  pausarSimuladorRobo()
})

defineExpose({
  resetarLeitura,
  fetchHistoricoSeguranca,
  alternarSimuladorRobo,
  simuladorAtivo,
})
</script>

<style scoped>
.portaria {
  display: flex;
  flex-direction: column;
  gap: 20px;
  color: #342216;
}

.portaria-cabecalho,
.portaria-card-topo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.portaria-cabecalho {
  min-height: 68px;
}

.portaria-cabecalho h2 {
  color: var(--color-carcara-marrom);
  font-family: var(--font-serif);
  font-size: clamp(2rem, 2.8vw, 2.65rem);
  font-weight: 700;
  line-height: 1.15;
}

.portaria-cabecalho p,
.atendimento-orientacao {
  color: #625247;
  font-size: 0.94rem;
  line-height: 1.55;
}

.portaria-cabecalho p {
  margin-top: 4px;
}

.portaria-card {
  overflow: hidden;
  background: #fff;
  border: 1px solid #ead9cc;
  border-radius: 22px;
  box-shadow: 0 6px 20px rgb(74 46 27 / 5%);
}

.portaria-card-topo {
  min-height: 62px;
  padding: 10px 24px;
  border-bottom: 1px solid #eee2d8;
}

.portaria-card-topo h3 {
  color: var(--color-carcara-marrom);
  font-size: 1.12rem;
  font-weight: 750;
}

.portaria-status {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  gap: 7px;
  border: 1px solid transparent;
  border-radius: 999px;
  padding: 5px 11px;
  font-size: 0.835rem;
  font-weight: 700;
  line-height: 1.3;
}

.portaria-status.is-neutral {
  background: #f6eee8;
  border-color: #ead9cc;
  color: #594133;
}

.portaria-status.is-success {
  background: #e9f5ed;
  border-color: #c9e5d1;
  color: #235b37;
}

.portaria-status.is-warning {
  background: #fff2d7;
  border-color: #efd59a;
  color: #714606;
}

.atendimento-grade {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
  gap: clamp(24px, 3vw, 44px);
  align-items: start;
  padding: clamp(22px, 2.5vw, 34px) 24px;
}

.atendimento-conteudo {
  display: grid;
  align-content: start;
  gap: 18px;
}

.atendimento-placa,
.atendimento-sem-placa {
  overflow-wrap: anywhere;
  margin: 11px 0 4px;
  color: #342216;
  font-weight: 800;
  line-height: 1.12;
}

.atendimento-placa {
  font-size: clamp(2.5rem, 4.25vw, 4.25rem);
  letter-spacing: 0.045em;
  font-variant-numeric: tabular-nums;
}

.atendimento-sem-placa {
  max-width: 24ch;
  font-size: clamp(1.45rem, 2.35vw, 2.05rem);
}

.atendimento-hora,
.historico-sentido {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.atendimento-hora {
  margin-top: 6px;
  color: #625247;
  font-size: 0.9rem;
  font-variant-numeric: tabular-nums;
}

.atendimento-orientacao {
  margin-top: 10px;
}

.atendimento-dados {
  display: grid;
  gap: 9px;
  font-size: 0.88rem;
}

.atendimento-dados dt {
  color: #625247;
  font-weight: 650;
}

.atendimento-dados dd {
  font-weight: 600;
}

.atendimento-imagem {
  min-width: 0;
  min-height: 176px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  border: 1px solid #eee2d8;
  border-radius: 16px;
  padding: 16px;
  background: #faf5f0;
  color: #625247;
  text-align: center;
  font-size: 0.875rem;
}

.atendimento-imagem img {
  display: block;
  width: 100%;
  max-height: 158px;
  object-fit: contain;
}

.atendimento-imagem.is-empty {
  align-items: center;
}

.atendimento-imagem.is-empty svg {
  color: #9a694b;
}

.portaria-acoes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 174px), 1fr));
  gap: 12px;
}

.portaria-botao,
.portaria-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  cursor: pointer;
  font-weight: 700;
}

.portaria-botao {
  min-height: 50px;
  border: 1px solid #c6916b;
  border-radius: 12px;
  padding: 9px 13px;
  color: #683718;
  background: #fff;
}

.portaria-botao.is-primary {
  background: var(--color-carcara-laranja);
  color: #27150a;
  border-color: var(--color-carcara-laranja);
}

.portaria-botao:hover:not(:disabled) {
  background: #fff0e4;
}

.portaria-botao.is-primary:hover:not(:disabled) {
  background: #f06e12;
}

.portaria-link {
  color: #8a3b09;
  font-size: 0.9rem;
  padding: 4px 6px;
}

.portaria-link:hover:not(:disabled) {
  text-decoration: underline;
}

.portaria button:disabled {
  cursor: wait;
  opacity: 0.6;
}

.portaria :is(button, input, select):focus-visible {
  outline: 3px solid #97613f;
  outline-offset: 3px;
}

.atendimento-rodape {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px 16px;
  min-height: 52px;
  padding: 5px 24px;
  border-top: 1px solid #eee2d8;
  color: #625247;
  font-size: 0.9rem;
}

.atendimento-rodape button {
  margin-left: auto;
}

.portaria-confirmacao {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #235b37;
  font-weight: 700;
}

.portaria-erro {
  color: #a12d23;
}

.historico-filtros {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 16px 24px;
  background: #faf5f0;
}

.historico-filtros label {
  display: grid;
  gap: 4px;
  color: #594133;
  font-size: 0.875rem;
  font-weight: 650;
}

.historico-paginacao {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  border-top: 1px solid #eee2d8;
  padding: 6px 16px;
  color: #625247;
  font-size: 0.875rem;
}

.historico-filtros :is(input, select) {
  min-height: 44px;
  border: 1px solid #cfae98;
  border-radius: 9px;
  background: #fff;
  padding: 8px 10px;
  color: #342216;
}

.historico-vazio {
  padding: 22px 24px;
  color: #625247;
  font-size: 0.925rem;
}

.historico-tabela {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.875rem;
}

.historico-tabela th,
.historico-tabela td {
  padding: 12px 8px;
  vertical-align: middle;
}

.historico-tabela th:first-child,
.historico-tabela td:first-child {
  padding-left: 24px;
}

.historico-tabela th:last-child,
.historico-tabela td:last-child {
  padding-right: 24px;
}

.historico-tabela th {
  background: #faf5f0;
  color: #625247;
  font-weight: 700;
}

.historico-tabela tr + tr td {
  border-top: 1px solid #eee2d8;
}

.historico-placa {
  font-weight: 750;
}

.historico-hora,
.historico-modo {
  color: #625247;
  font-variant-numeric: tabular-nums;
}

.historico-sentido svg {
  color: #8a3b09;
}

@media (max-width: 680px) {
  .atendimento-grade {
    grid-template-columns: minmax(0, 1fr);
    gap: 18px;
  }

  .atendimento-conteudo {
    display: contents;
  }

  .atendimento-imagem {
    min-height: 112px;
    order: 1;
  }

  .atendimento-dados {
    order: 2;
  }

  .portaria-acoes {
    order: 3;
  }

  .portaria-card-topo,
  .atendimento-grade,
  .atendimento-rodape,
  .historico-vazio,
  .historico-filtros {
    padding-right: 16px;
    padding-left: 16px;
  }

  .historico-tabela {
    font-size: 0.8rem;
  }

  .historico-tabela th:first-child,
  .historico-tabela td:first-child {
    padding-left: 12px;
  }

  .historico-tabela th:last-child,
  .historico-tabela td:last-child {
    padding-right: 12px;
  }

  .historico-hora span {
    display: block;
  }
}
</style>

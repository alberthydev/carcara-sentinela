<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn"
  >
    <div
      class="w-full max-w-[500px] bg-white rounded-3xl p-8 shadow-xl flex flex-col gap-6 text-left border border-gray-100 relative max-h-[90vh] overflow-y-auto"
    >
      <div class="flex items-center justify-between sticky top-0 bg-white z-10 pb-2">
        <h3 class="text-xl font-bold text-[#1E0D01] flex items-center gap-3">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FD7917"
            stroke-width="2.5"
          >
            <rect x="3" y="8" width="18" height="12" rx="2" ry="2"></rect>
            <path d="M16 8v-2a4 4 0 0 0-8 0v2"></path>
          </svg>
          {{
            isAgendamento
              ? 'Agendar Visita'
              : isModoPortaria
                ? 'Liberação Manual'
                : 'Cadastrar Veículo'
          }}
        </h3>
        <button @click="fecharModal" class="text-gray-400 hover:text-[#FD7917] text-xl font-bold">
          &times;
        </button>
      </div>

      <form @submit.prevent="handleCadastro" class="flex flex-col gap-4">
        <template v-if="isAgendamento">
          <h4
            class="text-xs font-bold text-[#FD7917] tracking-wider mb-2 uppercase flex items-center gap-2"
          >
            <span class="w-full h-px bg-[#FDEEE8] flex-1"></span>Dados da Visita<span
              class="w-full h-px bg-[#FDEEE8] flex-1"
            ></span>
          </h4>

          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-1">
              <label class="text-xs font-bold text-[#1E0D01]">Data</label>
              <input
                v-model="form.dataVisita"
                @input="aplicarMascaraData"
                type="text"
                maxlength="10"
                placeholder="DD/MM/AAAA"
                class="w-full h-[46px] px-4 border border-[#F79347] rounded-xl text-sm focus:outline-none transition-all placeholder:text-gray-300"
                required
              />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs font-bold text-[#1E0D01]">Horário Estimado</label>
              <input
                v-model="form.horaVisita"
                @input="aplicarMascaraHora"
                type="text"
                maxlength="5"
                placeholder="HH:MM"
                class="w-full h-[46px] px-4 border border-[#F79347] rounded-xl text-sm focus:outline-none transition-all placeholder:text-gray-300"
                required
              />
            </div>
          </div>
        </template>

        <template v-if="isModoPortaria">
          <h4
            class="text-xs font-bold text-[#FD7917] tracking-wider mt-2 mb-1 uppercase flex items-center gap-2"
          >
            <span class="w-full h-px bg-[#FDEEE8] flex-1"></span>Dados do Condutor<span
              class="w-full h-px bg-[#FDEEE8] flex-1"
            ></span>
          </h4>

          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-1">
              <label class="text-xs font-bold text-[#1E0D01]">Nome do Motorista</label>
              <input
                v-model="form.nomeMotorista"
                type="text"
                placeholder="Ex: João da Silva"
                class="w-full h-[46px] px-4 border border-[#F79347] rounded-xl text-sm focus:outline-none transition-all placeholder:text-gray-300"
                required
              />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs font-bold text-[#1E0D01]">Vínculo/Tipo</label>
              <select
                v-model="form.tipoMotorista"
                class="w-full h-[46px] px-4 border border-[#F79347] rounded-xl text-sm bg-white focus:outline-none cursor-pointer"
                required
              >
                <option value="" disabled selected>Selecione o vínculo</option>
                <option value="Visitante">Visitante</option>
                <option value="Terceirizado">Terceirizado</option>
                <option value="Entrega/App">Entrega/App</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
          </div>
        </template>

        <h4
          class="text-xs font-bold text-[#FD7917] tracking-wider mt-2 mb-1 uppercase flex items-center gap-2"
        >
          <span class="w-full h-px bg-[#FDEEE8] flex-1"></span>Dados do Veículo<span
            class="w-full h-px bg-[#FDEEE8] flex-1"
          ></span>
        </h4>

        <div class="grid grid-cols-[1.5fr_1fr] gap-4">
          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-[#1E0D01]">Placa</label>
            <input
              v-model="form.placa"
              @input="form.placa = form.placa.toUpperCase()"
              type="text"
              maxlength="7"
              placeholder="ABC1D23"
              class="w-full h-[46px] px-4 border border-[#F79347] rounded-xl text-sm focus:outline-none uppercase placeholder:text-gray-300"
              required
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-[#1E0D01]">Cor</label>
            <select
              v-model="form.cor"
              class="w-full h-[46px] px-4 border border-[#F79347] rounded-xl text-sm bg-white focus:outline-none cursor-pointer"
              required
            >
              <option value="" disabled selected>Selecione a cor</option>
              <option v-for="cor in listaCores" :key="cor" :value="cor">{{ cor }}</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-[#1E0D01]">Marca</label>
            <select
              v-model="form.marca"
              @change="handleMarcaChange"
              class="w-full h-[46px] px-4 border border-[#F79347] rounded-xl text-sm bg-white focus:outline-none cursor-pointer"
              required
            >
              <option value="" disabled selected>Selecione a marca</option>
              <option v-for="marca in listaMarcas" :key="marca" :value="marca">{{ marca }}</option>
            </select>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-[#1E0D01]">Modelo</label>
            <select
              v-model="form.modelo"
              :disabled="!form.marca"
              class="w-full h-[46px] px-4 border border-[#F79347] rounded-xl text-sm bg-white focus:outline-none disabled:bg-gray-50 disabled:border-gray-200 disabled:text-gray-300 cursor-pointer"
              required
            >
              <option value="" disabled selected>Selecione o modelo</option>
              <option v-for="modelo in modelosFiltrados" :key="modelo" :value="modelo">
                {{ modelo }}
              </option>
            </select>
          </div>
        </div>

        <div class="flex items-center gap-4 mt-4">
          <button
            type="button"
            @click="fecharModal"
            class="flex-1 h-[44px] border border-[#F79347] text-[#F79347] font-semibold rounded-full text-sm hover:bg-[#FDEEE8] transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="!formValido"
            :class="[
              'flex-1 h-[44px] font-semibold rounded-full text-sm transition-all cursor-pointer',
              formValido
                ? 'bg-gradient-to-r from-[#FD7917] to-[#F79347] text-white shadow-md hover:opacity-95'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed',
            ]"
          >
            {{
              isAgendamento
                ? 'Confirmar Agendamento'
                : isModoPortaria
                  ? 'Liberar Acesso'
                  : 'Cadastrar Carro'
            }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{ isOpen: boolean; tipoUsuarioVisualizando: string }>()
const emit = defineEmits(['close', 'save'])

const isAgendamento = computed(() => props.tipoUsuarioVisualizando === 'visitante')
const isModoPortaria = computed(() => props.tipoUsuarioVisualizando === 'seguranca')

const form = ref({
  placa: '',
  marca: '',
  modelo: '',
  cor: '',
  dataVisita: '',
  horaVisita: '',
  nomeMotorista: '',
  tipoMotorista: '',
})

const listaCores = ref([
  'Branco',
  'Preto',
  'Cinza',
  'Prata',
  'Vermelho',
  'Azul',
  'Verde',
  'Amarelo',
])
const listaMarcas = ref([
  'Chevrolet',
  'Fiat',
  'Volkswagen',
  'Ford',
  'Toyota',
  'Honda',
  'Renault',
  'Hyundai',
])
const baseModelos = ref<Record<string, string[]>>({
  Chevrolet: ['Onix', 'Prisma', 'Cruze', 'Tracker', 'S10', 'Celta', 'Corsa'],
  Fiat: ['Uno', 'Palio', 'Mobi', 'Argo', 'Cronos', 'Toro', 'Strada', 'Idea'],
  Volkswagen: ['Gol', 'Fox', 'Polo', 'Virtus', 'T-Cross', 'Nivus', 'Saveiro', 'Jetta'],
  Ford: ['Ka', 'Fiesta', 'Focus', 'EcoSport', 'Ranger'],
  Toyota: ['Corolla', 'Etios', 'Yaris', 'Hilux', 'SW4'],
  Honda: ['Civic', 'Fit', 'City', 'HR-V'],
  Renault: ['Sandero', 'Logan', 'Duster', 'Kwid', 'Fluence'],
  Hyundai: ['HB20', 'HB20S', 'Creta', 'Tucson', 'I30'],
})

const aplicarMascaraData = (event: Event) => {
  const input = event.target as HTMLInputElement
  let valor = input.value.replace(/\D/g, '')
  if (valor.length > 8) valor = valor.slice(0, 8)
  valor = valor.replace(/(\d{2})(\d)/, '$1/$2')
  valor = valor.replace(/(\d{2})(\d)/, '$1/$2')
  form.value.dataVisita = valor
}

const aplicarMascaraHora = (event: Event) => {
  const input = event.target as HTMLInputElement
  let valor = input.value.replace(/\D/g, '')
  if (valor.length > 4) valor = valor.slice(0, 4)
  valor = valor.replace(/(\d{2})(\d)/, '$1:$2')
  form.value.horaVisita = valor
}

const modelosFiltrados = computed(() => {
  return form.value.marca ? baseModelos.value[form.value.marca] || [] : []
})

const formValido = computed(() => {
  const veiculoValido =
    form.value.placa.length >= 7 && form.value.marca && form.value.modelo && form.value.cor

  if (isAgendamento.value) {
    return (
      veiculoValido && form.value.dataVisita.length === 10 && form.value.horaVisita.length === 5
    )
  }

  if (isModoPortaria.value) {
    return (
      veiculoValido && form.value.nomeMotorista.trim().length > 0 && form.value.tipoMotorista !== ''
    )
  }

  return veiculoValido
})

const handleMarcaChange = () => {
  form.value.modelo = ''
}

const fecharModal = () => {
  form.value = {
    placa: '',
    marca: '',
    modelo: '',
    cor: '',
    dataVisita: '',
    horaVisita: '',
    nomeMotorista: '',
    tipoMotorista: '',
  }
  emit('close')
}

const handleCadastro = () => {
  emit('save', {
    ...form.value,
    isAgendamento: isAgendamento.value,
    isModoPortaria: isModoPortaria.value,
  })
  fecharModal()
}
</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.2s ease-out forwards;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #fdeee8;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #f79347;
}
</style>

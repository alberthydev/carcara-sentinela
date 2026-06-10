<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn"
  >
    <div
      class="w-full max-w-[500px] bg-white rounded-3xl p-8 shadow-[0px_10px_40px_rgba(0,0,0,0.1)] flex flex-col gap-6 text-left border border-gray-100 relative"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FD7917"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="3" y="8" width="18" height="12" rx="2" ry="2"></rect>
            <path d="M16 8v-2a4 4 0 0 0-8 0v2"></path>
          </svg>
          <h3 class="text-xl font-bold text-[#1E0D01]">Cadastrar Veículo</h3>
        </div>
        <button
          @click="fecharModal"
          class="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer text-xl font-bold"
        >
          &times;
        </button>
      </div>

      <form @submit.prevent="handleCadastro" class="flex flex-col gap-4">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-[#1E0D01]">Placa</label>
          <input
            v-model="form.placa"
            @input="formatarPlaca"
            type="text"
            maxlength="7"
            placeholder="Ex: ABC1D23 ou ABC1234"
            class="w-full h-[46px] px-4 border border-[#F79347] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F79347]/20 transition-all uppercase placeholder:text-gray-300"
            required
          />
          <span class="text-[10px] text-gray-400"
            >Padrão Mercosul (ABC1D23) ou Antigo (ABC1234)</span
          >
        </div>

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

        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-[#1E0D01]">Ano</label>
          <select
            v-model="form.ano"
            class="w-full h-[46px] px-4 border border-[#F79347] rounded-xl text-sm bg-white focus:outline-none cursor-pointer"
            required
          >
            <option value="" disabled selected>Selecione o ano</option>
            <option v-for="ano in listaAnos" :key="ano" :value="ano">{{ ano }}</option>
          </select>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-[#1E0D01]">Cor Predominante</label>
          <select
            v-model="form.cor"
            class="w-full h-[46px] px-4 border border-[#F79347] rounded-xl text-sm bg-white focus:outline-none cursor-pointer"
            required
          >
            <option value="" disabled selected>Selecione a cor</option>
            <option v-for="cor in listaCores" :key="cor" :value="cor">{{ cor }}</option>
          </select>
        </div>

        <div class="flex items-center gap-4 mt-4">
          <button
            type="button"
            @click="fecharModal"
            class="flex-1 h-[44px] border border-[#F79347] text-[#F79347] font-semibold rounded-full text-center text-sm bg-white hover:bg-[#FDEEE8] transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="submit"
            :disabled="!formValido"
            :class="[
              'flex-1 h-[44px] font-semibold rounded-full text-center text-sm transition-all cursor-pointer',
              formValido
                ? 'bg-gradient-to-r from-[#FD7917] to-[#F79347] text-white shadow-[0px_4px_12px_rgba(253,121,23,0.2)] hover:opacity-95'
                : 'bg-gray-100 text-gray-300 cursor-not-allowed',
            ]"
          >
            Cadastrar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits(['close', 'save'])

const form = ref({
  placa: '',
  marca: '',
  modelo: '',
  ano: '',
  cor: '',
})

const listaMarcas = [
  'Chevrolet',
  'Fiat',
  'Volkswagen',
  'Ford',
  'Toyota',
  'Honda',
  'Renault',
  'Hyundai',
]

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

const listaCores = ['Branco', 'Preto', 'Cinza', 'Prata', 'Vermelho', 'Azul', 'Verde', 'Amarelo']

const listaAnos = computed(() => {
  const anoAtual = new Date().getFullYear()
  const anos = []
  for (let i = anoAtual; i >= 1990; i--) {
    anos.push(i.toString())
  }
  return anos
})

const modelosFiltrados = computed(() => {
  return form.value.marca ? baseModelos[form.value.marca] || [] : []
})

const formValido = computed(() => {
  return (
    form.value.placa.length >= 7 &&
    form.value.marca &&
    form.value.modelo &&
    form.value.ano &&
    form.value.cor
  )
})

const formatarPlaca = () => {
  form.value.placa = form.value.placa.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

const handleMarcaChange = () => {
  form.value.modelo = ''
}

const fecharModal = () => {
  form.value = { placa: '', marca: '', modelo: '', ano: '', cor: '' }
  emit('close')
}

const handleCadastro = () => {
  if (formValido.value) {
    emit('save', { ...form.value })
    fecharModal()
  }
}
</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.2s ease-out forwards;
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>

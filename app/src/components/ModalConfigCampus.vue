<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
    <div class="w-full max-w-[400px] bg-white rounded-3xl p-8 shadow-xl flex flex-col gap-6 text-left border border-gray-100 relative">
      <div class="flex items-center justify-between">
        <h3 class="text-xl font-bold text-[#1E0D01]">Configurações do Campus</h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer text-xl font-bold">&times;</button>
      </div>

      <form @submit.prevent="salvar" class="flex flex-col gap-4">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-[#1E0D01]">Capacidade Total de Vagas</label>
          <input
            v-model="vagas"
            type="number"
            min="1"
            class="w-full h-[46px] px-4 border border-[#F79347] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F79347]/20 transition-all"
            required
          />
        </div>

        <div class="flex items-center gap-4 mt-2">
          <button type="button" @click="$emit('close')" class="flex-1 h-[44px] border border-[#F79347] text-[#F79347] font-semibold rounded-full text-sm bg-white hover:bg-[#FDEEE8] transition-colors">Cancelar</button>
          <button type="submit" class="flex-1 h-[44px] bg-gradient-to-r from-[#FD7917] to-[#F79347] text-white font-semibold rounded-full text-sm shadow-md hover:opacity-95 transition-all">Salvar</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{ isOpen: boolean, vagasAtuais: number }>()
const emit = defineEmits(['close', 'save'])
const vagas = ref(props.vagasAtuais)

watch(() => props.isOpen, (novo) => { if (novo) vagas.value = props.vagasAtuais })

const salvar = () => {
  emit('save', vagas.value)
}
</script>
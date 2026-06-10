<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn"
  >
    <div
      class="w-full max-w-[460px] bg-white rounded-3xl p-8 shadow-[0px_10px_40px_rgba(0,0,0,0.1)] border border-gray-100 text-left relative max-h-[90vh] overflow-y-auto"
    >
      <div class="flex items-center gap-3 mb-6">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#FD7917"
          stroke-width="2.5"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
        <h3 class="text-xl font-bold text-[#1E0D01]">Perfil do Usuário</h3>
      </div>

      <div v-if="!isEditing" class="flex flex-col gap-5">
        <div class="flex justify-center my-2">
          <div
            class="w-24 h-24 rounded-full border-2 border-[#F79347] flex items-center justify-center text-[#F79347] bg-[#FAFBFC]"
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <div>
            <p class="text-xs font-bold text-[#1E0D01]">CPF</p>
            <p class="text-sm text-gray-500 mt-0.5">123.456.789-00</p>
          </div>
          <div>
            <p class="text-xs font-bold text-[#1E0D01]">Nome</p>
            <p class="text-sm text-gray-500 mt-0.5">{{ dadosUser.nome }}</p>
          </div>
          <div>
            <p class="text-xs font-bold text-[#1E0D01]">Sobrenome</p>
            <p class="text-sm text-gray-500 mt-0.5">{{ dadosUser.sobrenome }}</p>
          </div>
          <div>
            <p class="text-xs font-bold text-[#1E0D01]">Matrícula</p>
            <p class="text-sm text-gray-500 mt-0.5">20231001</p>
          </div>
          <div>
            <p class="text-xs font-bold text-[#1E0D01]">Senha</p>
            <p class="text-sm text-gray-400 tracking-widest mt-0.5">••••••••</p>
          </div>
        </div>

        <div class="flex gap-4 mt-4">
          <button
            @click="$emit('close')"
            class="flex-1 h-[44px] border border-[#F79347] text-[#F79347] font-semibold rounded-full text-sm bg-white hover:bg-[#FDEEE8] transition-colors cursor-pointer"
          >
            Fechar
          </button>
          <button
            @click="isEditing = true"
            class="flex-1 h-[44px] bg-gradient-to-r from-[#FD7917] to-[#F79347] text-white font-semibold rounded-full text-sm hover:opacity-95 shadow-[0px_4px_12px_rgba(253,121,23,0.2)] cursor-pointer"
          >
            Editar
          </button>
        </div>
      </div>

      <form v-else @submit.prevent="salvarEdicao" class="flex flex-col gap-4">
        <div class="flex flex-col items-center gap-1.5 my-1">
          <div
            class="w-20 h-20 rounded-full bg-gray-400 border border-gray-300 flex flex-col items-center justify-center text-white text-[10px] font-bold cursor-pointer hover:opacity-90 relative overflow-hidden"
          >
            <span>Alterar Foto</span>
          </div>
          <span class="text-[9px] text-gray-400">PNG, JPG, JPEG, Máx. 5MB</span>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-[#1E0D01]">CPF</label>
          <input
            type="text"
            value="123.456.789-00"
            disabled
            class="w-full h-[44px] px-4 bg-gray-50 border border-gray-200 text-gray-400 rounded-xl text-sm focus:outline-none"
          />
          <span class="text-[9px] text-gray-400"
            >O CPF é o identificador e não pode ser alterado.</span
          >
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-[#1E0D01]">Matrícula</label>
          <input
            type="text"
            value="20231001"
            disabled
            class="w-full h-[44px] px-4 bg-gray-50 border border-gray-200 text-gray-400 rounded-xl text-sm focus:outline-none"
          />
          <span class="text-[9px] text-gray-400"
            >A matrícula é vinculada ao identificador institucional.</span
          >
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-[#1E0D01]">Nome</label>
          <input
            v-model="dadosUser.nome"
            type="text"
            class="w-full h-[44px] px-4 border border-[#F79347] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F79347]/10"
            required
          />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-[#1E0D01]">Sobrenome</label>
          <input
            v-model="dadosUser.sobrenome"
            type="text"
            class="w-full h-[44px] px-4 border border-[#F79347] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F79347]/10"
            required
          />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-[#1E0D01]">Nova Senha</label>
          <input
            v-model="dadosUser.novaSenha"
            type="password"
            placeholder="Deixe em branco para manter"
            class="w-full h-[44px] px-4 border border-[#F79347] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F79347]/10"
          />
          <span class="text-[9px] text-gray-400"
            >8+ caracteres - 1 maiúscula - 1 minúscula - 1 número - 1 especial</span
          >
        </div>

        <div class="flex gap-4 mt-3">
          <button
            type="button"
            @click="isEditing = false"
            class="flex-1 h-[44px] border border-[#F79347] text-[#F79347] font-semibold rounded-full text-sm bg-white hover:bg-[#FDEEE8] transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="flex-1 h-[44px] bg-gradient-to-r from-[#FD7917] to-[#F79347] text-white font-semibold rounded-full text-sm hover:opacity-95 shadow-[0px_4px_12px_rgba(253,121,23,0.2)] cursor-pointer"
          >
            Salvar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ isOpen: boolean }>()
const emit = defineEmits(['close', 'atualizar'])

const isEditing = ref(false)

const dadosUser = ref({
  nome: 'João',
  sobrenome: 'Silva',
  novaSenha: '',
})

const salvarEdicao = () => {
  emit('atualizar', { ...dadosUser.value })
  isEditing.value = false
  emit('close')
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
    <div class="w-full max-w-[460px] bg-white rounded-3xl p-8 shadow-[0px_10px_40px_rgba(0,0,0,0.1)] border border-gray-100 text-left relative max-h-[90vh] overflow-y-auto">
      
      <div class="flex items-center gap-3 mb-6">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FD7917" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        <h3 class="text-xl font-bold text-[#1E0D01]">Perfil do Usuário</h3>
      </div>

      <div v-if="!isEditing" class="flex flex-col gap-5">
        <div class="flex justify-center my-2">
          <div class="w-24 h-24 rounded-full border-2 border-[#F79347] flex items-center justify-center text-[#F79347] bg-[#FAFBFC] overflow-hidden">
            <img v-if="usuarioLogado?.fotoUrl" :src="usuarioLogado.fotoUrl" class="w-full h-full object-cover" />
            <svg v-else width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <div>
            <p class="text-xs font-bold text-[#1E0D01]">CPF</p>
            <p class="text-sm text-gray-500 mt-0.5">{{ dadosUser.cpf }}</p>
          </div>
          <div>
            <p class="text-xs font-bold text-[#1E0D01]">Nome</p>
            <p class="text-sm text-gray-500 mt-0.5">{{ dadosUser.nome }}</p>
          </div>
          <div>
            <p class="text-xs font-bold text-[#1E0D01]">Sobrenome</p>
            <p class="text-sm text-gray-500 mt-0.5">{{ dadosUser.sobrenome }}</p>
          </div>
          <div v-if="dadosUser.matricula">
            <p class="text-xs font-bold text-[#1E0D01]">Matrícula</p>
            <p class="text-sm text-gray-500 mt-0.5">{{ dadosUser.matricula }}</p>
          </div>
          <div>
            <p class="text-xs font-bold text-[#1E0D01]">Senha</p>
            <p class="text-sm text-gray-400 tracking-widest mt-0.5">••••••••</p>
          </div>
        </div>

        <div class="flex gap-4 mt-4">
          <button @click="$emit('close')" class="flex-1 h-[44px] border border-[#F79347] text-[#F79347] font-semibold rounded-full text-sm bg-white hover:bg-[#FDEEE8] transition-colors cursor-pointer">Fechar</button>
          <button @click="isEditing = true" class="flex-1 h-[44px] bg-gradient-to-r from-[#FD7917] to-[#F79347] text-white font-semibold rounded-full text-sm hover:opacity-95 shadow-sm cursor-pointer">Editar</button>
        </div>
      </div>

      <form v-else @submit.prevent="salvarEdicao" class="flex flex-col gap-4">
        <div class="flex flex-col items-center gap-1.5 my-1">
          <div class="w-20 h-20 rounded-full bg-gray-400 border border-gray-300 flex flex-col items-center justify-center text-white text-[10px] font-bold cursor-pointer hover:opacity-90 relative overflow-hidden">
            <span>Alterar Foto</span>
          </div>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-[#1E0D01]">CPF</label>
          <input type="text" :value="dadosUser.cpf" disabled class="w-full h-[44px] px-4 bg-gray-50 border border-gray-200 text-gray-400 rounded-xl text-sm focus:outline-none" />
        </div>

        <div v-if="dadosUser.matricula" class="flex flex-col gap-1">
          <label class="text-xs font-bold text-[#1E0D01]">Matrícula</label>
          <input type="text" :value="dadosUser.matricula" disabled class="w-full h-[44px] px-4 bg-gray-50 border border-gray-200 text-gray-400 rounded-xl text-sm focus:outline-none" />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-[#1E0D01]">Nome</label>
          <input v-model="dadosUser.nome" type="text" class="w-full h-[44px] px-4 border border-[#F79347] rounded-xl text-sm focus:outline-none" required />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-[#1E0D01]">Sobrenome</label>
          <input v-model="dadosUser.sobrenome" type="text" class="w-full h-[44px] px-4 border border-[#F79347] rounded-xl text-sm focus:outline-none" required />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-bold text-[#1E0D01]">Nova Senha</label>
          <input v-model="dadosUser.novaSenha" type="password" placeholder="Deixe em branco para manter" class="w-full h-[44px] px-4 border border-[#F79347] rounded-xl text-sm focus:outline-none" />
        </div>

        <div class="flex gap-4 mt-3">
          <button type="button" @click="isEditing = false" class="flex-1 h-[44px] border border-[#F79347] text-[#F79347] font-semibold rounded-full text-sm bg-white hover:bg-[#FDEEE8] transition-colors cursor-pointer">Cancelar</button>
          <button type="submit" :disabled="carregando" class="flex-1 h-[44px] bg-gradient-to-r from-[#FD7917] to-[#F79347] text-white font-semibold rounded-full text-sm hover:opacity-95 shadow-sm cursor-pointer disabled:opacity-70">
            {{ carregando ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{ isOpen: boolean; usuarioLogado: any }>()
const emit = defineEmits(['close', 'atualizar'])

const isEditing = ref(false)
const carregando = ref(false)

const dadosUser = ref({
  nome: '',
  sobrenome: '',
  cpf: '',
  matricula: '',
  novaSenha: '',
})

watch(() => props.isOpen, (aberto) => {
  if (aberto && props.usuarioLogado) {
    dadosUser.value = {
      nome: props.usuarioLogado.nome || '',
      sobrenome: props.usuarioLogado.sobrenome || '',
      cpf: props.usuarioLogado.cpf || '',
      matricula: props.usuarioLogado.matricula || '',
      novaSenha: ''
    }
    isEditing.value = false
  }
})

const salvarEdicao = async () => {
  carregando.value = true
  try {
    const res = await fetch(`/api/users/${props.usuarioLogado.id || props.usuarioLogado._id}/perfil`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: dadosUser.value.nome,
        sobrenome: dadosUser.value.sobrenome,
        password: dadosUser.value.novaSenha ? dadosUser.value.novaSenha : undefined
      })
    })

    if (res.ok) {
      const data = await res.json()
      alert("Perfil atualizado com sucesso!")
      emit('atualizar', data.usuario)
      isEditing.value = false
      emit('close')
    } else {
      alert("Erro ao atualizar o perfil.")
    }
  } catch (e) {
    console.error(e)
    alert("Falha na comunicação com o servidor.")
  } finally {
    carregando.value = false
  }
}
</script>

<style scoped>
.animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
</style>
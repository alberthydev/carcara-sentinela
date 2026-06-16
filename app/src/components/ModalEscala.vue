<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
    <div class="w-full max-w-[700px] bg-white rounded-3xl shadow-xl flex flex-col text-left border border-gray-100 relative max-h-[95vh] overflow-hidden">
      <div class="bg-[#F79347] px-8 py-5 shrink-0 flex justify-between items-center">
        <h3 class="text-2xl font-serif text-white">
          <span v-if="modo === 'lista'">Escala de Segurança</span>
          <span v-else-if="modo === 'cadastro'">Nova Escala</span>
          <span v-else>Editar Escala</span>
        </h3>
        <button @click="fecharModal" class="text-white/80 hover:text-white transition-colors cursor-pointer text-2xl font-bold leading-none">&times;</button>
      </div>

      <div class="p-8 flex-1 overflow-y-auto">
        <div v-if="modo === 'lista'" class="flex flex-col gap-6 animate-fadeIn">
          <p class="text-[15px] text-[#1E0D01] font-medium">Veja a escala dos funcionários responsáveis pela segurança e os acessos desses usuários ao sistema.</p>

          <div class="w-full flex flex-col mt-2">
            <div class="grid grid-cols-[1.5fr_0.8fr_1.5fr_1.5fr_0.5fr] px-4 mb-3 text-[14px] font-bold text-[#1E0D01] border-b border-transparent">
              <div>Usuário</div>
              <div>Turno</div>
              <div>Dias</div>
              <div>Acesso ao sistema</div>
              <div class="text-center">Editar</div>
            </div>
            
            <div v-for="(item, index) in escala" :key="item._id || index" :class="['grid grid-cols-[1.5fr_0.8fr_1.5fr_1.5fr_0.5fr] px-4 h-[44px] rounded-full text-[13px] items-center font-medium text-[#1E0D01] transition-colors', index % 2 !== 0 ? 'bg-white hover:bg-gray-50' : 'bg-[#FFF5F0] hover:bg-[#FDEEE8]']">
              <div class="truncate pr-2">{{ item.nome }}</div>
              <div>{{ item.turno }}</div>
              <div class="truncate pr-2">{{ Array.isArray(item.dias) ? item.dias.join(', ') : item.dias }}</div>
              <div class="truncate pr-2">De {{ item.horaInicio }} até {{ item.horaFim }}</div>

              <div class="flex justify-center cursor-pointer text-gray-400 hover:text-[#FD7917] transition-colors" @click="abrirEdicao(item)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-center gap-4 mt-4">
            <button @click="fecharModal" class="w-[140px] h-[44px] border border-[#F79347] text-[#F79347] font-semibold rounded-full text-sm hover:bg-[#FDEEE8] transition-colors cursor-pointer">Fechar</button>
            <button @click="modo = 'cadastro'" class="w-[140px] h-[44px] bg-gradient-to-r from-[#FD7917] to-[#F79347] text-white font-semibold rounded-full text-sm shadow-md hover:opacity-95 transition-all cursor-pointer">Cadastrar</button>
          </div>
        </div>

        <form v-else @submit.prevent="salvarEscala" class="flex flex-col gap-5 animate-fadeIn">
          <div class="flex flex-col gap-1">
            <label class="text-sm font-semibold text-[#1E0D01]">Nome do Segurança</label>
            <input v-model="form.nome" type="text" placeholder="Ex: Fernando Torres" class="w-full bg-[#F9F9F9] border border-gray-200 rounded-lg py-3 px-4 text-sm outline-none focus:border-[#F79347]" required />
          </div>
        
          <div class="grid grid-cols-3 gap-4">
            <div class="flex flex-col gap-1">
              <label class="text-sm font-semibold text-[#1E0D01]">Turno</label>
              <select v-model="form.turno" class="w-full bg-[#F9F9F9] border border-gray-200 rounded-lg py-3 px-4 text-sm outline-none focus:border-[#F79347] appearance-none cursor-pointer text-gray-700" required>
                <option value="" disabled>Selecione</option>
                <option value="M">Manhã (M)</option>
                <option value="T">Tarde (T)</option>
                <option value="N">Noite (N)</option>
              </select>
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-sm font-semibold text-[#1E0D01]">Entrada</label>
              <input v-model="form.horaInicio" type="time" class="w-full bg-[#F9F9F9] border border-gray-200 rounded-lg py-3 px-4 text-sm outline-none focus:border-[#F79347]" required />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-sm font-semibold text-[#1E0D01]">Saída</label>
              <input v-model="form.horaFim" type="time" class="w-full bg-[#F9F9F9] border border-gray-200 rounded-lg py-3 px-4 text-sm outline-none focus:border-[#F79347]" required />
            </div>
          </div>
        
          <div class="flex flex-col gap-2">
            <label class="text-sm font-semibold text-[#1E0D01]">Dias da Semana</label>
            <div class="flex flex-wrap gap-2">
              <label v-for="dia in ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']" :key="dia" class="flex items-center gap-1.5 text-sm bg-gray-50 px-3 py-2 rounded-xl border border-gray-200 cursor-pointer hover:bg-orange-50 transition-colors select-none">
                <input type="checkbox" :value="dia" v-model="form.dias" class="accent-[#FD7917] w-4 h-4 rounded"> {{ dia }}
              </label>
            </div>
          </div>
        
          <div class="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-100">
            <button type="button" @click="voltarParaLista" class="w-[140px] h-[44px] border border-[#F79347] text-[#F79347] font-semibold rounded-full text-sm hover:bg-[#FDEEE8] transition-colors cursor-pointer">Voltar</button>
            <button type="submit" class="w-[140px] h-[44px] bg-gradient-to-r from-[#FD7917] to-[#F79347] text-white font-semibold rounded-full text-sm shadow-md hover:opacity-95 transition-all cursor-pointer">Salvar</button>
          </div>
        </form>        

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { fetchApi } from '../utils/api'

const props = defineProps<{ isOpen: boolean }>()
const emit = defineEmits(['close'])

const modo = ref<'lista' | 'cadastro' | 'edicao'>('lista')


interface EscalaItem {
  _id?: string;
  nome: string;
  turno: string;
  dias: string[];
  horaInicio: string;
  horaFim: string;
}

const form = ref<EscalaItem>({
  nome: '',
  turno: '',
  dias: [],
  horaInicio: '',
  horaFim: '',
})


const escala = ref<EscalaItem[]>([])

const buscarEscala = async () => {
  try {
    const res = await fetchApi('/api/users/escala')
    escala.value = await res.json()
  } catch (e) {
    console.error("Erro ao buscar escala:", e)
  }
}

watch(() => props.isOpen, (novo) => {
  if (novo) {
    modo.value = 'lista'
    limparFormulario()
    buscarEscala()
  }
})

const abrirEdicao = (item: EscalaItem) => {
  form.value = { 
    ...item, 
    dias: Array.isArray(item.dias) ? [...item.dias] : [] 
  }
  modo.value = 'edicao'
}

const salvarEscala = async () => {
  try {
    if (modo.value === 'cadastro') {
      await fetchApi('/api/users/escala', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form.value)
      })
    } else if (modo.value === 'edicao' && form.value._id) {
      await fetch(`/api/users/escala/${form.value._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form.value)
      })
    }
    
    await buscarEscala()
    voltarParaLista()
  } catch (e) {
    console.error("Erro ao salvar escala no banco:", e)
  }
}

const limparFormulario = () => {
  form.value = { nome: '', turno: '', dias: [], horaInicio: '', horaFim: '' }
}

const voltarParaLista = () => {
  limparFormulario()
  modo.value = 'lista'
}

const fecharModal = () => {
  emit('close')
}
</script>
<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.2s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #FDEEE8;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #F79347;
}
</style>
<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
    <div class="w-full max-w-[700px] bg-white rounded-3xl shadow-xl flex flex-col text-left border border-gray-100 relative max-h-[95vh] overflow-hidden flex-col">
      
      <div class="bg-[#F79347] px-8 py-5 shrink-0 flex justify-between items-center">
        <h3 class="text-2xl font-serif text-white">
          <span v-if="modo === 'lista'">Usuários</span>
          <span v-else-if="modo === 'cadastro'">Cadastrar Usuário</span>
          <span v-else>Editar Usuário</span>
        </h3>
        <button @click="fecharModal" class="text-white/80 hover:text-white transition-colors cursor-pointer text-2xl font-bold leading-none">&times;</button>
      </div>
      
      <div class="p-8 flex-1 overflow-y-auto">
        
        <div v-if="modo === 'lista'" class="flex flex-col gap-6 animate-fadeIn">
          <p class="text-[15px] text-[#1E0D01] font-medium">Inative usuários ou gerencie os acessos do sistema:</p>

          <div class="w-full flex flex-col mt-2">
            <div class="grid grid-cols-5 px-4 mb-3 text-[14px] font-bold text-[#1E0D01]">
              <div class="col-span-2">Usuário</div>
              <div class="col-span-1">Tipo</div>
              <div class="col-span-1 text-center">Editar</div>
              <div class="col-span-1 text-center">Status</div>
            </div>
            
            <div v-for="(user, index) in usuarios" :key="index" :class="['grid grid-cols-5 px-4 h-[44px] rounded-full text-[13px] items-center font-medium text-[#1E0D01] transition-colors', index % 2 !== 0 ? 'bg-[#FFF5F0]' : 'bg-white hover:bg-gray-50']">
              <div class="col-span-2 truncate pr-2" :class="{'text-gray-400 line-through': !user.ativo}">
                {{ user.nome }} {{ user.sobrenome }}
              </div>
              <div class="col-span-1 capitalize" :class="{'text-gray-400': !user.ativo}">{{ user.tipo }}</div>
              
              <div class="col-span-1 flex justify-center cursor-pointer hover:text-[#FD7917] transition-colors" @click="abrirEdicao(user)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </div>
              
              <div class="col-span-1 flex justify-center cursor-pointer transform hover:scale-110 transition-all" @click="user.ativo = !user.ativo" :title="user.ativo ? 'Inativar Usuário' : 'Ativar Usuário'">
                <svg v-if="user.ativo" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#80CC28" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EA4335" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-center gap-4 mt-4">
            <button @click="fecharModal" class="w-[140px] h-[44px] border border-[#F79347] text-[#F79347] font-semibold rounded-full text-sm hover:bg-[#FDEEE8] transition-colors cursor-pointer">Fechar</button>
            <button @click="modo = 'cadastro'" class="w-[140px] h-[44px] bg-gradient-to-r from-[#FD7917] to-[#F79347] text-white font-semibold rounded-full text-sm shadow-md hover:opacity-95 transition-all cursor-pointer">Cadastrar</button>
          </div>
        </div>

        <form v-else @submit.prevent="salvarUsuario" class="flex flex-col gap-5 animate-fadeIn">
          
          <div class="flex flex-col gap-1">
            <label class="text-sm font-semibold text-[#1E0D01]">Tipo de Perfil</label>
            <select v-model="form.tipo" class="w-full bg-[#F9F9F9] border border-gray-200 rounded-lg py-3 px-4 text-sm outline-none focus:border-[#F79347] appearance-none cursor-pointer text-gray-700 disabled:opacity-70 disabled:cursor-not-allowed" :disabled="modo === 'edicao'" required>
              <option value="" disabled>Selecione o perfil</option>
              <option value="visitante">Visitante</option>
              <option value="aluno">Aluno</option>
              <option value="servidor">Servidor</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-1">
              <label class="text-sm font-semibold text-[#1E0D01]">CPF</label>
              <input v-model="form.cpf" type="text" placeholder="123.456.789-00" class="w-full bg-[#F9F9F9] border border-gray-200 rounded-lg py-3 px-4 text-sm outline-none focus:border-[#F79347] disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed" :disabled="modo === 'edicao'" required />
            </div>

            <div class="flex flex-col gap-1" v-if="form.tipo === 'aluno' || form.tipo === 'servidor'">
              <label class="text-sm font-semibold text-[#1E0D01]">Matrícula / SIAPE</label>
              <input v-model="form.matricula" type="text" placeholder="Ex: 2021101..." class="w-full bg-[#F9F9F9] border border-gray-200 rounded-lg py-3 px-4 text-sm outline-none focus:border-[#F79347] disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed" :disabled="modo === 'edicao'" required />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-1">
              <label class="text-sm font-semibold text-[#1E0D01]">Nome</label>
              <input v-model="form.nome" type="text" placeholder="Nome" class="w-full bg-[#F9F9F9] border border-gray-200 rounded-lg py-3 px-4 text-sm outline-none focus:border-[#F79347]" required />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-sm font-semibold text-[#1E0D01]">Sobrenome</label>
              <input v-model="form.sobrenome" type="text" placeholder="Sobrenome" class="w-full bg-[#F9F9F9] border border-gray-200 rounded-lg py-3 px-4 text-sm outline-none focus:border-[#F79347]" required />
            </div>
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-semibold text-[#1E0D01]">{{ modo === 'edicao' ? 'Nova Senha (deixe em branco para manter)' : 'Senha' }}</label>
            <input v-model="form.senha" type="password" placeholder="••••••••" class="w-full bg-[#F9F9F9] border border-gray-200 rounded-lg py-3 px-4 text-sm outline-none focus:border-[#F79347]" :required="modo === 'cadastro'" />
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

const props = defineProps<{ isOpen: boolean }>()
const emit = defineEmits(['close'])

const modo = ref<'lista' | 'cadastro' | 'edicao'>('lista')

interface Usuario {
  id: number;
  cpf: string;
  matricula?: string;
  nome: string;
  sobrenome: string;
  tipo: string;
  ativo: boolean;
}

const form = ref({
  id: 0,
  cpf: '',
  matricula: '',
  nome: '',
  sobrenome: '',
  tipo: '',
  senha: ''
})

const usuarios = ref<Usuario[]>([
  { id: 1, cpf: '111.111.111-11', matricula: '', nome: 'Sérgio', sobrenome: 'Carvalho', tipo: 'visitante', ativo: false },
  { id: 2, cpf: '222.222.222-22', matricula: '2023001', nome: 'Carlos', sobrenome: 'Silva', tipo: 'aluno', ativo: true },
  { id: 3, cpf: '333.333.333-33', matricula: '', nome: 'Vinícius', sobrenome: 'Santos', tipo: 'visitante', ativo: true },
  { id: 4, cpf: '444.444.444-44', matricula: '', nome: 'Jorge', sobrenome: 'Amado', tipo: 'visitante', ativo: true },
  { id: 5, cpf: '555.555.555-55', matricula: '2020002', nome: 'José', sobrenome: 'Felipe', tipo: 'servidor', ativo: true },
  { id: 6, cpf: '666.666.666-66', matricula: '', nome: 'Pedro', sobrenome: 'Tavares', tipo: 'visitante', ativo: true }
])

watch(() => props.isOpen, (novo) => {
  if (novo) {
    modo.value = 'lista'
    limparFormulario()
  }
})

const abrirEdicao = (user: Usuario) => {
  form.value = {
    id: user.id,
    cpf: user.cpf,
    matricula: user.matricula || '',
    nome: user.nome,
    sobrenome: user.sobrenome,
    tipo: user.tipo,
    senha: ''
  }
  modo.value = 'edicao'
}

const salvarUsuario = () => {
  if (!usuarios.value) usuarios.value = []

  if (modo.value === 'cadastro') {
    usuarios.value.unshift({
      id: Date.now(),
      cpf: form.value.cpf,
      matricula: form.value.matricula,
      nome: form.value.nome,
      sobrenome: form.value.sobrenome,
      tipo: form.value.tipo,
      ativo: true
    })
  } else if (modo.value === 'edicao') {
    const usuarioEditado = usuarios.value.find(u => u.id === form.value.id)
    
    if (usuarioEditado) {
      usuarioEditado.nome = form.value.nome
      usuarioEditado.sobrenome = form.value.sobrenome
    }
  }
  
  voltarParaLista()
}

const limparFormulario = () => {
  form.value = { id: 0, cpf: '', matricula: '', nome: '', sobrenome: '', tipo: '', senha: '' }
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
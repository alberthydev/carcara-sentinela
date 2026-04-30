<template>
  <main class="cadastro-container">
    <h2>Cadastro de Usuário</h2>
    <p>Preencha os seus dados para acessar o campus:</p>

    <form @submit.prevent="realizarCadastro" class="formulario">
      <div class="grupo-input">
        <label>Selecione seu perfil:</label>
        <select v-model="form.tipo" required>
          <option value="" disabled>Escolha uma opção</option>
          <option value="visitante">Visitante</option>
          <option value="aluno">Aluno</option>
          <option value="servidor">Servidor</option>
        </select>
      </div>

      <div v-if="form.tipo" class="campos-cadastro">
        <div v-if="form.tipo === 'aluno' || form.tipo === 'servidor'" class="grupo-input">
          <label>Matrícula Acadêmica/SIAPE:</label>
          <input v-model="form.matricula" type="text" placeholder="Ex: 2021101..." required />
        </div>

        <div class="grupo-input">
          <label>CPF:</label>
          <input v-model="form.cpf" type="text" placeholder="123.456.789-00" required />
        </div>

        <div class="grupo-input dupla">
          <div>
            <label>Nome:</label>
            <input v-model="form.nome" type="text" required />
          </div>
          <div>
            <label>Sobrenome:</label>
            <input v-model="form.sobrenome" type="text" required />
          </div>
        </div>

        <div class="grupo-input">
          <label>Senha:</label>
          <input v-model="form.senha" type="password" placeholder="Mínimo 8 caracteres, letras, números e símbolos" required />
        </div>

        <div class="grupo-input">
          <label>Foto de Perfil (Nome do arquivo por agora):</label>
          <input v-model="form.fotoUrl" type="text" placeholder="minha_foto.png" required />
        </div>

        <button type="submit" :disabled="carregando">
          {{ carregando ? 'Enviando...' : 'Concluir Cadastro' }}
        </button>

        <div v-if="mensagem" :class="['alerta', tipoAlerta]">
          {{ mensagem }}
        </div>
      </div>
    </form>
  </main>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const form = ref({
  cpf: '',
  matricula: '',
  nome: '',
  sobrenome: '',
  tipo: '',
  senha: '',
  fotoUrl: ''
})

const mensagem = ref('')
const tipoAlerta = ref('')
const carregando = ref(false)

const cadastroValido = computed(() => {
  if (form.value.tipo === 'visitante') {
    return form.value.cpf.length >= 11
  }
  if (form.value.tipo === 'aluno' || form.value.tipo === 'servidor') {
    return form.value.cpf.length >= 11 && form.value.matricula.length >= 5
  }
  return false
})

const realizarCadastro = async () => {
  carregando.value = true
  mensagem.value = ''

  const payload = {
    cpf: form.value.cpf,
    matricula: form.value.matricula,
    nome: form.value.nome,
    sobrenome: form.value.sobrenome,
    tipo: form.value.tipo,
    senha: form.value.senha,
    fotoUrl: form.value.fotoUrl
  }

  try {
    const resposta = await fetch('http://localhost:3000/api/visitantes/cadastro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const dados = await resposta.json()

    if (resposta.ok) {
      mensagem.value = dados.mensagem
      tipoAlerta.value = 'sucesso'
      form.value = { cpf: '', matricula: '', nome: '', sobrenome: '', tipo: '', senha: '', fotoUrl: '' }
    } else {
      mensagem.value = dados.erro || 'Erro ao cadastrar.'
      tipoAlerta.value = 'erro'
    }
  } catch (erro) {
    mensagem.value = 'Erro de conexão. A API está ligada no Docker?'
    tipoAlerta.value = 'erro'
  } finally {
    carregando.value = false
  }
}
</script>

<style scoped>
.cadastro-container {
  max-width: 600px;
  margin: 10% auto;
  padding: 2rem;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 0 12px rgba(0,0,0,0.1);
}
.formulario { display: flex; flex-direction: column; gap: 1rem; }
.grupo-input { display: flex; flex-direction: column; }
.dupla { flex-direction: row; gap: 1rem; }
.dupla > div { flex: 1; display: flex; flex-direction: column; }
input { padding: 0.8rem; border: 1px solid #ccc; border-radius: 4px; font-size: 1rem; }
button { padding: 1rem; background-color: #28a745; color: white; border: none; border-radius: 4px; font-size: 1.1rem; cursor: pointer; transition: 0.3s; margin-top: 10px;}
button:hover:not(:disabled) { background-color: #218838; }
button:disabled { background-color: #94d3a2; cursor: not-allowed; }
.alerta { padding: 1rem; border-radius: 4px; text-align: center; font-weight: bold; margin-top: 10px;}
.sucesso { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb;}
.erro { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;}
</style>
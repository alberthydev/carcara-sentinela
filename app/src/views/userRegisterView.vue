<template>
  <main class="cadastro-container">
    <button type="button" @click="mockarDadosIFC" class="btn-admin">Mockar Aluno/Servidor (Admin)</button>
    <h2>Cadastro de Usuário</h2>
    <p>Preencha os seus dados para acessar o campus:</p>

    <form @submit.prevent="realizarCadastro" class="formulario">
      <!-- 1. Seleção de Perfil -->
      <div class="grupo-input">
        <label>Selecione seu perfil:</label>
        <select v-model="form.tipo" required>
          <option value="" disabled>Escolha uma opção</option>
          <option value="visitante">Visitante</option>
          <option value="aluno">Aluno</option>
          <option value="servidor">Servidor</option>
        </select>
      </div>

      <!-- 2. Campos de Identificação (Sempre aparecem se houver tipo selecionado) -->
      <div v-if="form.tipo" class="campos-identificacao">
        <div class="grupo-input">
          <label>CPF:</label>
          <input 
            v-model="form.cpf" 
            type="text" 
            placeholder="123.456.789-00" 
            :disabled="validadoNoIFC" 
            required 
          />
        </div>

        <div v-if="form.tipo === 'aluno' || form.tipo === 'servidor'" class="grupo-input">
          <label>Matrícula Acadêmica/SIAPE:</label>
          <input 
            v-model="form.matricula" 
            type="text" 
            placeholder="Ex: 2021101..." 
            :disabled="validadoNoIFC" 
          />
    
          <!-- Alternância de botões de validação -->
          <button 
            v-if="!validadoNoIFC" 
            type="button" 
            @click="validarComIFC" 
            class="btn-validar"
          >
            Validar no Sistema IFC
          </button>
    
          <button 
            v-else 
            type="button" 
            @click="resetarValidacao" 
            class="btn-voltar"
          >
            Voltar
          </button>
        </div>

        <!-- 3. Campos Finais (Nome, Senha, Foto) -->
        <!-- Aparecem para visitantes OU se o aluno foi validado -->
        <div v-if="form.tipo === 'visitante' || validadoNoIFC" class="campos-finais">
          <div class="grupo-input dupla">
            <div>
              <label>Nome:</label>
              <input 
                v-model="form.nome" 
                type="text" 
                :disabled="validadoNoIFC" 
                required 
              />
            </div>
            <div>
              <label>Sobrenome:</label>
              <input 
                v-model="form.sobrenome" 
                type="text" 
                :disabled="validadoNoIFC" 
                required 
              />
            </div>
          </div>

          <div class="grupo-input">
            <label>Senha:</label>
            <input v-model="form.senha" type="password" placeholder="Mínimo 8 caracteres" required />
          </div>

          <div class="grupo-input">
            <label>Foto de Perfil:</label>
            <input v-model="form.fotoUrl" type="text" placeholder="minha_foto.png" required />
          </div>

          <button type="submit" :disabled="carregando">
            {{ carregando ? 'Enviando...' : 'Concluir Cadastro' }}
          </button>
        </div>
      </div>

      <!-- Mensagens de Alerta -->
      <div v-if="mensagem" :class="['alerta', tipoAlerta]">
          {{ mensagem }}
      </div>
    </form>
  </main>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'



const form = ref({
  cpf: '',
  matricula: '',
  nome: '',
  sobrenome: '',
  tipo: '',
  senha: '',
  fotoUrl: ''
})

const router = useRouter();
const mensagem = ref('');
const tipoAlerta = ref('');
const carregando = ref(false);
const validadoNoIFC = ref(false);

watch(() => form.value.tipo, () => {
  validadoNoIFC.value = false;
  mensagem.value = '';
  form.value.nome = '';
  form.value.sobrenome = '';
  form.value.matricula = '';
  form.value.cpf = ''; // Opcional: limpa o CPF também para evitar erro de validação
});

const mockarDadosIFC = async () => {
  const nome = prompt("Nome do Aluno:")
  const cpf = prompt("CPF do Aluno:")
  const matricula = prompt("Matrícula do Aluno:")

  if (nome && cpf && matricula) {
    await fetch('http://localhost:3000/api/users/admin/mock-estudante', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, cpf, matricula })
    })
    alert("Dados integrados ao 'Sistema IFC' com sucesso!")
  }
}

const validarComIFC = async () => {
  if (!form.value.cpf || !form.value.matricula) {
    alert("Preencha CPF e Matrícula primeiro.")
    return
  }
  
  const res = await fetch(`http://localhost:3000/api/users/validar-ifc/${form.value.cpf}/${form.value.matricula}`)
  const dados = await res.json()

  if (res.ok) {
    validadoNoIFC.value = true
    
    const partesNome = dados.nome.split(' ')
    form.value.nome = partesNome[0]
    form.value.sobrenome = partesNome.slice(1).join(' ') || ''
    
    mensagem.value = `Bem-vindo, ${dados.nome}! Identidade confirmada pelo IFC.`
    tipoAlerta.value = 'sucesso'
  } else {
    validadoNoIFC.value = false
    mensagem.value = dados.erro
    tipoAlerta.value = 'erro'
  }
}

const resetarValidacao = () => {
  validadoNoIFC.value = false;
  mensagem.value = '';
  tipoAlerta.value = '';

  form.value.nome = '';
  form.value.sobrenome = '';
};

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
    const resposta = await fetch('http://localhost:3000/api/users/cadastro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const dados = await resposta.json()

    if (resposta.ok) {
      mensagem.value = dados.mensagem
      tipoAlerta.value = 'sucesso'
      setTimeout(() => {
        form.value = { cpf: '', matricula: '', nome: '', sobrenome: '', tipo: '', senha: '', fotoUrl: '' }
        router.push('/')
      }, 3000)
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
input:disabled {
  background-color: #e9ecef; /* Cinza claro */
  cursor: not-allowed;
  color: #495057;
  border: 1px solid #ced4da;
}

.btn-admin {
  background-color: #6c757d;
  font-size: 0.9rem;
  padding: 8px;
  float: right;
}
.btn-voltar {
  background-color: #ffc107; /* Amarelo/Laranja para indicar correção */
  color: #212529;
  margin-top: 10px;
  padding: 0.8rem;
  font-weight: bold;
}

.btn-voltar:hover {
  background-color: #e0a800;
}
</style>
<template>
  <main class="home-container">
    <h1>Carcará Sentinela</h1>
  
    <section>
      <h2>Lista de Visitantes Cadastrados</h2>
      <button @click="buscarTodos">Atualizar Lista</button>
      
      <ul>
      <li v-for="v in listaVisitantes" :key="v._id" style="margin-bottom: 10px; border-bottom: 1px solid #ccc;">
        <strong>{{ v.nome }} {{ v.sobrenome }}</strong> - CPF: {{ v.cpf }}
      </li>
    </ul>
    </section>

    <p v-if="!mostrandoOpcoes">Selecione uma opção para continuar:</p>
    <p v-else>Qual é o seu perfil de usuário?</p>

    <div class="botoes" v-if="!mostrandoOpcoes">
      <button class="btn-login" disabled>Login (Em breve)</button>
      
      <button class="btn-cadastro" @click="mostrandoOpcoes = true">Cadastrar</button>
    </div>

    <div class="botoes" v-else>
      <button class="btn-visitante" @click="irParaVisitante">Sou Visitante</button>
      
      <button class="btn-aluno" disabled>Sou Aluno / Servidor (Em breve)</button>

      <button class="btn-voltar" @click="mostrandoOpcoes = false">Voltar</button>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

interface Visitante {
  _id: string;
  nome: string;
  sobrenome: string;
  cpf: string;
}

const router = useRouter()
const listaVisitantes = ref<Visitante[]>([]);

const mostrandoOpcoes = ref(false)

const irParaVisitante = () => {
  router.push('/cadastroVisitante')
}

const buscarTodos = async () => {
  try {
    const resposta = await fetch('http://localhost:3000/api/visitantes/todos')
    const dados = await resposta.json()
    
    listaVisitantes.value = dados 
  } catch (erro) {
    console.error("Erro ao buscar dados da API")
  }
}

</script>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
}

.botoes {
  display: flex;
  gap: 20px;
  margin-top: 30px;
}

button {
  padding: 15px 30px;
  font-size: 1.2rem;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  transition: 0.3s;
}

.btn-login, .btn-aluno {
  background-color: #6c757d;
  color: #d3d3d3;
  cursor: not-allowed;
}

.btn-cadastro, .btn-visitante {
  background-color: #28a745;
  color: white;
  cursor: pointer;
}

.btn-cadastro:hover, .btn-visitante:hover {
  background-color: #218838;
}

.btn-voltar {
  background-color: #dc3545;
  color: white;
  cursor: pointer;
}

.btn-voltar:hover {
  background-color: #c82333;
}
</style>
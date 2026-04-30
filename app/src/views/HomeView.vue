<template>
  <main class="home-container">
    <h1>Carcará Sentinela</h1>
  
    <section>
      <h2>Lista de Visitantes Cadastrados</h2>
      <button @click="buscarTodos">Atualizar Lista</button>
      
      <ul style="list-style: none;">
      <li v-for="v in usersList" :key="v._id" style="margin-bottom: 10px; border-bottom: 1px solid #ccc;">
        <strong>{{ v.nome }} {{ v.sobrenome }}</strong> - CPF: {{ v.cpf }} - Matricula: {{ v.matricula || 'Não possui' }}
      </li>
    </ul>
    </section>

    <div class="botoes">
      <button class="btn-login" disabled>Login (Em breve)</button>
      
      <button class="btn-cadastro" @click="registry">Cadastrar</button>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

interface User {
  _id: string;
  matricula?: string;
  nome: string;
  sobrenome: string;
  cpf: string;
}

const router = useRouter()
const usersList = ref<User[]>([]);

const registry = () => {
  router.push('/userRegistry')
}

const buscarTodos = async () => {
  try {
    const resposta = await fetch('http://localhost:3000/api/users/todos')
    const dados = await resposta.json()
    
    usersList.value = dados 
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
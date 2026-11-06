<template>
  <main class="min-h-screen flex items-center justify-center bg-[#fafafa] px-6">
    <form @submit.prevent="redefinir" class="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 flex flex-col gap-4">
      <h1 class="text-3xl font-serif font-bold text-carcara-marrom">Redefinir senha</h1>
      <p class="text-sm text-gray-500">Crie uma nova senha com pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e símbolo.</p>
      <label for="reset-password">Nova senha</label>
      <input id="reset-password" v-model="password" :type="mostrarSenha ? 'text' : 'password'" placeholder="Nova senha" required class="border rounded-lg px-4 py-3 text-carcara-marrom" />
      <label for="reset-password-confirmation">Confirme a nova senha</label>
      <input id="reset-password-confirmation" v-model="confirmation" :type="mostrarSenha ? 'text' : 'password'" placeholder="Confirme a nova senha" required class="border rounded-lg px-4 py-3 text-carcara-marrom" />
      <p class="text-xs text-gray-500">Mínimo de 8 caracteres, com maiúscula, minúscula, número e símbolo.</p>
      <button type="button" class="self-start text-sm text-carcara-laranja underline" @click="mostrarSenha = !mostrarSenha">
        {{ mostrarSenha ? 'Ocultar senhas' : 'Mostrar senhas' }}
      </button>
      <button :disabled="carregando" class="bg-carcara-marrom text-white rounded-lg py-3 disabled:opacity-50">
        {{ carregando ? 'Salvando...' : 'Redefinir senha' }}
      </button>
      <p v-if="mensagem" role="status" aria-live="polite" class="text-sm text-carcara-marrom">{{ mensagem }}</p>
    </form>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const password = ref('')
const confirmation = ref('')
const mensagem = ref('')
const carregando = ref(false)
const mostrarSenha = ref(false)

const redefinir = async () => {
  if (password.value !== confirmation.value) {
    mensagem.value = 'As senhas não coincidem.'
    return
  }
  carregando.value = true
  try {
    const resposta = await fetch('/api/users/senha/redefinir', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: route.query.token, password: password.value }),
    })
    const dados = await resposta.json()
    mensagem.value = dados.mensagem || dados.erro || 'Não foi possível redefinir a senha.'
    if (resposta.ok) setTimeout(() => router.push('/login'), 1500)
  } catch {
    mensagem.value = 'Falha na comunicação com o servidor.'
  } finally {
    carregando.value = false
  }
}
</script>

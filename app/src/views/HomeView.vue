<template>
  <div
    class="min-h-screen bg-carcara-creme text-carcara-marrom flex flex-col font-sans antialiased"
  >
    <header class="min-h-screen w-full px-12 md:px-20 py-12 flex flex-col justify-between">
      <div class="flex justify-between items-center w-full">
        <div class="flex items-center gap-4">
          <img
            src="../assets/img/carcara.png"
            alt="Logo Carcará Sentinela"
            class="h-18 w-18 object-contain"
          />
          <h1 class="text-5xl font-serif tracking-wide text-carcara-marrom">
            Carcará <span class="text-carcara-laranja font-medium">Sentinela</span>
          </h1>
        </div>
        <nav class="flex gap-8 text-2xl font-normal">
          <a
            href="#equipe"
            class="hover:text-carcara-laranja transition-colors underline decoration-carcara-laranja underline-offset-4"
            >Equipe</a
          >
          <a href="#sobre" class="hover:text-carcara-laranja transition-colors">Sobre</a>
          <a href="#contato" class="hover:text-carcara-laranja transition-colors">Contato</a>
        </nav>
      </div>

      <div class="max-w-4xl my-auto flex flex-col items-start gap-8 py-12">
        <h2
          class="text-7xl font-serif font-normal leading-tight text-carcara-marrom tracking-tight"
        >
          Monitoramento que <span class="text-carcara-laranja">informa</span>.<br />
          Segurança que <span class="text-carcara-laranja">acolhe</span>.<br />
          Visão que <span class="text-carcara-laranja">antecipa</span>.
        </h2>
        <p class="text-2xl font-semibold text-carcara-marrom leading-relaxed font-serif my-9">
          Um sistema feito sob medida para proteger quem ensina, quem aprende e quem visita.
        </p>
        <button
          @click="registry"
          class="border-2 border-carcara-laranja text-carcara-laranja text-xl font-medium uppercase tracking-widest px-6 py-4 rounded-none hover:bg-carcara-laranja hover:text-white transition-all duration-300 cursor-pointer"
        >
          Acessar o Sistema
        </button>
      </div>

      <div class="hidden md:block"></div>
    </header>

    <section id="sobre" class="min-h-screen bg-carcara-laranja text-white flex items-center">
      <div
        class="min-h-screen w-full px-12 md:px-20 py-12 mx-auto text-center flex flex-col justify-center gap-12"
      >
        <div class="flex items-center justify-center gap-6">
          <div class="h-[2px] w-60 bg-carcara-marrom"></div>
          <span class="text-4xl tracking-widest font-serif font-normal text-carcara-marrom"
            >Acesso rápido, segurança total: o sentinela que não pisca.</span
          >
          <div class="h-[2px] w-60 bg-carcara-marrom"></div>
        </div>

        <h3 class="text-8xl mt-20 mb-14 font-serif text-carcara-marrom">Sobre</h3>

        <p class="text-carcara-marrom text-xl font-normal max-w-3xl mx-auto leading-relaxed">
          Sistema inteligente de autenticação e controle de acesso veicular para instituições de
          ensino. Monitoramento em tempo real, segurança preventiva e transparência para toda a
          comunidade acadêmica.
        </p>

        <div class="grid md:grid-cols-3 gap-8 text-left w-full max-w-6xl mx-auto mt-4">
          <div
            class="bg-white p-8 rounded-lg border border-carcara-marrom shadow-md text-carcara-marrom flex flex-col gap-3 min-h-[200px]"
          >
            <h4 class="font-bold text-2xl font-serif">Monitoramento LPR</h4>
            <p class="text-base font-light text-carcara-marrom leading-relaxed">
              Integração com câmeras LPR para leitura automática de placas em tempo real.
            </p>
          </div>

          <div
            class="bg-white p-8 rounded-lg border border-carcara-marrom shadow-md text-carcara-marrom flex flex-col gap-3 min-h-[200px]"
          >
            <h4 class="font-bold text-2xl font-serif">Controle Inteligente</h4>
            <p class="text-base font-light text-carcara-marrom leading-relaxed">
              Identificação automática de veículos cadastrados e sistema de whitelist.
            </p>
          </div>

          <div
            class="bg-white p-8 rounded-lg border border-carcara-marrom shadow-md text-carcara-marrom flex flex-col gap-3 min-h-[200px]"
          >
            <h4 class="font-bold text-2xl font-serif">Gestão Simplificada</h4>
            <p class="text-base font-light text-carcara-marrom leading-relaxed">
              Cadastro fácil de veículos via app mobile para servidores, alunos e visitantes.
            </p>
          </div>
        </div>
      </div>
    </section>

    <footer id="contato" class="bg-carcara-marrom text-carcara-creme py-20 px-6 w-full">
      <div class="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-start">
        <!-- Coluna esquerda: título + redes + info de contato + endereço -->
        <div class="flex flex-col gap-8">
          <h3 class="text-4xl font-serif leading-tight text-carcara-creme">
            Voe mais alto conosco.<br />Entre em contato.
          </h3>

          <div class="flex gap-5 text-xl opacity-80">
            <a
              href="https://instagram.com"
              target="_blank"
              class="hover:text-carcara-laranja text-carcara-creme transition-colors"
            >
              <Instagram class="w-6 h-6" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              class="hover:text-carcara-laranja text-carcara-creme transition-colors"
            >
              <Twitter class="w-6 h-6" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              class="hover:text-carcara-laranja text-carcara-creme transition-colors"
            >
              <Linkedin class="w-6 h-6" />
            </a>
          </div>

          <div class="grid grid-cols-2 gap-8 text-base font-light opacity-90">
            <div class="flex flex-col gap-2">
              <h4 class="font-bold uppercase tracking-wider text-carcara-laranja text-sm">
                Informação de Contato
              </h4>
              <p>+55 22 93333-4444</p>
              <p class="text-sm">info@carcara.com.br</p>
              <p class="text-sm">info-proj@carcara.com.br</p>
            </div>
            <div class="flex flex-col gap-2">
              <h4 class="font-bold uppercase tracking-wider text-carcara-laranja text-sm">
                Endereço
              </h4>
              <p>SC-135, km 125 / S/n</p>
              <p>Campo Experimental, Videira - SC,</p>
              <p class="font-mono text-sm">89564-590</p>
            </div>
          </div>
        </div>

        <!-- Coluna direita: formulário -->
        <div class="flex flex-col gap-6 justify-end pt-4">
          <input
            v-model="form.email"
            type="email"
            placeholder="seuemail@seuemail.com"
            class="bg-transparent border-b border-carcara-creme/40 py-3 text-carcara-creme placeholder-carcara-creme/50 outline-none focus:border-carcara-laranja transition-colors w-full"
          />
          <input
            v-model="form.phone"
            type="tel"
            placeholder="+(55) 99 99999-9999"
            class="bg-transparent border-b border-carcara-creme/40 py-3 text-carcara-creme placeholder-carcara-creme/50 outline-none focus:border-carcara-laranja transition-colors w-full"
          />
          <input
            v-model="form.message"
            type="text"
            placeholder="Deixe sua mensagem para a nossa equipe"
            class="bg-transparent border-b border-carcara-creme/40 py-3 text-carcara-creme placeholder-carcara-creme/50 outline-none focus:border-carcara-laranja transition-colors w-full"
          />
          <div class="flex justify-end mt-2">
            <button
              @click="submitForm"
              class="bg-carcara-laranja text-white text-sm font-bold uppercase tracking-widest px-8 py-3 hover:opacity-90 transition-all cursor-pointer"
            >
              Enviar Formulário
            </button>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Instagram, Linkedin, Twitter } from 'lucide-vue-next'

const router = useRouter()

const form = reactive({
  email: '',
  phone: '',
  message: '',
})

const registry = () => {
  router.push('/userRegistry')
}

const submitForm = () => {
  // handle form submission
  console.log('Form submitted:', form)
}
</script>

<style scoped></style>

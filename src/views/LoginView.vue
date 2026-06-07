<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { supabase } from '../lib/supabase'

const router = useRouter()

const email = ref('')
const senha = ref('')

async function fazerLogin() {

  const { data, error } =
    await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email.value)
      .eq('senha', senha.value)
      .single()

  if (error || !data) {
    alert('Usuário ou senha inválidos')
    return
  }

  localStorage.setItem(
    'admin',
    JSON.stringify(data)
  )

  router.push('/admin')
}
</script>

<template>
  <div class="container">

<h1>Painel Administrativo</h1>

<input
  v-model="email"
  placeholder="Email"
/>

<input
  v-model="senha"
  type="password"
  placeholder="Senha"
/>

<button @click="fazerLogin">
  Entrar
</button>

  </div>
</template>

<style scoped>
.container {
  max-width: 400px;
  margin: 80px auto;

  display: flex;
  flex-direction: column;
  gap: 1rem;
}

input,
button {
  padding: 1rem;
}
</style>
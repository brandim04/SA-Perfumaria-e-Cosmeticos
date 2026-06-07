<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { supabase } from '../lib/supabase'

const router = useRouter()

const email = ref('')
const senha = ref('')
const carregando = ref(false)

async function fazerLogin() {
  if (!email.value || !senha.value) {
    alert('Preencha email e senha')
    return
  }

  carregando.value = true

  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('email', email.value)
    .eq('senha', senha.value)
    .single()

  carregando.value = false

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
  <div class="login-page">
    <div class="login-card">
      <div class="marca">
        <h1>Samara Adriana</h1>
        <p>Cosméticos</p>
      </div>

      <div class="titulo">
        <h2>Painel Administrativo</h2>
        <p>Entre para gerenciar pedidos e produtos.</p>
      </div>

      <form @submit.prevent="fazerLogin">
        <label>Email</label>
        <input
          v-model="email"
          type="email"
          placeholder="Digite seu email"
        />

        <label>Senha</label>
        <input
          v-model="senha"
          type="password"
          placeholder="Digite sua senha"
        />

        <button type="submit" :disabled="carregando">
          {{ carregando ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>

      <button
        type="button"
        class="voltar-loja"
        @click="router.push('/')"
      >
        ← Voltar para a loja
      </button>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #6f0716, #4b0410);

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 2rem;
}

.login-card {
  width: 100%;
  max-width: 430px;

  background: #ffffff;
  border-radius: 22px;

  padding: 2rem;

  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
}

.marca {
  text-align: center;
  margin-bottom: 2rem;
}

.marca h1 {
  margin: 0;
  color: #6f0716;
  font-size: 2rem;
}

.marca p {
  margin: 0.3rem 0 0;
  color: #c9a24d;
  font-weight: bold;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.titulo {
  margin-bottom: 1.5rem;
}

.titulo h2 {
  margin: 0;
  color: #333;
}

.titulo p {
  margin-top: 0.4rem;
  color: #777;
}

form {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

label {
  color: #6f0716;
  font-weight: bold;
  font-size: 0.9rem;
}

input {
  padding: 0.95rem;

  border: 1px solid #ddd;
  border-radius: 12px;

  font-size: 1rem;
  outline: none;
}

input:focus {
  border-color: #6f0716;
  box-shadow: 0 0 0 3px rgba(111, 7, 22, 0.12);
}

button {
  margin-top: 0.8rem;

  padding: 1rem;

  border: none;
  border-radius: 12px;

  background: #6f0716;
  color: #e5c89a;

  font-weight: bold;
  font-size: 1rem;

  cursor: pointer;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.voltar-loja {
  width: 100%;
  margin-top: 1rem;

  background: #f8f6f4;
  color: #6f0716;
}
</style>
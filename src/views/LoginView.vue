<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const senha = ref('')
const carregando = ref(false)
const mostrarSenha = ref(false)

async function fazerLogin() {
  if (!email.value || !senha.value) {
    alert('Preencha email e senha')
    return
  }

  carregando.value = true

  const resultado = await auth.login(email.value, senha.value)

  carregando.value = false

  if (!resultado.sucesso) {
    alert(resultado.mensagem)
    return
  }

  router.push('/admin')
}
</script>

<template>
  <div class="login-page">
    <div class="login-container">
      <section class="lado-marca">
        <span class="tag">Painel administrativo</span>

        <h1>Samara Adriana Cosméticos</h1>

        <p>
          Gerencie pedidos, clientes, produtos, estoque e vendas em um só lugar.
        </p>

        <div class="info-box">
          <strong>Acesso exclusivo</strong>
          <span>Área reservada para administração da loja.</span>
        </div>
      </section>

      <section class="login-card">
        <div class="titulo">
          <h2>Entrar no painel</h2>
          <p>Informe seus dados para continuar.</p>
        </div>

        <form @submit.prevent="fazerLogin">
          <label>Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="Digite seu email"
          />

          <label>Senha</label>

          <div class="campo-senha">
            <input
              v-model="senha"
              :type="mostrarSenha ? 'text' : 'password'"
              placeholder="Digite sua senha"
            />

            <button
              type="button"
              @click="mostrarSenha = !mostrarSenha"
            >
              {{ mostrarSenha ? 'Ocultar' : 'Mostrar' }}
            </button>
          </div>

          <button
            type="submit"
            class="entrar"
            :disabled="carregando"
          >
            {{ carregando ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>

        <button
          type="button"
          class="voltar"
          @click="router.push('/')"
        >
          ← Voltar para a loja
        </button>
      </section>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(229, 200, 154, 0.25), transparent 35%),
    linear-gradient(135deg, #6f0716, #3b020b);

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 2rem;
}

.login-container {
  width: 100%;
  max-width: 1000px;

  display: grid;
  grid-template-columns: 1.1fr 0.9fr;

  background: rgba(255, 255, 255, 0.08);

  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 28px;

  overflow: hidden;

  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
}

.lado-marca {
  color: white;

  padding: 3rem;

  display: flex;
  flex-direction: column;
  justify-content: center;
}

.tag {
  width: fit-content;

  background: rgba(229, 200, 154, 0.18);
  color: #e5c89a;

  padding: 0.45rem 0.8rem;
  border-radius: 999px;

  font-size: 0.8rem;
  font-weight: bold;

  margin-bottom: 1.2rem;
}

.lado-marca h1 {
  color: #e5c89a;
  font-size: 2.7rem;
  line-height: 1.1;

  margin: 0 0 1rem;
}

.lado-marca p {
  color: #f5e7c8;
  line-height: 1.6;

  max-width: 440px;
}

.info-box {
  margin-top: 2rem;

  background: rgba(255, 255, 255, 0.12);

  border-radius: 18px;

  padding: 1.2rem;

  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.info-box strong {
  color: #e5c89a;
}

.info-box span {
  color: #f5e7c8;
}

.login-card {
  background: white;

  padding: 3rem;

  display: flex;
  flex-direction: column;
  justify-content: center;
}

.titulo h2 {
  color: #6f0716;
  margin: 0;

  font-size: 2rem;
}

.titulo p {
  color: #777;
  margin: 0.5rem 0 2rem;
}

form {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

label {
  color: #6f0716;
  font-weight: bold;
}

input {
  width: 100%;

  padding: 1rem;

  border: 1px solid #ddd;
  border-radius: 12px;

  outline: none;
  font-size: 1rem;
}

input:focus {
  border-color: #6f0716;
  box-shadow: 0 0 0 3px rgba(111, 7, 22, 0.12);
}

.campo-senha {
  display: flex;
  gap: 0.5rem;
}

.campo-senha input {
  flex: 1;
}

.campo-senha button {
  border: none;
  border-radius: 12px;

  padding: 0 1rem;

  background: #f8f6f4;
  color: #6f0716;

  font-weight: bold;
  cursor: pointer;
}

.entrar {
  margin-top: 1rem;

  background: #6f0716;
  color: #e5c89a;

  border: none;
  border-radius: 12px;

  padding: 1rem;

  font-weight: bold;
  font-size: 1rem;

  cursor: pointer;
}

.entrar:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.voltar {
  margin-top: 1rem;

  background: #f8f6f4;
  color: #6f0716;

  border: none;
  border-radius: 12px;

  padding: 1rem;

  font-weight: bold;
  cursor: pointer;
}

@media (max-width: 850px) {
  .login-container {
    grid-template-columns: 1fr;
  }

  .lado-marca,
  .login-card {
    padding: 2rem;
  }

  .lado-marca h1 {
    font-size: 2rem;
  }
}
</style>
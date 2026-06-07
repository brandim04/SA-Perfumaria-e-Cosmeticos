<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import logo from '../assets/logo.png'

const emit = defineEmits(['buscar'])

const router = useRouter()
const cart = useCartStore()

const quantidadeItens = computed(() => cart.itens.length)

function abrirCarrinho() {
  router.push('/carrinho')
}
</script>

<template>
  <header class="header">
    <div class="brand" @click="router.push('/')">
      <img :src="logo" alt="Logo Samara Adriana" />
      <div>
        <h2>Samara Adriana</h2>
        <span>Perfumaria & Cosméticos</span>
      </div>
    </div>

    <input
      type="text"
      placeholder="Buscar produtos..."
      class="search"
      @input="emit('buscar', $event.target.value)"
    />

    <button class="cart" @click="abrirCarrinho">
      Carrinho ({{ quantidadeItens }})
    </button>
  </header>
</template>

<style scoped>
.header {
  background: #6f0716;
  color: #e5c89a;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  gap: 1rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
}

.brand img {
  width: 60px;
  height: 60px;
  object-fit: contain;
  background: white;
  border-radius: 50%;
  padding: 4px;
}

.brand h2 {
  margin: 0;
}

.brand span {
  font-size: 0.85rem;
  letter-spacing: 2px;
}

.search {
  width: 320px;
  padding: 0.75rem;
  border: none;
  border-radius: 20px;
}

.cart {
  background: #e5c89a;
  color: #6f0716;
  border: none;
  border-radius: 20px;
  padding: 0.8rem 1.2rem;
  cursor: pointer;
  font-weight: bold;
}
</style>
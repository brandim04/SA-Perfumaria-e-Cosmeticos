<script setup>
import { computed } from 'vue'
import { useCartStore } from '../stores/cart'
import { useRouter } from 'vue-router'

const emit = defineEmits(['buscar'])

const cart = useCartStore()

const router = useRouter()

const quantidadeItens = computed(() => {
  return cart.itens.length
})

function abrirCarrinho() {
  router.push('/carrinho')
}
</script>

<template>
  <header class="header">
    <h2>Samara Adriana</h2>

    <input
      type="text"
      placeholder="Buscar produtos..."
      class="search"
      @input="emit('buscar', $event.target.value)"
    />

    <button
  class="cart"
  @click="abrirCarrinho"
>
  Carrinho ({{ quantidadeItens }})
    </button>
  </header>
</template>

<style scoped>
.header {
  background-color: #6f0716;
  color: #e5c89a;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 1rem 2rem;
}

.search {
  width: 300px;
  padding: 0.6rem;

  border: none;
  border-radius: 8px;
}

.cart {
  background: #e5c89a;
  color: #6f0716;

  border: none;
  border-radius: 8px;

  padding: 0.7rem 1rem;

  cursor: pointer;

  font-weight: bold;
}
</style>
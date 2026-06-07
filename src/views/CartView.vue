<script setup>
import { computed } from 'vue'
import { useCartStore } from '../stores/cart'

const cart = useCartStore()

const total = computed(() => {
  return cart.itens.reduce(
    (soma, produto) =>
      soma + Number(produto.preco),
    0
  )
})
</script>

<template>
  <div class="container">
    <h1>Meu Carrinho</h1>

    <div v-if="cart.itens.length === 0">
      <p>Seu carrinho está vazio.</p>
    </div>

    <div v-else>
  <div
    v-for="(produto, index) in cart.itens"
    :key="index"
    class="item"
  >
    <div>
      <h3>{{ produto.nome }}</h3>

      <p>
        R$ {{ Number(produto.preco).toFixed(2) }}
      </p>
    </div>

    <button
      class="remover"
      @click="cart.removerProduto(index)"
    >
      Remover
    </button>
  </div>

  <div class="resumo">
    <h2>
      Total:
      R$ {{ total.toFixed(2) }}
    </h2>

    <router-link
  to="/checkout"
  class="finalizar"
>
  Finalizar Pedido
    </router-link>

    <button
      class="limpar"
      @click="cart.limparCarrinho()"
    >
      Limpar Carrinho
    </button>
  </div>
</div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  color: #6f0716;
  margin-bottom: 2rem;
}

.item {
  background: white;

  border-radius: 12px;

  padding: 1rem;

  margin-bottom: 1rem;

  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
}

.remover {
  background: #c62828;
  color: white;

  border: none;
  border-radius: 8px;

  padding: 0.7rem 1rem;

  cursor: pointer;
}

.resumo {
  margin-top: 2rem;

  padding-top: 1rem;

  border-top: 2px solid #eee;
}

.limpar {
  margin-top: 1rem;

  background: #6f0716;
  color: #e5c89a;

  border: none;
  border-radius: 8px;

  padding: 0.9rem 1.2rem;

  cursor: pointer;
}

.finalizar {
  display: inline-block;

  margin-top: 1rem;
  margin-right: 1rem;

  text-decoration: none;

  background: #2e7d32;
  color: white;

  padding: 0.9rem 1.2rem;

  border-radius: 8px;
}
</style>
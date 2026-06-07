<script setup>
import { useCartStore } from '../stores/cart'

const cart = useCartStore()

const props = defineProps({
  produto: {
    type: Object,
    required: true,
  },
})

function adicionarAoCarrinho() {
  cart.adicionarProduto(props.produto)

  console.log('Itens no carrinho:', cart.itens)
}
</script>

<template>
  <div class="card">
    <div class="imagem">
      <span>Imagem do Produto</span>
    </div>

    <div class="conteudo">
      <p class="marca">
        {{ produto.marcas?.nome }}
      </p>
      <h3>{{ produto.nome }}</h3>

      <p class="preco">
        R$ {{ Number(produto.preco).toFixed(2) }}
      </p>

      <button @click="adicionarAoCarrinho">
        Comprar
      </button>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: white;
  border-radius: 16px;

  overflow: hidden;

  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

  transition: all 0.3s ease;

  display: flex;
  flex-direction: column;
}

.card:hover {
  transform: translateY(-5px);

  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.imagem {
  height: 220px;

  background: #f8f8f8;

  display: flex;
  align-items: center;
  justify-content: center;

  color: #888;
  font-size: 0.9rem;

  border-bottom: 1px solid #eee;
}

.conteudo {
  padding: 1rem;
}

h3 {
  font-size: 1rem;

  margin-bottom: 1rem;

  color: #333;

  min-height: 48px;
}

.marca {
  color: #888;

  font-size: 0.85rem;

  text-transform: uppercase;

  letter-spacing: 1px;

  margin-bottom: 0.5rem;
}

.preco {
  font-size: 1.4rem;
  font-weight: bold;

  color: #6f0716;

  margin-bottom: 1rem;
}

button {
  width: 100%;

  padding: 0.9rem;

  border: none;
  border-radius: 10px;

  background: #6f0716;
  color: #e5c89a;

  font-weight: bold;

  cursor: pointer;

  transition: all 0.3s ease;
}

button:hover {
  background: #540411;
}
</style>
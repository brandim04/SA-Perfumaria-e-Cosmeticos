<script setup>
import { ref } from 'vue'
import { useCartStore } from '../stores/cart'

const cart = useCartStore()

const props = defineProps({
  produto: {
    type: Object,
    required: true,
  },
})

const mensagem = ref('')
const tipoMensagem = ref('sucesso')

function adicionarAoCarrinho() {
  const resultado = cart.adicionarProduto(props.produto)

  mensagem.value = resultado.mensagem
  tipoMensagem.value = resultado.sucesso ? 'sucesso' : 'erro'

  setTimeout(() => {
    mensagem.value = ''
  }, 2500)
}
</script>

<template>
  <div>
    <div
      v-if="mensagem"
      :class="['toast', tipoMensagem]"
    >
      {{ mensagem }}
    </div>

    <div class="card">
      <div class="imagem">
        <img
          v-if="produto.imagem"
          :src="produto.imagem"
          :alt="produto.nome"
        />

        <span v-else>
          Imagem do Produto
        </span>
      </div>

      <div class="conteudo">
        <p class="marca">
          {{ produto.marcas?.nome }}
        </p>

        <h3>{{ produto.nome }}</h3>

        <p class="preco">
          R$ {{ Number(produto.preco).toFixed(2) }}
        </p>

        <p class="estoque">
          Estoque: {{ produto.estoque }}
        </p>

        <button
          @click="adicionarAoCarrinho"
          :disabled="Number(produto.estoque) <= 0"
        >
          {{ Number(produto.estoque) <= 0 ? 'Sem estoque' : 'Comprar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;

  padding: 0.9rem 1.2rem;
  border-radius: 10px;

  color: white;
  font-weight: bold;

  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);

  animation: aparecer 0.3s ease;
}

.toast.sucesso {
  background: #2e7d32;
}

.toast.erro {
  background: #c62828;
}

@keyframes aparecer {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

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

.imagem img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  margin-bottom: 0.5rem;
}

.estoque {
  color: #777;
  font-size: 0.9rem;
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
}

button:hover {
  background: #540411;
}

button:disabled {
  background: #aaa;
  color: white;
  cursor: not-allowed;
}
</style>
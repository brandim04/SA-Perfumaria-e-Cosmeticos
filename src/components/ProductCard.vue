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
const modalAberto = ref(false)

function adicionarAoCarrinho() {
  const resultado = cart.adicionarProduto(props.produto)

  mensagem.value = resultado.mensagem
  tipoMensagem.value = resultado.sucesso ? 'sucesso' : 'erro'

  setTimeout(() => {
    mensagem.value = ''
  }, 2500)
}

function abrirModal() {
  modalAberto.value = true
}

function fecharModal() {
  modalAberto.value = false
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

    <div class="card" @click="abrirModal">
      <div class="imagem">
        <img
          v-if="produto.imagem"
          :src="produto.imagem.trim()"
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
          type="button"
          @click.stop="adicionarAoCarrinho"
          :disabled="Number(produto.estoque) <= 0"
        >
          {{ Number(produto.estoque) <= 0 ? 'Sem estoque' : 'Comprar' }}
        </button>
      </div>
    </div>

    <div
      v-if="modalAberto"
      class="modal-fundo"
      @click="fecharModal"
    >
      <div
        class="modal-card"
        @click.stop
      >
        <button
          type="button"
          class="fechar"
          @click="fecharModal"
        >
          ✕
        </button>

        <div class="modal-imagem">
          <img
            v-if="produto.imagem"
            :src="produto.imagem.trim()"
            :alt="produto.nome"
          />

          <span v-else>
            Imagem do Produto
          </span>
        </div>

        <div class="modal-info">
          <p class="marca-modal">
            {{ produto.marcas?.nome }}
          </p>

          <h2>{{ produto.nome }}</h2>

          <p class="modal-preco">
            R$ {{ Number(produto.preco).toFixed(2) }}
          </p>

          <p class="descricao">
            {{ produto.descricao || 'Este produto ainda não possui descrição cadastrada.' }}
          </p>

          <p class="estoque-modal">
            Estoque disponível: {{ produto.estoque }}
          </p>

          <button
            type="button"
            class="comprar-modal"
            @click="adicionarAoCarrinho"
            :disabled="Number(produto.estoque) <= 0"
          >
            {{ Number(produto.estoque) <= 0 ? 'Sem estoque' : 'Adicionar ao carrinho' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;

  padding: 0.9rem 1.2rem;
  border-radius: 10px;

  color: white;
  font-weight: bold;

  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.toast.sucesso {
  background: #2e7d32;
}

.toast.erro {
  background: #c62828;
}

.card {
  background: white;
  border-radius: 16px;
  overflow: hidden;

  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

  transition: all 0.3s ease;

  display: flex;
  flex-direction: column;

  cursor: pointer;
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

  overflow: hidden;
}

.imagem img {
  width: 100%;
  height: 100%;

  object-fit: contain;

  padding: 1rem;

  display: block;
}

.conteudo {
  padding: 1rem;
}

.marca {
  color: #888;

  font-size: 0.85rem;

  text-transform: uppercase;

  letter-spacing: 1px;

  margin-bottom: 0.5rem;
}

h3 {
  font-size: 1rem;

  margin-bottom: 1rem;

  color: #333;

  min-height: 48px;
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

.conteudo button {
  width: 100%;

  padding: 0.9rem;

  border: none;
  border-radius: 10px;

  background: #6f0716;
  color: #e5c89a;

  font-weight: bold;

  cursor: pointer;
}

.conteudo button:hover {
  background: #540411;
}

.conteudo button:disabled {
  background: #aaa;
  color: white;
  cursor: not-allowed;
}

.modal-fundo {
  position: fixed;
  inset: 0;

  background: rgba(0, 0, 0, 0.6);

  z-index: 9998;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 1.5rem;
}

.modal-card {
  position: relative;

  width: 100%;
  max-width: 900px;

  background: white;

  border-radius: 20px;

  overflow: hidden;

  display: grid;
  grid-template-columns: 1fr 1fr;

  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
}

.fechar {
  position: absolute;

  top: 15px;
  right: 15px;

  width: 40px;
  height: 40px;

  border: none;
  border-radius: 50%;

  background: #6f0716;
  color: #e5c89a;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 1.3rem;
  font-weight: bold;
  line-height: 1;

  cursor: pointer;

  z-index: 9999;
}

.modal-imagem {
  background: #f8f6f4;

  min-height: 420px;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 2rem;
}

.modal-imagem img {
  width: 100%;
  max-width: 360px;
  max-height: 360px;

  object-fit: contain;

  display: block;
}

.modal-imagem span {
  color: #999;
}

.modal-info {
  padding: 2rem;

  display: flex;
  flex-direction: column;
}

.marca-modal {
  color: #9a7b34;

  text-transform: uppercase;
  letter-spacing: 1px;

  font-size: 0.85rem;

  margin-bottom: 0.5rem;
}

.modal-info h2 {
  margin: 0;

  color: #333;

  font-size: 2rem;
}

.modal-preco {
  color: #6f0716;

  font-size: 2rem;
  font-weight: bold;

  margin: 1rem 0;
}

.descricao {
  color: #555;

  line-height: 1.7;

  margin-bottom: 1.5rem;
}

.estoque-modal {
  color: #777;
  font-weight: 500;

  margin-bottom: 2rem;
}

.comprar-modal {
  margin-top: auto;

  width: 100%;

  background: #6f0716;
  color: #e5c89a;

  border: none;
  border-radius: 12px;

  padding: 1rem;

  font-size: 1rem;
  font-weight: bold;

  cursor: pointer;
}

.comprar-modal:hover {
  background: #540411;
}

.comprar-modal:disabled {
  background: #999;
  color: white;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .modal-card {
    grid-template-columns: 1fr;

    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-imagem {
    min-height: 250px;
    padding: 1rem;
  }

  .modal-imagem img {
    max-height: 250px;
  }

  .modal-info {
    padding: 1.5rem;
  }

  .modal-info h2 {
    font-size: 1.5rem;
  }

  .modal-preco {
    font-size: 1.6rem;
  }
}
</style>
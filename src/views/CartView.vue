<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'

const router = useRouter()
const cart = useCartStore()

function voltarParaLoja() {
  router.push('/')
}

function irParaCheckout() {
  router.push('/checkout')
}

const total = computed(() => {
  return cart.itens.reduce(
    (soma, produto) =>
      soma + Number(produto.preco) * produto.quantidade,
    0
  )
})
</script>

<template>
  <div class="pagina-carrinho">
    <div class="topo">
      <div>
        <h1>Meu Carrinho</h1>
        <p>Confira os produtos antes de finalizar seu pedido.</p>
      </div>

      <button
        type="button"
        class="botao-voltar"
        @click="voltarParaLoja"
      >
        ← Voltar para a loja
      </button>
    </div>

    <div v-if="cart.itens.length === 0" class="carrinho-vazio">
      <h2>Seu carrinho está vazio</h2>
      <p>Adicione produtos para continuar seu pedido.</p>

      <button
        type="button"
        class="botao-principal"
        @click="voltarParaLoja"
      >
        Ver produtos
      </button>
    </div>

    <div v-else class="conteudo-carrinho">
      <section class="lista-produtos">
        <div
          v-for="produto in cart.itens"
          :key="produto.id"
          class="item-carrinho"
        >
          <div class="imagem-produto">
            <img
              v-if="produto.imagem"
              :src="produto.imagem"
              :alt="produto.nome"
            />

            <span v-else>
              Sem imagem
            </span>
          </div>

          <div class="info-produto">
            <p class="marca">
              {{ produto.marcas?.nome }}
            </p>

            <h3>{{ produto.nome }}</h3>

            <p class="estoque">
              Estoque disponível: {{ produto.estoque }}
            </p>

            <button
              type="button"
              class="remover"
              @click="cart.removerProduto(produto.id)"
            >
              Remover
            </button>
          </div>

          <div class="controle-quantidade">
            <p>Quantidade</p>

            <div class="botoes-quantidade">
              <button
                type="button"
                @click="cart.diminuirQuantidade(produto.id)"
              >
                -
              </button>

              <span>{{ produto.quantidade }}</span>

              <button
                type="button"
                @click="cart.aumentarQuantidade(produto.id)"
                :disabled="produto.quantidade >= Number(produto.estoque)"
              >
                +
              </button>
            </div>
          </div>

          <div class="precos">
            <p class="preco-unitario">
              R$ {{ Number(produto.preco).toFixed(2) }} un.
            </p>

            <strong>
              R$ {{ (Number(produto.preco) * produto.quantidade).toFixed(2) }}
            </strong>
          </div>
        </div>
      </section>

      <aside class="resumo">
        <h2>Resumo do pedido</h2>

        <div class="linha-resumo">
          <span>Itens</span>
          <strong>{{ cart.totalItens }}</strong>
        </div>

        <div class="linha-resumo total">
          <span>Total</span>
          <strong>R$ {{ total.toFixed(2) }}</strong>
        </div>

        <button
          type="button"
          class="finalizar"
          @click="irParaCheckout"
        >
          Finalizar Pedido
        </button>

        <button
          type="button"
          class="limpar"
          @click="cart.limparCarrinho()"
        >
          Limpar Carrinho
        </button>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.pagina-carrinho {
  max-width: 1180px;
  margin: 0 auto;
  padding: 2rem;
}

.topo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 2rem;
}

h1 {
  color: #6f0716;
  margin: 0;
}

.topo p {
  color: #777;
  margin-top: 0.4rem;
}

.botao-voltar {
  background: #ffffff;
  color: #6f0716;
  border: 1px solid #6f0716;
  border-radius: 999px;
  padding: 0.75rem 1.2rem;
  font-weight: bold;
  cursor: pointer;
}

.carrinho-vazio {
  background: #ffffff;
  border-radius: 18px;
  padding: 3rem 2rem;
  text-align: center;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.08);
}

.carrinho-vazio h2 {
  color: #6f0716;
  margin-bottom: 0.5rem;
}

.carrinho-vazio p {
  color: #777;
  margin-bottom: 1.5rem;
}

.botao-principal {
  background: #6f0716;
  color: #e5c89a;
  border: none;
  border-radius: 999px;
  padding: 0.9rem 1.4rem;
  font-weight: bold;
  cursor: pointer;
}

.conteudo-carrinho {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 1.5rem;
  align-items: flex-start;
}

.lista-produtos {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.item-carrinho {
  background: #ffffff;
  border-radius: 18px;
  padding: 1rem;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.08);

  display: grid;
  grid-template-columns: 110px 1fr 160px 140px;
  gap: 1rem;
  align-items: center;
}

.imagem-produto {
  width: 110px;
  height: 110px;
  background: #f8f6f4;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 0.8rem;
  overflow: hidden;
}

.imagem-produto img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.marca {
  color: #9a7b34;
  text-transform: uppercase;
  font-size: 0.78rem;
  letter-spacing: 1px;
  margin: 0 0 0.35rem;
}

.info-produto h3 {
  margin: 0;
  color: #333;
}

.estoque {
  color: #777;
  font-size: 0.9rem;
  margin: 0.5rem 0;
}

.remover {
  background: transparent;
  color: #c62828;
  border: none;
  padding: 0;
  font-weight: bold;
  cursor: pointer;
}

.controle-quantidade p {
  margin: 0 0 0.5rem;
  color: #777;
  font-size: 0.9rem;
}

.botoes-quantidade {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.botoes-quantidade button {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: none;
  background: #6f0716;
  color: #e5c89a;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
}

.botoes-quantidade button:disabled {
  background: #ccc;
  color: #777;
  cursor: not-allowed;
}

.botoes-quantidade span {
  min-width: 28px;
  text-align: center;
  font-weight: bold;
}

.precos {
  text-align: right;
}

.preco-unitario {
  color: #777;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
}

.precos strong {
  color: #6f0716;
  font-size: 1.1rem;
}

.resumo {
  background: #ffffff;
  border-radius: 18px;
  padding: 1.4rem;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 1rem;
}

.resumo h2 {
  color: #6f0716;
  margin-top: 0;
  margin-bottom: 1.5rem;
}

.linha-resumo {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  color: #555;
}

.linha-resumo.total {
  border-top: 1px solid #eee;
  padding-top: 1rem;
  font-size: 1.2rem;
  color: #6f0716;
}

.finalizar,
.limpar {
  width: 100%;
  border: none;
  border-radius: 12px;
  padding: 1rem;
  font-weight: bold;
  cursor: pointer;
}

.finalizar {
  background: #6f0716;
  color: #e5c89a;
  margin-top: 1rem;
}

.limpar {
  background: #f8f6f4;
  color: #6f0716;
  margin-top: 0.8rem;
}

@media (max-width: 900px) {
  .conteudo-carrinho {
    grid-template-columns: 1fr;
  }

  .item-carrinho {
    grid-template-columns: 90px 1fr;
  }

  .controle-quantidade,
  .precos {
    grid-column: span 2;
    text-align: left;
  }

  .topo {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
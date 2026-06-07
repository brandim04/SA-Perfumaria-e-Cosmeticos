<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

import { useCartStore } from '../stores/cart'
import { supabase } from '../lib/supabase'

const router = useRouter()
const cart = useCartStore()

const telefoneVendedora = '5586988586598'

const nome = ref('')
const email = ref('')
const telefone = ref('')
const aniversario = ref('')
const formaPagamento = ref('PIX')

const clienteExistente = ref(false)
const clienteId = ref(null)

function voltarParaCarrinho() {
  router.push('/carrinho')
}

const totalPedido = computed(() => {
  return cart.itens.reduce(
    (total, item) =>
      total + Number(item.preco) * item.quantidade,
    0
  )
})

onMounted(() => {
  const clienteSalvo = localStorage.getItem('cliente')

  if (clienteSalvo) {
    const dados = JSON.parse(clienteSalvo)

    clienteId.value = dados.id
    nome.value = dados.nome
    email.value = dados.email
    telefone.value = dados.telefone
    aniversario.value = dados.aniversario

    clienteExistente.value = true
  }
})

async function confirmarPedido() {
  try {
    if (cart.itens.length === 0) {
      alert('Carrinho vazio')
      return
    }

    if (!clienteExistente.value) {
      const { data: clienteData, error: clienteError } = await supabase
        .from('clientes')
        .insert({
          nome: nome.value,
          email: email.value,
          telefone: telefone.value,
          aniversario: aniversario.value
        })
        .select()
        .single()

      if (clienteError) {
        console.error(clienteError)
        alert('Erro ao cadastrar cliente')
        return
      }

      clienteId.value = clienteData.id

      localStorage.setItem(
        'cliente',
        JSON.stringify({
          id: clienteData.id,
          nome: nome.value,
          email: email.value,
          telefone: telefone.value,
          aniversario: aniversario.value
        })
      )
    }

    const { data: pedidoData, error: pedidoError } = await supabase
      .from('pedidos')
      .insert({
        cliente_id: clienteId.value,
        valor_total: totalPedido.value,
        forma_pagamento: formaPagamento.value,
        status: 'Pendente'
      })
      .select()
      .single()

    if (pedidoError) {
      console.error(pedidoError)
      alert('Erro ao criar pedido')
      return
    }

    const itensPedido = cart.itens.map(produto => ({
      pedido_id: pedidoData.id,
      produto_id: produto.id,
      quantidade: produto.quantidade,
      preco_unitario: produto.preco
    }))

    const { error: itensError } = await supabase
      .from('itens_pedido')
      .insert(itensPedido)

    if (itensError) {
      console.error(itensError)
      alert('Erro ao salvar itens do pedido')
      return
    }

    const listaProdutos = cart.itens
      .map(produto => {
        const subtotal = Number(produto.preco) * produto.quantidade

        return `• ${produto.quantidade}x ${produto.nome} - R$ ${subtotal.toFixed(2)}`
      })
      .join('\n')

    const mensagem = `
Olá Samara!

Novo pedido realizado.

Cliente: ${nome.value}
Telefone: ${telefone.value}

Produtos:
${listaProdutos}

Total: R$ ${totalPedido.value.toFixed(2)}

Pagamento: ${formaPagamento.value}
`

    const mensagemCodificada = encodeURIComponent(mensagem)

    window.open(
      `https://wa.me/${telefoneVendedora}?text=${mensagemCodificada}`,
      '_blank'
    )

    cart.limparCarrinho()

    alert('Pedido realizado com sucesso!')

    router.push('/')
  } catch (error) {
    console.error(error)
    alert('Erro ao finalizar pedido')
  }
}
</script>

<template>
  <div class="pagina-checkout">
    <div class="topo">
      <div>
        <h1>Finalizar Pedido</h1>
        <p>Preencha os dados para enviar o pedido pelo WhatsApp.</p>
      </div>

      <button
        type="button"
        class="botao-voltar"
        @click="voltarParaCarrinho"
      >
        ← Voltar para o carrinho
      </button>
    </div>

    <div class="checkout-grid">
      <form class="formulario">
        <div
          v-if="clienteExistente"
          class="cliente-info"
        >
          <p>
            Bem-vindo novamente,
            <strong>{{ nome }}</strong>
          </p>

          <p>
            WhatsApp: {{ telefone }}
          </p>
        </div>

        <input
          v-if="!clienteExistente"
          v-model="nome"
          type="text"
          placeholder="Nome completo"
        />

        <input
          v-if="!clienteExistente"
          v-model="email"
          type="email"
          placeholder="E-mail"
        />

        <input
          v-if="!clienteExistente"
          v-model="telefone"
          type="text"
          placeholder="WhatsApp"
        />

        <label v-if="!clienteExistente">
          Data de nascimento
        </label>

        <input
          v-if="!clienteExistente"
          v-model="aniversario"
          type="date"
        />

        <label>
          Forma de pagamento
        </label>

        <select v-model="formaPagamento">
          <option>PIX</option>
          <option>Dinheiro</option>
          <option>Cartão de Débito</option>
          <option>Cartão de Crédito</option>
        </select>

        <button
          type="button"
          class="confirmar"
          @click="confirmarPedido"
        >
          Confirmar Pedido
        </button>
      </form>

      <aside class="resumo">
        <h2>Resumo</h2>

        <div
          v-for="produto in cart.itens"
          :key="produto.id"
          class="item-resumo"
        >
          <span>
            {{ produto.quantidade }}x {{ produto.nome }}
          </span>

          <strong>
            R$ {{ (Number(produto.preco) * produto.quantidade).toFixed(2) }}
          </strong>
        </div>

        <div class="total">
          <span>Total</span>
          <strong>R$ {{ totalPedido.toFixed(2) }}</strong>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.pagina-checkout {
  max-width: 1100px;
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

.checkout-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 1.5rem;
  align-items: flex-start;
}

.formulario,
.resumo {
  background: #ffffff;
  border-radius: 18px;
  padding: 1.5rem;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.08);
}

.formulario {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cliente-info {
  background: #f8f6f4;
  padding: 1rem;
  border-radius: 12px;
  color: #333;
}

input,
select {
  padding: 0.95rem;
  border: 1px solid #ddd;
  border-radius: 10px;
  outline: none;
}

label {
  font-weight: bold;
  color: #6f0716;
}

.confirmar {
  background: #6f0716;
  color: #e5c89a;
  border: none;
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  font-weight: bold;
  margin-top: 0.5rem;
}

.resumo h2 {
  color: #6f0716;
  margin-top: 0;
  margin-bottom: 1.5rem;
}

.item-resumo {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
  color: #555;
}

.item-resumo span {
  flex: 1;
}

.item-resumo strong {
  color: #6f0716;
  white-space: nowrap;
}

.total {
  border-top: 1px solid #eee;
  padding-top: 1rem;
  margin-top: 1rem;

  display: flex;
  justify-content: space-between;

  color: #6f0716;
  font-size: 1.2rem;
}

@media (max-width: 850px) {
  .checkout-grid {
    grid-template-columns: 1fr;
  }

  .topo {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
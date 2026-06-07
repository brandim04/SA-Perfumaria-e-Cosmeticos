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

const totalPedido = computed(() => {
  return cart.itens.reduce(
    (total, item) => total + Number(item.preco),
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
      const {
        data: clienteData,
        error: clienteError
      } = await supabase
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

    const {
      data: pedidoData,
      error: pedidoError
    } = await supabase
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
      quantidade: 1,
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
      .map(
        produto =>
          `• ${produto.nome} - R$ ${Number(produto.preco).toFixed(2)}`
      )
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

    const mensagemCodificada =
      encodeURIComponent(mensagem)

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
  <div class="container">
    <h1>Finalizar Pedido</h1>

```
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

  <div class="total">
    Total: R$ {{ totalPedido.toFixed(2) }}
  </div>

  <button
    type="button"
    @click="confirmarPedido"
  >
    Confirmar Pedido
  </button>
</form>
```

  </div>
</template>

<style scoped>
.container {
  max-width: 700px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  color: #6f0716;
  margin-bottom: 2rem;
}

.formulario {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cliente-info {
  background: #f8f6f4;
  padding: 1rem;
  border-radius: 8px;
}

input,
select {
  padding: 0.9rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.total {
  font-size: 1.2rem;
  font-weight: bold;
  color: #6f0716;
}

button {
  background: #6f0716;
  color: #e5c89a;
  border: none;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  font-weight: bold;
}
</style>

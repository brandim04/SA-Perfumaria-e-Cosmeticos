<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = useRouter()

const pedidos = ref([])
const pedidoSelecionado = ref(null)
const modalAberto = ref(false)

const statusOptions = [
  'Pendente',
  'Pago',
  'Concluído',
  'Cancelado'
]

function voltarDashboard() {
  router.push('/admin')
}

async function carregarPedidos() {
  const { data, error } = await supabase
    .from('pedidos')
    .select(`
      *,
      clientes (
        nome,
        telefone,
        email
      ),
      itens_pedido (
        id,
        produto_id,
        quantidade,
        preco_unitario,
        produtos (
          id,
          nome,
          imagem,
          estoque
        )
      )
    `)
    .order('created_at', {
      ascending: false
    })

  if (error) {
    console.error(error)
    alert('Erro ao carregar pedidos')
    return
  }

  pedidos.value = data || []
}

async function baixarEstoque(pedido) {
  for (const item of pedido.itens_pedido || []) {
    const produto = item.produtos

    if (!produto) continue

    const estoqueAtual = Number(produto.estoque || 0)
    const quantidadeComprada = Number(item.quantidade || 1)
    const novoEstoque = Math.max(estoqueAtual - quantidadeComprada, 0)

    const { error } = await supabase
      .from('produtos')
      .update({
        estoque: novoEstoque
      })
      .eq('id', produto.id)

    if (error) {
      console.error(error)
      alert(`Erro ao baixar estoque do produto ${produto.nome}`)
      return false
    }
  }

  return true
}

async function atualizarStatus(pedido) {
  if (pedido.status === 'Concluído' && !pedido.estoque_baixado) {
    const estoqueBaixado = await baixarEstoque(pedido)

    if (!estoqueBaixado) return

    const { error } = await supabase
      .from('pedidos')
      .update({
        status: pedido.status,
        estoque_baixado: true
      })
      .eq('id', pedido.id)

    if (error) {
      console.error(error)
      alert('Erro ao atualizar status')
      return
    }

    alert('Status atualizado e estoque baixado com sucesso')
    carregarPedidos()
    return
  }

  const { error } = await supabase
    .from('pedidos')
    .update({
      status: pedido.status
    })
    .eq('id', pedido.id)

  if (error) {
    console.error(error)
    alert('Erro ao atualizar status')
    return
  }

  alert('Status atualizado com sucesso')
  carregarPedidos()
}

function abrirDetalhes(pedido) {
  pedidoSelecionado.value = pedido
  modalAberto.value = true
}

function fecharModal() {
  pedidoSelecionado.value = null
  modalAberto.value = false
}

function formatarData(data) {
  if (!data) return '-'

  return new Date(data).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function classeStatus(status) {
  if (status === 'Pago') return 'pago'
  if (status === 'Concluído') return 'concluido'
  if (status === 'Cancelado') return 'cancelado'

  return 'pendente'
}

function subtotalItem(item) {
  return Number(item.preco_unitario || 0) * Number(item.quantidade || 1)
}

onMounted(() => {
  carregarPedidos()
})
</script>

<template>
  <div class="admin-page">
    <header class="topo">
      <div>
        <h1>Pedidos</h1>
        <p>Gerencie os pedidos recebidos pela loja.</p>
      </div>

      <button
        type="button"
        class="voltar"
        @click="voltarDashboard"
      >
        ← Voltar ao painel
      </button>
    </header>

    <div v-if="pedidos.length === 0" class="vazio">
      Nenhum pedido encontrado.
    </div>

    <div v-else class="tabela-container">
      <table>
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Telefone</th>
            <th>Data</th>
            <th>Total</th>
            <th>Pagamento</th>
            <th>Status</th>
            <th>Estoque</th>
            <th>Alterar status</th>
            <th>Detalhes</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="pedido in pedidos"
            :key="pedido.id"
          >
            <td>
              <strong>{{ pedido.clientes?.nome || 'Cliente não informado' }}</strong>
            </td>

            <td>
              {{ pedido.clientes?.telefone || '-' }}
            </td>

            <td>
              {{ formatarData(pedido.created_at) }}
            </td>

            <td class="valor">
              R$ {{ Number(pedido.valor_total || 0).toFixed(2) }}
            </td>

            <td>
              {{ pedido.forma_pagamento }}
            </td>

            <td>
              <span :class="['status', classeStatus(pedido.status)]">
                {{ pedido.status }}
              </span>
            </td>

            <td>
              <span
                :class="['estoque-status', pedido.estoque_baixado ? 'baixado' : 'nao-baixado']"
              >
                {{ pedido.estoque_baixado ? 'Baixado' : 'Pendente' }}
              </span>
            </td>

            <td>
              <select
                v-model="pedido.status"
                @change="atualizarStatus(pedido)"
              >
                <option
                  v-for="status in statusOptions"
                  :key="status"
                  :value="status"
                >
                  {{ status }}
                </option>
              </select>
            </td>

            <td>
              <button
                type="button"
                class="detalhes"
                @click="abrirDetalhes(pedido)"
              >
                Ver detalhes
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="modalAberto && pedidoSelecionado"
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

        <div class="modal-topo">
          <div>
            <h2>Detalhes do pedido</h2>
            <p>
              Pedido realizado em {{ formatarData(pedidoSelecionado.created_at) }}
            </p>
          </div>

          <span :class="['status', classeStatus(pedidoSelecionado.status)]">
            {{ pedidoSelecionado.status }}
          </span>
        </div>

        <section class="cliente-box">
          <h3>Cliente</h3>

          <p>
            <strong>Nome:</strong>
            {{ pedidoSelecionado.clientes?.nome || 'Não informado' }}
          </p>

          <p>
            <strong>Telefone:</strong>
            {{ pedidoSelecionado.clientes?.telefone || 'Não informado' }}
          </p>

          <p>
            <strong>Email:</strong>
            {{ pedidoSelecionado.clientes?.email || 'Não informado' }}
          </p>

          <p>
            <strong>Estoque:</strong>
            {{ pedidoSelecionado.estoque_baixado ? 'Já foi baixado' : 'Ainda não foi baixado' }}
          </p>
        </section>

        <section class="produtos-box">
          <h3>Produtos do pedido</h3>

          <div
            v-if="!pedidoSelecionado.itens_pedido || pedidoSelecionado.itens_pedido.length === 0"
            class="sem-itens"
          >
            Nenhum item encontrado para este pedido.
          </div>

          <div
            v-for="item in pedidoSelecionado.itens_pedido"
            :key="item.id"
            class="item-pedido"
          >
            <div class="imagem-produto">
              <img
                v-if="item.produtos?.imagem"
                :src="item.produtos.imagem.trim()"
                :alt="item.produtos?.nome"
              />

              <span v-else>
                Sem imagem
              </span>
            </div>

            <div class="item-info">
              <strong>
                {{ item.produtos?.nome || 'Produto não encontrado' }}
              </strong>

              <p>
                Quantidade: {{ item.quantidade }}
              </p>

              <p>
                Valor unitário: R$ {{ Number(item.preco_unitario || 0).toFixed(2) }}
              </p>
            </div>

            <div class="item-subtotal">
              R$ {{ subtotalItem(item).toFixed(2) }}
            </div>
          </div>
        </section>

        <section class="resumo-box">
          <div>
            <span>Forma de pagamento</span>
            <strong>{{ pedidoSelecionado.forma_pagamento }}</strong>
          </div>

          <div>
            <span>Total do pedido</span>
            <strong>
              R$ {{ Number(pedidoSelecionado.valor_total || 0).toFixed(2) }}
            </strong>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-page {
  min-height: 100vh;
  background: #f8f6f4;
  padding: 2rem;
}

.topo {
  background: linear-gradient(135deg, #6f0716, #4b0410);
  color: white;

  padding: 1.8rem;
  border-radius: 18px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom: 2rem;
}

.topo h1 {
  margin: 0;
  color: #e5c89a;
}

.topo p {
  margin: 0.4rem 0 0;
  color: #f5e7c8;
}

.voltar {
  background: white;
  color: #6f0716;

  border: none;
  border-radius: 999px;

  padding: 0.8rem 1.3rem;

  font-weight: bold;
  cursor: pointer;
}

.vazio {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  text-align: center;
  color: #777;
}

.tabela-container {
  background: white;
  border-radius: 18px;
  padding: 1rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  color: #6f0716;
  text-align: left;
  padding: 1rem;
  border-bottom: 2px solid #eee;
}

td {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  color: #444;
}

.valor {
  font-weight: bold;
  color: #6f0716;
}

.status {
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: bold;
  white-space: nowrap;
}

.pendente {
  background: #fff3cd;
  color: #8a6d00;
}

.pago {
  background: #dff5e1;
  color: #2e7d32;
}

.concluido {
  background: #d9edf7;
  color: #0b5f8a;
}

.cancelado {
  background: #fde0e0;
  color: #c62828;
}

select {
  padding: 0.6rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  outline: none;
}

.detalhes {
  background: #6f0716;
  color: #e5c89a;

  border: none;
  border-radius: 10px;

  padding: 0.65rem 0.9rem;

  font-weight: bold;
  cursor: pointer;
  white-space: nowrap;
}

.modal-fundo {
  position: fixed;
  inset: 0;

  background: rgba(0, 0, 0, 0.55);

  z-index: 9998;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 1rem;
}

.modal-card {
  position: relative;

  width: 100%;
  max-width: 850px;
  max-height: 90vh;

  overflow-y: auto;

  background: white;

  border-radius: 20px;
  padding: 2rem;

  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
}

.fechar {
  position: absolute;
  top: 14px;
  right: 14px;

  width: 38px;
  height: 38px;

  border: none;
  border-radius: 50%;

  background: #6f0716;
  color: #e5c89a;

  font-weight: bold;
  cursor: pointer;
}

.modal-topo {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;

  margin-bottom: 1.5rem;
}

.modal-topo h2 {
  color: #6f0716;
  margin: 0;
}

.modal-topo p {
  color: #777;
  margin: 0.4rem 0 0;
}

.cliente-box,
.produtos-box,
.resumo-box {
  border: 1px solid #eee;
  border-radius: 16px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.cliente-box h3,
.produtos-box h3 {
  color: #6f0716;
  margin-top: 0;
}

.cliente-box p {
  color: #555;
  margin: 0.5rem 0;
}

.item-pedido {
  display: grid;
  grid-template-columns: 70px 1fr 120px;
  gap: 1rem;
  align-items: center;

  padding: 0.9rem 0;
  border-bottom: 1px solid #eee;
}

.item-pedido:last-child {
  border-bottom: none;
}

.imagem-produto {
  width: 70px;
  height: 70px;

  background: #f8f6f4;
  border-radius: 12px;

  display: flex;
  align-items: center;
  justify-content: center;

  color: #999;
  font-size: 0.75rem;

  overflow: hidden;
}

.imagem-produto img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 0.4rem;
}

.item-info strong {
  color: #333;
}

.item-info p {
  margin: 0.25rem 0;
  color: #666;
  font-size: 0.9rem;
}

.item-subtotal {
  text-align: right;
  color: #6f0716;
  font-weight: bold;
}

.resumo-box {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.resumo-box div {
  background: #f8f6f4;
  border-radius: 12px;
  padding: 1rem;
}

.resumo-box span {
  display: block;
  color: #777;
  margin-bottom: 0.4rem;
}

.resumo-box strong {
  color: #6f0716;
  font-size: 1.1rem;
}

.sem-itens {
  color: #777;
  padding: 1rem 0;
}

@media (max-width: 700px) {
  .topo,
  .modal-topo {
    flex-direction: column;
    align-items: flex-start;
  }

  .item-pedido {
    grid-template-columns: 60px 1fr;
  }

  .item-subtotal {
    grid-column: span 2;
    text-align: left;
  }

  .resumo-box {
    grid-template-columns: 1fr;
  }
}

.estoque-status {
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: bold;
  white-space: nowrap;
}

.estoque-status.baixado {
  background: #dff5e1;
  color: #2e7d32;
}

.estoque-status.nao-baixado {
  background: #fff3cd;
  color: #8a6d00;
}
</style>
<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = useRouter()

const cliente = ref(null)
const pedidos = ref([])

const totalPedidos = computed(() => pedidos.value.length)

const totalComprado = computed(() => {
  return pedidos.value
    .filter(pedido =>
      pedido.status === 'Pago' || pedido.status === 'Concluído'
    )
    .reduce(
      (total, pedido) => total + Number(pedido.valor_total || 0),
      0
    )
})

function voltarLoja() {
  router.push('/')
}

async function carregarPedidos() {
  const clienteSalvo = localStorage.getItem('cliente')

  if (!clienteSalvo) {
    cliente.value = null
    return
  }

  cliente.value = JSON.parse(clienteSalvo)

  const { data, error } = await supabase
    .from('pedidos')
    .select(`
      id,
      valor_total,
      forma_pagamento,
      status,
      created_at,
      itens_pedido (
        id,
        quantidade,
        preco_unitario,
        produtos (
          nome,
          imagem
        )
      )
    `)
    .eq('cliente_id', cliente.value.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error(error)
    alert('Erro ao carregar pedidos')
    return
  }

  pedidos.value = data || []
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

function textoStatus(status) {
  if (status === 'Pendente') {
    return 'Seu pedido foi recebido e está aguardando confirmação.'
  }

  if (status === 'Pago') {
    return 'Pagamento confirmado. Seu pedido será preparado em breve.'
  }

  if (status === 'Concluído') {
    return 'Pedido concluído. Obrigada pela preferência.'
  }

  if (status === 'Cancelado') {
    return 'Este pedido foi cancelado.'
  }

  return 'Acompanhe o andamento do seu pedido.'
}

function subtotalItem(item) {
  return Number(item.preco_unitario || 0) * Number(item.quantidade || 1)
}

onMounted(() => {
  carregarPedidos()
})
</script>

<template>
  <div class="pagina">
    <header class="topo">
      <div>
        <span class="tag">Área do cliente</span>
        <h1>Meus pedidos</h1>

        <p v-if="cliente">
          Olá, <strong>{{ cliente.nome }}</strong>. Acompanhe aqui o status das suas compras.
        </p>

        <p v-else>
          Acompanhe seus pedidos após realizar a primeira compra.
        </p>
      </div>

      <button
        type="button"
        @click="voltarLoja"
      >
        Voltar para a loja
      </button>
    </header>

    <section
      v-if="cliente"
      class="resumo-cliente"
    >
      <div class="resumo-card">
        <span>Total de pedidos</span>
        <strong>{{ totalPedidos }}</strong>
      </div>

      <div class="resumo-card">
        <span>Total em compras confirmadas</span>
        <strong>R$ {{ totalComprado.toFixed(2) }}</strong>
      </div>

      <div class="resumo-card">
        <span>WhatsApp cadastrado</span>
        <strong>{{ cliente.telefone || 'Não informado' }}</strong>
      </div>
    </section>

    <div
      v-if="!cliente"
      class="estado-vazio"
    >
      <div class="icone-vazio">!</div>

      <h2>Nenhum cadastro encontrado</h2>

      <p>
        Essa área aparece depois que você realiza seu primeiro pedido na loja.
      </p>

      <button
        type="button"
        @click="voltarLoja"
      >
        Ver produtos
      </button>
    </div>

    <div
      v-else-if="pedidos.length === 0"
      class="estado-vazio"
    >
      <div class="icone-vazio">0</div>

      <h2>Nenhum pedido encontrado</h2>

      <p>
        Você ainda não possui pedidos cadastrados.
      </p>

      <button
        type="button"
        @click="voltarLoja"
      >
        Comprar agora
      </button>
    </div>

    <section
      v-else
      class="lista"
    >
      <div
        v-for="pedido in pedidos"
        :key="pedido.id"
        class="pedido-card"
      >
        <div class="pedido-header">
          <div>
            <span class="pedido-label">Pedido</span>
            <h2>{{ formatarData(pedido.created_at) }}</h2>
            <p>{{ textoStatus(pedido.status) }}</p>
          </div>

          <span :class="['status', classeStatus(pedido.status)]">
            {{ pedido.status }}
          </span>
        </div>

        <div class="pedido-info">
          <div>
            <span>Forma de pagamento</span>
            <strong>{{ pedido.forma_pagamento }}</strong>
          </div>

          <div>
            <span>Total do pedido</span>
            <strong>R$ {{ Number(pedido.valor_total || 0).toFixed(2) }}</strong>
          </div>
        </div>

        <div class="produtos">
          <h3>Produtos comprados</h3>

          <div
            v-for="item in pedido.itens_pedido"
            :key="item.id"
            class="produto"
          >
            <div class="produto-imagem">
              <img
                v-if="item.produtos?.imagem"
                :src="item.produtos.imagem.trim()"
                :alt="item.produtos?.nome"
              />

              <span v-else>
                Sem imagem
              </span>
            </div>

            <div class="produto-info">
              <strong>{{ item.produtos?.nome || 'Produto não encontrado' }}</strong>

              <p>
                Quantidade: {{ item.quantidade }}
              </p>

              <p>
                Valor unitário: R$ {{ Number(item.preco_unitario || 0).toFixed(2) }}
              </p>
            </div>

            <div class="produto-subtotal">
              R$ {{ subtotalItem(item).toFixed(2) }}
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.pagina {
  min-height: 100vh;
  background: #f8f6f4;
  padding: 2rem;
}

.topo {
  background: linear-gradient(135deg, #6f0716, #4b0410);
  color: white;

  padding: 2rem;
  border-radius: 22px;

  display: flex;
  justify-content: space-between;
  align-items: center;

  margin-bottom: 1.5rem;

  box-shadow: 0 10px 28px rgba(111, 7, 22, 0.22);
}

.tag {
  display: inline-block;

  background: rgba(229, 200, 154, 0.18);
  color: #e5c89a;

  padding: 0.35rem 0.75rem;
  border-radius: 999px;

  font-size: 0.8rem;
  font-weight: bold;

  margin-bottom: 0.8rem;
}

.topo h1 {
  color: #e5c89a;
  margin: 0;
  font-size: 2.2rem;
}

.topo p {
  color: #f5e7c8;
  margin: 0.4rem 0 0;
  max-width: 600px;
}

.topo button {
  background: white;
  color: #6f0716;

  border: none;
  border-radius: 999px;

  padding: 0.85rem 1.3rem;

  font-weight: bold;
  cursor: pointer;
}

.resumo-cliente {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;

  margin-bottom: 1.5rem;
}

.resumo-card {
  background: white;
  border-radius: 18px;
  padding: 1.3rem;

  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.resumo-card span {
  display: block;
  color: #777;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.resumo-card strong {
  color: #6f0716;
  font-size: 1.3rem;
}

.estado-vazio {
  background: white;
  border-radius: 22px;
  padding: 3rem 2rem;

  text-align: center;

  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.icone-vazio {
  width: 54px;
  height: 54px;

  margin: 0 auto 1rem;

  border-radius: 50%;

  background: #f8f6f4;
  color: #6f0716;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 1.4rem;
  font-weight: bold;
}

.estado-vazio h2 {
  color: #6f0716;
  margin-bottom: 0.5rem;
}

.estado-vazio p {
  color: #777;
  margin-bottom: 1.5rem;
}

.estado-vazio button {
  background: #6f0716;
  color: #e5c89a;

  border: none;
  border-radius: 999px;

  padding: 0.9rem 1.4rem;

  font-weight: bold;
  cursor: pointer;
}

.lista {
  display: grid;
  gap: 1.2rem;
}

.pedido-card {
  background: white;
  border-radius: 22px;
  padding: 1.5rem;

  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.pedido-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;

  border-bottom: 1px solid #eee;

  padding-bottom: 1rem;
  margin-bottom: 1rem;
}

.pedido-label {
  display: inline-block;

  color: #9a7b34;

  text-transform: uppercase;
  letter-spacing: 1px;

  font-size: 0.75rem;
  font-weight: bold;

  margin-bottom: 0.3rem;
}

.pedido-header h2 {
  color: #6f0716;
  margin: 0;
}

.pedido-header p {
  color: #777;
  margin: 0.4rem 0 0;
}

.status {
  padding: 0.45rem 0.85rem;
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

.pedido-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;

  margin-bottom: 1rem;
}

.pedido-info div {
  background: #f8f6f4;
  border-radius: 14px;
  padding: 1rem;
}

.pedido-info span {
  display: block;
  color: #777;
  margin-bottom: 0.4rem;
  font-size: 0.9rem;
}

.pedido-info strong {
  color: #6f0716;
  font-size: 1.1rem;
}

.produtos {
  border: 1px solid #eee;
  border-radius: 16px;
  padding: 1rem;
}

.produtos h3 {
  margin-top: 0;
  color: #6f0716;
}

.produto {
  display: grid;
  grid-template-columns: 70px 1fr 130px;
  gap: 1rem;
  align-items: center;

  padding: 0.9rem 0;
  border-bottom: 1px solid #eee;
}

.produto:last-child {
  border-bottom: none;
}

.produto-imagem {
  width: 70px;
  height: 70px;

  background: #f8f6f4;
  border-radius: 14px;

  display: flex;
  align-items: center;
  justify-content: center;

  color: #999;
  font-size: 0.75rem;

  overflow: hidden;
}

.produto-imagem img {
  width: 100%;
  height: 100%;

  object-fit: contain;

  padding: 0.4rem;
}

.produto-info strong {
  color: #333;
}

.produto-info p {
  margin: 0.25rem 0;
  color: #666;
  font-size: 0.9rem;
}

.produto-subtotal {
  color: #6f0716;
  font-weight: bold;
  text-align: right;
}

@media (max-width: 750px) {
  .topo,
  .pedido-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .produto {
    grid-template-columns: 60px 1fr;
  }

  .produto-subtotal {
    grid-column: span 2;
    text-align: left;
  }
}
</style>
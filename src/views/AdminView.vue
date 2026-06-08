<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = useRouter()

const admin = ref(JSON.parse(localStorage.getItem('admin')) || null)

const totalPedidos = ref(0)
const totalClientes = ref(0)
const totalProdutos = ref(0)
const faturamentoTotal = ref(0)
const pedidosPendentes = ref(0)
const pedidosCancelados = ref(0)
const ultimosPedidos = ref([])
const produtosEstoqueBaixo = ref([])
const aniversariantesMes = ref([])

const ticketMedio = computed(() => {
  if (totalPedidos.value === 0) return 0
  return faturamentoTotal.value / totalPedidos.value
})

function logout() {
  localStorage.removeItem('admin')
  router.push('/login')
}

async function carregarMetricas() {
  const { data: pedidosData } = await supabase
    .from('pedidos')
    .select(`
      id,
      valor_total,
      status,
      forma_pagamento,
      created_at,
      clientes (
        nome
      )
    `)
    .order('created_at', { ascending: false })

  const { data: clientesData } = await supabase
    .from('clientes')
    .select('id, nome, telefone, aniversario')

  const { data: produtosData } = await supabase
    .from('produtos')
    .select('id, nome, estoque')

  const pedidos = pedidosData || []
  const clientes = clientesData || []
  const produtos = produtosData || []

  const pedidosValidos = pedidos.filter(pedido =>
    pedido.status === 'Pago' || pedido.status === 'Concluído'
  )

  totalPedidos.value = pedidosValidos.length
  totalClientes.value = clientes.length
  totalProdutos.value = produtos.length

  pedidosPendentes.value = pedidos.filter(
    pedido => pedido.status === 'Pendente'
  ).length

  pedidosCancelados.value = pedidos.filter(
    pedido => pedido.status === 'Cancelado'
  ).length

  faturamentoTotal.value = pedidosValidos.reduce(
    (total, pedido) => total + Number(pedido.valor_total || 0),
    0
  )

  ultimosPedidos.value = pedidos.slice(0, 5)

  produtosEstoqueBaixo.value = produtos
    .filter(produto => Number(produto.estoque || 0) <= 5)
    .sort((a, b) => Number(a.estoque || 0) - Number(b.estoque || 0))
    .slice(0, 5)

  const mesAtual = new Date().getMonth() + 1

  aniversariantesMes.value = clientes
    .filter(cliente => {
      if (!cliente.aniversario) return false

      const mesAniversario = Number(cliente.aniversario.split('-')[1])

      return mesAniversario === mesAtual
    })
    .slice(0, 5)
}

function formatarData(data) {
  if (!data) return '-'
  return new Date(data).toLocaleDateString('pt-BR')
}

function classeStatus(status) {
  if (status === 'Pago') return 'pago'
  if (status === 'Concluído') return 'concluido'
  if (status === 'Cancelado') return 'cancelado'
  return 'pendente'
}

function formatarAniversario(data) {
  if (!data) return '-'

  const partes = data.split('-')

  if (partes.length !== 3) return data

  return `${partes[2]}/${partes[1]}`
}

onMounted(() => {
  carregarMetricas()
})
</script>

<template>
  <div class="admin-page">
    <header class="topo">
      <div>
        <span class="tag">Painel administrativo</span>
        <h1>Dashboard</h1>
        <p>
          Bem-vinda,
          <strong>{{ admin?.nome || 'administradora' }}</strong>
        </p>
      </div>

      <button
        type="button"
        class="logout"
        @click="logout"
      >
        Sair
      </button>
    </header>

    <section class="metricas">
      <div class="metrica-card">
        <span>Pedidos válidos</span>
        <strong>{{ totalPedidos }}</strong>
        <small>Pagos ou concluídos</small>
      </div>

      <div class="metrica-card">
        <span>Clientes</span>
        <strong>{{ totalClientes }}</strong>
        <small>Cadastrados na loja</small>
      </div>

      <div class="metrica-card">
        <span>Produtos</span>
        <strong>{{ totalProdutos }}</strong>
        <small>Disponíveis no sistema</small>
      </div>

      <div class="metrica-card destaque">
        <span>Faturamento</span>
        <strong>R$ {{ faturamentoTotal.toFixed(2) }}</strong>
        <small>Somente pedidos válidos</small>
      </div>
    </section>

    <section class="indicadores">
      <div class="indicador">
        <span>Ticket médio</span>
        <strong>R$ {{ ticketMedio.toFixed(2) }}</strong>
      </div>

      <div class="indicador">
        <span>Pedidos pendentes</span>
        <strong>{{ pedidosPendentes }}</strong>
      </div>

      <div class="indicador">
        <span>Pedidos cancelados</span>
        <strong>{{ pedidosCancelados }}</strong>
      </div>
    </section>

    <section class="atalhos">
      <router-link
        to="/admin/pedidos"
        class="atalho-card"
      >
        <span class="numero">{{ pedidosPendentes }}</span>
        <h2>Pedidos</h2>
        <p>Gerencie pedidos, acompanhe pagamentos e altere o status das vendas.</p>
      </router-link>

      <router-link
        to="/admin/produtos"
        class="atalho-card"
      >
        <span class="numero">{{ totalProdutos }}</span>
        <h2>Produtos</h2>
        <p>Cadastre, edite, pesquise e organize os produtos disponíveis na loja.</p>
      </router-link>

      <router-link
        to="/admin/clientes"
        class="atalho-card"
      >
        <span class="numero">{{ totalClientes }}</span>
        <h2>Clientes</h2>
        <p>Consulte clientes cadastrados, aniversários e histórico de compras.</p>
      </router-link>
    </section>

    <section class="extras-grid">
      <div class="painel-extra">
        <div class="titulo-extra">
          <h2>Estoque baixo</h2>

          <router-link to="/admin/produtos">
            Ver produtos
          </router-link>
        </div>

        <div
          v-if="produtosEstoqueBaixo.length === 0"
          class="mensagem-vazia"
        >
          Nenhum produto com estoque baixo.
        </div>

        <div
          v-for="produto in produtosEstoqueBaixo"
          :key="produto.id"
          class="linha-extra"
        >
          <div>
            <strong>{{ produto.nome }}</strong>
            <span>Estoque atual</span>
          </div>

          <span
            :class="['badge-estoque', Number(produto.estoque || 0) === 0 ? 'zerado' : 'baixo']"
          >
            {{ produto.estoque ?? 0 }}
          </span>
        </div>
      </div>

      <div class="painel-extra">
        <div class="titulo-extra">
          <h2>Aniversariantes do mês</h2>

          <router-link to="/admin/clientes">
            Ver clientes
          </router-link>
        </div>

        <div
          v-if="aniversariantesMes.length === 0"
          class="mensagem-vazia"
        >
          Nenhum aniversariante neste mês.
        </div>

        <div
          v-for="cliente in aniversariantesMes"
          :key="cliente.id"
          class="linha-extra"
        >
          <div>
            <strong>{{ cliente.nome }}</strong>
            <span>{{ cliente.telefone || 'Telefone não informado' }}</span>
          </div>

          <span class="badge-aniversario">
            {{ formatarAniversario(cliente.aniversario) }}
          </span>
        </div>
      </div>
    </section>

    <section class="ultimos">
      <div class="titulo-secao">
        <div>
          <h2>Últimos pedidos</h2>
          <p>Acompanhe os pedidos mais recentes da loja.</p>
        </div>

        <router-link to="/admin/pedidos">
          Ver todos
        </router-link>
      </div>

      <div
        v-if="ultimosPedidos.length === 0"
        class="vazio"
      >
        Nenhum pedido encontrado.
      </div>

      <div
        v-else
        class="tabela"
      >
        <table>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Valor</th>
              <th>Pagamento</th>
              <th>Status</th>
              <th>Data</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="pedido in ultimosPedidos"
              :key="pedido.id"
            >
              <td>
                {{ pedido.clientes?.nome || 'Cliente não informado' }}
              </td>

              <td>
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
                {{ formatarData(pedido.created_at) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
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
  padding: 2rem;
  border-radius: 22px;

  display: flex;
  justify-content: space-between;
  align-items: center;

  margin-bottom: 2rem;

  box-shadow: 0 10px 28px rgba(111, 7, 22, 0.25);
}

.tag {
  display: inline-block;
  background: rgba(229, 200, 154, 0.16);
  color: #e5c89a;

  padding: 0.35rem 0.7rem;
  border-radius: 999px;

  font-size: 0.8rem;
  font-weight: bold;

  margin-bottom: 0.8rem;
}

.topo h1 {
  margin: 0;
  color: #e5c89a;
  font-size: 2.3rem;
}

.topo p {
  margin: 0.4rem 0 0;
  color: #f5e7c8;
}

.logout {
  background: white;
  color: #6f0716;

  border: none;
  border-radius: 999px;

  padding: 0.85rem 1.5rem;

  font-weight: bold;
  cursor: pointer;
}

.metricas {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.metrica-card {
  background: white;
  border-radius: 18px;
  padding: 1.4rem;

  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.metrica-card span {
  display: block;
  color: #777;
  font-size: 0.9rem;
}

.metrica-card strong {
  display: block;
  color: #6f0716;
  font-size: 1.9rem;
  margin: 0.35rem 0;
}

.metrica-card small {
  color: #999;
}

.destaque {
  border: 2px solid #e5c89a;
}

.indicadores {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.indicador {
  background: white;
  border-radius: 16px;
  padding: 1rem 1.3rem;

  display: flex;
  justify-content: space-between;
  align-items: center;

  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
}

.indicador span {
  color: #666;
}

.indicador strong {
  color: #6f0716;
  font-size: 1.3rem;
}

.atalhos {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.atalho-card {
  position: relative;
  background: white;
  color: #333;
  text-decoration: none;

  border-radius: 18px;
  padding: 1.5rem;

  min-height: 150px;

  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);

  transition: 0.2s;
}

.atalho-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.12);
}

.atalho-card h2 {
  color: #6f0716;
  margin-top: 0;
}

.atalho-card p {
  color: #777;
  line-height: 1.5;
}

.numero {
  position: absolute;
  top: 1rem;
  right: 1rem;

  min-width: 34px;
  height: 34px;

  border-radius: 999px;

  background: #f8f6f4;
  color: #6f0716;

  display: flex;
  align-items: center;
  justify-content: center;

  font-weight: bold;
}

.extras-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;

  margin-bottom: 1.5rem;
}

.painel-extra,
.ultimos {
  background: white;
  border-radius: 18px;
  padding: 1.5rem;

  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.titulo-extra,
.titulo-secao {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  margin-bottom: 1rem;
}

.titulo-extra h2,
.titulo-secao h2 {
  color: #6f0716;
  margin: 0;
}

.titulo-secao p {
  color: #777;
  margin: 0.3rem 0 0;
}

.titulo-extra a,
.titulo-secao a {
  color: #6f0716;
  font-weight: bold;
  text-decoration: none;
  font-size: 0.9rem;
}

.linha-extra {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  padding: 0.9rem 0;
  border-bottom: 1px solid #eee;
}

.linha-extra:last-child {
  border-bottom: none;
}

.linha-extra strong {
  display: block;
  color: #333;
}

.linha-extra span {
  display: block;
  color: #777;
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.badge-estoque,
.badge-aniversario {
  min-width: 42px;

  padding: 0.4rem 0.7rem;
  border-radius: 999px;

  text-align: center;
  font-weight: bold;
  font-size: 0.85rem;
}

.badge-estoque.baixo {
  background: #fff3cd;
  color: #8a6d00;
}

.badge-estoque.zerado {
  background: #fde0e0;
  color: #c62828;
}

.badge-aniversario {
  background: #f8f6f4;
  color: #6f0716;
  white-space: nowrap;
}

.mensagem-vazia,
.vazio {
  color: #777;
  text-align: center;
  padding: 1rem;
}

.mensagem-vazia {
  background: #f8f6f4;
  border-radius: 12px;
}

.tabela {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  text-align: left;
  color: #6f0716;
  border-bottom: 2px solid #eee;
  padding: 0.9rem;
}

td {
  padding: 0.9rem;
  border-bottom: 1px solid #eee;
  color: #444;
}

.status {
  padding: 0.35rem 0.7rem;
  border-radius: 999px;

  font-size: 0.8rem;
  font-weight: bold;
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

@media (max-width: 850px) {
  .topo,
  .titulo-secao,
  .titulo-extra {
    flex-direction: column;
    align-items: flex-start;
  }

  .extras-grid {
    grid-template-columns: 1fr;
  }
}
</style>
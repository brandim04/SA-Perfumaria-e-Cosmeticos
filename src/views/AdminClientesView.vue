<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = useRouter()

const clientes = ref([])
const busca = ref('')

function voltarDashboard() {
  router.push('/admin')
}

async function carregarClientes() {
  const { data, error } = await supabase
    .from('clientes')
    .select(`
      *,
      pedidos (
        id,
        valor_total,
        status,
        created_at
      )
    `)
    .order('nome', { ascending: true })

  if (error) {
    console.error(error)
    alert('Erro ao carregar clientes')
    return
  }

  clientes.value = data || []
}

const clientesFiltrados = computed(() => {
  if (!busca.value.trim()) {
    return clientes.value
  }

  return clientes.value.filter(cliente =>
    cliente.nome?.toLowerCase().includes(busca.value.toLowerCase()) ||
    cliente.email?.toLowerCase().includes(busca.value.toLowerCase()) ||
    cliente.telefone?.includes(busca.value)
  )
})

function formatarData(data) {
  if (!data) return 'Não informado'

  return new Date(data).toLocaleDateString('pt-BR')
}

function pedidosValidos(cliente) {
  return cliente.pedidos?.filter(pedido =>
    pedido.status === 'Pago' || pedido.status === 'Concluído'
  ) || []
}

function totalGasto(cliente) {
  return pedidosValidos(cliente).reduce(
    (total, pedido) => total + Number(pedido.valor_total || 0),
    0
  )
}

function aniversarioProximo(cliente) {
  if (!cliente.aniversario) return false

  const hoje = new Date()
  const aniversario = new Date(cliente.aniversario + 'T00:00:00')

  return (
    aniversario.getMonth() === hoje.getMonth()
  )
}

onMounted(() => {
  carregarClientes()
})
</script>

<template>
  <div class="admin-page">
    <header class="topo">
      <div>
        <h1>Clientes</h1>
        <p>Visualize clientes cadastrados, aniversários e histórico de compras.</p>
      </div>

      <button
        type="button"
        class="voltar"
        @click="voltarDashboard"
      >
        ← Voltar ao painel
      </button>
    </header>

    <section class="filtros">
      <input
        v-model="busca"
        type="text"
        placeholder="Pesquisar por nome, email ou telefone..."
      />
    </section>

    <p class="contador">
      {{ clientesFiltrados.length }} cliente(s) encontrado(s)
    </p>

    <section
      v-if="clientesFiltrados.length > 0"
      class="lista"
    >
      <div
        v-for="cliente in clientesFiltrados"
        :key="cliente.id"
        class="card"
      >
        <div class="cabecalho-card">
          <div>
            <h3>{{ cliente.nome }}</h3>
            <p>{{ cliente.email || 'Email não informado' }}</p>
          </div>

          <span
            v-if="aniversarioProximo(cliente)"
            class="selo-aniversario"
          >
            Aniversário este mês
          </span>
        </div>

        <div class="info">
          <p>
            <strong>Telefone:</strong>
            {{ cliente.telefone || 'Não informado' }}
          </p>

          <p>
            <strong>Aniversário:</strong>
            {{ formatarData(cliente.aniversario) }}
          </p>

          <p>
            <strong>Cadastro:</strong>
            {{ formatarData(cliente.created_at) }}
          </p>
        </div>

        <div class="metricas">
          <div>
            <span>Pedidos válidos</span>
            <strong>{{ pedidosValidos(cliente).length }}</strong>
          </div>

          <div>
            <span>Total comprado</span>
            <strong>R$ {{ totalGasto(cliente).toFixed(2) }}</strong>
          </div>
        </div>

        <div class="observacao">
          <p v-if="aniversarioProximo(cliente)">
            Cliente com aniversário neste mês. Boa oportunidade para cupom, brinde ou desconto especial.
          </p>

          <p v-else>
            Sem ação especial no momento.
          </p>
        </div>
      </div>
    </section>

    <div
      v-else
      class="vazio"
    >
      Nenhum cliente encontrado.
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

  margin-bottom: 1.5rem;
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

.filtros {
  background: white;
  padding: 1rem;
  border-radius: 16px;

  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

input {
  width: 100%;
  padding: 0.95rem;

  border: 1px solid #ddd;
  border-radius: 10px;

  outline: none;
  font-size: 1rem;
}

.contador {
  color: #777;
  margin: 1rem 0;
}

.lista {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
}

.card {
  background: white;
  border-radius: 18px;
  padding: 1.3rem;

  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.cabecalho-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;

  margin-bottom: 1rem;
}

.cabecalho-card h3 {
  margin: 0;
  color: #6f0716;
}

.cabecalho-card p {
  margin: 0.3rem 0 0;
  color: #777;
  font-size: 0.9rem;
}

.selo-aniversario {
  background: #fff3cd;
  color: #8a6d00;

  padding: 0.4rem 0.7rem;
  border-radius: 999px;

  font-size: 0.75rem;
  font-weight: bold;

  white-space: nowrap;
}

.info {
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;

  padding: 1rem 0;
  margin-bottom: 1rem;
}

.info p {
  margin: 0.5rem 0;
  color: #555;
}

.metricas {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem;

  margin-bottom: 1rem;
}

.metricas div {
  background: #f8f6f4;
  border-radius: 12px;
  padding: 1rem;
}

.metricas span {
  display: block;
  color: #777;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
}

.metricas strong {
  color: #6f0716;
  font-size: 1.2rem;
}

.observacao {
  background: #fffaf0;
  color: #6f0716;

  border-radius: 12px;
  padding: 0.9rem;

  font-size: 0.9rem;
}

.observacao p {
  margin: 0;
}

.vazio {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  text-align: center;
  color: #777;
}

@media (max-width: 700px) {
  .topo {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .metricas {
    grid-template-columns: 1fr;
  }
}
</style>
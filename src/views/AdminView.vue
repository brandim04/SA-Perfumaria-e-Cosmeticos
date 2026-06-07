<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = useRouter()

const totalPedidos = ref(0)
const totalClientes = ref(0)
const totalProdutos = ref(0)
const faturamentoTotal = ref(0)

function logout() {
  localStorage.removeItem('admin')
  router.push('/login')
}

async function carregarMetricas() {
  const { data: pedidosData } = await supabase
  .from('pedidos')
  .select('valor_total, status')

  const { data: clientesData } = await supabase
    .from('clientes')
    .select('id')

  const { data: produtosData } = await supabase
    .from('produtos')
    .select('id')

  const pedidosValidos = pedidosData?.filter(pedido =>
  pedido.status === 'Pago' || pedido.status === 'Concluído'
) || []

totalPedidos.value = pedidosValidos.length
totalClientes.value = clientesData?.length || 0
totalProdutos.value = produtosData?.length || 0

faturamentoTotal.value = pedidosValidos.reduce(
  (total, pedido) => total + Number(pedido.valor_total || 0),
  0
)
}

onMounted(() => {
  carregarMetricas()
})
</script>

<template>
  <div class="admin-page">
    <header class="topo">
      <div>
        <h1>Dashboard Administrativo</h1>
        <p>Samara Adriana Cosméticos</p>
      </div>

      <button @click="logout" class="logout">
        Sair
      </button>
    </header>

    <section class="metricas">
      <div class="metrica-card">
        <span>Total de pedidos</span>
        <strong>{{ totalPedidos }}</strong>
      </div>

      <div class="metrica-card">
        <span>Total de clientes</span>
        <strong>{{ totalClientes }}</strong>
      </div>

      <div class="metrica-card">
        <span>Total de produtos</span>
        <strong>{{ totalProdutos }}</strong>
      </div>

      <div class="metrica-card destaque">
        <span>Faturamento total</span>
        <strong>
          R$ {{ faturamentoTotal.toFixed(2) }}
        </strong>
      </div>
    </section>

    <section class="atalhos">
      <router-link
        to="/admin/pedidos"
        class="atalho-card"
      >
        <h2>Pedidos</h2>
        <p>Ver pedidos realizados pelos clientes.</p>
      </router-link>

      <router-link
        to="/admin/produtos"
        class="atalho-card"
      >
        <h2>Produtos</h2>
        <p>Cadastrar, editar e remover produtos.</p>
      </router-link>

      <div class="atalho-card disabled">
        <h2>Clientes</h2>
        <p>Área de clientes será criada em breve.</p>
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

  padding: 1.8rem;
  border-radius: 18px;

  display: flex;
  justify-content: space-between;
  align-items: center;

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

.logout {
  background: #ffffff;
  color: #6f0716;

  border: none;
  border-radius: 999px;

  padding: 0.8rem 1.4rem;

  font-weight: bold;
  cursor: pointer;
}

.metricas {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.metrica-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 1.5rem;

  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);

  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.metrica-card span {
  color: #777;
  font-size: 0.95rem;
}

.metrica-card strong {
  color: #6f0716;
  font-size: 2rem;
}

.metrica-card.destaque {
  border: 2px solid #e5c89a;
}

.atalhos {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
}

.atalho-card {
  background: #ffffff;
  color: #333;

  text-decoration: none;

  border-radius: 16px;
  padding: 1.5rem;

  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);

  transition: 0.2s;
}

.atalho-card:hover {
  transform: translateY(-4px);
}

.atalho-card h2 {
  color: #6f0716;
  margin-top: 0;
}

.atalho-card p {
  color: #777;
}

.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 700px) {
  .topo {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>
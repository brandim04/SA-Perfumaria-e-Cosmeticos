<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = useRouter()
const pedidos = ref([])

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
        telefone
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

async function atualizarStatus(pedido) {
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
            <th>Alterar status</th>
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
          </tr>
        </tbody>
      </table>
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

@media (max-width: 700px) {
  .topo {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>
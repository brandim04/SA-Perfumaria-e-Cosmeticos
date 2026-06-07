<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabase'

const pedidos = ref([])

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
    return
  }

  pedidos.value = data
}

onMounted(() => {
  carregarPedidos()
})
</script>

<template>
  <div class="container">
    <h1>Pedidos</h1>

<table>
  <thead>
    <tr>
      <th>Cliente</th>
      <th>Telefone</th>
      <th>Total</th>
      <th>Pagamento</th>
      <th>Status</th>
    </tr>
  </thead>

  <tbody>
    <tr
      v-for="pedido in pedidos"
      :key="pedido.id"
    >
      <td>
        {{ pedido.clientes?.nome }}
      </td>

      <td>
        {{ pedido.clientes?.telefone }}
      </td>

      <td>
        R$ {{ Number(pedido.valor_total).toFixed(2) }}
      </td>

      <td>
        {{ pedido.forma_pagamento }}
      </td>

      <td>
        {{ pedido.status }}
      </td>
    </tr>
  </tbody>
</table>

  </div>
</template>

<style scoped>
.container {
  padding: 2rem;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border: 1px solid #ddd;
  padding: 12px;
}

th {
  background: #6f0716;
  color: white;
}
</style>
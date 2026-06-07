<template>
  <div class="container">

<h1>Dashboard Administrativo</h1>

<div class="cards">

  <router-link
    to="/admin/pedidos"
    class="card"
  >
    Pedidos
  </router-link>

  <router-link
    to="/admin/clientes"
    class="card"
  >
    Clientes
  </router-link>

  <router-link
    to="/admin/produtos"
    class="card"
  >
    Produtos
  </router-link>

</div>

  </div>
</template>

<style scoped>
.container {
  padding: 2rem;
}

.cards {
  display: flex;
  gap: 1rem;
}

.card {
  padding: 2rem;
  background: #6f0716;
  color: white;
  text-decoration: none;
  border-radius: 10px;
}
</style>
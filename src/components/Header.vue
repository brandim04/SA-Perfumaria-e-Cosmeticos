<template>
  <header class="header">
    <h2>Samara Adriana</h2>

    <input
      type="text"
      placeholder="Buscar produtos..."
      class="search"
    />

    <button class="cart">
      Carrinho
    </button>
  </header>
</template>

<style scoped>
.header {
  background-color: #6f0716;
  color: #e5c89a;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 1rem 2rem;
}

.search {
  width: 300px;
  padding: 0.6rem;

  border: none;
  border-radius: 8px;
}

.cart {
  background: #e5c89a;
  color: #6f0716;

  border: none;
  border-radius: 8px;

  padding: 0.7rem 1rem;

  cursor: pointer;
}
</style>
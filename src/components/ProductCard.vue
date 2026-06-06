<script setup>
defineProps({
  produto: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <div class="card">
    <div class="imagem">
      Sem imagem
    </div>

    <h3>{{ produto.nome }}</h3>

    <p class="preco">
      R$ {{ Number(produto.preco).toFixed(2) }}
    </p>

    <button>
      Comprar
    </button>
  </div>
</template>

<style scoped>
.card {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
}

.imagem {
  height: 180px;
  background: #f3f3f3;
  border-radius: 8px;

  display: flex;
  align-items: center;
  justify-content: center;

  margin-bottom: 1rem;
}

.preco {
  font-size: 1.2rem;
  font-weight: bold;
  color: #6f0716;
}

button {
  width: 100%;
  padding: 0.8rem;

  border: none;
  border-radius: 8px;

  background: #6f0716;
  color: #e5c89a;

  cursor: pointer;
}
</style>
<script setup>
defineProps({
  marcas: {
    type: Array,
    default: () => [],
  },

  categorias: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits([
  'filtrarMarca',
  'filtrarCategoria',
])
</script>

<template>
  <aside class="sidebar">
    <div class="bloco">
      <h3>Marcas</h3>

      <ul>
        <li @click="emit('filtrarMarca', null)">
          Todas as marcas
        </li>

        <li
          v-for="marca in marcas"
          :key="marca.id"
          @click="emit('filtrarMarca', marca.id)"
        >
          {{ marca.nome }}
        </li>
      </ul>
    </div>

    <div class="bloco">
      <h3>Categorias</h3>

      <ul>
        <li @click="emit('filtrarCategoria', null)">
          Todas as categorias
        </li>

        <li
          v-for="categoria in categorias"
          :key="categoria.id"
          @click="emit('filtrarCategoria', categoria.id)"
        >
          {{ categoria.nome }}
        </li>
      </ul>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 280px;

  padding: 1.5rem;

  background: white;

  border-right: 1px solid #eee;

  min-height: calc(100vh - 80px);
}

.bloco {
  margin-bottom: 2rem;
}

h3 {
  color: #6f0716;

  font-size: 1.1rem;

  margin-bottom: 1rem;

  border-bottom: 2px solid #e5c89a;

  padding-bottom: 0.5rem;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  padding: 0.8rem;

  margin-bottom: 0.4rem;

  border-radius: 8px;

  cursor: pointer;

  transition: all 0.2s ease;
}

li:hover {
  background: #f7f1e8;

  color: #6f0716;

  padding-left: 1rem;
}
</style>
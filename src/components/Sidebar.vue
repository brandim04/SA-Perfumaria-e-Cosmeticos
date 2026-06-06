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

    <h3>Categorias</h3>

    <ul>
  <li
    v-for="categoria in categorias"
    :key="categoria.id"
    @click="emit('filtrarCategoria', categoria.id)"
  >
    {{ categoria.nome }}
  </li>
    </ul>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 250px;
  padding: 1rem;
  background: #f8f6f4;
  border-right: 1px solid #ddd;
  min-height: calc(100vh - 80px);
}

ul {
  list-style: none;
  padding: 0;
}

li {
  padding: 0.5rem 0;
  cursor: pointer;
}
</style>
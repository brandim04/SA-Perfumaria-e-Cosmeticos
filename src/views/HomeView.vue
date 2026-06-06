<script setup>
import { ref, onMounted, computed } from 'vue'

import Header from '../components/Header.vue'
import Sidebar from '../components/Sidebar.vue'
import ProductCard from '../components/ProductCard.vue'

import { supabase } from '../lib/supabase'

const marcas = ref([])
const categorias = ref([])
const produtos = ref([])

const marcaSelecionada = ref(null)
const categoriaSelecionada = ref(null)

async function carregarDados() {
  const { data: marcasData, error: marcasError } =
    await supabase
      .from('marcas')
      .select('*')

  const { data: categoriasData, error: categoriasError } =
    await supabase
      .from('categorias')
      .select('*')

  const { data: produtosData, error: produtosError } =
    await supabase
      .from('produtos')
      .select('*')

  if (marcasError) {
    console.error('Erro ao carregar marcas:', marcasError)
  }

  if (categoriasError) {
    console.error('Erro ao carregar categorias:', categoriasError)
  }

  if (produtosError) {
    console.error('Erro ao carregar produtos:', produtosError)
  }

  marcas.value = marcasData || []
  categorias.value = categoriasData || []
  produtos.value = produtosData || []
}

function filtrarMarca(id) {
  marcaSelecionada.value = id
}

function filtrarCategoria(id) {
  categoriaSelecionada.value = id
}

const produtosFiltrados = computed(() => {
  let resultado = produtos.value

  if (marcaSelecionada.value) {
    resultado = resultado.filter(
      produto => produto.marca_id === marcaSelecionada.value
    )
  }

  if (categoriaSelecionada.value) {
    resultado = resultado.filter(
      produto => produto.categoria_id === categoriaSelecionada.value
    )
  }

  return resultado
})

onMounted(() => {
  carregarDados()
})
</script>

<template>
  <div>
    <Header />

    <main class="container">
      <Sidebar
        :marcas="marcas"
        :categorias="categorias"
        @filtrarMarca="filtrarMarca"
        @filtrarCategoria="filtrarCategoria"
      />

      <section class="content">
        <h1>Produtos</h1>

        <div class="produtos-grid">
          <ProductCard
            v-for="produto in produtosFiltrados"
            :key="produto.id"
            :produto="produto"
          />
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.container {
  display: flex;
}

.content {
  flex: 1;
  padding: 2rem;
}

.produtos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}
</style>
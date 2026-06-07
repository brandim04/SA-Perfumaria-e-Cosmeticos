<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabase'

const produtos = ref([])
const marcas = ref([])
const categorias = ref([])

const editandoId = ref(null)

const form = ref({
  nome: '',
  marca_id: '',
  categoria_id: '',
  preco: null,
  descricao: '',
  estoque: null,
  imagem: '',
  ativo: true
})

async function carregarDados() {
  const { data: produtosData } = await supabase
    .from('produtos')
    .select('*')

  const { data: marcasData } = await supabase
    .from('marcas')
    .select('*')

  const { data: categoriasData } = await supabase
    .from('categorias')
    .select('*')

  produtos.value = produtosData || []
  marcas.value = marcasData || []
  categorias.value = categoriasData || []
}

async function salvarProduto() {

  const payload = {
    nome: form.value.nome,
    marca_id: form.value.marca_id || null,
    categoria_id: form.value.categoria_id || null,
    preco: Number(form.value.preco || 0),
    descricao: form.value.descricao,
    estoque: Number(form.value.estoque || 0),
    imagem: form.value.imagem,
    ativo: form.value.ativo
  }

  const response = editandoId.value
    ? await supabase.from('produtos').update(payload).eq('id', editandoId.value)
    : await supabase.from('produtos').insert(payload)

  if (response.error) {
    alert('Erro ao salvar produto')
    console.log(response.error)
    return
  }

  alert(editandoId.value ? 'Produto atualizado com sucesso' : 'Produto cadastrado com sucesso')

  limparForm()
  carregarDados()
}

function editar(produto) {
  editandoId.value = produto.id

  form.value = {
    nome: produto.nome || '',
    marca_id: produto.marca_id || '',
    categoria_id: produto.categoria_id || '',
    preco: produto.preco ?? null,
    descricao: produto.descricao || '',
    estoque: produto.estoque ?? null,
    imagem: produto.imagem || '',
    ativo: produto.ativo ?? true
  }
}

function limparForm() {
  editandoId.value = null
  form.value = {
    nome: '',
    marca_id: '',
    categoria_id: '',
    preco: null,
    descricao: '',
    estoque: null,
    imagem: '',
    ativo: true
  }
}

async function remover(id) {
  await supabase.from('produtos').delete().eq('id', id)
  carregarDados()
}

onMounted(() => {
  carregarDados()
})
</script>

<template>
  <div class="container">

    <h1>Produtos</h1>

    <div class="form">

      <input v-model="form.nome" placeholder="Nome do produto" />

      <select v-model="form.marca_id">
        <option disabled value="">Selecione a marca</option>
        <option v-for="m in marcas" :key="m.id" :value="m.id">
          {{ m.nome }}
        </option>
      </select>

      <select v-model="form.categoria_id">
        <option disabled value="">Selecione a categoria</option>
        <option v-for="c in categorias" :key="c.id" :value="c.id">
          {{ c.nome }}
        </option>
      </select>

      <input v-model="form.preco" type="number" placeholder="Preço (ex: 29.90)" />

      <input v-model="form.estoque" type="number" placeholder="Quantidade em estoque" />

      <input v-model="form.imagem" placeholder="URL da imagem do produto" />

      <textarea v-model="form.descricao" placeholder="Descrição do produto"></textarea>

      <button @click="salvarProduto">
        {{ editandoId ? 'Atualizar produto' : 'Cadastrar produto' }}
      </button>

    </div>

    <hr />

    <div class="lista">

      <div v-for="p in produtos" :key="p.id" class="card">

        <img
          v-if="p.imagem"
          :src="p.imagem"
          class="product-img"
        />

        <div v-else class="no-img">
          Sem imagem
        </div>

        <h3>{{ p.nome }}</h3>
        <p>R$ {{ Number(p.preco || 0).toFixed(2) }}</p>
        <p>Estoque: {{ p.estoque ?? 0 }}</p>

        <button @click="editar(p)">Editar</button>
        <button @click="remover(p.id)">Excluir</button>

      </div>

    </div>

  </div>
</template>

<style scoped>
.container {
  padding: 2rem;
}

h1 {
  margin-bottom: 1.5rem;
  color: #6f0716;
}

.form {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.8rem;
  background: #fff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

input,
select,
textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  outline: none;
  font-size: 14px;
}

textarea {
  grid-column: span 2;
  min-height: 90px;
}

button {
  grid-column: span 2;
  background: #6f0716;
  color: white;
  padding: 0.9rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.2s;
}

button:hover {
  opacity: 0.9;
}

hr {
  margin: 2rem 0;
  border: none;
  border-top: 1px solid #eee;
}

.lista {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
}

.card {
  background: white;
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid #eee;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.card:hover {
  transform: translateY(-3px);
}

.product-img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: 10px;
  margin-bottom: 0.5rem;
}

.no-img {
  width: 100%;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f2f2f2;
  border-radius: 10px;
  color: #999;
}

.card h3 {
  color: #333;
  margin-bottom: 0.3rem;
}

.card p {
  color: #666;
  margin: 0;
}

.card button {
  width: 100%;
  margin-top: 0.4rem;
}

@media (max-width: 768px) {
  .form {
    grid-template-columns: 1fr;
  }

  textarea,
  button {
    grid-column: span 1;
  }
}
</style>
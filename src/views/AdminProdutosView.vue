<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = useRouter()

const produtos = ref([])
const marcas = ref([])
const categorias = ref([])

const busca = ref('')
const filtroMarca = ref('')
const filtroCategoria = ref('')

const modalAberto = ref(false)
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

function voltarDashboard() {
  router.push('/admin')
}

async function carregarDados() {
  const { data: produtosData } = await supabase
    .from('produtos')
    .select(`
      *,
      marcas (
        nome
      ),
      categorias (
        nome
      )
    `)
    .order('nome', { ascending: true })

  const { data: marcasData } = await supabase
    .from('marcas')
    .select('*')
    .order('nome', { ascending: true })

  const { data: categoriasData } = await supabase
    .from('categorias')
    .select('*')
    .order('nome', { ascending: true })

  produtos.value = produtosData || []
  marcas.value = marcasData || []
  categorias.value = categoriasData || []
}

const produtosFiltrados = computed(() => {
  let resultado = produtos.value

  if (busca.value.trim()) {
    resultado = resultado.filter(produto =>
      produto.nome.toLowerCase().includes(busca.value.toLowerCase())
    )
  }

  if (filtroMarca.value) {
    resultado = resultado.filter(produto =>
      produto.marca_id === filtroMarca.value
    )
  }

  if (filtroCategoria.value) {
    resultado = resultado.filter(produto =>
      produto.categoria_id === filtroCategoria.value
    )
  }

  return resultado
})

function abrirCadastro() {
  limparForm()
  modalAberto.value = true
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

  modalAberto.value = true
}

function fecharModal() {
  modalAberto.value = false
  limparForm()
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

async function salvarProduto() {
  if (!form.value.nome) {
    alert('Informe o nome do produto')
    return
  }

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
    ? await supabase
        .from('produtos')
        .update(payload)
        .eq('id', editandoId.value)
    : await supabase
        .from('produtos')
        .insert(payload)

  if (response.error) {
    console.log(response.error)
    alert('Erro ao salvar produto')
    return
  }

  alert(editandoId.value ? 'Produto atualizado com sucesso' : 'Produto cadastrado com sucesso')

  fecharModal()
  carregarDados()
}

async function remover(id) {
  const confirmar = confirm('Tem certeza que deseja excluir este produto?')

  if (!confirmar) return

  const { error } = await supabase
    .from('produtos')
    .delete()
    .eq('id', id)

  if (error) {
    console.log(error)
    alert('Erro ao excluir produto')
    return
  }

  alert('Produto excluído')
  carregarDados()
}

onMounted(() => {
  carregarDados()
})
</script>

<template>
  <div class="admin-page">
    <header class="topo">
      <div>
        <h1>Produtos</h1>
        <p>Gerencie os produtos cadastrados na loja.</p>
      </div>

      <div class="acoes-topo">
        <button
          type="button"
          class="voltar"
          @click="voltarDashboard"
        >
          ← Voltar ao painel
        </button>

        <button
          type="button"
          class="novo"
          @click="abrirCadastro"
        >
          + Adicionar produto
        </button>
      </div>
    </header>

    <section class="filtros">
      <input
        v-model="busca"
        type="text"
        placeholder="Pesquisar produto..."
      />

      <select v-model="filtroMarca">
        <option value="">Todas as marcas</option>
        <option
          v-for="m in marcas"
          :key="m.id"
          :value="m.id"
        >
          {{ m.nome }}
        </option>
      </select>

      <select v-model="filtroCategoria">
        <option value="">Todas as categorias</option>
        <option
          v-for="c in categorias"
          :key="c.id"
          :value="c.id"
        >
          {{ c.nome }}
        </option>
      </select>
    </section>

    <p class="contador">
      {{ produtosFiltrados.length }} produto(s) encontrado(s)
    </p>

    <section
      v-if="produtosFiltrados.length > 0"
      class="lista"
    >
      <div
        v-for="p in produtosFiltrados"
        :key="p.id"
        class="card"
      >
        <div class="imagem">
          <img
            v-if="p.imagem"
            :src="p.imagem.trim()"
            :alt="p.nome"
          />

          <span v-else>
            Sem imagem
          </span>
        </div>

        <div class="info">
          <p class="marca">
            {{ p.marcas?.nome || 'Sem marca' }}
          </p>

          <h3>{{ p.nome }}</h3>

          <p class="categoria">
            {{ p.categorias?.nome || 'Sem categoria' }}
          </p>

          <strong>
            R$ {{ Number(p.preco || 0).toFixed(2) }}
          </strong>

          <p>
            Estoque: {{ p.estoque ?? 0 }}
          </p>

          <span
            :class="['status', p.ativo ? 'ativo' : 'inativo']"
          >
            {{ p.ativo ? 'Ativo' : 'Inativo' }}
          </span>
        </div>

        <div class="botoes">
          <button
            type="button"
            class="editar"
            @click="editar(p)"
          >
            Atualizar
          </button>

          <button
            type="button"
            class="excluir"
            @click="remover(p.id)"
          >
            Excluir
          </button>
        </div>
      </div>
    </section>

    <div
      v-else
      class="vazio"
    >
      Nenhum produto encontrado.
    </div>

    <div
      v-if="modalAberto"
      class="modal-fundo"
      @click="fecharModal"
    >
      <div
        class="modal-card"
        @click.stop
      >
        <button
          type="button"
          class="fechar"
          @click="fecharModal"
        >
          ✕
        </button>

        <h2>
          {{ editandoId ? 'Atualizar produto' : 'Adicionar produto' }}
        </h2>

        <div class="form">
          <input
            v-model="form.nome"
            placeholder="Nome do produto"
          />

          <select v-model="form.marca_id">
            <option disabled value="">Selecione a marca</option>
            <option
              v-for="m in marcas"
              :key="m.id"
              :value="m.id"
            >
              {{ m.nome }}
            </option>
          </select>

          <select v-model="form.categoria_id">
            <option disabled value="">Selecione a categoria</option>
            <option
              v-for="c in categorias"
              :key="c.id"
              :value="c.id"
            >
              {{ c.nome }}
            </option>
          </select>

          <input
            v-model="form.preco"
            type="number"
            placeholder="Preço"
          />

          <input
            v-model="form.estoque"
            type="number"
            placeholder="Quantidade em estoque"
          />

          <input
            v-model="form.imagem"
            placeholder="URL da imagem"
          />

          <textarea
            v-model="form.descricao"
            placeholder="Descrição do produto"
          ></textarea>

          <label class="check">
            <input
              v-model="form.ativo"
              type="checkbox"
            />
            Produto ativo
          </label>

          <button
            type="button"
            class="salvar"
            @click="salvarProduto"
          >
            {{ editandoId ? 'Salvar alterações' : 'Cadastrar produto' }}
          </button>
        </div>
      </div>
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
  justify-content: space-between;
  align-items: center;

  margin-bottom: 1.5rem;
}

.topo h1 {
  margin: 0;
  color: #e5c89a;
}

.topo p {
  margin: 0.4rem 0 0;
  color: #f5e7c8;
}

.acoes-topo {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.voltar,
.novo {
  border: none;
  border-radius: 999px;
  padding: 0.8rem 1.2rem;
  font-weight: bold;
  cursor: pointer;
}

.voltar {
  background: white;
  color: #6f0716;
}

.novo {
  background: #e5c89a;
  color: #6f0716;
}

.filtros {
  background: white;
  padding: 1rem;
  border-radius: 16px;
  display: grid;
  grid-template-columns: 1fr 220px 220px;
  gap: 1rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

input,
select,
textarea {
  width: 100%;
  padding: 0.9rem;
  border: 1px solid #ddd;
  border-radius: 10px;
  outline: none;
  font-size: 0.95rem;
}

.contador {
  color: #777;
  margin: 1rem 0;
}

.lista {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
}

.card {
  background: white;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
}

.imagem {
  height: 190px;
  background: #f2f2f2;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  overflow: hidden;
}

.imagem img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 1rem;
}

.info {
  padding: 1rem;
  flex: 1;
}

.marca {
  color: #9a7b34;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 0.4rem;
}

.info h3 {
  margin: 0 0 0.5rem;
  color: #333;
}

.categoria {
  color: #777;
  font-size: 0.9rem;
}

.info strong {
  color: #6f0716;
  font-size: 1.2rem;
}

.status {
  display: inline-block;
  margin-top: 0.6rem;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: bold;
}

.ativo {
  background: #dff5e1;
  color: #2e7d32;
}

.inativo {
  background: #fde0e0;
  color: #c62828;
}

.botoes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.7rem;
  padding: 1rem;
}

.botoes button {
  border: none;
  border-radius: 10px;
  padding: 0.8rem;
  font-weight: bold;
  cursor: pointer;
}

.editar {
  background: #6f0716;
  color: #e5c89a;
}

.excluir {
  background: #fde0e0;
  color: #c62828;
}

.vazio {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  text-align: center;
  color: #777;
}

.modal-fundo {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 9998;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 1rem;
}

.modal-card {
  position: relative;
  width: 100%;
  max-width: 760px;
  max-height: 90vh;
  overflow-y: auto;

  background: white;
  border-radius: 20px;
  padding: 2rem;

  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
}

.modal-card h2 {
  color: #6f0716;
  margin-top: 0;
}

.fechar {
  position: absolute;
  top: 14px;
  right: 14px;

  width: 38px;
  height: 38px;

  border: none;
  border-radius: 50%;

  background: #6f0716;
  color: #e5c89a;

  font-weight: bold;
  cursor: pointer;
}

.form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.9rem;
}

textarea {
  grid-column: span 2;
  min-height: 100px;
}

.check {
  grid-column: span 2;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6f0716;
  font-weight: bold;
}

.check input {
  width: auto;
}

.salvar {
  grid-column: span 2;
  background: #6f0716;
  color: #e5c89a;
  border: none;
  border-radius: 12px;
  padding: 1rem;
  font-weight: bold;
  cursor: pointer;
}

@media (max-width: 800px) {
  .topo {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .filtros {
    grid-template-columns: 1fr;
  }

  .form {
    grid-template-columns: 1fr;
  }

  textarea,
  .check,
  .salvar {
    grid-column: span 1;
  }
}
</style>
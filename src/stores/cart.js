import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    itens: (JSON.parse(localStorage.getItem('carrinho')) || []).map(item => ({
      ...item,
      quantidade: item.quantidade || 1
    }))
  }),

  getters: {
    totalItens: (state) => {
      return state.itens.reduce(
        (total, item) => total + (item.quantidade || 1),
        0
      )
    },

    valorTotal: (state) => {
      return state.itens.reduce(
        (total, item) =>
          total + Number(item.preco) * (item.quantidade || 1),
        0
      )
    }
  },

  actions: {
    salvarCarrinho() {
      localStorage.setItem('carrinho', JSON.stringify(this.itens))
    },

    adicionarProduto(produto) {
      const produtoExistente = this.itens.find(
        item => item.id === produto.id
      )

      const estoque = Number(produto.estoque) || 0

      if (produtoExistente) {
        if ((produtoExistente.quantidade || 1) >= estoque) {
          return {
            sucesso: false,
            mensagem: 'Quantidade máxima em estoque atingida.'
          }
        }

        produtoExistente.quantidade = (produtoExistente.quantidade || 1) + 1
      } else {
        if (estoque <= 0) {
          return {
            sucesso: false,
            mensagem: 'Produto sem estoque.'
          }
        }

        this.itens.push({
          ...produto,
          quantidade: 1
        })
      }

      this.salvarCarrinho()

      return {
        sucesso: true,
        mensagem: 'Produto adicionado ao carrinho.'
      }
    },

    aumentarQuantidade(id) {
      const produto = this.itens.find(item => item.id === id)

      if (!produto) return

      const estoque = Number(produto.estoque) || 0
      const quantidadeAtual = produto.quantidade || 1

      if (quantidadeAtual < estoque) {
        produto.quantidade = quantidadeAtual + 1
        this.salvarCarrinho()
      } else {
        alert('Quantidade máxima em estoque atingida.')
      }
    },

    diminuirQuantidade(id) {
      const produto = this.itens.find(item => item.id === id)

      if (!produto) return

      const quantidadeAtual = produto.quantidade || 1

      if (quantidadeAtual > 1) {
        produto.quantidade = quantidadeAtual - 1
      } else {
        this.itens = this.itens.filter(item => item.id !== id)
      }

      this.salvarCarrinho()
    },

    removerProduto(id) {
      this.itens = this.itens.filter(item => item.id !== id)
      this.salvarCarrinho()
    },

    limparCarrinho() {
      this.itens = []
      localStorage.removeItem('carrinho')
    }
  }
})
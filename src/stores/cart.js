import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    itens: JSON.parse(
      localStorage.getItem('carrinho')
    ) || []
  }),

  actions: {
    salvarCarrinho() {
      localStorage.setItem(
        'carrinho',
        JSON.stringify(this.itens)
      )
    },

    adicionarProduto(produto) {
      this.itens.push(produto)

      this.salvarCarrinho()
    },

    removerProduto(index) {
      this.itens.splice(index, 1)

      this.salvarCarrinho()
    },

    limparCarrinho() {
      this.itens = []

      localStorage.removeItem('carrinho')
    }
  }
})
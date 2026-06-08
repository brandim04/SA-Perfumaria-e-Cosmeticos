import { defineStore } from 'pinia'
import { supabase } from '../lib/supabase'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    admin: JSON.parse(localStorage.getItem('admin')) || null
  }),

  getters: {
    adminLogado: (state) => {
      return !!state.admin
    }
  },

  actions: {
    async login(email, senha) {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .eq('senha', senha)
        .single()

      if (error || !data) {
        return {
          sucesso: false,
          mensagem: 'Usuário ou senha inválidos'
        }
      }

      this.admin = data

      localStorage.setItem(
        'admin',
        JSON.stringify(data)
      )

      return {
        sucesso: true,
        mensagem: 'Login realizado com sucesso'
      }
    },

    logout() {
      this.admin = null
      localStorage.removeItem('admin')
    }
  }
})
import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import CartView from '../views/CartView.vue'
import CheckoutView from '../views/CheckoutView.vue'
import LoginView from '../views/LoginView.vue'
import AdminView from '../views/AdminView.vue'
import AdminPedidosView from '../views/AdminPedidosView.vue'
import AdminProdutosView from '../views/AdminProdutosView.vue'
import AdminClientesView from '../views/AdminClientesView.vue'
import MeusPedidosView from '../views/MeusPedidosView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/carrinho',
      name: 'carrinho',
      component: CartView,
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: CheckoutView,
    },
    {
      path: '/gestao',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
      meta: { requiresAuth: true },
    },
    {
      path: '/admin/pedidos',
      name: 'admin-pedidos',
      component: AdminPedidosView,
      meta: { requiresAuth: true },
    },
    {
      path: '/admin/produtos',
      name: 'admin-produtos',
      component: AdminProdutosView,
      meta: { requiresAuth: true },
    },
    {
      path: '/admin/clientes',
      name: 'admin-clientes',
      component: AdminClientesView,
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      redirect: '/gestao',
    },
    {
      path: '/meus-pedidos',
      name: 'meus-pedidos',
      component: MeusPedidosView,
    },
  ],
})

router.beforeEach((to, from, next) => {
  const adminLogado = localStorage.getItem('admin')

  if (to.meta.requiresAuth && !adminLogado) {
    next('/gestao')
  } else {
    next()
  }
})

export default router
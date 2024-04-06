export default [
  {
    path: 'masterData',
    name: 'admin.masterData',
    redirect: {name: 'admin.index'},
    children: [
      {
        path: 'customer',
        name: 'admin.masterData.customer.index',
        component: () => import('pages/admin/masterData/customer/CustomerIndex.vue'),
        meta: {
          auth: true,
        },
      },
      {
        path: 'factory',
        name: 'admin.masterData.factory.index',
        component: () => import('pages/admin/masterData/factory/FactoryIndex.vue'),
        meta: {
          auth: true,
        },
      },

    ]
  },
]

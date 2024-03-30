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

    ]
  },
]

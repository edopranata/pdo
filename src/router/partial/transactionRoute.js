export default [
  {
    path: 'transaction',
    name: 'admin.transaction',
    redirect: {name: 'admin.index'},
    children: [
      {
        path: 'loan',
        name: 'admin.transaction.loan.index',
        component: () => import('pages/admin/transaction/loan/LoanIndex.vue'),
        meta: {
          auth: true,
        },
      },

    ]
  },
]

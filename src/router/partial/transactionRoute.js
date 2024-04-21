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
      {
        path: 'loan/:id',
        name: 'admin.transaction.loan.print',
        component: () => import('pages/admin/report/invoiceData/InvoicePrint.vue'),
        meta: {
          auth: true,
        },
      },
      {
        path: 'order',
        name: 'admin.transaction.order.index',
        component: () => import('pages/admin/transaction/order/OrderIndex.vue'),
        meta: {
          auth: true,
        },
      },
      {
        path: 'invoice',
        name: 'admin.transaction.invoice.index',
        component: () => import('pages/admin/transaction/invoice/InvoiceIndex.vue'),
        meta: {
          auth: true,
        },
      },

      {
        path: 'invoice/:id',
        name: 'admin.transaction.invoice.showInvoice',
        component: () => import('pages/admin/transaction/invoice/InvoiceView.vue'),
        meta: {
          auth: true,
        },
      },

      {
        path: 'invoice/:id/print',
        name: 'admin.transaction.invoice.print',
        component: () => import('pages/admin/report/invoiceData/InvoicePrint.vue'),
        meta: {
          auth: true,
        },
      },
    ]
  },
]

export default [
  {
    path: 'report',
    name: 'admin.report',
    redirect: {name: 'admin.index'},
    children: [
      {
        path: 'invoiceData',
        name: 'admin.report.invoiceData.index',
        component: () => import('pages/admin/report/invoiceData/InvoiceDataIndex.vue'),
        meta: {
          auth: true,
        },
      },

      {
        path: 'invoiceData/:id',
        name: 'admin.report.invoiceData.print',
        component: () => import('pages/admin/report/invoiceData/InvoicePrint.vue'),
        meta: {
          auth: true,
        },
      },
    ]
  },
]

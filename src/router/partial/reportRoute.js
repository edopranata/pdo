export default [
  {
    path: 'report',
    name: 'admin.report',
    redirect: {name: 'admin.index'},
    children: [
      {
        path: 'invoiceReport',
        name: 'admin.report.invoiceReport.index',
        component: () => import('pages/admin/report/invoiceData/InvoiceDataIndex.vue'),
        meta: {
          auth: true,
        },
      },
      {
        path: 'invoiceReport/:id',
        name: 'admin.report.invoiceReport.print',
        component: () => import('pages/admin/report/invoiceData/InvoicePrint.vue'),
        meta: {
          auth: true,
        },
      },
      {
        path: 'cashReport',
        name: 'admin.report.cashReport',
        redirect: {name: 'admin.report.cashReport.index'},
        children: [
          {
            path: '',
            name: 'admin.report.cashReport.index',
            component: () => import('pages/admin/report/cashReport/CashReportIndex.vue'),
            meta: {
              auth: true,
            },
          },
          {
            path: 'todayCash',
            name: 'admin.report.cashReport.todayCash',
            component: () => import('pages/admin/report/cashReport/TodayCashReport.vue'),
            meta: {
              auth: true,
            },
          },
          {
            path: 'dailyCash',
            name: 'admin.report.cashReport.dailyCash',
            component: () => import('pages/admin/report/cashReport/DailyCashReport.vue'),
            meta: {
              auth: true,
            },
          },
        ]
      },
      {
        path: 'DOReport',
        name: 'admin.report.DOReport.index',
        component: () => import('pages/admin/report/deliveryOrder/ReportDeliveryOrderIndex.vue'),
        meta: {
          auth: true,
        },
      },
      {
        path: 'DOReport/:id',
        name: 'admin.report.DOReport.print',
        component: () => import('pages/admin/report/deliveryOrder/ReportDeliveryOrderPrint.vue'),
        meta: {
          auth: true,
        },
      },
    ]
  },
]

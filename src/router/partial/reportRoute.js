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
        path: 'transactionReport',
        name: 'admin.report.transactionReport',
        redirect: {name: 'admin.report.transactionReport.index'},
        children: [
          {
            path: '',
            name: 'admin.report.transactionReport.index',
            component: () => import('pages/admin/report/transactionReport/TransactionReportIndex.vue'),
            meta: {
              auth: true,
            },
          },
          {
            path: 'todayTransaction',
            name: 'admin.report.transactionReport.todayTransaction',
            component: () => import('pages/admin/report/transactionReport/TodayTransactionReport.vue'),
            meta: {
              auth: true,
            },
          },
          {
            path: 'dailyTransaction',
            name: 'admin.report.transactionReport.dailyTransaction',
            component: () => import('pages/admin/report/transactionReport/DailyTransactionReport.vue'),
            meta: {
              auth: true,
            },
          },
        ]
      },
      {
        path: 'customerReport',
        name: 'admin.report.customerReport',
        redirect: {name: 'admin.report.customerReport.index'},
        children: [
          {
            path: '',
            name: 'admin.report.customerReport.index',
            component: () => import('pages/admin/report/customerReport/CustomerReportIndex.vue'),
            meta: {
              auth: true,
            },
          },
          {
            path: 'loanReport',
            name: 'admin.report.customerReport.loanReport',
            component: () => import('pages/admin/report/customerReport/LoanReport.vue'),
            meta: {
              auth: true,
            },
          },
          {
            path: 'orderReport',
            name: 'admin.report.customerReport.orderReport',
            component: () => import('pages/admin/report/customerReport/OrderReport.vue'),
            meta: {
              auth: true,
            },
          },
          {
            path: 'customerOrderReport',
            name: 'admin.report.customerReport.customerOrderReport',
            component: () => import('pages/admin/report/customerReport/CustomerOrderReport.vue'),
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
        path: 'orderReport',
        name: 'admin.report.orderReport',
        redirect: {name: 'admin.report.orderReport.index'},
        children: [
          {
            path: '',
            name: 'admin.report.orderReport.index',
            component: () => import('pages/admin/report/orderReport/OrderReportIndex.vue'),
            meta: {
              auth: true,
            },
          },
          {
            path: 'factory',
            name: 'admin.report.orderReport.factoryReport',
            component: () => import('pages/admin/report/orderReport/FactoryOrderReportIndex.vue'),
            meta: {
              auth: true,
            },
          },
          {
            path: 'monthlyFactory',
            name: 'admin.report.orderReport.monthlyFactoryReport',
            component: () => import('pages/admin/report/orderReport/FactoryOrderMonthlyReportIndex.vue'),
            meta: {
              auth: true,
            },
          },


          {
            path: 'allFactory',
            name: 'admin.report.orderReport.allFactoryReportShow',
            component: () => import('pages/admin/report/orderReport/AllFactoryOrderReportIndex.vue'),
            meta: {
              auth: true,
            },
          },
          {
            path: 'monthlyAllFactory',
            name: 'admin.report.orderReport.monthlyAllFactoryReportShow',
            component: () => import('pages/admin/report/orderReport/AllFactoryOrderMonthlyReportIndex.vue'),
            meta: {
              auth: true,
            },
          },
        ]
      },

      {
        path: 'incomeReport',
        name: 'admin.report.incomeReport',
        redirect: {name: 'admin.report.incomeReport.index'},
        children: [
          {
            path: '',
            name: 'admin.report.incomeReport.index',
            component: () => import('pages/admin/report/incomeReport/IncomeReportIndex.vue'),
            meta: {
              auth: true,
            },
          },
          {
            path: 'monthlyAllFactoryIncome',
            name: 'admin.report.incomeReport.monthlyAllFactoryIncomeReport',
            component: () => import('pages/admin/report/incomeReport/AllFactoryIncomeReportIndex.vue'),
            meta: {
              auth: true,
            },
          },
          {
            path: 'detailFactoryIncome',
            name: 'admin.report.incomeReport.detailFactoryIncome',
            component: () => import('pages/admin/report/incomeReport/FactoryIncomeReportIndex.vue'),
            meta: {
              auth: true,
            },
          },
          {
            path: 'detailFactoryIncome/:id',
            name: 'admin.report.incomeReport.detailFactoryIncomeShow',
            component: () => import('pages/admin/report/incomeReport/FactoryIncomeReportShow.vue'),
            meta: {
              auth: true,
            },
          },

        ]
      }

    ]
  },
]

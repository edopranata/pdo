import {defineStore} from 'pinia'
import {reactive} from "vue";
import {api} from "boot/axios";
import {LocalStorage, Notify} from "quasar";
import { date } from 'quasar'
import {useDashboardStore} from "stores/dashboard";

const dashboard = useDashboardStore()

export const useCustomerInvoiceStore = defineStore('customerInvoice', {
  state: () => ({
    dialog: {
      open: false,
      print: false,
    },
    form: {
      installment: 0,
      order_id: [],
      customer_id: null,
      trade_date: null,
      loan: null,
      total: null,
    },
    customer: {},
    select: {
      factories: [],
      factories_option: [],
      selected_factory: null,
    },
    table: {
      pagination: {
        sortBy: '',
        descending: false,
        page: 1,
        rowsPerPage: 10,
        rowsNumber: 0
      },
      selected: [],
      filter: '',
      loading: false,
      headers: reactive([
        {name: "no", label: "No", field: 'id', sortable: false, align: 'left'},
        {name: "factory_name", label: "Factory", field: "factory", sortable: false, align: 'left'},
        {name: "trade_date", label: "Delivery Order Date", field: "trade_date", sortable: true, align: 'left'},
        {name: "net_weight", label: "Weight", field: "net_weight", sortable: true},
        {name: "net_price", label: "Price", field: "customer_price", sortable: true},
        {name: "customer_total", label: "Total", field: "customer_total", sortable: true},
      ]),
      data: [],
      orders: []
    },
    errors: {},
  }),

  getters: {
    getSelected(state) {
      return state.table.selected
    },
    getCustomerOption(state) {
      return state.form.type
    },
    getSummaries(state) {
      let data = {}
      data.average = state.table.selected.length > 0 ? state.table.selected.reduce((total, next) => parseFloat(total) + parseFloat(next.customer_price), 0) / parseFloat(state.table.selected.length) : 0;
      data.weight = state.table.selected.length > 0 ? state.table.selected.reduce((total, next) => parseFloat(total) + parseFloat(next.net_weight), 0) : 0
      data.total = state.table.selected.length > 0 ? state.table.selected.reduce((total, next) => parseFloat(total) + parseFloat(next.customer_total), 0) : 0
      data.loan =  state.customer.hasOwnProperty('loan') ? parseFloat(state.customer.loan) : null
      data.installment = state.form.installment
      data.ending_balance = state.customer.hasOwnProperty('loan') ? parseFloat(state.customer?.loan) - data.installment : 0
      data.customer_total = data.total - data.installment;
      state.form.loan = data.loan ?? null
      state.form.total = data.customer_total
      return data
    },

    getAllCustomers(state) {
      return state.select.customers
    },
    getForm(state) {
      return state.form
    },
    getLoan(state) {
      return state.loan
    }
  },

  actions: {
    setError(e) {
      if (e.hasOwnProperty('response')) {
        if (e.response.status === 422) {
          let error = e.response.data.errors;
          for (let property in error) {
            this.errors[property] = error[property][0];
          }
        } else if (e.response.status === 401) {
          LocalStorage.remove('token')
          LocalStorage.remove('permission')
          this.router.replace({name: 'home.unauthorized'})
        } else if (e.response.status === 403) {
          this.errors = {};
          Notify.create({
            position: "top",
            type: 'negative',
            message: e.response.message ?? e.response.statusText
          })
          this.router.replace({name: 'admin.unauthorized'})
        } else {
          this.errors = {};
          Notify.create({
            position: "top",
            type: 'negative',
            message: e.response.message ?? e.response.statusText
          })
        }
      } else {
        Notify.create({
          position: "top",
          type: 'negative',
          message: 'Unknown error'
        })
      }
    },
    unsetError(error) {
      if (this.errors.hasOwnProperty(error)) {
        delete this.errors[error]
      }
    },
    onReset() {
      this.errors = {}
      this.table.selected = []
      for (let property in this.form) {
        this.form[property] = null
        if(property === 'trade_date'){
          this.form[property] = date.formatDate(Date.now(), 'YYYY/MM/DD')
        }
      }

      this.dialog.open = false

    },
    async getCurrentCustomer(path) {
      try {
        const response = await api.get(path)

        this.customer = response.data?.customer
        this.form.customer_id = this.customer.hasOwnProperty('id') ? this.customer.id : null

      } catch (e) {
        this.setError(e)
      }
    },

    async getCustomerOrderFromApi(path, startRow, count, filter, sortBy, descending) {
      const data = {
        page: startRow,
        limit: count,
      }

      // Sort by field descending or ascending
      if (sortBy) {
        const orderBy = descending ? 'desc' : 'asc'
        data.sortBy = JSON.stringify({
          key: sortBy,
          order: orderBy
        })
      }
      // search
      data.search = this.table.search ?? ''
      try {
        const params = new URLSearchParams(data);
        const response = await api.get(path, {params})
        return response.data
      } catch (e) {
        this.setError(e)
      }
    },
    async getCustomerOrder(path, props) {
      const {page, rowsPerPage, sortBy, descending} = props.pagination
      const filter = props.filter

      this.table.loading = true

      // emulate server
      // update rowsCount with appropriate value

      // get all rows if "All" (0) is selected
      const fetchCount = rowsPerPage === 0 ? this.table.pagination.rowsNumber : rowsPerPage

      // calculate starting row of data
      // fetch data from "server"
      const returnedData = await this.getCustomerOrderFromApi(path, page, fetchCount, filter, sortBy, descending)

      // clear out existing data and add new
      this.table.data = returnedData.hasOwnProperty('orders') ? returnedData.orders.data : []

      // update only rowsNumber = total rows
      this.table.pagination.rowsNumber = returnedData.orders.meta.total

      // don't forget to update local pagination object
      this.table.pagination.page = page
      this.table.pagination.rowsPerPage = rowsPerPage
      this.table.pagination.sortBy = sortBy
      this.table.pagination.descending = descending

      // ...and turn of loading indicator
      this.table.loading = false
      return true
    },

    async submitForm(path) {
      this.table.loading = true
      const params = this.form;

      await api({
        method: 'post',
        url: path,
        data: params
      }).then(async (response) => {
        this.table.selected = []
        Notify.create({
          position: "top",
          type: 'positive',
          message: 'Data transaksi berhasil disimpan'
        })

        await dashboard.getUserFactoryInfo('/admin', 'user')

        const id = response.data.data?.id
        if (this.dialog.print && id) {
          this.router.replace({
            name: 'admin.transaction.invoice.print',
            params: {id: id}
          })
        } else {
          this.table.data = []
          this.router.replace({
            name: 'admin.transaction.invoice.index'
          })
        }

      }).catch(e => {
        this.setError(e);
      }).finally(() => {
        this.table.loading = false
        this.dialog.open = false
      });
    }
  }
})

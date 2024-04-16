import {defineStore} from 'pinia'
import {reactive, ref} from "vue";
import {api} from "boot/axios";
import {LocalStorage, Notify} from "quasar";

export const useOrderStore = defineStore('order', {
  state: () => ({
    customers: [],
    customers_option: [],
    selected_customer: null,
    factories: [],
    factories_option: [],
    selected_factory: null,
    form: {
      id: '',
      trade_date: '',
      customer_id: '',
      factory_id: '',
      net_weight: '',
      net_price: '',
      margin: '',
      net_total: '',
      gross_total: '',
      ppn_tax: '',
      pph22_tax: '',
      ppn: '',
      pph22: '',
      loan: 0,
    },
    table: {
      pagination: {
        sortBy: '',
        descending: false,
        page: 1,
        rowsPerPage: 10,
        rowsNumber: 0
      },
      from: 0,
      selected: ref([]),
      filter: '',
      search: {
        customer_id: '',
        factory_id: '',
      },
      loading: false,
      headers: reactive([
        {name: "no", label: "No", field: "id", sortable: false, align: 'left'},
        {name: "factory_name", label: "Factory", field: "factory", sortable: false, align: 'left'},
        {name: "customer_name", label: "Customer", field: "customer", sortable: false, align: 'left'},
        {name: "trade_date", label: "Delivery Order Date", field: "trade_date", sortable: true, align: 'left'},
        {name: "net_weight", label: "Weight", field: "net_weight", sortable: true},
        {name: "net_price", label: "Price", field: "net_price", sortable: true},
        {name: "margin", label: "Margin", field: "margin", sortable: true},
        {name: "gross_total", label: "Gross Total", field: "gross_total", sortable: true},
        {name: "net_customer", label: "Net Customer", sortable: false},
        {name: "net_total", label: "Net Income", field: "net_total", sortable: true},
        {name: "income_status", label: "Income", field: "income_status", sortable: false, align: 'left'},
      ]),
      data: [],
    },
    errors: {},
  }),

  getters: {
    getSelected(state) {
      return state.table.selected
    }
  },

  actions: {

    setError(e) {
      if(e.hasOwnProperty('response')){
        if (e.response.status === 422) {
          let error = e.response.data.errors;
          for (let property in error) {
            this.errors[property] = error[property][0];
          }
        }else if (e.response.status === 401) {
          LocalStorage.remove('token')
          LocalStorage.remove('permission')
          this.router.replace({name: 'unauthorized'})
        } else {
          this.errors = {};
          Notify.create({
            position: "top",
            type: 'negative',
            message: e.message ?? e.response.statusText
          })
          this.router.replace({name: 'app.unauthorized'})
        }
      }else{
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
    onReset(name = null) {
      if (!name) {
        for (let property in this.form) {
          this.form[property] = null
          this.errors = {}
          if (property === 'customer_id') {
            this.selected_customer = null
          }
          if (property === 'factory_id') {
            this.selected_factory = null
          }
        }
        this.table.selected = []
      } else {
        this.form[name] = null
        if (this.errors.hasOwnProperty(name)) {
          this.errors[name] = ''
        }
        if (name === 'customer_id') {
          this.selected_customer = null
        }
        if (name === 'factory_id') {
          this.selected_factory = null
        }
      }
    },
    async getDeliveriesDataFromApi(path, startRow, count, filter, sortBy, descending) {
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
      data.customer_id = this.table.search.customer_id ?? ''
      data.factory_id = this.table.search.factory_id ?? ''
      try {
        const params = new URLSearchParams(data);
        const response = await api.get(path, {params})
        return response.data
      } catch (e) {
        this.setError(e)
      }
    },
    async getDeliveriesData(path, props) {
      const {page, rowsPerPage, sortBy, descending} = props.pagination
      const filter = props.filter

      this.table.loading = true

      // emulate server
      // update rowsCount with appropriate value

      // get all rows if "All" (0) is selected
      const fetchCount = rowsPerPage === 0 ? this.table.pagination.rowsNumber : rowsPerPage

      // calculate starting row of data
      // fetch data from "server"
      const returnedData = await this.getDeliveriesDataFromApi(path, page, fetchCount, filter, sortBy, descending)

      // clear out existing data and add new
      this.table.data = returnedData.order.data
      this.customers = returnedData.customers
      // this.customers_option = returnedData.customers?.slice(0, 10)
      this.factories = returnedData.factories
      // this.factories_option = returnedData.factories?.slice(0, 10)
      // update only rowsNumber = total rows
      this.table.pagination.rowsNumber = returnedData.order.meta.total

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

      const url = this.form.id ? `${path}/${this.form.id}` : `${path}/${params.factory_id}`
      await api({
        method: this.form.id ? 'patch' : 'post',
        url: url,
        data: params
      }).then(() => {
        this.table.selected = []
        this.onReset()
        Notify.create({
          position: "top",
          type: 'positive',
          message: params.hasOwnProperty('id') ? 'Data transaksi DO berhasil diubah' : 'Data transaksi DO berhasil disimpan'
        })
        this.table.filter = String(Date.now())
        this.onReset()
      }).catch(e => {
        this.setError(e);
      }).finally(() => this.table.loading = false);
    },
    async submitDelete(path = '/') {
      this.table.loading = true
      await api.delete(path + "/" + this.table.selected[0].id)
        .then(() => {
          Notify.create({
            position: "top",
            type: 'positive',
            message: 'transaksi DO berhasil dihapus'
          })
          this.table.filter = String(Date.now())
          this.table.selected = []
          this.onReset()
        }).catch(e => {
          this.table.selected = []
          this.setError(e);
        }).finally(() => this.table.loading = false);
    },
  }
})

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
    date: {
      title: null,
      subtitle: null,
      events: [],
      periods: [],
    },
    dialog: {
      create: false
    },
    form: {
      id: '',
      trade_date: '',
      customer_id: '',
      factory_id: '',
      net_weight: null,
      net_price: null,
      customer_price: null,
      customer_total_price: '',
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
        {name: "customer_price", label: "Customer Price", field: "customer_price", sortable: true},
        {name: "net_customer", label: "Net Customer", sortable: false},
        {name: "margin", label: "Margin", field: "margin", sortable: true},
        {name: "net_price", label: "Factory Price", field: "net_price", sortable: true},
        {name: "gross_total", label: "Gross Total", field: "gross_total", sortable: true},
        {name: "net_total", label: "Net Income", field: "net_total", sortable: true},
      ]),
      header_cashier: reactive([
        {name: "no", label: "No", field: "id", sortable: false, align: 'left'},
        {name: "factory_name", label: "Factory", field: "factory", sortable: false, align: 'left'},
        {name: "customer_name", label: "Customer", field: "customer", sortable: false, align: 'left'},
        {name: "trade_date", label: "Delivery Order Date", field: "trade_date", sortable: true, align: 'left'},
        {name: "net_weight", label: "Weight", field: "net_weight", sortable: true},
        {name: "net_price", label: "Customer Price", field: "customer_price", sortable: true},
        {name: "net_customer", label: "Net Customer", sortable: false},
      ]),
      data: [],
    },
    errors: {},
  }),

  getters: {
    getSelected(state) {
      return state.table.selected
    },
    getTradeDate(state){
      return state.form.trade_date
    }
  },

  actions: {

    setError(e) {
      if (Object.prototype.hasOwnProperty.call(e, 'response')) {
        if (e.response.status === 422) {
          let error = e.response.data.errors;
          for (let property in error) {
            this.errors[property] = error[property][0];
          }
        } else if (e.response.status === 401) {
          LocalStorage.remove('token')
          LocalStorage.remove('permission')
          this.router.replace({name: 'home.unauthorized'})
        } else {
          this.errors = {};
          Notify.create({
            position: "top",
            type: 'negative',
            message: e.message ?? e.response.statusText
          })
          this.router.replace({name: 'admin.unauthorized'})
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
      if (Object.prototype.hasOwnProperty.call(this.errors, error)) {
        delete this.errors[error]
      }
    },
    onReset(name = null) {
      if (!name) {
        for (let property in this.form) {
          this.form[property] = (property === 'net_weight' || property === 'customer_price') ? '' : null;
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
        if (Object.prototype.hasOwnProperty.call(this.errors, name)) {
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


    async getCustomerAndFactoryFromApi(path) {

      try {
        const response = await api.get(path)
        return response.data
      } catch (e) {
        this.setError(e)
      }
    },
    async getCustomerAndFactoryData(path) {

      this.table.loading = true

      // calculate starting row of data
      // fetch data from "server"
      const returnedData = await this.getCustomerAndFactoryFromApi(path)

      // clear out existing data and add new
      this.customers = returnedData.customers
      // this.customers_option = returnedData.customers?.slice(0, 10)
      this.factories = returnedData.factories
      this['date'].periods = returnedData.periods
      // this.factories_option = returnedData.factories?.slice(0, 10)

      // turn of loading indicator
      this.table.loading = false
      return true
    },

    async getFactoryPriceFromApi(path) {
      const data = {
        trade_date: this.form.trade_date ?? '',
        factory_id: this.form.factory_id ?? '',
      }

      try {
        const params = new URLSearchParams(data);

        const response = await api.get(path, {params})
        return response.data
      } catch (e) {
        this.setError(e)
      }
    },
    async getFactoryPriceData(path) {

      this.table.loading = true

      // calculate starting row of data
      // fetch data from "server"
      const returnedData = await this.getFactoryPriceFromApi(path)
      console.log(returnedData)
      this.form.net_price = returnedData.factory_price?.price ?? 0
      // turn of loading indicator
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
          progress: true,
          timeout: 1000,
          position: "top",
          type: 'positive',
          message: Object.prototype.hasOwnProperty.call(params, 'id') ? 'Data transaksi DO berhasil diubah' : 'Data transaksi DO berhasil disimpan'
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

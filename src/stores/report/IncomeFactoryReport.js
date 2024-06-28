import {defineStore} from 'pinia'
import {LocalStorage, Notify} from "quasar";
import {api} from "boot/axios";
import {reactive} from "vue";

export const useIncomeFactoryDataStore = defineStore('incomeFactoryData', {
  state: () => ({
    form: {
      factory_id: null,
    },
    factories: [],
    factories_option: [],
    selected_factory: null,
    table: {
      pagination: {
        sortBy: '',
        descending: false,
        page: 1,
        rowsPerPage: 10,
        rowsNumber: 0
      },
      search: {
        factory_id: null,
      },
      loading: false,
      data: [],
      summaries: {},
      headers: reactive([
        {name: "no", label: "No", field: "id", sortable: false, align: 'left'},
        {name: "action", label: "Action", sortable: false, align: 'left'},
        {name: "factory_name", label: "Factory", field: "factory", sortable: false, align: 'left'},
        {name: "trade_date", label: "Transfer Date", field: "trade_date", sortable: true, align: 'left'},
        {name: "period_start", label: "Start Date", field: "period_start", sortable: true, align: 'left'},
        {name: "period_end", label: "End Date", field: "period_end", sortable: true, align: 'left'},
        {name: "net_weight", label: "Weight", field: "orders", sortable: true},
        {name: "net_price", label: "Price (avg)", field: "orders", sortable: true},
        {name: "margin", label: "Margin (avg)", field: 'orders', sortable: false},
        {name: "ppn", label: "PPN (Rp)", field: "orders", sortable: true},
        {name: "pph22", label: "PPh 22 (Rp)", field: "orders", sortable: true},
        {name: "gross_total", label: "Gross Total", field: "orders", sortable: true},
        {name: "customer_total", label: "Customer Total", field: "orders", sortable: true},
        {name: "bank_transfer", label: "Bank Transfer", field: "orders", sortable: true},
        {name: "net_total", label: "Net Income", field: "orders", sortable: true},
      ]),
    },
    errors: {},
  }),

  getters: {
    form_empty(state) {
      return !state.form.start_date || !state.form.end_date
    },
    form_monthly(state) {
      return state.form.monthly ? state.form.monthly.length !== 7 : true
    }
  },

  actions: {
    onReset(name = null) {
      if (!name) {
        for (let property in this.form) {
          this.form[property] = null
          this.errors = {}
        }
        this.table.selected = []
      } else {
        this.form[name] = null
        if (this.errors.hasOwnProperty(name)) {
          this.errors[name] = ''
        }
      }
    },

    unsetError(error) {
      if (this.errors.hasOwnProperty(error)) {
        delete this.errors[error]
      }
    },
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
      }else{
        Notify.create({
          position: "top",
          type: 'negative',
          message: 'Unknown error'
        })
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
      this.table.data = returnedData.data
      // update only rowsNumber = total rows
      this.table.pagination.rowsNumber = returnedData.meta?.total ?? 0

      // don't forget to update local pagination object
      this.table.pagination.page = page
      this.table.pagination.rowsPerPage = rowsPerPage
      this.table.pagination.sortBy = sortBy
      this.table.pagination.descending = descending

      // ...and turn of loading indicator
      this.table.loading = false
      return true
    },


    async getDeliveryFactoryID(path) {
      this.table.loading = true
      const response = await this.getFactoryDeliveryOrderDataFromApi(path)
      this.table.data = response.income.data
      // this.table.summaries = response.orders.orders
      this.table.loading = false
      return true
    },

    async getFactoryData(path) {
      this.table.loading = true
      const response = await this.getFactoryDataFromApi(path)
      this.factories = response.factories
      this.table.loading = false
    },
    async getFactoryDataFromApi(path) {
      try {
        const response = await api.get(path)
        return response.data
      } catch (e) {
        this.setError(e)
      }
    },

    async getFactoryDeliveryOrderDataFromApi(path) {
      const data = this.form

      if(this.request_type === 'period') {
        delete data.monthly
      }else{
        delete data.end_date
        delete data.start_date
      }

      const params = new URLSearchParams(data);
      try {
        const response = await api.get(`${path}`, {params})
        return response.data
      } catch (e) {
        this.setError(e)
      }
    },

    async exportDataToExcel(path, id){
      this.table.loading = true
      const table = this.table.data[id]

      const data = {}
      const trade_date = table.trade_date ? table.trade_date.replaceAll("/", "") : ""
      const factory_name = table.factory.name.toUpperCase() ?? ""

      data.file_name = `${factory_name.replaceAll(' ', '_')}_${trade_date}.xlsx`
      data.start_date = table.period_start
      data.end_date = table.period_end
      await api.post(`${path}/${table.id}`, data, {
        responseType: 'blob'
      }).then((response) => {
        saveAs(response.data, data.file_name);
      });

      this.table.loading = false
    }
  }
})

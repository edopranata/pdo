import {defineStore} from 'pinia'
import {reactive} from "vue";
import {api} from "boot/axios";
import {LocalStorage, Notify} from "quasar";

export const useIncomeStore = defineStore('income', {
  state: () => ({
    form: {
      factory_id: null,
      trade_date: null,
      period: null,
      income_period: null,
      period_start: null,
      period_end: null,
    },
    dialog: {
      open: false,
    },
    factories: [],
    factories_option: [],
    selected_factory: null,
    table: {
      loading: false,
      data: [],
      orders: [],
      headers: reactive([
        {name: "no", label: "No", field: 'id', sortable: false, align: 'left'},
        {name: "trade_date", label: "Trade Date", field: "trade_date", sortable: false, align: 'left'},
        {name: "factory_name", label: "Factory", field: "factory", sortable: true, align: 'left'},
        {name: "customer_name", label: "Customer", field: "customer", sortable: true, align: 'left'},
        {name: "net_weight", label: "Net Weight (kg)", field: "net_weight", sortable: true},
        {name: "net_price", label: "Price (Rp)", field: "customer_price", sortable: true},
        {name: "gross_total", label: "Total", field: "gross_total", sortable: true},
        {name: "ppn_total", label: "PPN", field: "ppn_total", sortable: true},
        {name: "pph22_total", label: "PPh 22", field: "pph22_total", sortable: true},
        {name: "total", label: "Net Total", field: "total", sortable: true},
      ]),
    },
    order: {},
    errors: {},
  }),

  getters: {
    getSelected(state) {
      return state.table.selected
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
          this.form[property] = null
          this.errors = {}
          if (property === 'factory_id') {
            this.selected_factory = null
          }
        }
      } else {
        this.form[name] = null
        if (Object.prototype.hasOwnProperty.call(this.errors, name)) {
          this.errors[name] = ''
        }
        if (name === 'factory_id') {
          this.selected_factory = null
        }
      }
    },
    async getIncomeDataFromApi(path) {
      const data = {
        factory_id: this.form.factory_id ?? '',
        period_start: this.form.period_start ?? '',
        period_end: this.form.period_end ?? '',
      }

      try {
        const params = new URLSearchParams(data);
        const response = await api.get(path, {params})
        return response.data
      } catch (e) {
        this.setError(e)
      }
    },
    async getIncomeData(path) {
      this.table.loading = true

      // fetch data from "server"
      const returnedData = await this.getIncomeDataFromApi(path)

      // clear out existing data and add new
      if(Object.prototype.hasOwnProperty.call(returnedData, 'order')){
        this.order = Object.prototype.hasOwnProperty.call(returnedData.order, 'orders') ? returnedData.order.orders : null
        this.table.data = Object.prototype.hasOwnProperty.call(returnedData.order, 'data') ? returnedData.order.data : []
        this.table.orders = Object.prototype.hasOwnProperty.call(returnedData.order, 'orders') ? returnedData.order.orders : []
      }

      if(Object.prototype.hasOwnProperty.call(returnedData, 'factories')){
        this.factories = returnedData.factories
      }


      // ...and turn of loading indicator
      this.table.loading = false
      return true
    },
    async submitForm(path) {
      this.table.loading = true
      const params = this.form;
      await api({
        method: 'post',
        url: `${path}/${params.factory_id}`,
        data: params
      }).then(() => {

        Notify.create({
          position: "top",
          type: 'positive',
          message: 'Income Data berhasil disimpan'
        })

        this.onReset()
        this.order = null
        this.errors = []
        this.table.data = []
        this.table.orders = null
      }).catch(e => {
        this.setError(e);
      }).finally(() => {
        this.table.loading = false
        this.dialog.open = false
      });
    }
  }
})

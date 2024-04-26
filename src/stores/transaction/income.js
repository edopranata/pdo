import {defineStore} from 'pinia'
import {reactive} from "vue";
import {api} from "boot/axios";
import {LocalStorage, Notify} from "quasar";

export const useIncomeStore = defineStore('income', {
  state: () => ({
    form: {
      factory_id: null,
      trade_date: null,
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
      if (this.errors.hasOwnProperty(error)) {
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
        this.table.selected = []
      } else {
        this.form[name] = null
        if (this.errors.hasOwnProperty(name)) {
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
      this.table = returnedData.order
      // this.customers_option = returnedData.customers?.slice(0, 10)
      this.factories = returnedData.factories

      this.order = returnedData.order.orders

      // ...and turn of loading indicator
      this.table.loading = false
      return true
    },
  }
})

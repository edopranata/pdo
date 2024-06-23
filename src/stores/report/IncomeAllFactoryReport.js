import {defineStore} from 'pinia'
import {LocalStorage, Notify} from "quasar";
import {api} from "boot/axios";

export const useIncomeAllFactoryDataStore = defineStore('incomeAllFactoryData', {
  state: () => ({
    request_type: 'period',
    form: {
      monthly: null,
    },
    table: {
      loading: false,
      data: [],
      summaries: {},
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

    async getDeliveryFactoryID(path) {
      this.table.loading = true
      const response = await this.getFactoryDeliveryOrderDataFromApi(path)
      this.table.data = response.income.data
      // this.table.summaries = response.orders.orders
      this.table.loading = false
      return true
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

    async exportDataToExcel(path){
      const start = this.form.start_date ? this.form.start_date.replaceAll("/", "") : ""
      const end = this.form.end_date ? this.form.end_date.replaceAll("/", "") : ""
      const monthly = this.form.monthly ? this.form.monthly.replaceAll("/", "") : ""

      const data = this.form

      if(this.request_type === 'period') {
        delete data.monthly
        data.file_name = `FACTORY_INCOME_${start}_${end}.xlsx`

      }else{
        delete data.end_date
        delete data.start_date
        data.file_name = `FACTORY_INCOME_${monthly}.xlsx`
      }

      await api.post(`${path}`, data, {
        responseType: 'blob'
      }).then((response) => {
        saveAs(response.data, data.file_name);
      });
    }
  }
})

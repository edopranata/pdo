import {defineStore} from 'pinia'
import {LocalStorage, Notify} from "quasar";
import {api} from "boot/axios";
import * as FileSaver from "file-saver";
export const useCustomerOrderReportStore = defineStore('customerOrderReport', {
  state: () => ({
    customers: [],
    customers_option: [],
    selected_customer: null,
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
    summaries(state) {
      return state.table.summaries
    },
    checkForm(state){
      return state.form.monthly ? state.form.monthly.length === 7 : false
    }
  },

  actions: {
    onReset(name = null) {
      if (!name) {
        for (let property in this.form) {
          this.form[property] = null
          this.errors = {}
          if (property === 'customer_id') {
            this.selected_customer = null
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
      }
    },

    unsetError(error) {
      if (Object.prototype.hasOwnProperty.call(this.errors, error)) {
        delete this.errors[error]
      }
    },
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
    async getCustomerOrderFromApi(path) {
      try {
        const data = this.form
        const params = new URLSearchParams(data);
        const response = await api.get(path, {params})
        return response.data
      } catch (e) {
        this.setError(e)
        this.table.loading = false
      }
    },

    async getCustomerOrderList(path) {
      this.table.loading = true
      const response = await this.getCustomerOrderFromApi(path)
      if (Array.isArray(response.data)) {
        this.table.data = response.data
        this.table.summaries = response.summaries
      }
      this.table.loading = false
      return true
    },

    async exportDataToExcel(path){
      this.table.loading = true
      const fileName = `customer_order_${this.form.monthly.replace('/', '')}.xlsx`

      await api.post(path, this.form, {
        responseType: 'blob'
      }).then((response) => {
        FileSaver.saveAs(response.data, fileName);
        this.table.loading = false
      }).catch((e) => {
        this.setError(e)
        this.table.loading = false
      });
    }

  }
})

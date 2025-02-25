import { defineStore } from 'pinia'
import { LocalStorage, Notify } from 'quasar'
import { api } from 'boot/axios'
import * as FileSaver from 'file-saver'

export const useCustomerOrderReportStore = defineStore('customerOrderReport', {
  state: () => ({
    customers: [],
    customers_option: [],
    selected_customer: null,
    form: {
      customer_id: '',
      monthly: null
    },
    table: {
      loading: false,
      data: [],
      summaries: {}
    },
    errors: {}
  }),

  getters: {
    summaries(state) {
      return state.table.summaries
    },
    form_empty(state) {
      return !state.form.customer_id
    },
    checkForm(state) {
      return state.form.monthly ? state.form.monthly.length === 7 : false
    }
  },

  actions: {
    onReset(name = null) {
      if (!name) {
        for (let property in this.form) {
          this.form[property] = null
          this.errors = {}

          this.selected_customer = null
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
          let error = e.response.data.errors
          for (let property in error) {
            this.errors[property] = error[property][0]
          }
          if(error === undefined) {
            Notify.create({
              position: 'top',
              type: 'negative',
              message: e.message ?? e.response.statusText
            })
          }
        } else if (e.response.status === 401) {
          LocalStorage.remove('token')
          LocalStorage.remove('permission')
          this.router.replace({ name: 'home.unauthorized' })
        } else {
          this.errors = {}
          Notify.create({
            position: 'top',
            type: 'negative',
            message: e.message ?? e.response.statusText
          })
          this.router.replace({ name: 'admin.unauthorized' })
        }
      } else {
        Notify.create({
          position: 'top',
          type: 'negative',
          message: 'Unknown error'
        })
      }
    },

    async getAllCustomer(path) {
      this.table.loading = true
      const response = await api.get(path)

      this.customers = Object.prototype.hasOwnProperty.call(response.data, 'data') ? response.data.data : []
      this.table.loading = false
    },
    async getCustomerOrderFromApi(path) {
      try {
        const data = this.form
        const params = new URLSearchParams(data)
        const response = await api.get(path, { params })
        return response.data
      } catch (e) {
        this.setError(e)
        this.table.loading = false
      }
    },

    async getAllCustomerOrders(path) {
      this.table.loading = true
      const response = await this.getCustomerOrderFromApi(path)
      if (Array.isArray(response.data)) {
        this.table.data = response.data
        this.table.summaries = response.summaries
      }
      this.table.loading = false
      return true
    },
    async getCustomerOrderList(path) {
      this.table.loading = true
      try {
        const data = this.form
        const response = await api.post(path, data)
        let customer = Object.prototype.hasOwnProperty.call(response.data, 'data') ? response.data.data : []
        this.table.data = Object.prototype.hasOwnProperty.call(customer, 'orders') ? customer.orders : []
        this.table.summaries = Object.prototype.hasOwnProperty.call(customer, 'summaries') ? customer.summaries : []
        delete customer.orders
        delete customer.summaries
        this.table.loading = false
        return true
      } catch (e) {
        this.setError(e)
        this.table.loading = false
      }

    },

    async exportDataToExcel(path) {
      this.table.loading = true
      const fileName = `customer_order_${this.form.monthly.replace('/', '')}.xlsx`

      await api.post(path, this.form, {
        responseType: 'blob'
      }).then((response) => {
        if (response.status === 200) {
          FileSaver.saveAs(response.data, fileName)
        }else{
          this.setError(response)
        }

        this.table.loading = false
      }).catch((e) => {
        this.setError(e)
        this.table.loading = false
      })
    },

    async exportCustomerOrderDataToExcel(path) {
      this.table.loading = true
      const fileName = `customer_order_${this.form.monthly.replace('/', '')}.xlsx`


      try {
        const response = await api.patch(path, this.form, {
          responseType: 'blob'
        })
        if(response.data) {
          FileSaver.saveAs(response.data, fileName)
        }
        this.table.loading = false
        return true
      } catch (e) {
        this.setError(e)
        this.table.loading = false
      }
      // await api.patch(path, this.form, {
      //   responseType: 'blob'
      // }).then((response) => {
      //   if (response.status === 200) {
      //     FileSaver.saveAs(response.data, fileName)
      //   }else{
      //     this.setError(response)
      //   }
      //   this.table.loading = false
      // }).catch((e) => {
      //   this.setError(e)
      //   this.table.loading = false
      // })
    }

  }
})

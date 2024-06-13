import {defineStore} from 'pinia'
import {date, LocalStorage, Notify} from "quasar";
import {api} from "boot/axios";

export const useLoanReportStore = defineStore('loanReport', {
  state: () => ({
    customers: [],
    customers_option: [],
    selected_customer: null,
    form: {
      customer_id: null,
      date: null,
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
        if (this.errors.hasOwnProperty(name)) {
          this.errors[name] = ''
        }
        if (name === 'customer_id') {
          this.selected_customer = null
        }
      }
    },

    unsetError(error) {
      if (this.errors.hasOwnProperty(error)) {
        delete this.errors[error]
      }
    },
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
    async getCustomerFromApi(path) {
      try {
        const response = await api.get(path)
        return response.data
      } catch (e) {
        this.setError(e)
      }
    },

    async getCustomerList(path) {
      this.table.loading = true
      const response = await this.getCustomerFromApi(path)
      if (Array.isArray(response.data)) {
        this.table.data = response.data
        this.table.summaries = response.summaries
      }
      this.table.loading = false
      return true
    },

    async exportDataToExcel(path){
      const fileName = `customer_loan_${date.formatDate(Date.now(), 'YYYYMMDD')}.xlsx`

      await api.post(path,{}, {
        responseType: 'blob'
      }).then((response) => {
        // console.log(response)
        saveAs(response.data, fileName);
      });
    }

  }
})

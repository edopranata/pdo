import {defineStore} from 'pinia'
import {date, LocalStorage, Notify} from "quasar";
import {api} from "boot/axios";

export const useTransactionReportStore = defineStore('transactionReport', {
  state: () => ({
    users: [],
    users_option: [],
    selected_user: null,
    form: {
      user_id: null,
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
      // const total = state.table.data
      // const opening_balance = total.length > 0 ? parseFloat(total[0].opening_balance) : 0
      // const total_cash_in = total.length > 0 ? parseFloat(total.reduce((t, n) => t + n.balance_in, 0)) : 0
      // const total_cash_out = total.length > 0 ? parseFloat(total.reduce((t, n) => t + n.balance_out, 0)) : 0
      // return  {
      //   opening_balance: opening_balance,
      //   total_cash_in: total_cash_in,
      //   total_cash_out: total_cash_out,
      //   ending_balance: parseFloat(opening_balance + total_cash_in - total_cash_out)
      // };
    }
  },

  actions: {
    onReset(name = null) {
      if (!name) {
        for (let property in this.form) {
          this.form[property] = null
          this.errors = {}
          if (property === 'user_id') {
            this.selected_user = null
          }
        }
        this.table.selected = []
      } else {
        this.form[name] = null
        if (this.errors.hasOwnProperty(name)) {
          this.errors[name] = ''
        }
        if (name === 'user_id') {
          this.selected_user = null
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
    async getUserFromApi(path) {
      try {
        const response = await api.get(path)
        return response.data
      } catch (e) {
        this.setError(e)
      }
    },

    async getUserList(path) {
      this.table.loading = true
      const response = await this.getUserFromApi(path)
      if (Array.isArray(response.data)) {
        this.users = response.data
      } else {
        this.users = []
        this.users.push(response.data)
        this.selected_user = response.data
        this.form.user_id = response.data.id

        if (path.endsWith('dailyTransaction')) {
          this.form.date = date.formatDate(Date.now(), 'YYYY/MM/DD')
        }
        await this.getTransactionData(path)

      }
      this.table.loading = false
      return true
    },

    async getTransactionDataFromApi(path) {
      try {
        if (path.endsWith('todayTransaction')) {
          delete this.form.date
        }
        const data = this.form

        const params = new URLSearchParams(data);

        const response = await api.get(path, {params})
        return response.data
      } catch (e) {
        this.setError(e)
      }
    },

    async getTransactionData(path) {
      this.table.loading = true
      const response = await this.getTransactionDataFromApi(path)
      this.table.data = response.data.invoice
      this.table.loading = false
      return true
    }


  }
})

import {defineStore} from 'pinia'
import {date, LocalStorage, Notify} from "quasar";
import {api} from "boot/axios";

export const useCashTodayReportStore = defineStore('cashTodayReport', {
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
      const total = state.table.data
      const opening_balance = total.length > 0 ? parseFloat(total[0].opening_balance) : 0
      const total_cash_in = total.length > 0 ? parseFloat(total.reduce((t, n) => t + n.balance_in, 0)) : 0
      const total_cash_out = total.length > 0 ? parseFloat(total.reduce((t, n) => t + n.balance_out, 0)) : 0
      return  {
        opening_balance: opening_balance,
        total_cash_in: total_cash_in,
        total_cash_out: total_cash_out,
        ending_balance: parseFloat(opening_balance + total_cash_in - total_cash_out)
      };
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
        if (Object.prototype.hasOwnProperty.call(this.errors, name)) {
          this.errors[name] = ''
        }
        if (name === 'user_id') {
          this.selected_user = null
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

        if (path.endsWith('dailyCash')) {
          this.form.date = date.formatDate(Date.now(), 'YYYY/MM/DD')
        }
        await this.getCashData(path)

      }
      this.table.loading = false
      return true
    },

    async getCashDataFromApi(path) {
      try {
        if (path.endsWith('todayCash')) {
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

    async getCashData(path) {
      this.table.loading = true
      const response = await this.getCashDataFromApi(path)
      this.table.data = response.data.mutations
      this.table.loading = false
      return true
    }


  }
})

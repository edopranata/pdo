import {defineStore} from 'pinia'
import {LocalStorage, Notify} from "quasar";
import {api} from "boot/axios";
import * as FileSaver from "file-saver";
export const useIncomeFactoryReportShowStore = defineStore('incomeFactoryReportShow', {
  state: () => ({
    table: {
      loading: false,
      data: [],
    },
    errors: {},
  }),

  actions: {
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
        if (Object.prototype.hasOwnProperty.call(this.errors, name)) {
          this.errors[name] = ''
        }
        if (name === 'factory_id') {
          this.selected_factory = null
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
    async getIncomeDeliveryOrderFromApi(path) {
      try {
        const response = await api.get(path)
        return response.data
      } catch (e) {
        this.setError(e)
      }
    },

    async getIncomeDeliveryOrder(path) {
      this.table.loading = true
      const response = await this.getIncomeDeliveryOrderFromApi(path)
      // this.table.income = response.data
      this.table.data = response.data
      this.table.loading = false
      return true
    },

    async exportDataToExcel(path) {
      const data = {}
      const trade_date = this.table.data.trade_date ? this.table.data.trade_date.replaceAll("/", "") : ""
      const factory_name = this.table.data.factory.name.toUpperCase() ?? ""

      data.file_name = `${factory_name.replaceAll(' ', '_')}_${trade_date}.xlsx`
      data.start_date = this.table.data.period_start
      data.end_date = this.table.data.period_end
      await api.post(`${path}`, data, {
        responseType: 'blob'
      }).then((response) => {
        FileSaver.saveAs(response.data, data.file_name);
      });
    }
  }
})

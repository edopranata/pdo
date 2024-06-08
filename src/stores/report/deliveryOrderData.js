import {defineStore} from 'pinia'
import {LocalStorage, Notify} from "quasar";
import {api} from "boot/axios";

export const useDeliveryOrderDataStore = defineStore('deliveryOrderData', {
  state: () => ({
    factories: [],
    factories_option: [],
    selected_factory: null,
    form: {
      factory_id: null,
      start_date: null,
      end_date: null,
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
      return !state.form.factory_id || !state.form.start_date || !state.form.end_date
    },
  },

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
        if (this.errors.hasOwnProperty(name)) {
          this.errors[name] = ''
        }
        if (name === 'factory_id') {
          this.selected_factory = null
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
    async getFactoryFromApi(path) {

      try {
        const response = await api.get(path)
        return response.data
      } catch (e) {
        this.setError(e)
      }
    },

    async getDeliveryOrderData(path){
      this.table.loading = true
      const response = await this.getFactoryFromApi(path)
      this.factories = response.factories
      this.table.loading = false
      return true
    },

    async getDeliveryFactoryID(path) {
      this.table.loading = true
      const response = await this.getFactoryDeliveryOrderDataFromApi(path)
      this.table.data = response.orders.data
      this.table.summaries = response.orders.orders
      this.table.loading = false
      return true
    },

    async getFactoryDeliveryOrderDataFromApi(path) {
      const data = {
        start_date: this.form.start_date,
        end_date: this.form.end_date
      }
      const params = new URLSearchParams(data);
      try {
        const response = await api.get(`${path}/${this.form.factory_id}`, {params})
        return response.data
      } catch (e) {
        this.setError(e)
      }
    },

    async exportDataToExcel(path){
      const factory = this.selected_factory.name.toLowerCase().replaceAll(" ", "_").replaceAll('.', '')
      const start = this.form.start_date.replaceAll("/", "")
      const end = this.form.end_date.replaceAll("/", "")
      const fileName = `${factory}_${start}_${end}.xlsx`

      console.log(fileName)
      await api.post(`${path}/${this.form.factory_id}`, {
        file_name: fileName,
        start_date: this.form.start_date,
        end_date: this.form.end_date
      }, {
        responseType: 'blob'
      }).then((response) => {
        // console.log(response)
        saveAs(response.data, fileName);
      });
    }
  }
})

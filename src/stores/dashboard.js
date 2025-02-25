import {defineStore} from 'pinia'
import {LocalStorage, Notify} from "quasar";
import {api} from "boot/axios";

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    dialog: {
      open: false,
    },
    form: {
      factory_id: null,
      name: null,
      price_date: null,
      price: null
    },
    user: {},
    factories: [],
    best_customers: {
      options: {},
      series: []
    },
    annual_factory_chart:{
      options: {},
      series: []

    },
    errors: {},
    table: {
      loading: false
    }
  }),

  getters: {

  },

  actions: {
    onReset(form = null) {
      if(form === null){
        for (let property in this.form) {
          this.form[property] = null;
        }

        this.errors = {}
      }
    },
    setError(e) {
      if(Object.prototype.hasOwnProperty.call(e, 'response')){
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
    async getUserFactoryInfoFromApi(path, type) {

      const data = {
        type: type
      }
      try {
        const response = await api.post(path, data )
        return response.data
      } catch (e) {
        this.setError(e)
      }
    },

    async getUserFactoryInfo(path, type) {

      this.table.loading = true

      // fetch data from "server"
      const returnedData = await this.getUserFactoryInfoFromApi(path, type)

      if(Object.prototype.hasOwnProperty.call(returnedData, 'factories')) {
        this.factories = returnedData.factories
      }

      if(Object.prototype.hasOwnProperty.call(returnedData, 'user')) {
        this.user = returnedData.user
      }
      if(Object.prototype.hasOwnProperty.call(returnedData, 'annual_factory_chart')) {
        this.annual_factory_chart = returnedData.annual_factory_chart
      }

      if(Object.prototype.hasOwnProperty.call(returnedData, 'best_customers')) {
        this.best_customers = returnedData.best_customers
      }
      this.table.loading = false
      return true
    },

    async submitForm(path) {
      this.table.loading = true
      const params = this.form;

      const url = `${path}/${params.factory_id}`
      await api.post(url, params).then(() => {
        Notify.create({
          position: "top",
          type: 'positive',
          message: `Harga tanggal ${params.price_date} untuk ${params.name} berhasil disimpan`
        })
        this.onReset()
        this.getUserFactoryInfo('/admin', 'factories')
        this.dialog.open = false
      }).catch(e => {
        this.setError(e);
      }).finally(() => this.table.loading = false);
    },
  }
})

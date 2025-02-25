import {defineStore} from 'pinia'
import {api} from "boot/axios";
import {LocalStorage, Notify} from "quasar";
import {reactive} from "vue";


export const usePriceStore = defineStore('price', {
  state: () => ({
    form: {
      id: null,
      factory_id: null,
      price_date: null,
      price: null,
    },
    dialog: {
      open: false,
    },
    date: {
      day: null,
      start_date: null,
      end_date: null,
      period: [],
      events: [],
    },
    factories: [],
    factories_option: [],
    selected_factory: null,
    table: {
      name: null,
      price: null,
      loading: false,
      data: [],
      headers: reactive([
        {name: "no", label: "No", field: "id", sortable: false, align: 'left'},
        {name: "date", label: "Date", field: "date", sortable: true, align: 'left'},
        {name: "price", label: "Price", field: "price", sortable: true, align: 'right'},
      ]),
    },
    order: {},
    errors: {},
  }),

  getters: {
    getSelected(state) {
      return state.table.selected
    },
    getTradeDate(state) {
      return state.form.price_date
    }
  },

  actions: {

    setError(e) {
      if(Object.prototype.hasOwnProperty.call(e, 'response')){
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
      if(Object.prototype.hasOwnProperty.call(this.errors, error)){
        delete this.errors[error]
      }
    },
    onReset(name = null) {
      if (!name) {
        for (let property in this.form) {

          this.form[property] = property === 'price' ? '' : null
          this.errors = {}
          if (property === 'factory_id') {
            this.selected_factory = null
          }

        }
        this.table.selected = []
      } else {
        this.form[name] = null
        if(Object.prototype.hasOwnProperty.call(this.errors, name)){
          this.errors[name] = ''
        }
        if (name === 'factory_id') {
          this.selected_factory = null
        }
      }
    },
    async getPriceDataFromApi(path) {

      try {
        const response = await api.get(path)
        return response.data
      } catch (e) {
        this.setError(e)
      }
    },
    async getPriceData(path) {


      this.table.loading = true

      // fetch data from "server"
      const returnedData = await this.getPriceDataFromApi(path)

      // clear out existing data and add new
      this.date.day = returnedData.day
      // this.customers_option = returnedData.customers?.slice(0, 10)
      this.factories = returnedData.factories

      this.date.period = returnedData.period
      this.date.start_date = returnedData.start_date
      this.date.end_date = returnedData.end_date

      // ...and turn of loading indicator
      this.table.loading = false
      return true
    },

    async submitForm(path) {
      this.table.loading = true
      const params = this.form;

      const url = this.form.id ? `${path}/${params.id}` : `${path}/${params.factory_id}`
      await api({
        method: this.form.id ? 'patch' : 'post',
        url: url,
        data: params
      }).then(() => {
        Notify.create({
          position: "top",
          type: 'positive',
          message: Object.prototype.hasOwnProperty.call(params, 'id') ? `Data harga tanggal ${params.price_date} berhasil diubah` : `Data harga ${params.price_date} berhasil disimpan`
        })
        this.onReset()
        this.getPriceData(path)
        this.dialog.open = false
      }).catch(e => {
        this.setError(e);
      }).finally(() => this.table.loading = false);
    },
  }
})

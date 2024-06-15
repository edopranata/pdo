import {defineStore} from 'pinia'
import {reactive, ref} from "vue";
import {LocalStorage, Notify} from "quasar";
import {api} from "boot/axios";

export const useInvoiceCancelingDataStore = defineStore('invoiceCancelingData', {
  state: () => ({
    form:{
      invoice_id: "",
      installment: "",
      total: "",
      customer_id: ""
    },
    table: {
      search: "",
      pagination: {
        sortBy: '',
        descending: false,
        page: 1,
        rowsPerPage: 10,
        rowsNumber: 0
      },
      filter: null,
      selected: ref([]),
      loading: false,
      headers: reactive([
        {name: "no", label: "No", field: "id", sortable: false, align: 'left'},
        {name: "customer_name", label: "Customer", field: "customer", sortable: false, align: 'left'},
        {name: "trade_date", label: "Invoice Date", field: "invoice_date", sortable: true, align: 'left'},
        {name: "invoice_number", label: "Invoice Number", field: "invoice_number", sortable: true, align: 'left'},
        {name: "total_order", label: "Delivery Order", field: "total_order", sortable: false, align: 'right'},
        {name: "loan_installment", label: "Loan Installment", field: "loan_installment", sortable: false, align: 'right'},
        {name: "total", label: "Customer Total", field: "total", sortable: false, align: 'right'},
      ]),
      data: [],
      invoice: {},
    },
    errors: {},
  }),

  getters: {
    getSearch(state) {
      return state.table.search
    },
    getSelected(state) {
      return state.table.selected
    },
    getInvoice(state) {
      return state.table.invoice
    },
    getCountTransaction(state){
      const data = {}
      data.loan = state.table.invoice ? state.table.invoice.loan ? 5 : 0 : 0
      data.detail = state.table.invoice ? state.table.invoice.count_order > 0 ? state.table.invoice.count_order + 2 : 0 : 0

      data.needed_length = data.loan + data.detail

      data.total = state.table.invoice ? state.table.invoice.detail_do ? state.table.invoice.detail_do.reduce((total, next) => parseFloat(total) + parseFloat(next.customer_total), 0) : 0 : 0
      data.count = (14 - data.needed_length) >= 0 ? (14 - data.needed_length) : 1

      return data
    },
  },

  actions: {

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
    async getInvoiceDataFromApi(path, startRow, count, filter, sortBy, descending) {
      const data = {
        page: startRow,
        limit: count,
        search: this.table.search
      }

      // Sort by field descending or ascending
      if (sortBy) {
        const orderBy = descending ? 'desc' : 'asc'
        data.sortBy = JSON.stringify({
          key: sortBy,
          order: orderBy
        })
      }
      // search


      try {
        const params = new URLSearchParams(data);
        const response = await api.get(path, {params})

        return response.data
        // this.table.data = response.data.data

        // update only rowsNumber = total rows
        // this.table.pagination.rowsNumber = response.data.details.total
      } catch (e) {
        // this.setError(e)
      }

      this.table.loading = false
    },
    async getInvoiceData(path, props) {
      const {page, rowsPerPage, sortBy, descending} = props.pagination
      const filter = props.filter

      this.table.loading = true

      // emulate server
      // update rowsCount with appropriate value

      // get all rows if "All" (0) is selected
      const fetchCount = rowsPerPage === 0 ? this.table.pagination.rowsNumber : rowsPerPage

      // calculate starting row of data
      // fetch data from "server"
      const returnedData = await this.getInvoiceDataFromApi(path, page, fetchCount, filter, sortBy, descending)

      if (returnedData) {
        // clear out existing data and add new
        this.table.data = returnedData.data

        // update only rowsNumber = total rows
        this.table.pagination.rowsNumber = returnedData.meta.total

        // don't forget to update local pagination object
        this.table.pagination.page = page
        this.table.pagination.rowsPerPage = rowsPerPage
        this.table.pagination.sortBy = sortBy
        this.table.pagination.descending = descending

        // ...and turn of loading indicator
        this.table.loading = false
      }
      return true
    },

    async getInvoiceID(path) {
      try {
        const response = await api.get(path)
        this.table.invoice = response.data.data
      } catch (e) {
        this.setError(e)
      }
    },

    async submitCancelation(path) {
      this.table.loading = true
      const params = this.form;
      await api({
        method: 'delete',
        url: path,
        data: params
      }).then(() => {
        this.table.search = ""
        this.router.replace({name: 'admin.transaction.invoiceCanceling.index'})
        Notify.create({
          position: "top",
          type: 'positive',
          message: 'Cash restore'
        })
      }).catch(e => {
        if(e.hasOwnProperty('response')){
          if(e.response.status === 422){
            Notify.create({
              position: "top",
              type: 'negative',
              message: e.response.data.errors.hasOwnProperty('balance') ? e.response.data.errors.balance[0] : e.response.statusText
            })
          }
          this.setError(e);
        }
      }).finally(() => this.table.loading = false);
    },


  }
})

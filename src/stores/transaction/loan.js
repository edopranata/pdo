import {defineStore} from 'pinia'
import {reactive} from "vue";
import {LocalStorage, Notify} from "quasar";
import {api} from "boot/axios";
import {useDashboardStore} from "stores/dashboard";

const dashboard = useDashboardStore()
export const useLoanStore = defineStore('loan', {
  state: () => ({
    form:{
      id: null,
      name: null,
      phone: null,
      address: null,
      balance: null,
      current: null,
      ending: null,
    },
    dialog: {
      give: false,
      take: false,
      print: false,
    },
    table: {
      pagination: {
        sortBy: '',
        descending: false,
        page: 1,
        rowsPerPage: 6,
        rowsNumber: 0
      },
      paginationDetails: {
        sortBy: '',
        descending: false,
        page: 1,
        rowsPerPage: 5,
        rowsNumber: 0
      },
      search: '',
      filter: '',
      loading: false,
      headers: reactive([
        {name: "no", label: "No", field: "id", sortable: false, align: 'left'},
        {name: "name", label: "Name", field: "user", sortable: true, align: 'left'},
        {name: "phone", label: "Phone", field: "phone", sortable: true, align: 'left'},
        {name: "address", label: "Address", field: "address", sortable: true, align: 'left'},
        {name: "balance", label: "Loan", field: "loan", sortable: true, align: 'left'},
      ]),
      details: reactive([
        {name: "no", label: "No", field: "id", sortable: true, align: 'left'},
        {name: "trade_date", label: "Tanggal Transaksi", field: "trade_date", sortable: false, align: 'left'},
        {name: "description", label: "Keterangan", field: "description", sortable: false, align: 'left'},
        {name: "opening_balance", label: "Pinjaman Awal", field: "opening_balance", sortable: false, align: 'right'},
        {name: "balance_in", label: "Angsunran", field: "balance_in", sortable: false, align: 'right'},
        {name: "balance_out", label: "Pinjaman", field: "balance_out", sortable: false, align: 'right'},
        {name: "ending_balance", label: "Sisa Pinjaman", field: "ending_balance", sortable: false, align: 'right'},
      ]),
      customer: {},
      loan: {},
      data: [],
    },
    errors: {},
  }),

  getters: {
    getSearch(state) {
      return state.table.search
    }
  },

  actions: {
    async onReset(form = null) {
      if(form === null){
        for (let property in this.form) {
          this.form[property] = '';
        }

        this.errors = {}
        this.table.selected = []

        await dashboard.getUserFactoryInfo('/admin', 'user')
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
    async getLoanDataFromApi(path, startRow, count, filter, sortBy, descending) {
      const data = {
        page: startRow,
        limit: count,
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
      data.search = this.table.search ?? ''
      try {
        const params = new URLSearchParams(data);
        const response = await api.get(path, {params})
        return response.data
      } catch (e) {
        this.setError(e)
      }
    },
    async getLoanData(path, props) {
      const {page, rowsPerPage, sortBy, descending} = props.pagination
      const filter = props.filter

      this.table.loading = true

      // emulate server
      // update rowsCount with appropriate value

      // get all rows if "All" (0) is selected
      const fetchCount = rowsPerPage === 0 ? this.table.pagination.rowsNumber : rowsPerPage

      // calculate starting row of data
      // fetch data from "server"
      const returnedData = await this.getLoanDataFromApi(path, page, fetchCount, filter, sortBy, descending)
      if(path.endsWith('details')){
        if(Object.prototype.hasOwnProperty.call(returnedData, 'details')){
          this.table.data = returnedData.details.data ?? []
          this.table.paginationDetails.rowsNumber = returnedData.details.meta.total
        }
        this.table.customer = Object.prototype.hasOwnProperty.call(returnedData, 'customer') ? returnedData.customer : {}
        this.table.loan = Object.prototype.hasOwnProperty.call(returnedData, 'loan') ? returnedData.loan : {}
        this.table.paginationDetails.page = page
        this.table.paginationDetails.rowsPerPage = rowsPerPage
        this.table.paginationDetails.sortBy = sortBy
        this.table.paginationDetails.descending = descending
      }else{
        this.table.data = Object.prototype.hasOwnProperty.call(returnedData, 'data') ? returnedData.data : []
        this.table.pagination.rowsNumber = Object.prototype.hasOwnProperty.call(returnedData, 'meta') ? returnedData.meta.total : 0
        this.table.pagination.page = page
        this.table.pagination.rowsPerPage = rowsPerPage
        this.table.pagination.sortBy = sortBy
        this.table.pagination.descending = descending
      }
      // clear out existing data and add new


      // ...and turn of loading indicator
      this.table.loading = false
      return true
    },

    async submit(url, params) {

      try {
        const response = await api.post(url, params)
        if(Object.prototype.hasOwnProperty.call(response, 'data')) {
          return response.data
        }else{
          this.setError(response)
        }

      } catch (e) {
        this.setError(e)
      }
    },

    addLoan: async function (path) {
      this.table.loading = true
      const params = {
        balance: this.form.balance
      };
      const url = `${path}/${this.form.id}/addLoan`
      const response = await this.submit(url, params)

      if(response){
        this.dialog.give = false
        this.onReset()
        this.table.filter = String(Date.now())
        this.table.loading = false

        if(this.dialog.print){
          const id = Object.prototype.hasOwnProperty.call(response.data, 'id') ? response.data.id : 0
          this.router.push({name: 'admin.transaction.loan.print', params: {id: id}})
        }

      }else{
        this.table.loading = false
      }
    },

    async payLoan(path) {
      this.table.loading = true
      const params = {
        balance: this.form.balance
      };
      const url =  `${path}/${this.form.id}/payLoan`
      const response = await this.submit(url, params)

      if(response){
        this.dialog.take = false
        this.onReset()
        this.table.filter = String(Date.now())
        this.table.loading = false

        if(this.dialog.print){
          const id = Object.prototype.hasOwnProperty.call(response.data, 'id') ? response.data.id : 0
          this.router.push({name: 'admin.transaction.loan.print', params: {id: id}})
        }

      }else{
        this.table.loading = false
      }

    },
  }
})

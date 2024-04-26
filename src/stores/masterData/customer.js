import {defineStore} from 'pinia'
import {reactive} from "vue";
import {LocalStorage, Notify} from "quasar";
import {api} from "boot/axios";

export const useCustomersStore = defineStore('customers', {
  state: () => ({
    form: {
      id: '',
      name: '',
      phone: '',
      address: '',
      loan: '',
    },
    deleted: {
      dialog: false,
      customer_id: [],
      data: [],
    },
    table: {
      pagination: {
        sortBy: '',
        descending: false,
        page: 1,
        rowsPerPage: 10,
        rowsNumber: 0
      },
      from: 0,
      selected: [],
      filter: '',
      search: {
        name: '',
        type: '',
        phone: '',
        address: '',
        user: '',
      },
      loading: false,
      headers: reactive([
        {name: "no", label: "No", field: "id", sortable: false, align: 'left'},
        {name: "name", label: "Name", field: "name", sortable: true, align: 'left'},
        {name: "Phone", label: "Phone Number", field: "phone", sortable: true, align: 'left'},
        {name: "address", label: "Address", field: "address", sortable: true, align: 'left'},
        {name: "loan", label: "Pinjaman", field: "loan", sortable: true, align: 'left'},
        {name: "user", label: "Created By", field: 'created_by', sortable: false, align: 'left'},
        {name: "created_at", label: "Created At", field: "created_at", sortable: true, align: 'left'},
      ]),
      data: [],
    },
    errors: {},
  }),

  getters: {
    getSelected(state){
      return state.table.selected
    },
    getSearch(state){
      return state.table.search
    }
  },

  actions: {
    onReset(form = null) {
      if(form === null){
        for (let property in this.form) {
          this.form[property] = '';
        }
        this.deleted.customer_id = []
        this.deleted.data = []
        this.errors = {}
        this.table.selected = []
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
    async getCustomersDataFromApi(path, startRow, count, filter, sortBy, descending) {
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
      data.name = this.table.search.name ?? ''
      data.type = this.table.search.type ?? ''
      data.phone = this.table.search.phone ?? ''
      data.address = this.table.search.address ?? ''
      data.user = this.table.search.user ?? ''
      try {
        const params = new URLSearchParams(data);
        const response = await api.get(path, {params})
        return response.data
      } catch (e) {
        this.setError(e)
      }
    },
    async getCustomersData(path, props) {
      const {page, rowsPerPage, sortBy, descending} = props.pagination
      const filter = props.filter

      this.table.loading = true

      // emulate server
      // update rowsCount with appropriate value

      // get all rows if "All" (0) is selected
      const fetchCount = rowsPerPage === 0 ? this.table.pagination.rowsNumber : rowsPerPage

      // calculate starting row of data
      // fetch data from "server"
      const returnedData = await this.getCustomersDataFromApi(path, page, fetchCount, filter, sortBy, descending)

      // clear out existing data and add new
      this.table.data = returnedData.data
      this.table.roles = returnedData.roles

      // update only rowsNumber = total rows
      this.table.pagination.rowsNumber = returnedData.meta.total

      // don't forget to update local pagination object
      this.table.pagination.page = page
      this.table.pagination.rowsPerPage = rowsPerPage
      this.table.pagination.sortBy = sortBy
      this.table.pagination.descending = descending

      // ...and turn of loading indicator
      this.table.loading = false
      return true
    },

    async submitForm(path) {
      this.table.loading = true
      const params = this.form;
      if (!this.form.id) {
        delete params.id
      }
      const url = params.id ? `${path}/${params.id}` : path
      await api({
        method: this.form.id ? 'patch' : 'post',
        url: url,
        data: params
      }).then(() => {
        this.table.selected = []
        Notify.create({
          position: "top",
          type: 'positive',
          message: params.hasOwnProperty('id') ? 'Data customer berhasil diubah' : 'Data customer berhasil disimpan'
        })
        this.table.filter = String(Date.now())
      }).catch(e => {
        this.setError(e);
      }).finally(() => this.table.loading = false);
    },

    async submitDelete(path = '/') {
      this.table.loading = true
      const params = this.deleted
      await api.delete(path + "/" + this.deleted.customer_id[0], {params})
        .then(() => {
          Notify.create({
            position: "top",
            type: 'positive',
            message: this.deleted.customer_id.length > 1 ? `${this.deleted.customer_id.length} customers delete` : `${this.deleted.customer_id.length} customer delete`
          })

          this.table.filter = String(Date.now())
          this.table.selected = []
          this.onReset()
        }).catch(e => {
          this.table.selected = []
          this.setError(e);
        }).finally(() => {
          this.table.loading = false
          this.deleted.dialog = false
        });
    },
  }
})

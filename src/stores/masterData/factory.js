import {defineStore} from 'pinia'
import {reactive} from "vue";
import {LocalStorage, Notify} from "quasar";
import {api} from "boot/axios";

export const useFactoriesStore = defineStore('factories', {
  state: () => ({
    form: {
      id: '',
      name: '',
      margin: '',
      ppn_tax: '',
      pph22_tax: '',
    },
    deleted: {
      dialog: false,
      factory_id: [],
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
        user: '',
      },
      loading: false,
      headers: reactive([
        {name: "no", label: "No", field: "id", sortable: false, align: 'left'},
        {name: "name", label: "Name", field: "name", sortable: true, align: 'left'},
        {name: "margin", label: "Margin", field: "margin", sortable: true, align: 'left'},
        {name: "ppn_tax", label: "PPN", field: "ppn_tax", sortable: true, align: 'left'},
        {name: "pph22_tax", label: "PPh 22", field: "pph22_tax", sortable: true, align: 'left'},
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
    }
  },

  actions: {
    onReset(form = null) {
      if(form === null){
        for (let property in this.form) {
          this.form[property] = '';
        }
        this.deleted.factory_id = []
        this.deleted.data = []
        this.errors = {}
        this.table.selected = []
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
    async getFactoriesDataFromApi(path, startRow, count, filter, sortBy, descending) {
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
      data.user = this.table.search.user ?? ''
      try {
        const params = new URLSearchParams(data);
        const response = await api.get(path, {params})
        return response.data
      } catch (e) {
        this.setError(e)
      }
    },
    async getFactoriesData(path, props) {
      const {page, rowsPerPage, sortBy, descending} = props.pagination
      const filter = props.filter

      this.table.loading = true

      // emulate server
      // update rowsCount with appropriate value

      // get all rows if "All" (0) is selected
      const fetchCount = rowsPerPage === 0 ? this.table.pagination.rowsNumber : rowsPerPage

      // calculate starting row of data
      // fetch data from "server"
      const returnedData = await this.getFactoriesDataFromApi(path, page, fetchCount, filter, sortBy, descending)

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
          message: Object.prototype.hasOwnProperty.call(params, 'id') ? 'Factory data change' : 'Factory data created'
        })
        this.table.filter = String(Date.now())
      }).catch(e => {
        this.setError(e);
      }).finally(() => this.table.loading = false);
    },

    async submitDelete(path = '/') {
      this.table.loading = true
      const params = this.deleted
      await api.delete(path + "/" + this.deleted.factory_id[0], {params})
        .then(() => {
          Notify.create({
            position: "top",
            type: 'positive',
            message: this.deleted.factory_id.length > 1 ? `${this.deleted.factory_id.length} factories delete` : `${this.deleted.factory_id.length} factory delete`
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

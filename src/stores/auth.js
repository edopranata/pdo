import { defineStore } from 'pinia';
import {LocalStorage, Notify} from "quasar";
import {usePageStore} from "stores/pages";
import {api} from 'boot/axios'

const usePage = usePageStore()
export const useAuthStore = defineStore('auth', {
  state: () => ({
    loading: false,
    token: null,
    user: null,
    permissions: [],
    errors: {}
  }),
  getters: {
    authenticated() {
      return !!this.token
    },
    role(state){
      return state.user ? state.user.roles[0].toLowerCase() : null
    }
  },

  actions: {
    can(permissionName) {
      let permissions = LocalStorage.has('permissions') ? LocalStorage.getItem('permissions') : []

      // console.log(permissions)
      if(permissionName.endsWith('*')){
        let contains = permissions.filter(filtered => filtered.startsWith(permissionName.replace('*', '')))
        return contains.length > 0
      }else if (permissionName.endsWith(']')){
        let first = permissionName.substring(0, permissionName.indexOf("["))
        let only = permissionName.substring(
          permissionName.indexOf("[") + 1,
          permissionName.lastIndexOf("]")
        );
        let access = []
        let split = only.replace(' ', '').split(',')
        for (let i in split){
          if(permissions.includes(first + split[i])){
            access.push(first + split[i])
          }
        }
        return access.length > 0
      }else{
        return permissions.includes(permissionName)
      }
    },
    isError(property) {
      return Object.prototype.hasOwnProperty.call(this.errors, property)
    },
    setErrors(e) {
      if (e.response)
        if (e.response.status === 422) {
          let error = e.response.data.errors;
          for (let property in error) {
            this.errors[property] = error[property][0];
          }
        } else {
          Notify.create({
            type: 'negative',
            message: e.response.statusText
          })
          this.errors = {};
        }

    },
    setAuthenticated(data, token) {
      if (data && token) {
        const permissions = data.routes
        // const menu = data.menu
        // const user = data.user

        // set token to pinia and local storage
        LocalStorage.set('token', token)
        this.token = token

        // set user to pinia and local storage
        // LocalStorage.set('user', user)
        this.user = data.user

        // set permissions to pinia and local storage
        // LocalStorage.set('permissions', permissions)
        this.permissions = permissions
        LocalStorage.set('permissions', permissions)

        // set menu to pinia and local storage
        // LocalStorage.set('menu', menu)
        usePage.menus = data.menu
        usePage.setting = data.setting
        usePage.default_setting = data.setting
      }

    },
    unsetAuthenticated() {
      // const menu = data.menu
      // const user = data.user

      // set token to pinia and local storage
      LocalStorage.remove('token')
      LocalStorage.remove('permissions')

      // set user to pinia and local storage
      // LocalStorage.set('user', user)
      this.user = null
      this.token = null
      // set permissions to pinia and local storage
      // LocalStorage.set('permissions', permissions)
      this.permissions = null

      // set menu to pinia and local storage
      // LocalStorage.set('menu', menu)
      usePage.menus = null
      usePage.setting = {}


    },
    async attempt(token) {
      try {
        let response = await api.post("/user");
        await this.setAuthenticated(response.data.data, token)
        return response;
      } catch (e) {
        await this.unsetAuthenticated()
        throw e
      }
    },

    async login(path, data) {
      this.loading = true
      try {
        let response = await api.post('/login', data)
        let token = response.data.token
        let type = response.data.type

        api.defaults.headers.common.Authorization = `${type} ${token}`

        await this.attempt(token);

        this.loading = false
      } catch (e) {
        this.loading = false
        this.setErrors(e)
      }
    },

    async logout() {
      try {
        let response = await api.post('/logout')
        if(response.data.status) {
          this.unsetAuthenticated()
          this.router.replace({name: 'home'})
        }
      } catch (e) {
        this.setErrors(e)
      }
    },

    async changePassword(data){
      try {
        await api.post('/change-password', data)
        Notify.create({
          position: 'top',
          type: 'positive',
          message: 'Password berhasil di ubah'
        })
        this.form.password = ''
        this.form.password_confirmation = ''
        usePage.rightDrawer = false
      } catch (e) {
        this.setErrors(e)
      }
    }

  }
});


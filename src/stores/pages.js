import {defineStore} from 'pinia';
import {LocalStorage, Notify} from "quasar";

export const usePageStore = defineStore('page', {
  state: () => ({
    miniState: false,
    leftDrawerOpen: false,
    rightDrawer: false,
    activeMenu: null,
    menus: [],
    print: false,
    setting: {},
    default_setting: {},
    currencyFormat: {
      prefix: 'Rp ',
      suffix: '',
      reverseFill: false,
      min: undefined,
      max: undefined,
    },
    percentFormat: {
      prefix: '',
      suffix: '%',
      reverseFill: false,
      min: undefined,
      max: undefined,
    },
    unitFormat: {
      prefix: '',
      suffix: ' kg',
      reverseFill: false,
      min: undefined,
      max: undefined,
    },
    errors: {},
  }),

  getters: {
    getPrintStatus(state){
      return state.print
    }
  },

  actions: {
    setActive(routeName) {
      LocalStorage.set('active', routeName)
      this.activeMenu = routeName
    },
    async toggleLeftDrawer () {
      this.leftDrawerOpen = !this.leftDrawerOpen

    },

    async toggleMiniState () {
      this.miniState = !this.miniState

    },
    async drawerClick (e) {
      if (this.miniState) {
        this.miniState = false

        // notice we have registered an event with capture flag;
        // we need to stop further propagation as this click is
        // intended for switching drawer to "normal" mode only
        e.stopPropagation()
      }
    },

    toggleRightDrawer() {
      this.rightDrawer = !this.rightDrawer
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

  }
});

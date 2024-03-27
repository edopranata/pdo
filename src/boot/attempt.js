import {boot} from 'quasar/wrappers'
import {useAuthStore} from "stores/auth";
import {LocalStorage} from "quasar";
import {api} from "boot/axios";

export default boot(async ({router}) => {
  const auth = useAuthStore()
  const token = LocalStorage.getItem('token')
  api.defaults.headers.common.Authorization = `Bearer ${token}`
  await auth.attempt(token).then(() => {
    router.push('/admin')
  }).catch( () => {
    router.push('/')
  })
})

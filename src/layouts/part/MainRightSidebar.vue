<script setup>
import {useAuthStore} from "stores/auth";
import {usePageStore} from "stores/pages";
import {reactive} from "vue";
import {storeToRefs} from "pinia";
import {useQuasar} from "quasar";
import {api} from "boot/axios";
import { saveAs } from 'file-saver';

const $q = useQuasar()
const page = usePageStore()
const auth = useAuthStore()
const {user, errors: authErrors} = storeToRefs(useAuthStore())
const {errors} = storeToRefs(usePageStore())
const form = reactive({
  password: '',
  password_confirmation: '',
})

const logout = async () => {
  $q.dialog({
    title: 'Keluar aplikasi',
    message: 'Anda yakin akan keluar dari aplikasi',
    cancel: true,
    persistent: true
  }).onOk( async () => {
    page.rightDrawer = false
    await auth.logout()
  })
}

const changePassword = async () => {
  $q.dialog({
    title: 'Ganti password',
    message: 'Anda yakin akan mengganti password?',
    cancel: true,
    persistent: true
  }).onOk( async () => {
    await auth.changePassword(form)
  })
}

const saveSetting = async () => {
  $q.dialog({
    title: 'Simpan pengaturan',
    message: 'Anda yakin akan merubah pengaturan default?',
    cancel: true,
    persistent: true
  }).onOk( async () => {
    const fileName = 'excel.xlsx'
    await api.post('/admin/test', {
      file_name: fileName
    }, {
      responseType: 'blob'
    }).then((response) => {
      saveAs(response.data, fileName);
    });
  })
}

</script>

<template>
  <q-list bordered padding>
    <q-item-label header>User Info</q-item-label>
    <q-item>
      <q-item-section avatar>
        <q-avatar><q-icon name="person" size="lg"/>
        </q-avatar>
      </q-item-section>

      <q-item-section>
        <q-item-label>{{ user?.name }}</q-item-label>
        <q-item-label caption>{{ user?.username }}</q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-btn flat round icon="logout" @click="logout" />
      </q-item-section>
    </q-item>

    <q-separator spaced/>
    <q-item-label header>Change Password</q-item-label>

    <q-item>
      <q-item-section>
        <q-input type="password" standout v-model="form.password"  label="New Password" :error="authErrors.hasOwnProperty('password')"
                 :error-message="authErrors.password"/>
      </q-item-section>
    </q-item>

    <q-item>
      <q-item-section>
        <q-input type="password" standout v-model="form.password_confirmation"  label="Confirmation Password" />
      </q-item-section>
    </q-item>

    <q-item>
      <q-item-section>
        <q-btn color="primary" glossy label="Change Password" @click="changePassword" />
      </q-item-section>
    </q-item>

  </q-list>
</template>

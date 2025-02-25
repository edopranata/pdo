<script setup>
import {reactive} from 'vue'
import {useAuthStore} from 'stores/auth'
import {useRoute, useRouter} from 'vue-router'
import {storeToRefs} from "pinia";

const appName = import.meta.env.VITE_APP_NAME
const appLogo = import.meta.env.VITE_APP_LOGO

const router = useRouter()
const auth = useAuthStore()
const {errors, loading} = storeToRefs(useAuthStore())
const {isError} = useAuthStore()
const {path, query} = useRoute()
const input = reactive({
  username: null,
  password: null,
  accept: false,
})
const page_config = reactive({
  visibility: false,
  visibilityIcon: 'visibility',
  passwordFieldType: 'password',
})

const unsetError = (property) => {
  delete auth.errors[property]
}
const onSubmit = async () => {
  const toPath = query.to || '/admin'
  await auth.login(path, input).then(() => {
    router.replace({path: toPath})
  })
}
const switchVisibility = () => {
  page_config.visibility = !page_config.visibility
  page_config.passwordFieldType = page_config.visibility ? 'text' : 'password'
  page_config.visibilityIcon = page_config.visibility ? 'visibility_off' : 'visibility'
}
</script>

<template>
  <q-page
    class="window-height window-width row justify-center items-center"
    style="background: linear-gradient(#8274c5, #5a4a9f)"
  >
    <div class="column q-pa-lg">
      <div class="row">
        <q-card square class="shadow-24" style="width: 400px; height: 540px">
          <q-card-section class="bg-deep-purple-7">
            <h4 class="text-h5 text-white q-my-md text-center">{{ appName }}</h4>
          </q-card-section>
          <q-card-section class="text-center">
            <q-img :src="appLogo" alt="logo" style="width: 160px; "/>
          </q-card-section>
          <q-card-section>
            <q-form class="q-px-sm">
              <q-input
                v-on:update:modelValue="unsetError('username')"
                ref="Username"
                square
                :error="isError('username')"
                :error-message="errors.username"
                :rules="[(val) => (val && val.length > 0) || 'Please type something']"
                clearable
                v-model="input.username"
                lazy-rules
                label="Username"
                v-on:keyup.enter="onSubmit"
                :loading="loading"
                :disabled="loading"
              >
                <template v-slot:prepend>
                  <q-icon name="person"/>
                </template>
              </q-input>
              <q-input
                v-on:update:modelValue="unsetError('password')"
                ref="password"
                square
                :error="isError('password')"
                :error-message="errors.password"
                clearable
                :rules="[
                  (val) => (val !== null && val !== '') || 'Please type your password',
                  (val) => val.length > 5 || 'Password must greater than 6 character',
                ]"
                v-model="input.password"
                :type="page_config.passwordFieldType"
                lazy-rules
                label="Password"
                v-on:keyup.enter="onSubmit"
                :loading="loading"
                :disabled="loading"
              >
                <template v-slot:prepend>
                  <q-icon name="lock"/>
                </template>
                <template v-slot:append>
                  <q-icon
                    :name="page_config.visibilityIcon"
                    @click="switchVisibility"
                    class="cursor-pointer"
                  />
                </template>
              </q-input>
            </q-form>
          </q-card-section>

          <q-card-actions class="q-px-lg">
            <q-btn
              :loading="loading"
              :disabled="loading"
              unelevated
              size="lg"
              color="secondary"
              @click="onSubmit"
              class="full-width text-white"
              label="Login"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<style scoped></style>

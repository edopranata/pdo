<script setup>
import {reactive} from "vue";
import {useAuthStore} from "stores/auth";
import {useRoute, useRouter} from "vue-router";

const router = useRouter()
const auth = useAuthStore()
const {isError} = useAuthStore()
const {path, query} = useRoute()
const input = reactive({
  username: null,
  password: null,
  accept: false,
})
let errors = {}
const onSubmit = async () => {
  const toPath = query.to || '/admin'
  await auth.login(path, input).then(() => {
    router.replace({path: toPath})
  })
}
const onReset = () => {
  errors = {}
}

</script>

<template>
  <q-page class="flex flex-center" :padding="$q.screen.lt.sm">
    <q-card style="width: 420px">
      <q-img alt="Img" src="/undraw/mobile_login.svg"/>
      <q-form
        class="q-gutter-md"
        @reset="onReset"
        @submit.prevent="onSubmit"
      >
        <q-card-section>
          <q-input
            v-model="input.username"
            :error="isError('username')"
            :error-message="auth.errors.username"
            :rules="[ val => val && val.length > 0 || 'Please type something']"
            filled
            hint="Username"
            label="Username *"
            lazy-rules
          />

          <q-input
            v-model="input.password"
            :rules="[
          val => val !== null && val !== '' || 'Please type your password',
          val => val.length > 5 || 'Password must greater than 6 character'
        ]"
            filled
            label="Password *"
            lazy-rules
            type="password"
          />
          <q-btn color="primary" class="tw-w-full" label="Login" type="submit"/>

        </q-card-section>

      </q-form>
    </q-card>
  </q-page>
</template>

<style scoped>

</style>

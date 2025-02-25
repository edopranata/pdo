<script setup>
import { reactive } from 'vue'
import { useAuthStore } from 'stores/auth'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const auth = useAuthStore()
const { isError } = useAuthStore()
const { path, query } = useRoute()
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

const onSubmit = async () => {
  const toPath = query.to || '/admin'
  await auth.login(path, input).then(() => {
    router.replace({ path: toPath })
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
            <h4 class="text-h5 text-white q-my-md">Palm Delivery Order</h4>
          </q-card-section>
          <q-card-section>
            <q-form class="q-px-sm q-pt-xl">
              <q-input
                ref="Username"
                square
                :error="isError('username')"
                :error-message="auth.errors.username"
                :rules="[(val) => (val && val.length > 0) || 'Please type something']"
                clearable
                v-model="input.username"
                lazy-rules
                label="Username"
                v-on:keyup.enter="onSubmit"
              >
                <template v-slot:prepend>
                  <q-icon name="person" />
                </template>
              </q-input>
              <q-input
                ref="password"
                square
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
              >
                <template v-slot:prepend>
                  <q-icon name="lock" />
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

  <!--  <q-page class="flex flex-center" :padding="$q.screen.lt.sm">-->
  <!--    <q-card style="width: 420px">-->
  <!--      <q-img alt="Img" src="/undraw/mobile_login.svg"/>-->
  <!--      <q-form-->
  <!--        class="q-gutter-md"-->
  <!--        @submit.prevent="onSubmit"-->
  <!--      >-->
  <!--        <q-card-section>-->
  <!--          <q-input-->
  <!--            v-model="input.username"-->
  <!--            :error="isError('username')"-->
  <!--            :error-message="auth.errors.username"-->
  <!--            :rules="[ val => val && val.length > 0 || 'Please type something']"-->
  <!--            filled-->
  <!--            hint="Username"-->
  <!--            label="Username *"-->
  <!--            lazy-rules-->
  <!--          />-->

  <!--          <q-input-->
  <!--            v-model="input.password"-->
  <!--            :rules="[-->
  <!--          val => val !== null && val !== '' || 'Please type your password',-->
  <!--          val => val.length > 5 || 'Password must greater than 6 character'-->
  <!--        ]"-->
  <!--            filled-->
  <!--            label="Password *"-->
  <!--            lazy-rules-->
  <!--            type="password"-->
  <!--          />-->
  <!--          <q-btn color="primary" class="tw-w-full" label="Login" type="submit"/>-->

  <!--        </q-card-section>-->

  <!--      </q-form>-->
  <!--    </q-card>-->
  <!--  </q-page>-->
</template>

<style scoped></style>

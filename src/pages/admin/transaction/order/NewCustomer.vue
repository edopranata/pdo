<script setup>
import {useCustomersStore} from "stores/masterData/customer";
import {useOrderStore} from "stores/transaction/order";
import {useAuthStore} from "stores/auth";
import {ref} from 'vue'
import {useRoute, useRouter} from "vue-router";
import {storeToRefs} from "pinia";
import {useQuasar} from "quasar";

const order = useOrderStore()
const router = useRouter()
const {dialog} = useOrderStore()
const $q = useQuasar()
const {table, form} = useCustomersStore()
const customers = useCustomersStore()
const {can} = useAuthStore()
const {errors} = storeToRefs(useCustomersStore())
const {path} = useRoute()

const customerForm = ref()
const onSubmit = async () => {
  const routes = router.getRoutes().filter(r => r.name === 'admin.masterData.customer.index')

  if (routes.length === 1) {
    try {
      await customers.submitForm(routes[0].path)
      order.onReset()
      await order.getCustomerAndFactoryData(path)
      dialog.create = false
      customers.onReset()
    }catch(err) {
      console.log(err)
    }
  }
}

</script>

<template>
  <q-dialog v-model="dialog.create" persistent transition-hide="scale" transition-show="scale">
    <q-card style="width: 600px;">
      <q-card-section>
        <q-toolbar class="text-primary">
          <q-toolbar-title>
            Create new customer
          </q-toolbar-title>
        </q-toolbar>
      </q-card-section>

      <q-form
        ref="customerForm"
        class="q-gutter-md"
        @submit="onSubmit"
        @reset="customers.onReset()"
      >
        <q-card-section v-if="can('admin.masterData.customer.[createCustomer,updateCustomer]')">

          <q-input
            v-model="form.name"
            :bg-color="!!form.id ? 'yellow-2' : ''"
            :dense="$q.screen.lt.md"
            :error="errors.hasOwnProperty('name')"
            :error-message="errors.name"
            :rules="[ val => val && val.length > 4 || 'Customer name must be greater than 3 characters.']"
            filled
            label="Nama Lengkap"
          />
          <q-input
            v-model="form.phone"
            :bg-color="!!form.id ? 'yellow-2' : ''"
            :dense="$q.screen.lt.md"
            :error="errors.hasOwnProperty('phone')"
            :error-message="errors.phone"
            :rules="[ val => val && val.length <= 20 || 'Phone number must be lower than 20 characters.']"
            filled
            label="No Telp"
            lazy-rules
          />
          <q-input
            v-model="form.address"
            :bg-color="!!form.id ? 'yellow-2' : ''"
            :dense="$q.screen.lt.md"
            filled
            label="Address"
            type="textarea"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn :disable="table.loading" v-close-popup color="warning" flat label="Batalkan" type="reset"/>
          <q-space/>
          <q-btn :disable="table.loading" color="primary" flat label="Simpan" type="submit"/>
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>


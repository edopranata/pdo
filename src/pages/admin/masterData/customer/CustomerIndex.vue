<script setup>
import {useCustomersStore} from "stores/masterData/customer";
import {useAuthStore} from "stores/auth";
import {usePageStore} from "stores/pages";
import {onBeforeMount, onMounted, ref, watch} from 'vue'
import {useRoute} from "vue-router";
import {storeToRefs} from "pinia";
import {useQuasar} from "quasar";
import DialogDelete from "pages/admin/masterData/customer/dialog/DialogDelete.vue";

const $q = useQuasar()
const page = usePageStore()
const {table, form, deleted} = useCustomersStore()
const customers = useCustomersStore()
const {can} = useAuthStore()
const {getSelected: selected, errors, getSearch} = storeToRefs(useCustomersStore())
const {path} = useRoute()

const tableRef = ref()
const customerForm = ref()

async function onRequest(props) {
  await customers.getCustomersData(path, props)
}

watch(getSearch, () => {
  table.filter = String(Date.now())
}, {
  deep: true,
  immediate: true
})

watch(selected, (selected_item) => {
  if (selected_item.length > 0) {
    deleted.customer_id = selected_item.map(i => i['id'])
    deleted.data = selected_item.map(i => `${i['name']}`)
  } else {
    deleted.customer_id = []
    deleted.data = []
  }

}, {
  deep: true,
})
onBeforeMount(() => {
})
onMounted(() => {
  // get initial data from server (1st page)
  tableRef.value.requestServerInteraction()
  onReset()

})

const onReset = () => {
  customers.onReset()
  setTimeout(() => {
    customerForm.value.resetValidation()
  }, 600)
}

const onSubmit = () => {
  customerForm.value.validate().then(success => {
    if (success) {
      $q.dialog({
        title: 'Simpan data',
        message: 'Apakah data yang di input sudah benar?',
        cancel: true,
        persistent: true
      }).onOk(async () => {
        await customers.submitForm(path)
        onReset()
      })
    }
  })
}

const onDelete = () => {
  deleted.dialog = true
}

const onEdit = () => {
  $q.dialog({
    title: 'Ubah Data',
    message: '<div class="text-warning">Apakah anda yakin akan mengubah data ini?</div>',
    html: true,

    cancel: true,
    persistent: true
  }).onOk(() => {
    if (table.selected.length === 1) {
      form.id = table.selected[0].id
      form.name = table.selected[0].name
      form.phone = table.selected[0].phone
      form.address = table.selected[0].address
      form.loan = null
    }
  })
}
</script>

<template>
  <q-page padding>
    <DialogDelete/>
    <q-card>
      <q-form
        ref="customerForm"
        class="q-gutter-md"
      >
        <q-card-section v-if="can('admin.masterData.customer.[createCustomer,updateCustomer]')">
          <div class="tw:grid tw:grid-cols-1 tw:md:grid-cols-2">
            <div>
              <q-toolbar class="text-primary">
                <q-toolbar-title>
                  Customers Data
                </q-toolbar-title>
              </q-toolbar>
              <div class="tw:flex tw:flex-col">
                <q-input
                  v-model="form.name"
                  :bg-color="!!form.id ? 'yellow-2' : ''"
                  :dense="$q.screen.lt.md"
                  :disable="table.loading"
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
                  :disable="table.loading"
                  :error="errors.hasOwnProperty('phone')"
                  :error-message="errors.phone"
                  :rules="[ val => val && val.length <= 20 || 'Phone number must be lower than 20 characters.']"
                  filled
                  label="No Telp"
                  lazy-rules
                />
                <q-number
                  v-if="can('admin.masterData.customer.firstLoan') && !form.id"
                  v-model="form.loan"
                  :bg-color="!!form.id ? 'yellow-2' : ''"
                  :dense="$q.screen.lt.md"
                  :disable="table.loading"
                  :options="page.currencyFormat"
                  filled
                  hint=""
                  label="First Loan"
                />
                <q-input
                  v-model="form.address"
                  :bg-color="!!form.id ? 'yellow-2' : ''"
                  :dense="$q.screen.lt.md"
                  :disable="table.loading"
                  filled
                  label="Address"
                  type="textarea"
                />
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions class="q-pa-md ">
          <q-btn
            v-if="can('admin.masterData.customer.[createCustomer,updateCustomer,deleteCustomer]')"
            :dense="$q.screen.lt.md"
            :disable="table.loading"
            :label="!$q.screen.lt.md ? 'Batalkan' : ''"
            :loading="table.loading"
            :round="$q.screen.lt.md"
            color="info"
            glossy
            @click="onReset"/>
          <q-btn
            v-if="can('admin.masterData.customer.createCustomer')"
            :dense="$q.screen.lt.md"
            :disable="table.loading"
            :label="!$q.screen.lt.md ? form.id ? 'Update' : 'Save' : ''"
            :loading="table.loading"
            :round="$q.screen.lt.md"
            color="secondary"
            glossy
            icon="save"
            @click.prevent="onSubmit"
          >
            <q-tooltip>
              Update or Save
            </q-tooltip>
          </q-btn>
          <q-btn
            v-if="can('admin.masterData.customer.deleteCustomer')"
            :dense="$q.screen.lt.md"
            :disable="!selected.length > 0"
            :label="!$q.screen.lt.md ? 'Delete' : ''"
            :loading="table.loading"
            :round="$q.screen.lt.md"
            color="negative"
            glossy
            icon="delete"
            @click.prevent="onDelete()"
          >
            <q-tooltip>
              Delete
            </q-tooltip>
          </q-btn>
          <q-btn
            v-if="can('admin.masterData.customer.updateCustomer')"
            :dense="$q.screen.lt.md"
            :disable="selected.length !== 1"
            :label="!$q.screen.lt.md ? 'Edit Data' : ''"
            :loading="table.loading"
            :round="$q.screen.lt.md"
            color="warning"
            glossy
            icon="edit"
            @click.prevent="onEdit"
          >
            <q-tooltip v-if="selected.length !== 1">
              Edit Data
            </q-tooltip>
          </q-btn>
        </q-card-actions>
      </q-form>
      <q-table
        ref="tableRef"
        v-model:pagination="table.pagination"
        v-model:selected="table.selected"
        :columns="table.headers ?? []"
        :dense="$q.screen.lt.md"
        :filter="table.filter"
        :loading="table.loading"
        :rows="table.data ?? []"
        :selection="can('admin.masterData.customer.[deleteCustomer]') ? 'multiple' :'single'"
        binary-state-sort
        bordered
        row-key="id"
        @request="onRequest"
      >
        <template v-slot:top-row>
          <q-tr>
            <q-th></q-th>
            <q-th class="text-left">#</q-th>
            <q-th>
              <q-input v-model="table.search.name" :loading="table.loading" clearable debounce="500" dense
                       label="Search Name"/>
            </q-th>
            <q-th>
              <q-input v-model="table.search.phone" :loading="table.loading" clearable debounce="500" dense
                       label="Search Phone"/>
            </q-th>
            <q-th>
              <q-input v-model="table.search.address" :loading="table.loading" clearable debounce="500" dense
                       label="Search Address"/>
            </q-th>
            <q-th>
            </q-th>
            <q-th>
              <q-input v-model="table.search.user" :loading="table.loading" clearable debounce="500" dense
                       label="Search Create By"/>
            </q-th>
            <q-th></q-th>
          </q-tr>
        </template>

        <template v-slot:body-cell-no="props">
          <q-td :props="props">
            {{ props.rowIndex + 1 }}
          </q-td>
        </template>
        <template v-slot:body-cell-loan="props">
          <q-td :props="props">
            {{
              new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR'
              }).format(props.value ?? 0)
            }}
          </q-td>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

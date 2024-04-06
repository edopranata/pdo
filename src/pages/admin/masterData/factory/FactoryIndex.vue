<script setup>
import {useFactoriesStore} from "stores/masterData/factory";
import {useAuthStore} from "stores/auth";
import {usePageStore} from "stores/pages";
import {onBeforeMount, onMounted, ref, watch} from 'vue'
import {useRoute} from "vue-router";
import {storeToRefs} from "pinia";
import {useQuasar} from "quasar";
import DialogDelete from "pages/admin/masterData/factory/dialog/DialogDelete.vue";
import QNumber from "components/Input/QNumber.vue";

const $q = useQuasar()
const {table, dialog, form, deleted} = useFactoriesStore()
const factory = useFactoriesStore()
const page = usePageStore()
const {can} = useAuthStore()
const {getSelected: selected, errors} = storeToRefs(useFactoriesStore())
const {path} = useRoute()

const tableRef = ref()
const factoryForm = ref()

async function onRequest(props) {
  await factory.getFactoriesData(path, props)
}

watch(table.search, () => {
  table.filter = String(Date.now())
}, {
  deep: true,
  immediate: true
})

watch(selected, (selected_item) => {
  if (selected_item.length > 0) {
    deleted.factory_id = selected_item.map(i => i['id'])
    deleted.data = selected_item.map(i => `${i['name']}`)
  } else {
    deleted.factory_id = []
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
  factory.onReset()
  setTimeout(() => {
    factoryForm.value.resetValidation()
  }, 600)
}

const onSubmit = () => {
  factoryForm.value.validate().then(success => {
    if (success) {
      $q.dialog({
        title: 'Simpan data',
        message: 'Apakah data yang di input sudah benar?',
        cancel: true,
        persistent: true
      }).onOk(async () => {
        await factory.submitForm(path)
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
    console.log(selected.length)

    if (table.selected.length === 1) {
      for (let property in form) {
        form[property] = table.selected[0][property];
      }
    }
  })
}
</script>

<template>
  <q-page padding>
    <DialogDelete/>
    <q-card>
      <q-form
        ref="factoryForm"
        class="q-gutter-md"
      >
        <q-card-section>
          <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2">
            <div>
              <q-toolbar class="text-primary">
                <q-toolbar-title>
                  Factories Data
                </q-toolbar-title>
              </q-toolbar>
              <q-input
                v-model="form.name"
                :bg-color="!!form.id ? 'yellow-2' : ''"
                :dense="$q.screen.lt.md"
                :error="errors.hasOwnProperty('name')"
                :error-message="errors.name"
                :rules="[ val => val && val.length > 4 || 'Factory name must be greater than 3 characters.']"
                filled
                label="Nama Pabrik"
              />
              <div class="tw-flex tw-space-x-4">
                <q-number
                  v-model="form.price"
                  :bg-color="!!form.id ? 'yellow-2' : ''"
                  :dense="$q.screen.lt.md"
                  :error="errors.hasOwnProperty('price')"
                  :error-message="errors.price"
                  :options="page.currencyFormat"

                  class="tw-w-full"
                  filled
                  label="Price (Rp)"
                />
                <q-number
                  v-model="form.margin"
                  :bg-color="!!form.id ? 'yellow-2' : ''"
                  :dense="$q.screen.lt.md"
                  :error="errors.hasOwnProperty('margin')"
                  :error-message="errors.margin"
                  :options="page.currencyFormat"

                  class="tw-w-full"
                  filled
                  label="Margin (Rp)"
                />
              </div>

              <div class="tw-flex tw-space-x-4">
                <q-number
                  v-model="form.ppn_tax"
                  :bg-color="!!form.id ? 'yellow-2' : ''"
                  :dense="$q.screen.lt.md"
                  :error="errors.hasOwnProperty('ppn_tax')"
                  :error-message="errors.ppn_tax"
                  :options="page.percentFormat"

                  class="tw-w-full"
                  filled
                  label="PPN (%)"
                />
                <q-number
                  v-model="form.pph22_tax"
                  :bg-color="!!form.id ? 'yellow-2' : ''"
                  :dense="$q.screen.lt.md"
                  :error="errors.hasOwnProperty('pph22_tax')"
                  :error-message="errors.pph22_tax"
                  :options="page.percentFormat"

                  class="tw-w-full"
                  filled
                  label="PPH 22 (%)"
                />
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions class="q-pa-md ">
          <q-btn
            :dense="$q.screen.lt.md"
            :label="!$q.screen.lt.md ? 'Batalkan' : ''"
            :loading="table.loading"
            :round="$q.screen.lt.md"
            color="info"
            glossy
            @click="onReset"/>
          <q-btn
            v-if="can('admin.masterData.factory.createFactory')"
            :dense="$q.screen.lt.md"
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
            v-if="can('admin.masterData.factory.deleteFactory')"
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
            v-if="can('admin.masterData.factory.updateFactory')"
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
        :selection="can('admin.masterData.factory.[deleteFactory]') ? 'multiple' :'single'"
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
            <q-th></q-th>
            <q-th></q-th>
            <q-th></q-th>
            <q-th></q-th>
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

      </q-table>
    </q-card>
  </q-page>
</template>

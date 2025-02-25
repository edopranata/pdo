<script setup>
import {useCashStore} from "stores/management/cash";
import {useAuthStore} from "stores/auth";
import {computed, onMounted, ref, watch} from 'vue'
import {useRoute} from "vue-router";

import {storeToRefs} from "pinia";
import {useQuasar} from "quasar";
import DialogGiveCash from "pages/admin/management/cash/dialog/DialogGiveCash.vue";
import DialogTakeCash from "pages/admin/management/cash/dialog/DialogTakeCash.vue";

const $q = useQuasar()
const {table, dialog, form} = useCashStore()
const cash = useCashStore()
const {can} = useAuthStore()
const {getSearch} = storeToRefs(useCashStore())
const {path} = useRoute()

const tableRef = ref()

watch(getSearch, () => {
  table.filter = String(Date.now())
})

watch(form, (newForm) => {
  if(newForm.balance > 0){
    if(dialog.take){
      form.ending = parseFloat(newForm.current) - parseFloat(newForm.balance)
    }

    if(dialog.give) {
      form.ending = parseFloat(newForm.current) + parseFloat(newForm.balance)
    }
  }
}, {deep: true})

async function onRequest(props) {
  await cash.getCashData(path, props)
}

const cardContainerClass = computed(() => {
  return $q.screen.gt.xs
    ? 'grid-masonry grid-masonry--' + ($q.screen.gt.sm ? '3' : '2')
    : null
})
const rowsPerPageOptions = computed(() => {
  return $q.screen.gt.xs
    ? $q.screen.gt.sm ? [3, 6, 9] : [3, 6]
    : [3]
})
onMounted(() => {
  tableRef.value.requestServerInteraction()
})

const giveCash = (index) => {
  setForm(index)
  dialog.give = true
}

const takeCash = (index) => {
  setForm(index)
  dialog.take = true
}

const setForm = (id) => {
  const index = table.data.map(e => e.id).indexOf(id);
  const data = table.data[index]
  for (let property in cash.form) {
    cash.form[property] = Object.prototype.hasOwnProperty.call(data, property) ? data[property] : '';
    if(property === 'current'){
      cash.form.current = data.cash?.balance ?? 0
    }
  }
}

</script>

<template>
  <q-page padding>
    <DialogGiveCash />
    <DialogTakeCash />
    <q-card>
      <q-table
        ref="tableRef"
        v-model:pagination="table.pagination"
        v-model:selected="table.selected"
        :card-container-class="cardContainerClass" :columns="table.headers ?? []"
        :dense="$q.screen.lt.md"
        :filter="table.filter"
        :loading="table.loading"
        :rows="table.data ?? []"
        :rows-per-page-options="rowsPerPageOptions"
        binary-state-sort
        bordered
        flat
        grid
        hide-header
        row-key="id"
        @request="onRequest"
      >

        <template v-slot:top-right>
          <q-input
            debounce="300"
            v-model="table.search"
            placeholder="Search">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>
        <template v-slot:item="props">
          <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
            <q-card bordered flat>
              <q-card-section>
                <q-list>
                  <q-item-label header>{{ props.row.name }}</q-item-label>
                  <q-item v-ripple class="q-mb-sm" :to="can('admin.management.cash.cashDetails') ? {name:'admin.management.cash.cashDetails', params: {id:props.row.id}} : {name: 'admin.management.cash.index'}">
                    <q-item-section avatar>
                      <q-avatar>
                        <q-img :src="props.row.photo"/>
                      </q-avatar>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ props.row.username }}</q-item-label>
                      <q-item-label caption lines="1">{{ props.row.email }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
              <q-separator/>
              <q-card-section>
                <q-field
                  :dense="$q.screen.lt.md"
                  bg-color="blue-grey"
                  color="blue-grey-2"
                  filled
                  hint=""
                  label="Cash (Rp)"
                  stack-label
                  tabindex="-1">
                  <template v-slot:control>
                    <div class="self-center full-width no-outline" tabindex="-1">
                      {{
                        Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0
                        }).format(props.row.cash?.balance ?? 0)
                      }}
                    </div>
                  </template>
                </q-field>
              </q-card-section>
              <q-card-actions class="q-px-md" v-if="can('admin.management.cash.[giveCash,takeCash]')">
                <q-btn
                  v-if="can('admin.management.cash.giveCash')"
                  :dense="$q.screen.lt.md"
                  label="Tambah kas"
                  :loading="table.loading"
                  color="primary"
                  glossy
                  @click="giveCash(props.row.id)"
                />
                <q-space/>
                <q-btn
                  v-if="can('admin.management.cash.takeCash')"
                  :dense="$q.screen.lt.md"
                  label="Tarik Kas"
                  :loading="table.loading"
                  color="negative"
                  @click="takeCash(props.row.id)"
                  glossy
                />
              </q-card-actions>
            </q-card>
          </div>
        </template>

      </q-table>
    </q-card>
  </q-page>
</template>

<style lang="sass">
.grid-masonry
  flex-direction: column
  height: 700px

  &--2
    > div
      &:nth-child(2n + 1)
        order: 1

      &:nth-child(2n)
        order: 2

    &:before
      content: ''
      flex: 1 0 100% !important
      width: 0 !important
      order: 1

  &--3
    > div
      &:nth-child(3n + 1)
        order: 1

      &:nth-child(3n + 2)
        order: 2

      &:nth-child(3n)
        order: 3

    &:before,
    &:after
      content: ''
      flex: 1 0 100% !important
      width: 0 !important
      order: 2
</style>

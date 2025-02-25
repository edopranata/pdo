<script setup>
import {useCashStore} from "stores/management/cash";
import {onMounted, ref} from 'vue'
import {useRoute} from "vue-router";
import {useQuasar} from "quasar";

const $q = useQuasar()
const {table} = useCashStore()
const cash = useCashStore()
const {path} = useRoute()

const tableRef = ref()

async function onRequest(props) {
  await cash.getCashData(path, props)
}

onMounted(() => {
  onReset()
  // get initial data from server (1st page)
  tableRef.value.requestServerInteraction()

})

const onReset = () => {
  cash.onReset()
}


</script>

<template>
  <q-page padding>
    <q-card>
      <q-table
        ref="tableRef"
        v-model:pagination="table.pagination"
        :columns="table.details ?? []"
        :dense="$q.screen.lt.md"
        :grid="$q.screen.lt.md"
        :loading="table.loading"
        :rows="table.data ?? []"
        binary-state-sort
        bordered
        row-key="id"
        @request="onRequest"
      >
        <template v-slot:top>
          <div class="tw:w-full tw:flex tw:flex-col tw:justify-between tw:md:items-center tw:md:flex-row">
            <div>
              <q-list>
                <q-item-label header>{{ table.user?.name }}</q-item-label>
                <q-item v-ripple class="q-mb-sm">
                  <q-item-section avatar>
                    <q-avatar>
                      <q-img :src="table.user?.photo_url"/>
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ table.user?.username }}</q-item-label>
                    <q-item-label caption lines="1">{{ table.user?.email }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
            <div class="text-h4">
              {{ new Intl.NumberFormat("id-ID", {style: 'currency', currency: 'IDR'}).format(table.cash.hasOwnProperty('balance') ? table.cash.balance : 0) }}
            </div>
          </div>
        </template>

        <template v-slot:body-cell-no="props">
          <q-td :props="props">
            {{ props.rowIndex + 1 }}
          </q-td>
        </template>

        <template v-slot:body-cell-opening_balance="props">
          <q-td :props="props">
            {{ new Intl.NumberFormat('id-ID', {style: 'currency', currency: 'IDR'}).format(props.value ?? 0) }}
          </q-td>
        </template>
        <template v-slot:body-cell-balance_in="props">
          <q-td :props="props">
            {{ new Intl.NumberFormat('id-ID', {style: 'currency', currency: 'IDR'}).format(props.value ?? 0) }}
          </q-td>
        </template>

        <template v-slot:body-cell-balance_out="props">
          <q-td :props="props">
            {{ new Intl.NumberFormat('id-ID', {style: 'currency', currency: 'IDR'}).format(props.value ?? 0) }}
          </q-td>
        </template>

        <template v-slot:body-cell-ending_balance="props">
          <q-td :props="props">
            {{ new Intl.NumberFormat('id-ID', {style: 'currency', currency: 'IDR'}).format(props.value ?? 0) }}
          </q-td>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

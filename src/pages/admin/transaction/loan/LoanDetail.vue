<script setup>
import {useLoanStore} from "stores/transaction/loan";
import {onMounted, ref} from 'vue'
import {useRoute} from "vue-router";
import {useQuasar} from "quasar";

const $q = useQuasar()
const {table} = useLoanStore()
const loan = useLoanStore()
const {path} = useRoute()

const tableRef = ref()

async function onRequest(props) {
  await loan.getLoanData(path, props)
}

onMounted(() => {
  onReset()
  // get initial data from server (1st page)
  tableRef.value.requestServerInteraction()

})

const onReset = () => {
  loan.onReset()
}


</script>

<template>
  <q-page padding>
    <q-card>
      <q-table
        ref="tableRef"
        v-model:pagination="table.paginationDetails"
        :columns="table.details ?? []"
        :rows-per-page-options="[5,10,20,30,50,80,100,0]"
        :dense="$q.screen.lt.md"
        :filter="table.filter"
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
                <q-item v-ripple class="q-mb-sm">
                  <q-item-section avatar>
                    <q-avatar>
                      <q-img :src="table.customer?.initial"/>
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ table.customer?.name }}</q-item-label>
                    <q-item-label caption lines="1">{{ table.customer?.address }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
            <div class="text-h4">
              {{ new Intl.NumberFormat("id-ID", {style: 'currency', currency: 'IDR'}).format(table.loan.hasOwnProperty('balance') ? table.loan.balance : 0) }}
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

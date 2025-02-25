<script setup>
import {useInvoiceStore} from "stores/transaction/invoice";
import {useAuthStore} from "stores/auth";
import {useRoute} from "vue-router";
import {onBeforeMount, onMounted, ref} from "vue";
import {useQuasar} from "quasar";

const {path} = useRoute()
const {can} = useAuthStore()
const {table} = useInvoiceStore()
const deliveries = useInvoiceStore()
const tableRef = ref()
const $q = useQuasar()

const onRequest = async (props) => {
  await deliveries.getCustomerOrder(path, props)
}

onBeforeMount(() => {
  table.filter = ''
  table.search = ''
  table.data = []
})

onMounted(async () => {
  deliveries.onReset()
  tableRef.value.requestServerInteraction()
})

</script>
<template>
  <q-page class="tw:space-y-4" padding>
    <q-card>
      <q-table
        ref="tableRef"
        v-model:pagination="table.pagination"
        :columns="table.headers ?? []"
        :dense="$q.screen.lt.md"
        :filter="table.filter"
        :loading="table.loading"
        :rows="table.data ?? []"
        binary-state-sort
        bordered
        row-key="id"
        @request="onRequest"
      >

        <template v-slot:body-selection="scope">
          <q-checkbox v-model="scope.selected"/>
        </template>

        <template v-slot:body-cell-no="props">
          <q-td :props="props">
            {{ props.rowIndex + 1 }}
          </q-td>
        </template>

        <template v-slot:body-cell-action="props">
          <q-td :props="props">
            <q-btn
              :dense="$q.screen.lt.lg"
              :disable="!can('admin.transaction.invoice.showInvoice')"
              :label="!$q.screen.lt.md ? 'Buat Invoice' : ''"
              :loading="table.loading"
              :round="$q.screen.lt.md"
              :to="{name: 'admin.transaction.invoice.showInvoice', params: {id: props.value}}"
              glossy
              icon="print"
              size="sm"
            >
              <q-tooltip>
                {{
                  can('admin.transaction.invoice.showInvoice') ? 'Create invoice' : 'User is not authorized to create invoice'
                }}
              </q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template v-slot:body-cell-loan="props">
          <q-td :props="props" class="text-right">
            {{
              Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
              }).format(props.value)
            }}
          </q-td>
        </template>

        <template v-slot:body-cell-count="props">
          <q-td :props="props">
            {{ `${props.row.orders?.count} DO` }}
          </q-td>
        </template>

        <template v-slot:body-cell-weight_total="props">
          <q-td :props="props">
            {{ Intl.NumberFormat('id-ID', {style: 'unit', unit: 'kilogram'}).format(props.row.orders?.weight_total) }}
          </q-td>
        </template>

        <template v-slot:body-cell-customer_average_price="props">
          <q-td :props="props">
            {{
              Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
              }).format(props.row.orders?.customer_average_price)
            }}
          </q-td>
        </template>

        <template v-slot:body-cell-customer_total="props">
          <q-td :props="props">
            {{
              Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
              }).format(props.row.orders?.customer_total)
            }}
          </q-td>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>


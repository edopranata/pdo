<script setup>
import {useInvoiceStore} from "stores/transaction/invoice";
import {useAuthStore} from "stores/auth";
import {useRoute} from "vue-router";
import {onMounted, reactive, ref} from "vue";
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
const calc = reactive({
  customer_weight: {type: Number, default: 0},
  customer_price: {type: Number, default: 0},
  customer_total_price: {type: Number, default: 0},
})
onMounted(async () => {
  deliveries.onReset()
  tableRef.value.requestServerInteraction()
})

const formattedNUmber = (calcItem, format = 'currency') => {

  const options = {}
  options.style = format

  if (format === "currency") {
    options.currency = "IDR"
  } else {
    options.unit = "kilogram"
  }

  return new Intl.NumberFormat('id-ID', options).format(calc[calcItem])
}

</script>
<template>
  <q-page class="tw-space-y-4" padding>
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
              :label="!$q.screen.lt.md ? 'Buat Invoice' : ''"
              :loading="table.loading"
              :round="$q.screen.lt.md"
              :disable="!can('admin.transaction.invoice.showInvoice')"
              glossy
              icon="print"
              size="sm"
              :to="{name: 'admin.transaction.invoice.showInvoice', params: {id: props.value}}"
            >
              <q-tooltip>
                {{ can('admin.transaction.invoice.showInvoice') ? 'Create invoice' : 'User is not authorized to create invoice' }}
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


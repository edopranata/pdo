<script setup>
import {useInvoiceCancelingDataStore} from "stores/transaction/invoiceCancelingData";
import {useAuthStore} from "stores/auth";
import {useRoute, useRouter} from "vue-router";
import {onMounted, ref, watch} from "vue";
import {useQuasar} from "quasar";
import {storeToRefs} from "pinia";

const $q = useQuasar()

const router = useRouter()
const invoice = useInvoiceCancelingDataStore()
const {can} = useAuthStore()
const {table, form} = useInvoiceCancelingDataStore()
const {getSearch: searching} = storeToRefs(useInvoiceCancelingDataStore())
const {path} = useRoute()

const tableRef = ref()

const toView = async (invoice, id) => {
  if (invoice)
    $q.dialog({
      title: 'View invoice',
      message: `Invoice number : ${invoice}`,
      cancel: true,
      persistent: true
    }).onOk(async () => {
      await router.replace({name: 'admin.transaction.invoiceCanceling.showInvoiceCanceling', params: {id: id}})

    })
}

watch(searching, () => {
  table.filter = String(Date.now())
})

onMounted(async () => {
  tableRef.value.requestServerInteraction()
})

const onRequest = async (props) => {
  await invoice.getInvoiceData(path, props)
}


</script>
<template>
  <q-page class="tw-space-y-4" padding>
    <q-card bordered>
      <q-card-section class="tw-p-0">
        <q-table
          flat
          ref="tableRef"
          v-model:pagination="table.pagination"
          :columns="table.headers ?? []"
          :filter="table.filter"
          :dense="$q.screen.lt.md"
          :grid="$q.screen.lt.md"
          :loading="table.loading"
          :rows="table.data ?? []"
          bordered
          row-key="id"
          @request="onRequest"
        >
          <template v-slot:top>
            <q-toolbar class="text-primary">
              <q-toolbar-title>
                Invoice Data
              </q-toolbar-title>
              <q-space></q-space>
              <q-input filled v-model="table.search" debounce="500" label="Search" />
            </q-toolbar>
          </template>

          <template v-slot:body-cell-no="props">
            <q-td :props="props">
              {{ props.rowIndex + 1 }}
            </q-td>
          </template>

          <template v-slot:body-cell-customer_name="props">
            <q-td :props="props">
              {{ props.value?.name }}
            </q-td>
          </template>

          <template v-slot:body-cell-invoice_number="props">
            <q-td :props="props">
              <q-chip
                v-if="can('admin.transaction.invoiceCanceling.showInvoiceCanceling')"
                clickable
                :color="props.row.type === 'LN' ? 'warning' : 'primary'"
                icon="print"
                text-color="white"
                @click="toView(props.row.invoice_number, props.row.id)"
                >
                {{ props.value }}
              </q-chip>
              <q-chip
                v-else
                :color="props.row.type === 'LN' ? 'warning' : 'primary'"
                icon="print"
                text-color="white"
              >
                {{ props.value }}
              </q-chip>
            </q-td>
          </template>
          <template v-slot:body-cell-total_order="props">
            <q-td :props="props">
              <div>
                {{ new Intl.NumberFormat('id-ID', {style: 'currency', currency: 'IDR'}).format(props.value) }}
              </div>
            </q-td>
          </template>
          <template v-slot:body-cell-loan_installment="props">
            <q-td :props="props">
              <div>{{
                  new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    'currency': 'IDR'
                  }).format(props.value)
                }}
              </div>
            </q-td>
          </template>
          <template v-slot:body-cell-total="props">
            <q-td :props="props">
              <div>{{
                  new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    'currency': 'IDR'
                  }).format(props.value)
                }}
              </div>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>


<script setup>
import {useInvoiceDataStore} from "stores/report/invoiceData";
import {usePageStore} from "stores/pages";
import {useAuthStore} from "stores/auth";
import {useRoute, useRouter} from "vue-router";
import {onMounted, ref} from "vue";
import {useQuasar} from "quasar";

const $q = useQuasar()

const router = useRouter()
const page = usePageStore()
const invoice = useInvoiceDataStore()
const {can} = useAuthStore()
const {table} = useInvoiceDataStore()
const {path} = useRoute()

const tableRef = ref()

const toPrint = async (invoice, id) => {
  if (invoice)
    $q.dialog({
      title: 'Print invoice',
      message: `Invoice number : ${invoice}`,
      cancel: true,
      persistent: true
    }).onOk(async () => {
      await router.replace({name: 'admin.report.invoiceData.print', params: {id: id}})
    })
}

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
                v-if="can('admin.report.invoiceData.print')"
                clickable
                :color="props.row.type === 'LN' ? 'warning' : 'primary'"
                icon="print"
                text-color="white"
                @click="toPrint(props.row.invoice_number, props.row.id)"
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


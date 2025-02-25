<script setup>
import {useInvoiceDataStore} from "stores/report/invoiceData";
import {useAuthStore} from "stores/auth";
import {useRoute, useRouter} from "vue-router";
import {onMounted, ref, watch} from "vue";
import {useQuasar} from "quasar";
import {storeToRefs} from "pinia";

const $q = useQuasar()

const router = useRouter()
const {getSearch: searching} = storeToRefs(useInvoiceDataStore())
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
      await router.replace({name: 'admin.report.invoiceReport.print', params: {id: id}})
    })
}

onMounted(async () => {
  tableRef.value.requestServerInteraction()
})

watch(searching, () => {
  table.filter = String(Date.now())
})


const onRequest = async (props) => {
  await invoice.getInvoiceData(path, props)
}

</script>
<template>
  <q-page class="tw:space-y-4" padding>
    <q-card bordered>
      <q-card-section class="tw:p-0">

        <q-table
          ref="tableRef"
          v-model:pagination="table.pagination"
          :columns="table.headers ?? []"
          :dense="$q.screen.lt.md"
          :filter="table.filter"
          :grid="$q.screen.lt.md"
          :loading="table.loading"
          :rows="table.data ?? []"
          bordered
          flat
          row-key="id"
          @request="onRequest"
        >

          <template v-if="$q.screen.lt.md" v-slot:item="props">
            <q-list bordered padding class="rounded-borders" style="max-width: 350px">
              <q-item-label header>Folders</q-item-label>

              <q-item clickable v-ripple>
                <q-item-section avatar top>
                  <q-avatar icon="folder" color="primary" text-color="white" />
                </q-item-section>

                <q-item-section>
                  <q-item-label lines="1">Photos</q-item-label>
                  <q-item-label caption>February 22nd, 2019</q-item-label>
                </q-item-section>

                <q-item-section side>
                  {{ props.row.rowIndex + 1 }}
                </q-item-section>
              </q-item>
            </q-list>
          </template>

          <template v-if="!$q.screen.lt.md" v-slot:top>
            <q-toolbar class="text-primary">
              <q-toolbar-title>
                Invoice Data
              </q-toolbar-title>

              <q-space v-if="!$q.screen.lt.md"></q-space>
              <q-input
                v-if="!$q.screen.lt.md"
                v-model="table.search"
                class="tw:w-80"
                debounce="300"
                placeholder="Search">
                <template v-slot:append>
                  <q-icon name="search"/>
                </template>
              </q-input>
            </q-toolbar>
            <q-input
              v-if="$q.screen.lt.md"
              v-model="table.search"
              class="tw:w-80"
              debounce="300"
              placeholder="Search">
              <template v-slot:append>
                <q-icon name="search"/>
              </template>
            </q-input>
          </template>

          <template v-if="!$q.screen.lt.md" v-slot:body-cell-no="props">
            <q-td :props="props">
              {{ props.rowIndex + 1 }}
            </q-td>
          </template>

          <template v-if="!$q.screen.lt.md" v-slot:body-cell-customer_name="props">
            <q-td :props="props">
              {{ props.value?.name }}
            </q-td>
          </template>

          <template v-if="!$q.screen.lt.md" v-slot:body-cell-invoice_number="props">
            <q-td :props="props">
              <q-chip
                v-if="can('admin.report.invoiceReport.print')"
                :color="props.row.type === 'LN' ? 'warning' : 'primary'"
                clickable
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
          <template v-if="!$q.screen.lt.md" v-slot:body-cell-total_order="props">
            <q-td :props="props">
              <div>
                {{ new Intl.NumberFormat('id-ID', {style: 'currency', currency: 'IDR'}).format(props.value) }}
              </div>
            </q-td>
          </template>
          <template v-if="!$q.screen.lt.md" v-slot:body-cell-loan_installment="props">
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
          <template v-if="!$q.screen.lt.md" v-slot:body-cell-total="props">
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


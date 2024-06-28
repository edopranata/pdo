<script setup>
import {useIncomeAllFactoryDataStore} from "stores/report/IncomeAllFactoryReport";
import {useRoute} from "vue-router";
import {onBeforeMount, onMounted} from "vue";
import {storeToRefs} from "pinia";
import {useQuasar} from "quasar";

const {path} = useRoute()
const {errors, form_monthly} = storeToRefs(useIncomeAllFactoryDataStore())
const {table, form} = useIncomeAllFactoryDataStore()
const income = useIncomeAllFactoryDataStore();
const $q = useQuasar()

onBeforeMount(() => {
  income.request_type = 'monthly'
  income.table.data = []
})

onMounted(async () => {
  income.onReset()
})

const onSubmit = async () => {
  await income.getDeliveryFactoryID(path)
}

const exportExcel = async () => {
  $q.dialog({
    title: 'Export Data',
    message: 'Export dan download data pada periode terpilih?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    await income.exportDataToExcel(path)
  })
}

</script>

<template>
  <q-page class="tw-space-y-4" padding>
    <q-card bordered>
      <q-toolbar class="text-primary">
        <q-toolbar-title>
          Laporan bank transfer dari Semua Pabrik
        </q-toolbar-title>
      </q-toolbar>
      <q-form
        @submit="onSubmit"
      >
        <q-card-section class="tw-space-y-4">
          <div class="md:tw-grid md:tw-grid-cols-3 md:tw-gap-4">
            <q-input
              v-model="form.monthly"
              :error="errors.hasOwnProperty('monthly')"
              :error-message="errors.monthly"
              :loading="table.loading"
              filled
              hint="Contoh: 2024/01"
              label="Periode bulan"
              mask="####/##"
              @change="income.unsetError('monthly')"
            />
          </div>
          <div class="md:tw-grid md:tw-grid-cols-3 md:tw-gap-4">
            <div class="tw-flex tw-space-x-4">
              <q-btn
                :disable="form_monthly"
                :loading="table.loading"
                color="secondary"
                glossy
                icon="add_circle"
                label="Lihat Data"
                type="submit"
              />
              <q-btn
                :disable="form_monthly"
                :loading="table.loading"
                color="warning"
                glossy
                icon="download"
                label="Export Data"
                @click="exportExcel"
              />
            </div>
          </div>
        </q-card-section>
      </q-form>
      <q-card-section class="no-padding">
        <q-markup-table bordered flat>
          <thead>
          <tr>
            <th class="text-left">No</th>
            <th class="text-left">Factory</th>
            <th class="text-left">Transfer Date</th>
            <th class="text-left">Period Start</th>
            <th class="text-left">Period End</th>
            <th class="text-right">Weight</th>
            <th class="text-right">Margin (avg)</th>
            <th class="text-right">Factory Price (avg)</th>
            <th class="text-right">PPN (Rp)</th>
            <th class="text-right">PPh 22 (Rp)</th>
            <th class="text-right">Gross Total</th>
            <th class="text-right">Customer Total</th>
            <th class="text-right">Bank Transfer</th>
            <th class="text-right">Income</th>
          </tr>
          </thead>
          <tbody v-if="table.data.length > 0">
          <tr v-for="(item, index) in table.data" :key="item.id">
            <td class="text-left">{{ index + 1 }}</td>
            <td class="text-left">{{ item.factory.hasOwnProperty('name') ? item.factory.name : '' }}</td>
            <td class="text-left">{{ item.trade_date }}</td>
            <td class="text-left">{{ item.period_start }}</td>
            <td class="text-left">{{ item.period_end }}</td>

            <td class="text-right">{{
                new Intl.NumberFormat('id-ID', {
                  style: 'unit',
                  unit: "kilogram"
                }).format(item.hasOwnProperty('summaries') ? item.summaries.total_weight : 0)
              }}
            </td>
            <td class="text-right">{{
                new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: "IDR",
                  maximumFractionDigits: 2
                }).format(item.hasOwnProperty('summaries') ? item.summaries.margin : 0)
              }}
            </td>
            <td class="text-right">{{
                new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: "IDR",
                  maximumFractionDigits: 2
                }).format(item.hasOwnProperty('summaries') ? item.summaries.factory_price : 0)
              }}
            </td>
            <td class="text-right">{{
                new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: "IDR",
                  maximumFractionDigits: 2
                }).format(item.hasOwnProperty('summaries') ? item.summaries.ppn_total : 0)
              }}
            </td>
            <td class="text-right">{{
                new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: "IDR",
                  maximumFractionDigits: 2
                }).format(item.hasOwnProperty('summaries') ? item.summaries.pph22_total : 0)
              }}
            </td>
            <td class="text-right">{{
                new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: "IDR",
                  maximumFractionDigits: 2
                }).format(item.hasOwnProperty('summaries') ? item.summaries.gross_total : 0)
              }}
            </td>
            <td class="text-right">{{
                new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: "IDR",
                  maximumFractionDigits: 2
                }).format(item.hasOwnProperty('summaries') ? item.summaries.customer_total : 0)
              }}
            </td>
            <td class="text-right">{{
                new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: "IDR",
                  maximumFractionDigits: 2
                }).format(item.hasOwnProperty('summaries') ? item.summaries.total : 0)
              }}
            </td>
            <td class="text-right">{{
                new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: "IDR",
                  maximumFractionDigits: 2
                }).format(item.hasOwnProperty('summaries') ? item.summaries.net_income : 0)
              }}
            </td>
          </tr>
          </tbody>
        </q-markup-table>
      </q-card-section>
    </q-card>
  </q-page>

</template>


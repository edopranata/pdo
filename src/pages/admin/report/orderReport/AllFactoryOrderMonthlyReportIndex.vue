<script setup>
import {useDeliveryOrderAllFactoryDataStore} from "stores/report/deliveryOrderAllFactoryData";
import {useRoute} from "vue-router";
import {onBeforeMount, onMounted} from "vue";
import {storeToRefs} from "pinia";
import {useQuasar} from "quasar";

const {path} = useRoute()
const {errors, form_monthly} = storeToRefs(useDeliveryOrderAllFactoryDataStore())
const {table, form} = useDeliveryOrderAllFactoryDataStore()
const order = useDeliveryOrderAllFactoryDataStore();
const $q = useQuasar()

onBeforeMount(() => {
  order.request_type = 'monthly'
})

onMounted( async () => {
  order.onReset()
})

const onSubmit = async () => {
  await order.getDeliveryFactoryID(path)
}

const exportExcel = async () => {
  $q.dialog({
    title: 'Export Data',
    message: 'Export dan download data pada periode terpilih?',
    cancel: true,
    persistent: true
  }).onOk( async () => {
    await order.exportDataToExcel(path)
  })
}

</script>

<template>
  <q-page class="tw-space-y-4" padding>
    <q-card bordered>
      <q-toolbar class="text-primary">
        <q-toolbar-title>
          Laporan Delivery Order Semua Pabrik
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
              @change="order.unsetError('monthly')"
            />
            </div>
          <div class="md:tw-grid md:tw-grid-cols-3 md:tw-gap-4">
            <div class="tw-flex tw-space-x-4">
              <q-btn
                :disable="!form_monthly"
                label="Lihat Data"
                :loading="table.loading"
                color="secondary"
                glossy
                icon="add_circle"
                type="submit"
              />
              <q-btn
                :disable="!form_monthly"
                label="Export Data"
                :loading="table.loading"
                color="warning"
                glossy
                icon="download"
                @click="exportExcel"
              />
            </div>
          </div>
        </q-card-section>
      </q-form>
        <q-card-section class="no-padding">
          <q-markup-table flat bordered>
            <thead>
            <tr>
              <th class="text-left">No</th>
              <th class="text-left">Factory</th>
              <th class="text-left">Customer</th>
              <th class="text-left">Delivery Order Date</th>
              <th class="text-right">Customer Price</th>
              <th class="text-right">Weight</th>
              <th class="text-right">Net Customer</th>
              <th class="text-right">Margin</th>
              <th class="text-right">Factory Price</th>
              <th class="text-right">Gross Total</th>
              <th class="text-right">PPN (Rp)</th>
              <th class="text-right">PPh 22 (Rp)</th>
              <th class="text-right">Bank Transfer</th>
              <th class="text-right">Income</th>
            </tr>
            </thead>
            <tbody v-if="table.data.length > 0">
            <tr class="text-bold bg-primary text-white">
              <td class="text-left"></td>
              <td class="text-left" colspan="3">Total</td>
              <td class="text-right">{{ new Intl.NumberFormat('id-ID', {style: 'currency', currency: "IDR", maximumFractionDigits: 0}).format(table.summaries.customer_price) }}</td>
              <td class="text-right">{{ new Intl.NumberFormat('id-ID', {style: 'unit', unit: "kilogram"}).format(table.summaries.total_weight) }}</td>
              <td class="text-right">{{ new Intl.NumberFormat('id-ID', {style: 'currency', currency: "IDR", maximumFractionDigits: 2}).format(table.summaries.customer_total) }}</td>
              <td class="text-right">{{ new Intl.NumberFormat('id-ID', {style: 'currency', currency: "IDR", maximumFractionDigits: 0}).format(table.summaries.margin) }}</td>
              <td class="text-right">{{ new Intl.NumberFormat('id-ID', {style: 'currency', currency: "IDR", maximumFractionDigits: 0}).format(table.summaries.factory_price) }}</td>
              <td class="text-right">{{ new Intl.NumberFormat('id-ID', {style: 'currency', currency: "IDR", maximumFractionDigits: 2}).format(table.summaries.gross_total) }}</td>
              <td class="text-right">{{ new Intl.NumberFormat('id-ID', {style: 'currency', currency: "IDR", maximumFractionDigits: 2}).format(table.summaries.ppn_total) }}</td>
              <td class="text-right">{{ new Intl.NumberFormat('id-ID', {style: 'currency', currency: "IDR", maximumFractionDigits: 2}).format(table.summaries.pph22_total) }}</td>
              <td class="text-right">{{ new Intl.NumberFormat('id-ID', {style: 'currency', currency: "IDR", maximumFractionDigits: 2}).format(table.summaries.total) }}</td>
              <td class="text-right">{{ new Intl.NumberFormat('id-ID', {style: 'currency', currency: "IDR", maximumFractionDigits: 2}).format(parseFloat(table.summaries.gross_total) - (table.summaries.customer_total + table.summaries.pph22_total)) }}</td>
            </tr>
            <tr v-for="(item, index) in table.data" :key="item.id">
              <td class="text-left">{{ index + 1 }}</td>
              <td class="text-left">{{ item.factory.hasOwnProperty('name') ? item.factory.name : '' }}</td>
              <td class="text-left">{{ item.customer.hasOwnProperty('name') ? item.customer.name : '' }}</td>
              <td class="text-left">{{ item.trade_date }}</td>
              <td class="text-right">{{ new Intl.NumberFormat('id-ID', {style: 'currency', currency: "IDR", maximumFractionDigits: 0}).format(item.customer_price) }}</td>
              <td class="text-right">{{ new Intl.NumberFormat('id-ID', {style: 'unit', unit: "kilogram"}).format(item.net_weight) }}</td>
              <td class="text-right">{{ new Intl.NumberFormat('id-ID', {style: 'currency', currency: "IDR", maximumFractionDigits: 2}).format(item.customer_total) }}</td>
              <td class="text-right">{{ new Intl.NumberFormat('id-ID', {style: 'currency', currency: "IDR", maximumFractionDigits: 0}).format(item.margin) }}</td>
              <td class="text-right">{{ new Intl.NumberFormat('id-ID', {style: 'currency', currency: "IDR", maximumFractionDigits: 0}).format(item.net_price) }}</td>
              <td class="text-right">{{ new Intl.NumberFormat('id-ID', {style: 'currency', currency: "IDR", maximumFractionDigits: 2}).format(item.gross_total) }}</td>
              <td class="text-right">{{ new Intl.NumberFormat('id-ID', {style: 'currency', currency: "IDR", maximumFractionDigits: 2}).format(item.ppn_total) }}</td>
              <td class="text-right">{{ new Intl.NumberFormat('id-ID', {style: 'currency', currency: "IDR", maximumFractionDigits: 2}).format(item.pph22_total) }}</td>
              <td class="text-right">{{ new Intl.NumberFormat('id-ID', {style: 'currency', currency: "IDR", maximumFractionDigits: 2}).format((parseFloat(item.gross_total) + parseFloat(item.ppn_total)) - parseFloat(item.pph22_total)) }}</td>
              <td class="text-right">{{ new Intl.NumberFormat('id-ID', {style: 'currency', currency: "IDR", maximumFractionDigits: 2}).format(parseFloat(item.gross_total) - (parseFloat(item.customer_total) + parseFloat(item.pph22_total))) }}</td>
            </tr>
            </tbody>
          </q-markup-table>
        </q-card-section>
    </q-card>
  </q-page>

</template>


<script setup>
import { onMounted, onUnmounted, watch } from 'vue'
import {useRoute} from "vue-router";
import {useCustomerOrderReportStore} from "stores/report/customerOrderReport";
import {storeToRefs} from "pinia";
import {useQuasar} from "quasar";
import {useAuthStore} from "stores/auth";

const {can} = useAuthStore()
const order = useCustomerOrderReportStore();
const {path} = useRoute()
const {errors, checkForm, form_empty, selected_customer, customers_option} = storeToRefs(useCustomerOrderReportStore())
const {table, form} = useCustomerOrderReportStore();
const $q = useQuasar()
onMounted(async () => {
  await order.getAllCustomer(path)
})

onUnmounted(async () => {
  order.onReset()
  table.data = []
})

const showReport = async () => {
  await order.getCustomerOrderList(path)
}

watch(selected_customer, (selectedC) => {
  if (selectedC) {
    form.customer_id = Object.prototype.hasOwnProperty.call(selectedC, 'id') ? selectedC.id : selectedC
  }else{
    form.customer_id = selectedC
  }
})
const searchCustomer = (val, update) => {
  update(() => {
    if (val === '') {
      order.customers_option = order.customers.slice(0, 10)
    } else {
      const needle = val.toLowerCase()
      order.customers_option = order.customers
        .filter(({ name }) => name.toLowerCase().indexOf(needle) > -1)
        .slice(0, 10)
    }
  })
}



const exportExcel = async () => {
  $q.dialog({
    title: 'Export Data',
    message: 'Export dan download data ke excel?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    await order.exportCustomerOrderDataToExcel(path)
  })
}

</script>

<template>
  <q-page class="tw:space-y-4" padding>
    <q-card bordered>
      <q-toolbar class="text-primary">
        <q-toolbar-title>
          Customer Order Report
        </q-toolbar-title>
      </q-toolbar>
      <q-card-section>
        <div class="tw:grid tw:md:grid-cols-3 tw:md:gap-4">
            <q-input
              :disable="table.loading"
              class="tw:md:col-span-1 tw:col-span-2"
              v-if="can('admin.report.customerReport.[orderReport,orderReportExport]')"
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

          <q-select
            :disable="table.loading"
            class="tw:md:col-span-1 tw:col-span-2"
            v-model="order.selected_customer"
            :bg-color="!!form.id ? 'yellow-2' : ''"
            :dense="$q.screen.lt.md"
            :error="errors.hasOwnProperty('customer_id')"
            :error-message="errors.customer_id"
            :options="customers_option"
            clearable
            fill-input
            filled
            hide-selected
            label="Pilih Pengepul"
            option-label="name"
            option-value="id"
            use-input
            @update:model-value="order.unsetError('customer_id')"
            @filter="searchCustomer"
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section avatar>
                  <q-img :src="scope.opt.initial" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ scope.opt.name }}</q-item-label>
                  <q-item-label caption>
                    <q-icon name="phone" />
                    {{ scope.opt.phone }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey"> No results </q-item-section>
              </q-item>
            </template>
          </q-select>
          </div>
          <div class="q-gutter-sm q-pt-sm">
            <q-btn
              v-if="can('admin.report.customerReport.orderReport')"
              :disable="!checkForm || form_empty"
              :loading="table.loading"
              color="secondary"
              glossy
              icon="add_circle"
              label="Reload Data"
              @click="showReport"
            />
            <q-btn
              v-if="can('admin.report.customerReport.orderReportExport')"
              :disable="!checkForm || form_empty"
              :loading="table.loading"
              color="warning"
              glossy
              icon="download"
              label="Export Data"
              @click="exportExcel"
            />
          </div>
      </q-card-section>
      <q-card-section v-if="table.data.length > 0" padding>
        <q-markup-table flat bordered>
          <thead>
          <tr>
            <th class="text-left">No</th>
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
            <td class="text-left">Total</td>
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


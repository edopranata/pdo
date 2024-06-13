<script setup>
import {onMounted} from "vue";
import {useRoute} from "vue-router";
import {useCustomerOrderReportStore} from "stores/report/customerOrderReport";
import {storeToRefs} from "pinia";
import {useQuasar} from "quasar";
import {useAuthStore} from "stores/auth";

const {can} = useAuthStore()
const order = useCustomerOrderReportStore();
const {path} = useRoute()
const {summaries, errors, checkForm} = storeToRefs(useCustomerOrderReportStore())
const {table, form} = useCustomerOrderReportStore();
const $q = useQuasar()
onMounted(async () => {
  order.onReset()
})

const showReport = async () => {
  await order.getCustomerOrderList(path)
}

const exportExcel = async () => {
  $q.dialog({
    title: 'Export Data',
    message: 'Export dan download data ke excel?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    await order.exportDataToExcel(path)
  })
}

</script>

<template>
  <q-page class="tw-space-y-4" padding>
    <q-card bordered>
      <q-toolbar class="text-primary">
        <q-toolbar-title>
          Customer Order Report
        </q-toolbar-title>
      </q-toolbar>
      <q-card-section>
        <div class="md:tw-grid md:tw-grid-cols-3 md:tw-gap-4 md:tw-mb-4">
          <div class="lg:tw-col-span-1 tw-col-span-2">
            <q-input
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
          </div>
        </div>
        <div class="md:tw-grid md:tw-grid-cols-3 md:tw-gap-4">
          <div class="tw-flex tw-space-x-4">
            <q-btn
              v-if="can('admin.report.customerReport.orderReport')"
              :disable="!checkForm"
              :loading="table.loading"
              color="secondary"
              glossy
              icon="add_circle"
              label="Reload Data"
              @click="showReport"
            />
            <q-btn
              v-if="can('admin.report.customerReport.orderReportExport')"
              :disable="!checkForm"
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
      <q-card-section v-if="table.data.length > 0" padding>
        <q-markup-table bordered flat>
          <thead>
          <tr>
            <th class="text-left">No</th>
            <th class="text-left">Customer</th>
            <th class="text-left">Address</th>
            <th class="text-left">Phone</th>
            <th class="text-left">Total DO</th>
            <th class="text-right">Total Weight</th>
            <th class="text-right">Avg Customer Price</th>
            <th class="text-right">Customer Total</th>
          </tr>
          <tr class="bg-primary text-white text-bold">
            <th class="text-left"></th>
            <th class="text-left"></th>
            <th class="text-left"></th>
            <th class="text-left">Total</th>
            <th class="text-left">{{ summaries.orders_count }} DO</th>
            <th class="text-right">{{
                new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: "IDR",
                  maximumFractionDigits: 2
                }).format(summaries.total_weight)
              }}
            </th>
            <th class="text-right">{{
                new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: "IDR",
                  maximumFractionDigits: 2
                }).format(summaries.average_customer_price)
              }}
            </th>
            <th class="text-right">{{
                new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: "IDR",
                  maximumFractionDigits: 2
                }).format(summaries.customer_total)
              }}
            </th>
          </tr>
          </thead>
          <tbody v-if="table.data.length > 0">
          <tr v-for="(item, index) in table.data" :key="item.id">
            <td class="text-left">{{ index + 1 }}</td>
            <td class="text-left">
              <div class="flex items-center tw-gap-2 ">
                <q-avatar size="sm">
                  <img :alt="item.name" :src="item.initial">
                </q-avatar>
                {{ item.name }}
              </div>
            </td>
            <td class="text-left">{{ item.address }}</td>
            <td class="text-left">{{ item.phone }}</td>
            <td class="text-left">{{ item.orders_count }} DO</td>
            <td class="text-right">{{
                new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: "IDR",
                  maximumFractionDigits: 2
                }).format(item.total_weight)
              }}
            </td>
            <td class="text-right">{{
                new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: "IDR",
                  maximumFractionDigits: 2
                }).format(item.average_customer_price)
              }}
            </td>
            <td class="text-right">{{
                new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: "IDR",
                  maximumFractionDigits: 2
                }).format(item.customer_total)
              }}
            </td>
          </tr>
          </tbody>
        </q-markup-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>


<script setup>
import {onMounted} from "vue";
import {useRoute} from "vue-router";
import {useLoanReportStore} from "stores/report/loanReport";
import {storeToRefs} from "pinia";
import {useQuasar} from "quasar";
import {useAuthStore} from "stores/auth";

const {can} = useAuthStore()
const loan = useLoanReportStore();
const {path} = useRoute()
const {summaries} = storeToRefs(useLoanReportStore())
const {table} = useLoanReportStore();
const $q = useQuasar()
onMounted(async () => {
  loan.onReset()
  await loan.getCustomerList(path)
})

const showReport = async () => {
  await loan.getCustomerList(path)
}

const exportExcel = async () => {
  $q.dialog({
    title: 'Export Data',
    message: 'Export dan download data ke excel?',
    cancel: true,
    persistent: true
  }).onOk( async () => {
    await loan.exportDataToExcel(path)
  })
}

</script>

<template>
  <q-page class="tw:space-y-4" padding>
    <q-card bordered>
      <q-toolbar class="text-primary">
        <q-toolbar-title>
          Customer Loan Report
        </q-toolbar-title>
      </q-toolbar>
      <q-card-section>
        <div class="tw:md:grid tw:md:grid-cols-3 tw:md:gap-4">
          <div class="q-gutter-sm">
            <q-btn
              v-if="can('admin.report.customerReport.loanReport')"
              :loading="table.loading"
              color="secondary"
              glossy
              icon="add_circle"
              label="Reload Data"
              @click="showReport"
            />
            <q-btn
              v-if="can('admin.report.customerReport.loanReportExport')"
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
            <th class="text-right">Pinjaman</th>
          </tr>
          <tr class="bg-primary text-white text-bold">
            <th class="text-left"></th>
            <th class="text-left"></th>
            <th class="text-left"></th>
            <th class="text-left">Total</th>
            <th class="text-right">{{
                new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: "IDR",
                  maximumFractionDigits: 2
                }).format(summaries.loan)
              }}
            </th>
          </tr>
          </thead>
          <tbody v-if="table.data.length > 0">
          <tr v-for="(item, index) in table.data" :key="item.id">
            <td class="text-left">{{ index + 1 }}</td>
            <td class="text-left">
              <div class="flex items-center tw:gap-2 ">
                <q-avatar size="sm">
                  <img :alt="item.name" :src="item.initial">
                </q-avatar>
                {{ item.name }}
              </div>
            </td>
            <td class="text-left">{{ item.address }}</td>
            <td class="text-left">{{ item.phone }}</td>
            <td class="text-right">{{
                new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: "IDR",
                  maximumFractionDigits: 2
                }).format(item.loan)
              }}
            </td>
          </tr>
          </tbody>
        </q-markup-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>


<script setup>
import {useInvoiceDataStore} from "stores/report/invoiceData";
import {usePageStore} from "stores/pages";
import {storeToRefs} from "pinia";
import {onMounted} from "vue";
import {useRoute} from "vue-router";
import {date, useQuasar} from 'quasar'
import BlankRowPrint from "components/invoice/BlankRowPrint.vue";
import LoanRowPrint from "components/invoice/LoanRowPrint.vue";
import FooterRowPrint from "components/invoice/FooterRowPrint.vue";

const appLogo = import.meta.env.VITE_APP_LOGO
const productName = import.meta.env.VITE_APP_PRODUCT_NAME
const page = usePageStore()
const print = useInvoiceDataStore()
const {getInvoice: data} = storeToRefs(useInvoiceDataStore())
const {path} = useRoute()
const $q = useQuasar()

onMounted(async () => {
  await print.getInvoiceID(path)
  setTimeout(() => {
    onPrint()
  }, 600)
})

const onPrint = () => {
  page.rightDrawer = false
  page.leftDrawerOpen = false
  $q.dialog({
    title: 'Print invoice',
    message: `Invoice number : ${print.table.invoice?.invoice_number}`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    setTimeout(() => {
      window.print()
    }, 600)
  })
}
</script>

<template>
  <q-page class="tw:print:mt-0 tw:print:py-0 tw:print:text-[12px]">
    <q-card v-if="data" class="tw:md:w-3/6 tw:print:w-full print-hide" flat>
      <q-card-section>
        <q-toolbar class="text-primary">
          <q-space></q-space>
          <q-btn v-if="!$q.platform.is.mobile" dense flat icon="print" round @click="onPrint"/>
        </q-toolbar>
      </q-card-section>
    </q-card>
    <div class="tw:flex tw:m-0 tw:p-0">
      <q-card v-if="data" class="tw:md:w-3/6 tw:print:w-full" flat>
        <q-card-section class="tw:print:my-0 tw:print:py-0">
          <div class="tw:flex">
            <q-img alt="logo" class="tw:w-4" fit="fill" :src="appLogo" style="width: 100px; height: 100px;" />
            <div class="tw:flex tw:flex-col text-left tw:mt-4">
              <div class="tw:text-4xl tw:font-bold tw:underline tw:font-sans">{{ productName }}</div>
              <div class="tw:text-xs tw:font-bold">HP: 0812-3456-7890</div>
            </div>
            <q-space></q-space>
            <div class="tw:flex tw:flex-col tw:w-64 tw:mt-6">
              <div class="tw:border-b tw:border-gray-900">Kepada</div>
              <div class="tw:border-b tw:border-gray-900 tw:font-bold">{{ data.customer?.name.toUpperCase() }}</div>
            </div>
          </div>
        </q-card-section>
        <q-card-section class="tw:print:my-0 tw:print:py-0">
          <div class="flex justify-between">
            <div class="tw:font-bold">No Nota: {{ data.invoice_number }}</div>
            <div class="tw:font-bold">Tanggal Nota: {{ data.invoice_date }}</div>
          </div>
          <div class="tw:grid tw:grid-cols-5">
            <span
              class="tw:font-bold tw:text-center tw:px-4 tw:py-1 tw:border-gray-800 tw:border-l tw:border-y tw:col-span-2">Tanggal / Keterangan</span>
            <span class="tw:font-bold tw:text-center tw:px-4 tw:py-1 tw:border-gray-800 tw:border-l tw:border-y">Banyaknya</span>
            <span
              class="tw:font-bold tw:text-center tw:px-4 tw:py-1 tw:border-gray-800 tw:border-l tw:border-y">Harga</span>
            <span
              class="tw:font-bold tw:text-center tw:px-4 tw:py-1 tw:border-gray-800 tw:border-x tw:border-y">Total</span>
          </div>
          <div v-if="data.type !== 'LN'" class="tw:grid tw:grid-cols-5">
            <span class="tw:px-4 tw:border-gray-800 tw:border-l tw:font-bold tw:col-span-2">Transaksi</span>
            <span class="tw:px-4 tw:border-gray-800 tw:border-l"></span>
            <span class="tw:px-4 tw:border-gray-800 tw:border-l"></span>
            <span class="tw:px-4 tw:border-gray-800 tw:border-x"></span>
          </div>

          <template v-if="data.count_order > 0">
            <div v-for="(item, index) in data.orders" :key="index" class="tw:grid tw:grid-cols-5">
              <span class="tw:px-4 tw:border-gray-800 tw:border-l tw:col-span-2">
                  {{
                    `${date.formatDate(item.trade_date.split('T')[0], 'DD MMMM YYYY')} ${item.hasOwnProperty('factory') ? '- ' + item.factory.name : ''}`
                  }}
              </span>
              <span class="tw:px-4 tw:border-gray-800 tw:border-l tw:text-right">{{
                  Intl.NumberFormat('id-ID', {
                    style: 'unit',
                    unit: 'kilogram'
                  }).format(item.net_weight)
                }}</span>
              <span class="tw:px-4 tw:border-gray-800 tw:border-l tw:text-right">{{
                  Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0
                  }).format(item.customer_price)
                }}</span>
              <span class="tw:px-4 tw:border-gray-800 tw:border-x tw:text-right">{{
                  Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0
                  }).format(item.customer_total)
                }}</span>
            </div>

            <div v-if="data.type !== 'LN'" class="tw:grid tw:grid-cols-5">
              <span class="tw:px-4 tw:border-gray-800 tw:border-l tw:col-span-2"></span>
              <span class="tw:px-4 tw:border-gray-800 tw:border-l tw:text-right tw:font-bold">{{
                  Intl.NumberFormat('id-ID', {
                    style: 'unit',
                    unit: 'kilogram'
                  }).format(data.total_net_weight)
                }}</span>
              <span class="tw:px-4 tw:border-gray-800 tw:border-l"></span>
              <span class="tw:px-4 tw:border-gray-800 tw:border-x tw:font-bold text-right">{{
                  Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0
                  }).format(data.total_order)
                }}</span>
            </div>
          </template>

          <template v-if="data.type !== 'LN'">
            <blank-row-print v-for="item in data.count" :key="item"/>
          </template>

          <loan-row-print v-if="data.installment" :loan="data.installment"/>

          <template v-if="data.type === 'LN'">
            <blank-row-print v-for="item in data.count" :key="item"/>
          </template>

          <div class="tw:grid tw:grid-cols-5 tw:border-gray-800 tw:border-b-2 tw:font-bold">
            <span class="tw:px-4 tw:py-1 tw:border-gray-800 tw:border-l tw:border-t tw:text-right tw:col-span-4">Total Diterima</span>
            <span class="tw:px-4 tw:py-1 tw:border-gray-800 tw:border-x tw:border-t tw:text-right">{{
                Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0
                }).format(data.total)
              }}</span>
          </div>

        </q-card-section>
        <q-card-section>
          <footer-row-print/>
        </q-card-section>

      </q-card>
    </div>

  </q-page>
</template>


<script setup>
import {useAuthStore} from "stores/auth";

const {can} = useAuthStore();
</script>
<template>
  <q-page padding>
    <div  class="tw:grid tw:md:grid-cols-2 tw:grid-cols-1">
      <q-card>
        <q-card-section class="no-padding">
          <q-list>
            <q-item-label header>Customer Report</q-item-label>
            <q-separator inset spaced/>
            <q-item clickable v-if="can('admin.report.customerReport.loanReport')" :to="{name: 'admin.report.customerReport.loanReport'}">
              <q-item-section>
                <q-item-label>Customers Loan</q-item-label>
                <q-item-label caption lines="2">Laporan total pinjaman seluruh customer sampai dengan hari ini</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable v-if="can('admin.report.customerReport.orderReport')" :to="{name: 'admin.report.customerReport.orderReport'}">
              <q-item-section>
                <q-item-label>Customers Order</q-item-label>
                <q-item-label caption lines="2">Laporan transaksi delivery order seluruh customer</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>


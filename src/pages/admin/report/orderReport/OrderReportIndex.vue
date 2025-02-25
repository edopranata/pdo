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
            <q-item-label header>Delivery Order Report</q-item-label>
            <q-separator inset spaced/>
            <q-item clickable v-if="can('admin.report.orderReport.factoryReport')" :to="{name: 'admin.report.orderReport.factoryReport'}">
              <q-item-section>
                <q-item-label>Period Factory Report</q-item-label>
                <q-item-label caption lines="2">Laporan transaksi DO berdasarkan periode tanggal per pabrik</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable v-if="can('admin.report.orderReport.monthlyFactoryReport')" :to="{name: 'admin.report.orderReport.monthlyFactoryReport'}">
              <q-item-section>
                <q-item-label>Monthly Factory Report</q-item-label>
                <q-item-label caption lines="2">Laporan transaksi DO berdasarkan bulan tertentu per pabrik</q-item-label>
              </q-item-section>
            </q-item>


            <q-item clickable v-if="can('admin.report.orderReport.allFactoryReportShow')" :to="{name: 'admin.report.orderReport.allFactoryReportShow'}">
              <q-item-section>
                <q-item-label>Period All Factory Report</q-item-label>
                <q-item-label caption lines="2">Laporan transaksi DO berdasarkan periode tanggal semua pabrik</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable v-if="can('admin.report.orderReport.monthlyAllFactoryReportShow')" :to="{name: 'admin.report.orderReport.monthlyAllFactoryReportShow'}">
              <q-item-section>
                <q-item-label>Monthly All Factory Report</q-item-label>
                <q-item-label caption lines="2">Laporan transaksi DO berdasarkan periode bulan semua pabrik</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>


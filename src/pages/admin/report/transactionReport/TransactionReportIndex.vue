<script setup>
import {useAuthStore} from "stores/auth";

const {can} = useAuthStore();
</script>
<template>
  <q-page padding>
    <div  class="tw-grid md:tw-grid-cols-2 tw-grid-cols-1">
      <q-card>
        <q-card-section class="no-padding">
          <q-list>
            <q-item-label header>Transaction Report</q-item-label>
            <q-separator inset spaced/>
            <q-item clickable v-if="can('admin.report.transactionReport.todayTransaction')" :to="{name: 'admin.report.transactionReport.todayTransaction'}">
              <q-item-section>
                <q-item-label>Transaksi Hari Ini</q-item-label>
                <q-item-label caption lines="2">Laporan transaksi kasir hari ini</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable v-if="can('admin.report.transactionReport.dailyTransaction')" :to="{name: 'admin.report.transactionReport.dailyTransaction'}">
              <q-item-section>
                <q-item-label>Transaksi Hari sebelumnya</q-item-label>
                <q-item-label caption lines="2">Laporan transaksi kasir berdasarkan tanggal</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>


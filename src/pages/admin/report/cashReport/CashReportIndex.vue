<script setup>
import {useAuthStore} from "stores/auth";

const {can} = useAuthStore();
</script>
<template>
  <q-page padding>
    <div  class="tw:grid md:tw:grid-cols-2 tw:grid-cols-1">
      <q-card>
        <q-card-section class="no-padding">
          <q-list>
            <q-item-label header>Cash Report</q-item-label>
            <q-separator inset spaced/>
            <q-item clickable v-if="can('admin.report.cashReport.todayCash')" :to="{name: 'admin.report.cashReport.todayCash'}">
              <q-item-section>
                <q-item-label>Kas Hari Ini</q-item-label>
                <q-item-label caption lines="2">Laporan kas masuk dan keluar kasir hari ini</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable v-if="can('admin.report.cashReport.dailyCash')" :to="{name: 'admin.report.cashReport.dailyCash'}">
              <q-item-section>
                <q-item-label>Kas Hari sebelumnya</q-item-label>
                <q-item-label caption lines="2">Laporan kas masuk dan keluar kasir berdasarkan tanggal</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>


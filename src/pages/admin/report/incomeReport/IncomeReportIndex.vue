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
            <q-item-label header>Income Report / Factory Bank Transfer</q-item-label>
            <q-separator inset spaced/>
            <q-item clickable v-if="can('admin.report.incomeReport.monthlyAllFactoryIncomeReport')" :to="{name: 'admin.report.incomeReport.monthlyAllFactoryIncomeReport'}">
              <q-item-section>
                <q-item-label>All Factory</q-item-label>
                <q-item-label caption lines="2">Laporan uang masuk dari pabrik </q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable v-if="can('admin.report.incomeReport.detailFactoryIncome')" :to="{name: 'admin.report.incomeReport.detailFactoryIncome'}">
              <q-item-section>
                <q-item-label>Detail Factory Income</q-item-label>
                <q-item-label caption lines="2">Laporan detail uang masuk dari pabrik</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>


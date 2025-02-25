<script setup>
import {useDashboardStore} from "stores/dashboard";
import {onMounted} from "vue";
import {useRoute} from "vue-router";
import {storeToRefs} from "pinia";
import FactoriesPriceWidget from "pages/admin/dashboard/Widget/FactoriesPriceWidget.vue";
import TopWeightCustomerWidget from "pages/admin/dashboard/Widget/TopWeightCustomerWidget.vue";
import AnnualFactoryChartWidget from "pages/admin/dashboard/Widget/AnnualFactoryChartWidget.vue";
import {useAuthStore} from "stores/auth";

const {path} = useRoute();
const {role} = storeToRefs(useAuthStore())
const dashboard = useDashboardStore();
const {table} = storeToRefs(useDashboardStore())
onMounted(async () => {
  await dashboard.getUserFactoryInfo(path, 'user')
  await dashboard.getUserFactoryInfo(path, 'factories')

  if (role !== 'cashier') {
    await dashboard.getUserFactoryInfo(path, 'top_customer')
    await dashboard.getUserFactoryInfo(path, 'annual_factory_chart')

  }
})
</script>

<template>
  <q-page class="" padding>
    <div class="tw:grid tw:gap-4">
      <FactoriesPriceWidget :factories="dashboard.factories" :loading="table.loading"/>
    </div>
    <div v-if="role !== 'cashier'" class="tw:grid tw:gap-4 tw:mt-4">
      <q-separator/>
      <div class="tw:grid tw:xl:grid-cols-4 tw:lg:grid-cols-3 tw:md:grid-cols-2 tw:grid-cols-1 tw:gap-4">
        <TopWeightCustomerWidget :loading="table.loading"/>
        <AnnualFactoryChartWidget :class="'tw:xl:col-span-3 tw:lgcol-span-2'" :loading="table.loading"/>
      </div>
    </div>
  </q-page>
</template>


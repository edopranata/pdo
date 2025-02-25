<script setup>
import {useDashboardStore} from "stores/dashboard";
import {storeToRefs} from "pinia";

const {annual_factory_chart} = storeToRefs(useDashboardStore())

defineProps({
  loading: Boolean,
})

</script>

<template>
  <q-card v-if="loading">
    <q-card-section class="row items-center">
      <q-skeleton height="350px" class="full-width" square />
    </q-card-section>
  </q-card>

  <q-card v-else>
    <q-card-section class="row items-center">

      <apexchart
        v-if="!loading"
        :options="annual_factory_chart.options"
        :series="annual_factory_chart.series"
        class="tw:w-full tw:h-auto"
        height="350"
        type="bar"/>
    </q-card-section>
  </q-card>
</template>

<style scoped>

</style>

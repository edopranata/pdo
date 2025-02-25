<script setup>


import {useDashboardStore} from "stores/dashboard";
import {storeToRefs} from "pinia";

const {best_customers} = storeToRefs(useDashboardStore())

defineProps({
  loading: Boolean,
})

</script>

<template>
    <q-card v-if="loading">
      <q-card-actions>
        <q-skeleton height="350px" class="full-width" square />
      </q-card-actions>
    </q-card>

    <q-card v-if="!loading">
      <q-card-section class="row items-center">
        <apexchart
          v-if="!loading"
          height="350"
          :options="best_customers.options"
          :series="best_customers.series"
          class="tw:w-full tw:h-auto"
          type="bar"/>
      </q-card-section>
    </q-card>
</template>

<style scoped>

</style>

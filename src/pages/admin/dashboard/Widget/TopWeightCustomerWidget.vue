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
      <q-card-section class="row items-center">
        <q-skeleton type="QAvatar"/>
        <q-space></q-space>
        <div class="tw-w-[75%]">
          <q-skeleton class="q-ml-sm tw-text-sm text-right" type="text"/>
          <q-skeleton class="q-ml-sm text-h5 text-right" type="rect"/>
          <q-skeleton class="q-ml-sm tw-text-sm text-right" type="text"/>
        </div>
      </q-card-section>
      <q-card-actions>
        <q-skeleton type="QChip"/>
      </q-card-actions>
    </q-card>

    <q-card v-if="!loading">
      <q-card-section class="row items-center">
        <apexchart
          v-if="!loading"
          height="350"
          :options="best_customers.options"
          :series="best_customers.series"
          class="tw-w-full tw-h-auto"
          type="bar"/>
      </q-card-section>
    </q-card>
</template>

<style scoped>

</style>

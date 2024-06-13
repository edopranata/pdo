<script setup>
import BlankRowPrint from "components/invoice/BlankRowPrint.vue";

defineProps({
  loan: {
    type: Number,
    default: null
  }
})
</script>

<template>
  <div class="tw-grid tw-grid-cols-5">
    <span class="tw-px-4 tw-border-gray-800 tw-border-l tw-font-bold tw-col-span-2">Sisa Pinjaman:</span>
    <span class="tw-px-4 tw-border-gray-800 tw-border-l"></span>
    <span class="tw-px-4 tw-border-gray-800 tw-border-l"></span>
    <span class="tw-px-4 tw-border-gray-800 tw-border-x text-right">{{ new Intl.NumberFormat('id-ID', {style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(loan ?? 0) }}</span>
  </div>
  <blank-row-print />
</template>

<style scoped>

</style>

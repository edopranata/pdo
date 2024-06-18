<script setup>
defineProps({
  user: Object,
  loading: Boolean
})
</script>

<template>

  <q-skeleton v-if="loading" type="QToolbar"/>
  <q-toolbar v-if="!loading">
    <q-toolbar-title>User Information</q-toolbar-title>
  </q-toolbar>
  <div class="tw-grid xl:tw-grid-cols-4 lg:tw-grid-cols-3 md:tw-grid-cols-2 tw-grid-cols-1 tw-gap-4">
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
        <q-avatar color="primary" icon="payments" text-color="white"/>
        <q-space></q-space>
        <div>
          <div class="q-ml-sm tw-text-sm text-right">{{ user.name }}</div>
          <div class="q-ml-sm text-h5 text-right">{{
              new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR'
              }).format(user.hasOwnProperty('cash') ? user.cash ? user.cash?.balance : 0 : 0)
            }}
          </div>
        </div>
      </q-card-section>
      <q-card-actions>
        <q-chip color="secondary" icon="person" text-color="white">
          {{ user.hasOwnProperty('username') ? user.username : '' }}
        </q-chip>
      </q-card-actions>
    </q-card>
  </div>
</template>

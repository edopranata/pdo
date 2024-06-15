<script setup>
import {useDashboardStore} from "stores/dashboard";
import {useAuthStore} from "stores/auth";
import {usePageStore} from "stores/pages";
import {date} from "quasar";
import {storeToRefs} from "pinia";
import QNumber from "components/Input/QNumber.vue";
import {useRouter} from "vue-router";
import {watch} from "vue";

const {can} = useAuthStore();
const router = useRouter();
const page = usePageStore();
const dashboard = useDashboardStore();
const {dialog, form} = useDashboardStore()
const {
  user, factories, table, errors
} = storeToRefs(useDashboardStore())

const openDialog = (index) => {
  dialog.open = true
  const selected = dashboard.factories[index]
  form.factory_id = selected.id
  form.name = selected.name
  form.price_date = date.formatDate(new Date(), 'YYYY/MM/DD')
}

watch(dialog, (dialogChange) => {
  if(!dialogChange.open){
    dashboard.onReset()
  }
})
const onSubmit = () => {
  const routes = router.getRoutes().filter(r => r.name === 'admin.management.price.index')

  if (routes.length === 1) {
    dashboard.submitForm(routes[0].path)
  }

}
</script>

<template>
  <q-dialog v-model="dialog.open" persistent>
    <q-card class="tw-w-96">
      <q-card-section class="row items-center">
        <q-field
          :dense="$q.screen.lt.md"
          :stack-label="!!form.name"
          bg-color="blue-grey"
          class="tw-w-full"
          color="blue-grey-2"
          filled
          hint=""
          label="Factory Name">
          <template v-slot:control>
            <div class="self-center full-width no-outline" tabindex="-1">
              {{ form.name }}
            </div>
          </template>
          <template v-slot:prepend>
            <q-icon name="factory" tabindex="0"/>
          </template>
        </q-field>
        <q-field
          :dense="$q.screen.lt.md"
          :error="errors.hasOwnProperty('date')"
          :error-message="errors.price_date"
          :stack-label="!!form.price_date"
          bg-color="blue-grey"
          class="tw-w-full"
          color="blue-grey-2"
          filled
          label="Price Date">
          <template v-slot:control>
            <div class="self-center full-width no-outline" tabindex="0">
              {{ date.formatDate(form.price_date, 'DD MMMM YYYY') }}
            </div>
          </template>
          <template v-slot:append>
            <q-icon class="cursor-pointer" name="calendar_month" tabindex="-1"/>
          </template>
        </q-field>
        <q-number
          v-model="form.price"
          :dense="$q.screen.lt.md"
          :error="errors.hasOwnProperty('price')"
          :error-message="errors.price"
          :options="page.currencyFormat"
          class="tw-w-full"
          filled
          label="Factory Price"
        />
      </q-card-section>
      <q-card-actions>
        <q-btn
          v-close-popup
          :loading="table.loading"
          color="warning"
          flat
          label="Batal"/>
        <q-space></q-space>
        <q-btn
          :loading="table.loading"
          color="primary"
          flat
          label="Simpan"
          @click="onSubmit"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
  <div v-if="table.loading"
       class="tw-grid xl:tw-grid-cols-4 lg:tw-grid-cols-3 md:tw-grid-cols-2 tw-grid-cols-1 tw-gap-4">
    <q-card v-for="(i) in 4" :key="i">
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
  </div>
  <div class="tw-grid tw-gap-4">
    <q-toolbar>
      <q-toolbar-title>User Information</q-toolbar-title>
    </q-toolbar>
    <div v-if="!table.loading"
         class="tw-grid xl:tw-grid-cols-4 lg:tw-grid-cols-3 md:tw-grid-cols-2 tw-grid-cols-1 tw-gap-4">
      <q-card>
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

    <q-toolbar>
      <q-toolbar-title>Factory Price</q-toolbar-title>
    </q-toolbar>
    <div v-if="!table.loading"
         class="tw-grid xl:tw-grid-cols-4 lg:tw-grid-cols-3 md:tw-grid-cols-2 tw-grid-cols-1 tw-gap-4">
      <q-card v-for="(factory, index) in factories" :key="index">
        <q-card-section class="row items-center">
          <q-avatar color="primary" icon="money" text-color="white"/>
          <q-space></q-space>
          <div>
            <div class="q-ml-sm tw-text-sm text-right">{{ factory.name }}</div>
            <div class="q-ml-sm text-h5 text-right">{{
                new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR'
                }).format(factory.price?.hasOwnProperty('price') ? factory.price.price : 0)
              }}
            </div>
          </div>
        </q-card-section>
        <q-card-actions>
          <q-chip color="secondary" icon="event" text-color="white">
            {{
              factory.price?.hasOwnProperty('date') ? date.formatDate(factory.price.date, 'DD MMMM YYYY') : date.formatDate(new Date(), 'DD MMMM YYYY')
            }}
          </q-chip>
          <q-space></q-space>
          <q-btn v-if="!factory.price?.hasOwnProperty('date') && can('admin.management.price.savePrice')" color="accent"
                 flat
                 @click="openDialog(index)">
            Set Price
          </q-btn>
        </q-card-actions>
      </q-card>
    </div>
  </div>

</template>


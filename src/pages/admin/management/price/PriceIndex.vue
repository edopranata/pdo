<script setup>
import {usePriceStore} from "stores/management/price";
import {usePageStore} from "stores/pages";
import {useAuthStore} from "stores/auth";
import {storeToRefs} from "pinia";
import {useRoute} from "vue-router";
import {onMounted, watch} from "vue";
import {date} from "quasar";
import QNumber from "components/Input/QNumber.vue";

const {can} = useAuthStore()
const page = usePageStore()
const price = usePriceStore()
const {form, dialog, table} = usePriceStore()
const {
  errors,
  factories_option,
  selected_factory,
  getTradeDate
} = storeToRefs(usePriceStore())

const {path} = useRoute()

watch([selected_factory],( [selectedF]) => {
  if (selectedF) {
    if (selectedF.hasOwnProperty('id')) {
      price.date.events = selectedF.hasOwnProperty('event') ? selectedF.event : []
      form.factory_id = selectedF.id
      table.data = selectedF.hasOwnProperty('price') ? selectedF.price : []
      table.name = selectedF.hasOwnProperty('name') ? selectedF.name : null
    }
  } else {
    price.onReset()
    table.data = []
  }
})

watch(getTradeDate,( newForm) => {
  if(newForm){
    let prices = price.selected_factory.hasOwnProperty('price') ? price.selected_factory.price : []
    let selectedItem = prices.filter( (p) => p.date === newForm)
    form.price = selectedItem.length > 0 ? selectedItem[0].hasOwnProperty('price') ? selectedItem[0].price : 0 : 0
    table.price = selectedItem.length > 0 ? selectedItem[0].hasOwnProperty('price') ? setNumberFormat(selectedItem[0].price) : setNumberFormat(0) : setNumberFormat(0)
    form.id = selectedItem.length > 0 ? selectedItem[0].hasOwnProperty('id') ? selectedItem[0].id : null : null
  }
})
const setNumberFormat = (number) => {
  return new Intl.NumberFormat("id-ID", {style: 'currency', currency: 'IDR'}).format(number)
}
onMounted( () => {
  price.onReset()
  price.getPriceData(path)
})

const searchFactory = (val, update) => {
  update(() => {
    if (val === '') {
      price.factories_option = price.factories.slice(0, 10)
    } else {
      const needle = val.toLowerCase()
      price.factories_option = price.factories.filter(({name}) => name.toLowerCase().indexOf(needle) > -1).slice(0, 10)
    }
  })
}

const onSubmit = async () => {
  await price.submitForm(path)
}

const onReset = () => {
  price.onReset()
}

</script>
<template>
  <q-page class="tw-space-y-4" padding>
    <q-dialog v-model="dialog.open" persistent>
      <q-card class="tw-w-96">
        <q-card-section class="row items-center">
          <q-avatar color="primary" icon="payments" text-color="white"/>
          <q-space></q-space>
          <div>
            <div class="q-ml-sm tw-text-sm text-right">{{ form.price_date }}</div>
            <div class="q-ml-sm text-h5 text-right">{{
                new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR'
                }).format(form.price)
              }}
            </div>
          </div>
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
    <q-card bordered>
      <q-toolbar class="text-primary">
        <q-toolbar-title>
          Delivery Order Price
        </q-toolbar-title>
      </q-toolbar>
      <q-form
        @reset="onReset"
        @submit="dialog.open = true"
      >
        <q-card-section class="tw-space-y-4" v-if="can('admin.management.price.savePrice')">
          <div class="md:tw-grid md:tw-grid-cols-3 md:tw-gap-4">
            <div class="lg:tw-col-span-1 tw-col-span-2">
              <q-select
                v-model="price.selected_factory"
                :dense="$q.screen.lt.md"
                :error="errors.hasOwnProperty('factory_id')"
                :error-message="errors.factory_id"
                :options="factories_option"
                class="tw-w-full"
                clearable
                fill-input
                filled
                hide-selected
                label="Pilih Pabrik"
                option-label="name"
                option-value="id"
                use-input
                @change="price.unsetError('factory_id')"
                @filter="searchFactory">
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section avatar>
                      <q-icon name="person"/>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ scope.opt.name }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      No results
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>

              <q-field
                :dense="$q.screen.lt.md"
                :error="errors.hasOwnProperty('price_date')"
                :error-message="errors.price_date"
                :stack-label="!!form.price_date"
                class="tw-w-full"
                filled
                label="Price Date">
                <template v-slot:control>
                  <div class="self-center full-width no-outline" tabindex="0">
                    {{ date.formatDate(form.price_date, 'DD MMMM YYYY') }}
                  </div>
                </template>
                <template v-slot:append>
                  <q-icon class="cursor-pointer" name="calendar_month" tabindex="0">
                    <q-popup-proxy cover transition-hide="scale" transition-show="scale">
                      <q-date
                        v-model="form.price_date"
                        :options="price.date.period"
                        :events="price.date.events"
                        :subtitle="table.name"
                        :title="table.price"
                      >
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup color="primary" flat label="Close"/>
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
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
              <div class="tw-flex tw-space-x-4">
                <q-btn
                  :disable="form.price_date === null && form.price === null && form.factory_id === null"
                  :dense="$q.screen.lt.lg"
                  label="Simpan data"
                  :loading="table.loading"
                  color="secondary"
                  glossy
                  icon="add_circle"
                  type="submit"
                />
              </div>
            </div>
            <div class="lg:tw-col-span-1 lg:tw-pt-0 tw-pt-4 tw-col-span-2" v-if="table.data.length">
              <q-table
                :title="table.name"
                :rows="table.data"
                :columns="table.headers"
                :rows-per-page-options="[3]"
                row-key="id"
              >
                <template v-slot:body-cell-no="props">
                  <q-td :props="props">
                    {{ props.rowIndex + 1 }}
                  </q-td>
                </template>
                <template v-slot:body-cell-price="props">
                  <q-td :props="props">
                    {{ new Intl.NumberFormat("id-ID", {style: 'currency',
                    currency: 'IDR'}).format(props.value) }}
                  </q-td>
                </template>
              </q-table>
            </div>
          </div>
        </q-card-section>
      </q-form>

    </q-card>
  </q-page>
</template>


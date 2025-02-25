<script setup>
import {useDeliveryOrderDataStore} from "stores/report/deliveryOrderData";
import {useRoute} from "vue-router";
import {onBeforeMount, onMounted, watch} from "vue";
import {storeToRefs} from "pinia";
import {date} from "quasar";
import {useQuasar} from "quasar";

const {path} = useRoute()
const {selected_factory, factories_option, errors, form_empty} = storeToRefs(useDeliveryOrderDataStore())
const {table, form} = useDeliveryOrderDataStore()
const order = useDeliveryOrderDataStore();
const $q = useQuasar()

onBeforeMount(() => {
  order.request_type = 'period'
})

onMounted( async () => {
  order.onReset()

  await order.getDeliveryOrderData(path)
})

watch( selected_factory, (selectedF) => {

  if (selectedF) {
    if (Object.prototype.hasOwnProperty.call(selectedF,'id')) {
      form.factory_id = selectedF.id
    }

  } else {
    form.factory_id = selectedF
  }

})

const searchFactory = (val, update) => {
  update(() => {
    if (val === '') {
      order.factories_option = order.factories.slice(0, 10)
    } else {
      const needle = val.toLowerCase()
      order.factories_option = order.factories.filter(({name}) => name.toLowerCase().indexOf(needle) > -1).slice(0, 10)
    }
  })
}

const onSubmit = async () => {
  await order.getDeliveryFactoryID(path)
}

const exportExcel = async () => {
  $q.dialog({
    title: 'Export Data',
    message: 'Export dan download data pada periode terpilih?',
    cancel: true,
    persistent: true
  }).onOk( async () => {
    await order.exportDataToExcel(path)
  })
}

</script>

<template>
  <q-page class="tw:space-y-4" padding>
    <q-card bordered>
      <q-toolbar class="text-primary">
        <q-toolbar-title>
          Laporan DO Pabrik
        </q-toolbar-title>
      </q-toolbar>
      <q-form
        @submit="onSubmit"
      >
        <q-card-section class="tw:space-y-4">
          <div class="tw:grid tw:md:grid-cols-3 tw:md:gap-4">
              <q-select
                v-model="order.selected_factory"
                :bg-color="!!form.id ? 'yellow-2' : ''"
                :error="errors.hasOwnProperty('factory_id')"
                :error-message="errors.factory_id"
                :options="factories_option"
                class="tw:md:col-span-1 tw:col-span-3"
                clearable
                fill-input
                filled
                hide-selected
                label="Pilih Pabrik"
                option-label="name"
                option-value="id"
                use-input
                @change="order.unsetError('factory_id')"
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
                :error="errors.hasOwnProperty('start_date')"
                :error-message="errors.start_date"
                :stack-label="!!form.start_date"
                class="tw:md:col-span-1 tw:col-span-3"
                filled
                label="Period Start">
                <template v-slot:control>
                  <div class="self-center full-width no-outline" tabindex="0">
                    {{ date.formatDate(form.start_date, 'DD MMMM YYYY') }}
                  </div>
                </template>
                <template v-slot:append>
                  <q-icon class="cursor-pointer" name="calendar_month" tabindex="0">
                    <q-popup-proxy cover transition-hide="scale" transition-show="scale">
                      <q-date v-model="form.start_date">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup color="primary" flat label="Close"/>
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-field>

              <q-field
                :error="errors.hasOwnProperty('end_date')"
                :error-message="errors.end_date"
                :stack-label="!!form.end_date"
                class="tw:md:col-span-1 tw:col-span-3"
                filled
                label="Period End">
                <template v-slot:control>
                  <div class="self-center full-width no-outline" tabindex="0">
                    {{ date.formatDate(form.end_date, 'DD MMMM YYYY') }}
                  </div>
                </template>
                <template v-slot:append>
                  <q-icon class="cursor-pointer" name="calendar_month" tabindex="0">
                    <q-popup-proxy cover transition-hide="scale" transition-show="scale">
                      <q-date v-model="form.end_date">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup color="primary" flat label="Close"/>
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-field>
            </div>
          <div class="tw:md:grid tw:md:grid-cols-3 tw:md:gap-4">
            <div class="q-gutter-sm">
              <q-btn
                :disable="form_empty"
                label="Lihat Data"
                :loading="table.loading"
                color="secondary"
                glossy
                icon="add_circle"
                type="submit"
              />
              <q-btn
                :disable="form_empty"
                label="Export Data"
                :loading="table.loading"
                color="warning"
                glossy
                icon="download"
                @click="exportExcel"
              />
            </div>
          </div>
        </q-card-section>
      </q-form>
        <q-card-section class="no-padding">
          <q-markup-table flat bordered>
            <thead>
            <tr>
              <th class="text-left">No</th>
              <th class="text-left">Customer</th>
              <th class="text-left">Delivery Order Date</th>
              <th class="text-right">Customer Price</th>
              <th class="text-right">Weight</th>
              <th class="text-right">Net Customer</th>
              <th class="text-right">Margin</th>
              <th class="text-right">Factory Price</th>
              <th class="text-right">Gross Total</th>
              <th class="text-right">PPN (Rp)</th>
              <th class="text-right">PPh 22 (Rp)</th>
              <th class="text-right">Bank Transfer</th>
              <th class="text-right">Income</th>
            </tr>
            </thead>
            <tbody v-if="table.data.length > 0">
            <tr class="text-bold bg-primary text-white">
              <td class="text-left"></td>
              <td class="text-left" colspan="2">Total</td>
              <td class="text-right">{{ new Intl.NumberFormat('id-ID', {style: 'currency', currency: "IDR", maximumFractionDigits: 0}).format(table.summaries.customer_price) }}</td>
              <td class="text-right">{{ new Intl.NumberFormat('id-ID', {style: 'unit', unit: "kilogram"}).format(table.summaries.total_weight) }}</td>
              <td class="text-right">{{ new Intl.NumberFormat('id-ID', {style: 'currency', currency: "IDR", maximumFractionDigits: 2}).format(table.summaries.customer_total) }}</td>
              <td class="text-right">{{ new Intl.NumberFormat('id-ID', {style: 'currency', currency: "IDR", maximumFractionDigits: 0}).format(table.summaries.margin) }}</td>
              <td class="text-right">{{ new Intl.NumberFormat('id-ID', {style: 'currency', currency: "IDR", maximumFractionDigits: 0}).format(table.summaries.factory_price) }}</td>
              <td class="text-right">{{ new Intl.NumberFormat('id-ID', {style: 'currency', currency: "IDR", maximumFractionDigits: 2}).format(table.summaries.gross_total) }}</td>
              <td class="text-right">{{ new Intl.NumberFormat('id-ID', {style: 'currency', currency: "IDR", maximumFractionDigits: 2}).format(table.summaries.ppn_total) }}</td>
              <td class="text-right">{{ new Intl.NumberFormat('id-ID', {style: 'currency', currency: "IDR", maximumFractionDigits: 2}).format(table.summaries.pph22_total) }}</td>
              <td class="text-right">{{ new Intl.NumberFormat('id-ID', {style: 'currency', currency: "IDR", maximumFractionDigits: 2}).format(table.summaries.total) }}</td>
              <td class="text-right">{{ new Intl.NumberFormat('id-ID', {style: 'currency', currency: "IDR", maximumFractionDigits: 2}).format(parseFloat(table.summaries.gross_total) - (table.summaries.customer_total + table.summaries.pph22_total)) }}</td>
            </tr>
            <tr v-for="(item, index) in table.data" :key="item.id">
              <td class="text-left">{{ index + 1 }}</td>
              <td class="text-left">{{ item.customer.hasOwnProperty('name') ? item.customer.name : '' }}</td>
              <td class="text-left">{{ item.trade_date }}</td>
              <td class="text-right">{{ new Intl.NumberFormat('id-ID', {style: 'currency', currency: "IDR", maximumFractionDigits: 0}).format(item.customer_price) }}</td>
              <td class="text-right">{{ new Intl.NumberFormat('id-ID', {style: 'unit', unit: "kilogram"}).format(item.net_weight) }}</td>
              <td class="text-right">{{ new Intl.NumberFormat('id-ID', {style: 'currency', currency: "IDR", maximumFractionDigits: 2}).format(item.customer_total) }}</td>
              <td class="text-right">{{ new Intl.NumberFormat('id-ID', {style: 'currency', currency: "IDR", maximumFractionDigits: 0}).format(item.margin) }}</td>
              <td class="text-right">{{ new Intl.NumberFormat('id-ID', {style: 'currency', currency: "IDR", maximumFractionDigits: 0}).format(item.net_price) }}</td>
              <td class="text-right">{{ new Intl.NumberFormat('id-ID', {style: 'currency', currency: "IDR", maximumFractionDigits: 2}).format(item.gross_total) }}</td>
              <td class="text-right">{{ new Intl.NumberFormat('id-ID', {style: 'currency', currency: "IDR", maximumFractionDigits: 2}).format(item.ppn_total) }}</td>
              <td class="text-right">{{ new Intl.NumberFormat('id-ID', {style: 'currency', currency: "IDR", maximumFractionDigits: 2}).format(item.pph22_total) }}</td>
              <td class="text-right">{{ new Intl.NumberFormat('id-ID', {style: 'currency', currency: "IDR", maximumFractionDigits: 2}).format((parseFloat(item.gross_total) + parseFloat(item.ppn_total)) - parseFloat(item.pph22_total)) }}</td>
              <td class="text-right">{{ new Intl.NumberFormat('id-ID', {style: 'currency', currency: "IDR", maximumFractionDigits: 2}).format(parseFloat(item.gross_total) - (parseFloat(item.customer_total) + parseFloat(item.pph22_total))) }}</td>
            </tr>

            </tbody>
          </q-markup-table>
        </q-card-section>
    </q-card>
  </q-page>

</template>


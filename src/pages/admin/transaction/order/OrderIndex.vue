<script setup>
import {useOrderStore} from "stores/transaction/order";
import {useAuthStore} from "stores/auth";
import {usePageStore} from "stores/pages";
import {useRoute} from "vue-router";
import {onMounted, reactive, ref, watch} from "vue";
import {storeToRefs} from "pinia";
import {date, useQuasar} from "quasar";
import QNumber from "components/Input/QNumber.vue";

const page = usePageStore()
const {path} = useRoute()
const {can} = useAuthStore()
const {form, table} = useOrderStore()
const deliveries = useOrderStore()
const {
  errors,
  customers_option,
  selected_customer,
  factories_option,
  selected_factory,
  form: formField,
  getSelected: selected
} = storeToRefs(useOrderStore())
const tableRef = ref()
const $q = useQuasar()


const onRequest = async (props) => {
  await deliveries.getDeliveriesData(path, props)
}
const calc = reactive({
  customer_weight: {type: Number, default: 0},
  customer_price: {type: Number, default: 0},
  customer_total_price: {type: Number, default: 0},
})
onMounted(async () => {
  deliveries.onReset()
  // if(setting.hasOwnProperty('do_margin')){
  //   form.margin = setting.do_margin
  // }
  tableRef.value.requestServerInteraction()
  await deliveries.getCustomerAndFactoryData(path)
})

const formattedNUmber = (calcItem, format = 'currency') => {

  const options = {}
  options.style = format

  if (format === "currency") {
    options.currency = "IDR"
  } else {
    options.unit = "kilogram"
  }

  return new Intl.NumberFormat('id-ID', options).format(calc[calcItem])
}

const searchCustomer = (val, update) => {
  update(() => {
    if (val === '') {
      deliveries.customers_option = deliveries.customers.slice(0, 10)
    } else {
      const needle = val.toLowerCase()
      deliveries.customers_option = deliveries.customers.filter(({name}) => name.toLowerCase().indexOf(needle) > -1).slice(0, 10)
    }
  })
}

watch([selected_customer, selected_factory], ([selectedC, selectedF]) => {
  if (selectedC) {
    if (selectedC.hasOwnProperty('id')) {
      form.customer_id = selectedC.id
      form.loan = selectedC.loan
      table.search.customer_id = selectedC.id
    }

  } else {
    form.customer_id = selectedC
    form.loan = selectedC
    table.search.customer_id = selectedC
  }

  if (selectedF) {
    if (selectedF.hasOwnProperty('id')) {
      form.factory_id = selectedF.id
      form.ppn_tax = selectedF.ppn_tax
      form.pph22_tax = selectedF.pph22_tax

      table.search.factory_id = selectedF.id
    }

  } else {
    form.factory_id = selectedF
    form.ppn_tax = selectedF
    form.pph22_tax = selectedF
    table.search.factory_id = selectedF
  }

  tableRef.value.requestServerInteraction()

})

const searchFactory = (val, update) => {
  update(() => {
    if (val === '') {
      deliveries.factories_option = deliveries.factories.slice(0, 10)
    } else {
      const needle = val.toLowerCase()
      deliveries.factories_option = deliveries.factories.filter(({name}) => name.toLowerCase().indexOf(needle) > -1).slice(0, 10)
    }
  })
}

watch(form, async (update) => {
  if (update.factory_id  && update.trade_date ) {
    let date = form.trade_date
    let prices = deliveries.selected_factory.hasOwnProperty('prices') ? deliveries.selected_factory.prices : []

    let price = prices.filter( (p) => p.date === date)

    form.net_price = price.length > 0 ? price[0].hasOwnProperty('price') ? price[0]['price'] : 0 : 0
  }
}, {deep: true})

watch(formField, async (newValue) => {
  for (let property in newValue) {
    if (!!newValue[property]) {
      deliveries.unsetError(property)
    }
  }
  if (newValue.customer_price && newValue.net_weight && newValue.pph22_tax && newValue.ppn_tax) {
    calc.customer_weight = parseFloat(newValue.net_weight)
    calc.customer_price = form.customer_price
    calc.customer_total_price = calc.customer_price * calc.customer_weight

    form.margin = form.net_price - form.customer_price

    form.gross_total = parseFloat(newValue.net_price) * parseFloat(newValue.net_weight)

    form.ppn = form.ppn_tax ? parseFloat(form.gross_total) * parseFloat(newValue.ppn_tax) / 100 : null
    form.pph22 = form.pph22_tax ? parseFloat(form.gross_total) * parseFloat(newValue.pph22_tax) / 100 : null

    form.net_total = parseFloat(newValue.net_weight) * parseFloat(form.margin)

  } else {
    for (let property in calc) {
      calc[property] = ''
    }
  }
}, {
  deep: true
})

const onSubmit = () => {
  $q.dialog({
    title: form.id ? 'Update data' : 'Simpan data',
    message: 'Apakah data yang di input sudah benar?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    deliveries.submitForm(path)
  })
}
const onReset = () => {
  deliveries.onReset()
}
const onDelete = () => {
  $q.dialog({
    title: 'Hapus data',
    message: '<div class="text-red">Apakah anda yakin akan menghapus data ini?</div>',
    html: true,

    cancel: true,
    persistent: true
  }).onOk(() => {
    deliveries.submitDelete(path)
  })
}
const onUpdate = () => {
  $q.dialog({
    title: 'Ubah Data',
    message: '<div class="text-warning">Apakah anda yakin akan mengubah data ini?</div>',
    html: true,

    cancel: true,
    persistent: true
  }).onOk(() => {
    const sel = table.selected.length === 1 ? table.selected[0] : []
    for (let property in form) {
      form[property] = sel[property]
    }
    if (form.customer_id) {
      let c = deliveries.customers.filter(cus => cus.id === form.customer_id)
      deliveries.selected_customer = c[0]
    }
    if (form.factory_id) {
      let c = deliveries.factories.filter(fact => fact.id === form.factory_id)
      deliveries.selected_factory = c[0]
    }
    if (form.trade_date) {
      form.trade_date = form.trade_date.split(' ')[0]
    }
  })
}
</script>
<template>
  <q-page class="tw-space-y-4" padding>
    <q-card v-if="can('admin.transaction.order.[createOrder,updateOrder,deleteOrder]')" bordered>
      <q-form
        class="tw-w-full"
        @reset="onReset"
        @submit="onSubmit"
      >
        <q-card-section>
          <div :class="$q.screen.lt.md ? 'tw-font-bold' : 'text-h6'" class="q-mt-sm q-mb-xs">Delivery Order</div>
          <div class="tw-grid lg:tw-gap-4 tw-gap-2 lg:tw-grid-cols-5 md:tw-grid-cols-4 tw-grid-cols-2">
            <q-select
              v-model="deliveries.selected_factory"
              :bg-color="!!form.id ? 'yellow-2' : ''"
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
              @change="deliveries.unsetError('factory_id')"
              @filter="searchFactory">
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <q-icon name="factory"/>
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
              :bg-color="!!form.id ? 'yellow-2' : ''"
              :dense="$q.screen.lt.md"
              :error="errors.hasOwnProperty('trade_date')"
              :error-message="errors.trade_date"
              :stack-label="!!form.trade_date"
              class="tw-w-full"
              filled
              label="Tanggal DO">
              <template v-slot:control>
                <div class="self-center full-width no-outline" tabindex="0">
                  {{ date.formatDate(form.trade_date, 'DD MMMM YYYY') }}
                </div>
              </template>
              <template v-slot:append>
                <q-icon class="cursor-pointer" name="event" tabindex="0">
                  <q-popup-proxy cover transition-hide="scale" transition-show="scale">
                    <q-date
                      v-model="form.trade_date"
                      :title="`Rp. ${new Intl.NumberFormat('en-US').format(form.net_price ?? 0)}`"
                      :subtitle="date.formatDate(form.trade_date, 'dddd, DD MMMM YYYY')"
                    >
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup color="primary" flat label="Close"/>
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-field>
          </div>

          <div :class="$q.screen.lt.md ? 'tw-font-bold' : 'text-h6'" class="q-mt-sm q-mb-xs">Customer</div>
          <div class="tw-grid lg:tw-gap-4 tw-gap-2 lg:tw-grid-cols-5 md:tw-grid-cols-4 tw-grid-cols-2">
            <q-select
              v-model="deliveries.selected_customer"
              :bg-color="!!form.id ? 'yellow-2' : ''"
              :dense="$q.screen.lt.md"
              :error="errors.hasOwnProperty('customer_id')"
              :error-message="errors.customer_id"
              :options="customers_option"
              class="tw-w-full"
              clearable
              fill-input
              filled
              hide-selected
              label="Pilih Pengepul"
              option-label="name"
              option-value="id"
              use-input
              @change="deliveries.unsetError('customer_id')"
              @filter="searchCustomer">
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <q-icon name="person"/>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ scope.opt.name }}</q-item-label>
                    <q-item-label caption>
                      <q-icon name="phone"/>
                      {{ scope.opt.phone }}
                    </q-item-label>
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
              v-if="form.loan > 0"
              :dense="$q.screen.lt.md"
              bg-color="blue-grey"
              color="blue-grey-2"
              filled
              label="Pinjaman pengepul"
              stack-label
              tabindex="-1">
              <template v-slot:control>
                <div class="self-center full-width no-outline" tabindex="-1">
                  {{ new Intl.NumberFormat('id-ID', {style: 'currency', currency: "IDR"}).format(form.loan ?? 0) }}
                </div>
              </template>
            </q-field>

          </div>

          <div :class="$q.screen.lt.md ? 'tw-font-bold' : 'text-h6'" class="q-mt-sm q-mb-xs">Data Timbangan dan harga beli customer</div>
          <div class="tw-grid lg:tw-gap-4 tw-gap-2 lg:tw-grid-cols-5 md:tw-grid-cols-4 tw-grid-cols-3">
            <q-number
              v-model="form.net_weight"
              :bg-color="!!form.id ? 'yellow-2' : ''"
              :dense="$q.screen.lt.md"
              :error="errors.hasOwnProperty('net_weight')"
              :error-message="errors.net_weight"
              :options="page.unitFormat"
              class="tw-w-full"
              filled
              label="Berat bersih (pabrik)"
            />

            <q-number
              v-model="form.customer_price"
              :bg-color="!!form.id ? 'yellow-2' : ''"
              :dense="$q.screen.lt.md"
              :error="errors.hasOwnProperty('customer_price')"
              :error-message="errors.customer_price"
              :options="page.currencyFormat"
              class="tw-w-full"
              filled
              label="Harga beli (pengepul)"
            />
          </div>
          <!-- PPN -->
          <div class="tw-grid lg:tw-gap-4 tw-gap-2 lg:tw-grid-cols-5 md:tw-grid-cols-4 tw-grid-cols-3">
            <q-number
              v-model="form.ppn_tax"
              :bg-color="!!form.id ? 'yellow-2' : ''"
              :dense="$q.screen.lt.md"
              :error="errors.hasOwnProperty('ppn_tax')"
              :error-message="errors.ppn_tax"
              :options="page.percentFormat"
              class="tw-w-full"
              filled
              label="PPN (%)"
            />


            <q-field
              :dense="$q.screen.lt.md"
              bg-color="blue-grey"
              color="blue-grey-2"
              filled
              label="PPN (Rp)"
              stack-label
              tabindex="-1">
              <template v-slot:control>
                <div class="self-center full-width no-outline" tabindex="-1">
                  {{ new Intl.NumberFormat('id-ID', {style: 'currency', currency: "IDR"}).format(form.ppn) }}
                </div>
              </template>
            </q-field>

          </div>

          <!-- PPH 22 -->
          <div class="tw-grid lg:tw-gap-4 tw-gap-2 lg:tw-grid-cols-5 md:tw-grid-cols-4 tw-grid-cols-3">
            <q-number
              v-model="form.pph22_tax"
              :bg-color="!!form.id ? 'yellow-2' : ''"
              :dense="$q.screen.lt.md"
              :error="errors.hasOwnProperty('pph22_tax')"
              :error-message="errors.pph22_tax"
              :options="page.percentFormat"
              class="tw-w-full"
              filled
              label="PPh 22 (%)"
            />

            <q-field
              :dense="$q.screen.lt.md"
              bg-color="blue-grey"
              color="blue-grey-2"
              filled
              label="PPh 22 (Rp)"
              stack-label
              tabindex="-1">
              <template v-slot:control>
                <div class="self-center full-width no-outline" tabindex="-1">
                  {{ new Intl.NumberFormat('id-ID', {style: 'currency', currency: "IDR"}).format(form.pph22) }}
                </div>
              </template>
            </q-field>
          </div>

          <div class="tw-grid lg:tw-gap-4 tw-gap-2 lg:tw-grid-cols-5 md:tw-grid-cols-4 tw-grid-cols-3">
            <q-field
              :dense="$q.screen.lt.md"
              bg-color="blue-grey"
              color="blue-grey-2"
              filled
              :error="errors.hasOwnProperty('net_price')"
              :error-message="errors.net_price"
              label="Harga Pabrik (Rp)"
              stack-label
              tabindex="-1">
              <template v-slot:control>
                <div class="self-center full-width no-outline" tabindex="-1">
                  {{ new Intl.NumberFormat('id-ID', {style: 'currency', currency: "IDR"}).format(form.net_price) }}
                </div>
              </template>
            </q-field>

            <q-field
              :dense="$q.screen.lt.md"
              bg-color="blue-grey"
              color="blue-grey-2"
              filled
              :error="errors.hasOwnProperty('margin')"
              :error-message="errors.margin"
              label="Margin (Rp)"
              stack-label
              tabindex="-1">
              <template v-slot:control>
                <div class="self-center full-width no-outline" tabindex="-1">
                  {{ new Intl.NumberFormat('id-ID', {style: 'currency', currency: "IDR"}).format(form.margin) }}
                </div>
              </template>
            </q-field>
          </div>

          <div class="tw-grid lg:tw-gap-4 tw-gap-2 lg:tw-grid-cols-5 md:tw-grid-cols-4 tw-grid-cols-3">
            <q-field
              :dense="$q.screen.lt.md"
              bg-color="blue-grey"
              color="blue-grey-2"
              filled
              label="Total (Bruto)"
              stack-label
              tabindex="-1">
              <template v-slot:control>
                <div class="self-center full-width no-outline" tabindex="-1">
                  {{ new Intl.NumberFormat('id-ID', {style: 'currency', currency: "IDR"}).format(form.gross_total) }}
                </div>
              </template>
            </q-field>

            <q-field
              :dense="$q.screen.lt.md"
              bg-color="blue-grey"
              color="blue-grey-2"
              filled
              label="Pendapatan (margin)"
              stack-label
              tabindex="-1">
              <template v-slot:control>
                <div class="self-center full-width no-outline" tabindex="-1">
                  {{ new Intl.NumberFormat('id-ID', {style: 'currency', currency: "IDR"}).format(form.net_total) }}
                </div>
              </template>
            </q-field>
          </div>

          <div :class="$q.screen.lt.md ? 'tw-font-bold' : 'text-h6'" class="q-mt-sm q-mb-xs">Beli dari Petani</div>
          <div class="tw-grid lg:tw-gap-4 tw-gap-2 lg:tw-grid-cols-5 md:tw-grid-cols-4 tw-grid-cols-3">
            <q-field
              :dense="$q.screen.lt.md"
              bg-color="blue-grey"
              color="blue-grey-2"
              filled
              label="Berat Bersih (pabrik)"
              stack-label
              tabindex="-1">
              <template v-slot:control>
                <div class="self-center full-width no-outline" tabindex="-1">
                  {{ formattedNUmber('customer_weight', 'unit') }}
                </div>
              </template>
            </q-field>
            <q-field
              :dense="$q.screen.lt.md"
              bg-color="blue-grey"
              color="blue-grey-2"
              filled
              label="Harga jual (pengepul)"
              stack-label
              tabindex="-1">
              <template v-slot:control>
                <div class="self-center full-width no-outline" tabindex="-1">{{ formattedNUmber('customer_price') }}
                </div>
              </template>
            </q-field>

            <q-field
              :dense="$q.screen.lt.md"
              bg-color="blue-grey"
              color="blue-grey-2"
              filled
              label="Total terima (pengepul)"
              stack-label
              tabindex="-1">
              <template v-slot:control>
                <div class="self-center full-width no-outline" tabindex="-1">
                  {{ formattedNUmber('customer_total_price') }}
                </div>
              </template>
            </q-field>
          </div>
        </q-card-section>
        <q-card-actions class="tw-p-4">
          <q-btn
            v-if="can('admin.transaction.order.createOrder')"
            :dense="$q.screen.lt.lg"
            :disable="!form.factory_id"
            :label="!$q.screen.lt.md ? 'Simpan' : ''"
            :loading="table.loading"
            :round="$q.screen.lt.md"
            :size="$q.screen.lt.lg ? 'md' : 'lg'"
            color="secondary"
            glossy
            icon="add_circle"
            type="submit"
          >
            <q-tooltip>
              Simpan transaksi DO
            </q-tooltip>
          </q-btn>
          <q-btn
            v-if="can('admin.transaction.order.[createOrder,updateOrder,deleteOrder]')"
            :dense="$q.screen.lt.lg"
            :label="!$q.screen.lt.md ? 'Batalkan' : ''"
            :loading="table.loading"
            :round="$q.screen.lt.md"
            :size="$q.screen.lt.lg ? 'md' : 'lg'"
            color="primary"
            glossy
            icon="cancel"
            type="reset">
            <q-tooltip>
              Hapus isian yang ada di form
            </q-tooltip>
          </q-btn>
          <q-space></q-space>
          <q-btn
            v-if="can('admin.transaction.invoice.showInvoice') && can('admin.transaction.invoice.index')"
            :dense="$q.screen.lt.lg"
            :disable="!form.customer_id || !table.data.length"
            :label="!$q.screen.lt.md ? 'Invoice' : ''"
            :loading="table.loading"
            :round="$q.screen.lt.md"
            :size="$q.screen.lt.lg ? 'md' : 'lg'"
            :to="{name:'admin.transaction.invoice.showInvoice', params: {id: form.customer_id ?? '0' }}"
            color="positive"
            glossy
            icon="document_scanner"
          >
            <q-tooltip>
              Create invoice
            </q-tooltip>
          </q-btn>
          <q-btn
            v-if="can('admin.transaction.order.deleteOrder')"
            :dense="$q.screen.lt.lg"
            :disable="selected.length !== 1"
            :label="!$q.screen.lt.md ? 'Hapus' : ''"
            :loading="table.loading"
            :round="$q.screen.lt.md"
            :size="$q.screen.lt.lg ? 'md' : 'lg'"
            color="negative"
            glossy
            icon="delete"
            @click.stop="onDelete"
          >
            <q-tooltip>
              Hapus transaksi DO yang terpilih
            </q-tooltip>
          </q-btn>
          <q-btn
            v-if="can('admin.transaction.order.updateOrder')"
            :dense="$q.screen.lt.lg"
            :disable="selected.length !== 1"
            :label="!$q.screen.lt.md ? 'Ubah' : ''"
            :loading="table.loading"
            :round="$q.screen.lt.md"
            :size="$q.screen.lt.lg ? 'md' : 'lg'"
            color="warning"
            glossy
            icon="edit"
            @click.stop="onUpdate"
          >

            <q-tooltip>
              Ubah data transaksi DO yang terpilih
            </q-tooltip>
          </q-btn>
        </q-card-actions>
      </q-form>
    </q-card>
    <q-card>
      <q-table
        ref="tableRef"
        v-model:pagination="table.pagination"
        v-model:selected="table.selected"
        :columns="table.headers ?? []"
        :dense="$q.screen.lt.md"
        :filter="table.filter"
        :loading="table.loading"
        :rows="table.data ?? []"
        binary-state-sort
        bordered
        row-key="id"
        selection="single"
        @request="onRequest"
      >

        <template v-slot:body-selection="scope">
          <q-checkbox v-model="scope.selected"
                      :disable="scope.row.customer_name === 'Plantation' || scope.row.customer_name === 'Trading'"/>
        </template>

        <template v-slot:body-cell-no="props">
          <q-td :props="props">
            {{ props.rowIndex + 1 }}
          </q-td>
        </template>

        <template v-slot:body-cell-net_weight="props">
          <q-td :props="props" class="text-right">
            {{ Intl.NumberFormat('id-ID', {style: 'unit', unit: 'kilogram'}).format(props.value) }}
          </q-td>
        </template>

        <template v-slot:body-cell-factory_name="props">
          <q-td :props="props">
            {{ props.row.factory?.name }}
          </q-td>
        </template>

        <template v-slot:body-cell-customer_name="props">
          <q-td :props="props">
            {{ props.row.customer?.name }}
          </q-td>
        </template>

        <template v-slot:body-cell-net_price="props">
          <q-td :props="props" class="tw-max-w-44">
            {{
              Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
              }).format(props.value)
            }}
          </q-td>
        </template>

        <template v-slot:body-cell-margin="props">
          <q-td :props="props" class="text-right">
            {{
              Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
              }).format(props.value)
            }}
          </q-td>
        </template>

        <template v-slot:body-cell-gross_total="props">
          <q-td :props="props" class="text-right">
            {{
              Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
              }).format(props.value)
            }}
          </q-td>
        </template>

        <template v-slot:body-cell-net_total="props">
          <q-td :props="props" class="text-right">
            {{
              Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
              }).format(props.value)
            }}
          </q-td>
        </template>

        <template v-slot:body-cell-net_customer="props">
          <q-td :props="props" class="text-right">
            {{
              Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
              }).format(props.row.gross_total - props.row.net_total)
            }}
          </q-td>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>


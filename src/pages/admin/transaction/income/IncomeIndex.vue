<script setup>
import {useIncomeStore} from "stores/transaction/income";
import {useAuthStore} from "stores/auth";
import {storeToRefs} from "pinia";
import {useRoute} from "vue-router";
import {onMounted, ref, watch} from "vue";
import {date} from "quasar";

const {can} = useAuthStore()
const income = useIncomeStore()
const {form, dialog} = useIncomeStore()
const {
  table,
  errors,
  factories_option,
  selected_factory,
} = storeToRefs(useIncomeStore())

const {path} = useRoute()

const tableRef = ref()

watch([selected_factory], ([selectedF]) => {
  if (selectedF) {
    if (selectedF.hasOwnProperty('id')) {
      form.factory_id = selectedF.id
    }
  } else {
    form.factory_id = selectedF
  }
})

watch([form], async ([newForm]) => {
  if (newForm.factory_id && newForm.period_start && newForm.period_end) {
    await income.getIncomeData(path)
  }
  income.errors = {}
})

onMounted(async () => {
  income.onReset()
  income.order = null
  income.errors = []
  income.table.data = []
  income.table.orders = null
  await income.getIncomeData(path)
})

const searchFactory = (val, update) => {
  update(() => {
    if (val === '') {
      income.factories_option = income.factories.slice(0, 10)
    } else {
      const needle = val.toLowerCase()
      income.factories_option = income.factories.filter(({name}) => name.toLowerCase().indexOf(needle) > -1).slice(0, 10)
    }
  })
}

const onSubmit = async () => {
  await income.submitForm(path)
}

const onReset = () => {
  income.onReset()
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
            <div class="q-ml-sm tw-text-sm text-right">Total terima (Bank Transfer)</div>
            <div class="q-ml-sm text-h5 text-right">{{
                new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR'
                }).format(table.orders ? table.orders.hasOwnProperty('total') ? table.orders.total : 0 : 0)
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
          Buat Nota / Invoice
        </q-toolbar-title>
      </q-toolbar>
      <q-form
        @reset="onReset"
        @submit="dialog.open = true"
      >
        <q-card-section v-if="can('admin.transaction.income.createIncome')" class="tw-space-y-4">
          <div class="md:tw-grid md:tw-grid-cols-3 md:tw-gap-4">
            <div class="lg:tw-col-span-1 tw-col-span-2">
              <q-select
                v-model="income.selected_factory"
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
                @change="income.unsetError('factory_id')"
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
                :error="errors.hasOwnProperty('period_start')"
                :error-message="errors.period_start"
                :stack-label="!!form.period_start"
                class="tw-w-full"
                filled
                label="Period Start">
                <template v-slot:control>
                  <div class="self-center full-width no-outline" tabindex="0">
                    {{ date.formatDate(form.period_start, 'DD MMMM YYYY') }}
                  </div>
                </template>
                <template v-slot:append>
                  <q-icon class="cursor-pointer" name="calendar_month" tabindex="0">
                    <q-popup-proxy cover transition-hide="scale" transition-show="scale">
                      <q-date v-model="form.period_start">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup color="primary" flat label="Close"/>
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-field>

              <q-field
                :dense="$q.screen.lt.md"
                :error="errors.hasOwnProperty('period_end')"
                :error-message="errors.period_end"
                :stack-label="!!form.period_end"
                class="tw-w-full"
                filled
                label="Period End">
                <template v-slot:control>
                  <div class="self-center full-width no-outline" tabindex="0">
                    {{ date.formatDate(form.period_end, 'DD MMMM YYYY') }}
                  </div>
                </template>
                <template v-slot:append>
                  <q-icon class="cursor-pointer" name="calendar_month" tabindex="0">
                    <q-popup-proxy cover transition-hide="scale" transition-show="scale">
                      <q-date v-model="form.period_end">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup color="primary" flat label="Close"/>
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-field>

              <q-field
                :dense="$q.screen.lt.md"
                :error="errors.hasOwnProperty('trade_date')"
                :error-message="errors.trade_date"
                :stack-label="!!form.trade_date"
                class="tw-w-full"
                filled
                label="Income Date">
                <template v-slot:control>
                  <div class="self-center full-width no-outline" tabindex="0">
                    {{ date.formatDate(form.trade_date, 'DD MMMM YYYY') }}
                  </div>
                </template>
                <template v-slot:append>
                  <q-icon class="cursor-pointer" name="calendar_month" tabindex="0">
                    <q-popup-proxy cover transition-hide="scale" transition-show="scale">
                      <q-date v-model="form.trade_date">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup color="primary" flat label="Close"/>
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-field>
              <div class="tw-flex tw-space-x-4">
                <q-btn
                  :dense="$q.screen.lt.lg"
                  :label="!$q.screen.lt.md ? 'Simpan data' : ''"
                  :loading="table.loading"
                  :round="$q.screen.lt.md"
                  color="secondary"
                  glossy
                  icon="add_circle"
                  type="submit"
                />
              </div>
            </div>
            <div>
              <q-field
                :dense="$q.screen.lt.md"
                bg-color="blue-grey"
                color="blue-grey-2"
                filled
                hint=""
                label="Gross Total (Rp)"
                stack-label
                tabindex="-1">
                <template v-slot:control>
                  <div class="self-center full-width no-outline" tabindex="-1">
                    {{
                      Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        maximumFractionDigits: 2,
                      }).format(table.orders ? table.orders.hasOwnProperty('gross_total') ? table.orders.gross_total : 0 : 0)
                    }}
                  </div>
                </template>
              </q-field>
              <q-field
                :dense="$q.screen.lt.md"
                bg-color="blue-grey"
                color="blue-grey-2"
                filled
                hint=""
                label="PPN (Rp)"
                stack-label
                tabindex="-1">
                <template v-slot:control>
                  <div class="self-center full-width no-outline" tabindex="-1">
                    {{
                      Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        maximumFractionDigits: 2,
                      }).format(table.orders ? table.orders.hasOwnProperty('ppn_total') ? table.orders.ppn_total : 0 : 0)
                    }}
                  </div>
                </template>
              </q-field>
              <q-field
                :dense="$q.screen.lt.md"
                bg-color="blue-grey"
                color="blue-grey-2"
                filled
                hint=""
                label="PPh 22 (Rp)"
                stack-label
                tabindex="-1">
                <template v-slot:control>
                  <div class="self-center full-width no-outline" tabindex="-1">
                    {{
                      Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        maximumFractionDigits: 2,
                      }).format(table.orders ? table.orders.hasOwnProperty('pph22_total') ? table.orders.pph22_total : 0 : 0)
                    }}
                  </div>
                </template>
              </q-field>
              <q-field
                :dense="$q.screen.lt.md"
                :error="errors.hasOwnProperty('total')"
                :error-message="errors.total"
                bg-color="blue-grey"
                color="blue-grey-2"
                filled
                hint=""
                label="Income (Bank Transfer)"
                stack-label
                tabindex="-1">
                <template v-slot:control>
                  <div class="self-center full-width no-outline" tabindex="-1">
                    {{
                      Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        maximumFractionDigits: 2,
                      }).format(table.orders ? table.orders.hasOwnProperty('total') ? table.orders.total : 0 : 0)
                    }}
                  </div>
                </template>
              </q-field>
            </div>
          </div>
        </q-card-section>
      </q-form>
      <q-card-section class="no-padding">
        <q-table
          ref="tableRef"
          :title="selected_factory ? selected_factory.hasOwnProperty('name') ? selected_factory.name : '' : ''"
          :rows="table.data"
          :columns="table.headers"
          row-key="id"
        >
          <template v-slot:body-cell-no="props">
            <q-td :props="props">
              {{ props.rowIndex + 1 }}
            </q-td>
          </template>

          <template v-slot:body-cell-factory_name="props">
            <q-td :props="props">
              {{ props.value.hasOwnProperty('name') ? props.value.name : '' }}
            </q-td>
          </template>

          <template v-slot:body-cell-customer_name="props">
            <q-td :props="props">
              {{ props.value.hasOwnProperty('name') ? props.value.name : '' }}
            </q-td>
          </template>

          <template v-slot:body-cell-net_weight="props">
            <q-td :props="props">
              {{
                new Intl.NumberFormat('id-ID', {
                  style: 'unit',
                  unit: 'kilogram'
                }).format(props.value)
              }}
            </q-td>
          </template>

          <template v-slot:body-cell-net_price="props">
            <q-td :props="props">
              {{
                new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0
                }).format(props.value)
              }}
            </q-td>
          </template>

          <template v-slot:body-cell-gross_total="props">
            <q-td :props="props">
              {{
                new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0
                }).format(props.value)
              }}
            </q-td>
          </template>

          <template v-slot:body-cell-ppn_total="props">
            <q-td :props="props">
              {{
                new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0
                }).format(props.value)
              }}
            </q-td>
          </template>

          <template v-slot:body-cell-pph22_total="props">
            <q-td :props="props">
              {{
                new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0
                }).format(props.value)
              }}
            </q-td>
          </template>

          <template v-slot:body-cell-total="props">
            <q-td :props="props">
              {{
                new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0
                }).format(props.value)
              }}
            </q-td>
          </template>
        </q-table>
<!--        <q-markup-table>-->
<!--          <thead>-->
<!--          <tr>-->
<!--            <th class="text-left">No</th>-->
<!--            <th class="text-left">Trade Date</th>-->
<!--            <th class="text-left">Factory</th>-->
<!--            <th class="text-right">Net Weight (kg)</th>-->
<!--            <th class="text-right">Price (Rp)</th>-->
<!--            <th class="text-right">Total</th>-->
<!--            <th class="text-right">PPN</th>-->
<!--            <th class="text-right">PPh 22</th>-->
<!--            <th class="text-right">Net Total</th>-->
<!--          </tr>-->
<!--          </thead>-->
<!--          <tbody v-if="table.data.length > 0">-->
<!--          <tr v-for="( order, i) in table.data" :key="i">-->
<!--            <td>-->
<!--              {{ i + 1 }}-->
<!--            </td>-->
<!--            <td>{{ order.trade_date }}</td>-->
<!--            <td>-->
<!--              {{ order.factory?.name }}-->
<!--            </td>-->
<!--            <td class="text-right">-->
<!--              {{-->
<!--                new Intl.NumberFormat('id-ID', {-->
<!--                  style: 'unit',-->
<!--                  unit: 'kilogram'-->
<!--                }).format(order.net_weight)-->
<!--              }}-->
<!--            </td>-->
<!--            <td class="text-right">-->
<!--              {{-->
<!--                new Intl.NumberFormat('id-ID', {-->
<!--                  style: 'currency',-->
<!--                  currency: 'IDR',-->
<!--                  maximumFractionDigits: 0-->
<!--                }).format(order.net_price)-->
<!--              }}-->
<!--            </td>-->
<!--            <td class="text-right">-->
<!--              {{-->
<!--                new Intl.NumberFormat('id-ID', {-->
<!--                  style: 'currency',-->
<!--                  currency: 'IDR',-->
<!--                  maximumFractionDigits: 0-->
<!--                }).format(order.gross_total)-->
<!--              }}-->
<!--            </td>-->
<!--            <td class="text-right">-->
<!--              {{-->
<!--                new Intl.NumberFormat('id-ID', {-->
<!--                  style: 'currency',-->
<!--                  currency: 'IDR',-->
<!--                  maximumFractionDigits: 0-->
<!--                }).format(order.ppn_total)-->
<!--              }}-->
<!--            </td>-->
<!--            <td class="text-right">-->
<!--              {{-->
<!--                new Intl.NumberFormat('id-ID', {-->
<!--                  style: 'currency',-->
<!--                  currency: 'IDR',-->
<!--                  maximumFractionDigits: 0-->
<!--                }).format(order.pph22_total)-->
<!--              }}-->
<!--            </td>-->
<!--            <td class="text-right">-->
<!--              {{-->
<!--                new Intl.NumberFormat('id-ID', {-->
<!--                  style: 'currency',-->
<!--                  currency: 'IDR',-->
<!--                  maximumFractionDigits: 0-->
<!--                }).format(order.total)-->
<!--              }}-->
<!--            </td>-->
<!--          </tr>-->
<!--          </tbody>-->
<!--        </q-markup-table>-->

      </q-card-section>
    </q-card>
  </q-page>
</template>


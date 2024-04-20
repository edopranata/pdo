<script setup>
import {useCustomerInvoiceStore} from "stores/transaction/customerInvoice";
import {usePageStore} from "stores/pages";
import {useAuthStore} from "stores/auth";
import {storeToRefs} from "pinia";
import {useRoute} from "vue-router";
import {onMounted, ref, watch} from "vue";
import {date} from "quasar";
import QNumber from "components/Input/QNumber.vue";

const {can} = useAuthStore()
const page = usePageStore()
const invoice = useCustomerInvoiceStore()
const {table, form, dialog} = useCustomerInvoiceStore()
const {
  errors,
  getSummaries: summaries,
  getForm,
  customer,
  getSelected: selected
} = storeToRefs(useCustomerInvoiceStore())
const {path} = useRoute()

const tableRef = ref()

onMounted(async () => {
  invoice.onReset()
  await invoice.getCurrentCustomer(path)
  tableRef.value.requestServerInteraction()

})


watch(getForm, (newForm) => {
  for (let property in newForm) {
    if (!!newForm[property]) {
      invoice.unsetError(property)
    }
  }

}, {deep: true})

watch(selected, (newSelect) => {
  form.order_id = newSelect.map(i => {
    return i['id']
  })

}, {deep: true})

const onSubmit = async () => {
  await invoice.submitForm(path)
}

const onReset = () => {
  invoice.onReset()
}

const onRequest = async (props) => {
  await invoice.getCustomerOrder(path, props)
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
            <div class="q-ml-sm tw-text-sm text-right">Total terima</div>
            <div class="q-ml-sm text-h5 text-right">{{
                new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR'
                }).format(summaries.hasOwnProperty('customer_total') ? summaries.customer_total : 0)
              }}
            </div>
          </div>
        </q-card-section>
        <q-checkbox v-model="dialog.print" :val="dialog.print" label="Simpan dan print" size="lg"/>
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
        <q-card-section class="tw-space-y-4">
          <div class="md:tw-grid md:tw-grid-cols-3 md:tw-gap-4">
            <div class="lg:tw-col-span-1 tw-col-span-2">
              <q-field
                :dense="$q.screen.lt.md"
                bg-color="blue-grey"
                color="blue-grey-2"
                filled
                hint=""
                label="Customer Name"
                stack-label
                tabindex="-1">
                <template v-slot:control>
                  <div class="self-center full-width no-outline" tabindex="-1">
                    {{ customer.name }}
                  </div>
                </template>
              </q-field>
              <q-field
                :dense="$q.screen.lt.md"
                :error="errors.hasOwnProperty('trade_date')"
                :error-message="errors.trade_date"
                :stack-label="!!form.trade_date"
                class="tw-w-full"
                filled
                label="Invoice Date">
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
              <div class="tw-grid tw-grid-cols-2 tw-gap-x-4">
                <q-number
                  v-if="summaries.loan"
                  v-model="form.installment"
                  :dense="$q.screen.lt.md"
                  :error="errors.hasOwnProperty('installment')"
                  :error-message="errors.installment"
                  :options="page.currencyFormat"
                  class="tw-w-full"
                  filled
                  label="Jumlah angsuran"
                />
                <q-field
                  v-if="summaries.loan"
                  :dense="$q.screen.lt.md"
                  bg-color="blue-grey"
                  color="blue-grey-2"
                  filled
                  hint=""
                  label="Pinjaman (Rp)"
                  stack-label
                  tabindex="-1">
                  <template v-slot:control>
                    <div class="self-center full-width no-outline" tabindex="-1">
                      {{
                        Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0
                        }).format(summaries.loan)
                      }}
                    </div>
                  </template>
                </q-field>
                <q-field
                  v-if="summaries.loan"
                  :dense="$q.screen.lt.md"
                  bg-color="blue-grey"
                  class="tw-col-span-2"
                  color="blue-grey-2"
                  filled
                  hint=""
                  label="Sisa Pinjaman (Rp)"
                  stack-label
                  tabindex="-1">
                  <template v-slot:control>
                    <div class="self-center full-width no-outline" tabindex="-1">
                      {{
                        Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0
                        }).format(summaries.ending_balance)
                      }}
                    </div>
                  </template>
                </q-field>
              </div>

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
                label="Rata-rata harga (Rp)"
                stack-label
                tabindex="-1">
                <template v-slot:control>
                  <div class="self-center full-width no-outline" tabindex="-1">
                    {{
                      Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0
                      }).format(summaries.average)
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
                label="Total berat (kg)"
                stack-label
                tabindex="-1">
                <template v-slot:control>
                  <div class="self-center full-width no-outline" tabindex="-1">
                    {{
                      Intl.NumberFormat('id-ID', {
                        style: 'unit',
                        unit: 'kilogram'
                      }).format(summaries.weight)
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
                label="Hasil kebun petani (Rp)"
                stack-label
                tabindex="-1">
                <template v-slot:control>
                  <div class="self-center full-width no-outline" tabindex="-1">
                    {{
                      Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0
                      }).format(summaries.total)
                    }}
                  </div>
                </template>
              </q-field>
              <q-field
                :dense="$q.screen.lt.md"
                bg-color="blue-grey"
                color="blue-grey-2"
                :error="errors.hasOwnProperty('total')"
                :error-message="errors.total"
                filled
                hint=""
                label="Yang diterima petani (Rp)"
                stack-label
                tabindex="-1">
                <template v-slot:control>
                  <div class="self-center full-width no-outline" tabindex="-1">
                    {{
                      Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0
                      }).format(summaries.customer_total)
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
          v-model:pagination="table.pagination"
          v-model:selected="table.selected"
          :columns="table.headers ?? []"
          :dense="$q.screen.lt.md"
          :filter="table.filter"
          :loading="table.loading"
          :rows="table.data ?? []"
          binary-state-sort
          row-key="id"
          selection="multiple"
          @request="onRequest"
        >
          <template v-slot:bottom-row>
            <q-tr v-if="errors.hasOwnProperty('order_id')">
              <q-td colspan="100%">
                <span class="text-negative tw-text-sm">{{ errors.order_id }}</span>
              </q-td>
            </q-tr>
          </template>
          <template v-slot:body-selection="scope">
            <q-checkbox
              v-model="scope.selected"
            />
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

          <template v-slot:body-cell-factory_name="props">
            <q-td :props="props">
              {{ props.row.factory?.name }}
            </q-td>
          </template>

          <template v-slot:body-cell-customer_total="props">
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

          <template v-slot:body-cell-invoice="props">
            <q-td :props="props" class="text-right">
              {{ props.value }}
            </q-td>
          </template>
          <template v-slot:body-cell-income="props">
            <q-td :props="props" class="text-right">
              {{ props.value }}
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>


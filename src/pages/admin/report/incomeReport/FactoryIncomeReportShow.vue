<script setup>
import {useIncomeFactoryReportShowStore} from "stores/report/incomeFactoryReportShow";
import {useRoute} from "vue-router";
import {onBeforeMount, onMounted} from "vue";
import {useQuasar} from "quasar";

const {path} = useRoute()
const {table} = useIncomeFactoryReportShowStore()
const order = useIncomeFactoryReportShowStore();
const $q = useQuasar()

onBeforeMount(() => {
  order.table.data = []
})

onMounted(async () => {
  await order.getIncomeDeliveryOrder(path)
})

const exportExcel = () => {
  $q.dialog({
    title: 'Export Data',
    message: 'Export dan download data pada periode terpilih?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    await order.exportDataToExcel(path)
  })
}

</script>

<template>
  <q-page class="tw:space-y-4" padding>
    <q-card bordered>
      <q-card-section v-if="table.loading">
        <q-list class="tw:w-full tw:sm:w-3/12">
          <q-item>
            <q-item-section>
              <q-skeleton type="text" class="text-subtitle1 tw:w-32" />
              <q-skeleton type="text" class="text-caption tw:w-56" />
              <q-skeleton type="text" class="text-caption tw:w-64" />
            </q-item-section>
            <q-item-section side top>
              <q-skeleton bordered type="circle" />
            </q-item-section>
          </q-item>
        </q-list>

      </q-card-section>
      <q-card-section v-if="!table.loading">
        <q-list v-if="table.data.hasOwnProperty('factory')" class="tw:w-full tw:sm:w-3/12">
          <q-item>
            <q-item-section>
              <q-item-label>{{ table.data.factory.name }}</q-item-label>
              <q-item-label caption>{{ `Bank Transfer ${table.data.trade_date}` }}</q-item-label>
              <q-item-label caption lines="2">{{ `Periode ${table.data.period_start} - ${table.data.period_end}` }}</q-item-label>
            </q-item-section>
            <q-item-section side top>
              <q-btn icon="download" color="primary" round rounded @click="exportExcel"/>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
      <q-card-section class="no-padding">
        <q-markup-table v-if="table.loading">
          <thead>
          <tr>
            <th class="text-left" style="width: 150px">
              <q-skeleton animation="blink" type="text" />
            </th>
            <th class="text-right">
              <q-skeleton animation="blink" type="text" />
            </th>
            <th class="text-right">
              <q-skeleton animation="blink" type="text" />
            </th>
            <th class="text-right">
              <q-skeleton animation="blink" type="text" />
            </th>
            <th class="text-right">
              <q-skeleton animation="blink" type="text" />
            </th>
            <th class="text-right">
              <q-skeleton animation="blink" type="text" />
            </th>
          </tr>
          </thead>

          <tbody>
          <tr v-for="n in 5" :key="n">
            <td class="text-left">
              <q-skeleton animation="blink" type="text" width="85px" />
            </td>
            <td class="text-right">
              <q-skeleton animation="blink" type="text" width="50px" />
            </td>
            <td class="text-right">
              <q-skeleton animation="blink" type="text" width="35px" />
            </td>
            <td class="text-right">
              <q-skeleton animation="blink" type="text" width="65px" />
            </td>
            <td class="text-right">
              <q-skeleton animation="blink" type="text" width="25px" />
            </td>
            <td class="text-right">
              <q-skeleton animation="blink" type="text" width="85px" />
            </td>
          </tr>
          </tbody>
        </q-markup-table>
        <q-markup-table v-if="!table.loading" bordered flat>
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
          <tbody v-if="table.data.hasOwnProperty('summaries')">
          <tr class="text-bold bg-primary text-white">
            <td class="text-left"></td>
            <td class="text-left" colspan="2">Total</td>
            <td class="text-right">{{
                new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: "IDR",
                  maximumFractionDigits: 0
                }).format(parseFloat(table.data.summaries.customer_price))
              }}
            </td>
            <td class="text-right">{{
                new Intl.NumberFormat('id-ID', {
                  style: 'unit',
                  unit: "kilogram"
                }).format(parseFloat(table.data.summaries.total_weight))
              }}
            </td>
            <td class="text-right">{{
                new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: "IDR",
                  maximumFractionDigits: 2
                }).format(parseFloat(table.data.summaries.customer_total))
              }}
            </td>
            <td class="text-right">{{
                new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: "IDR",
                  maximumFractionDigits: 0
                }).format(parseFloat(table.data.summaries.margin))
              }}
            </td>
            <td class="text-right">{{
                new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: "IDR",
                  maximumFractionDigits: 0
                }).format(parseFloat(table.data.summaries.factory_price))
              }}
            </td>
            <td class="text-right">{{
                new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: "IDR",
                  maximumFractionDigits: 2
                }).format(parseFloat(table.data.summaries.gross_total))
              }}
            </td>
            <td class="text-right">{{
                new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: "IDR",
                  maximumFractionDigits: 2
                }).format(parseFloat(table.data.summaries.ppn_total))
              }}
            </td>
            <td class="text-right">{{
                new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: "IDR",
                  maximumFractionDigits: 2
                }).format(parseFloat(table.data.summaries.pph22_total))
              }}
            </td>
            <td class="text-right">{{
                new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: "IDR",
                  maximumFractionDigits: 2
                }).format(parseFloat(table.data.summaries.total))
              }}
            </td>
            <td class="text-right">{{
                new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: "IDR",
                  maximumFractionDigits: 2
                }).format(parseFloat(table.data.summaries.gross_total) - (parseFloat(table.data.summaries.customer_total) + parseFloat(table.data.summaries.pph22_total)))
              }}
            </td>
          </tr>
          <template v-if="table.data.hasOwnProperty('orders')">
            <tr v-for="(item, index) in table.data.orders" :key="item.id">
              <td class="text-left">{{ index + 1 }}</td>
              <td class="text-left">{{ item.customer.hasOwnProperty('name') ? item.customer.name : '' }}</td>
              <td class="text-left">{{ item.trade_date }}</td>
              <td class="text-right">{{
                  new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: "IDR",
                    maximumFractionDigits: 0
                  }).format(parseFloat(item.customer_price))
                }}
              </td>
              <td class="text-right">{{
                  new Intl.NumberFormat('id-ID', {
                    style: 'unit',
                    unit: "kilogram"
                  }).format(parseFloat(item.net_weight))
                }}
              </td>
              <td class="text-right">{{
                  new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: "IDR",
                    maximumFractionDigits: 2
                  }).format(parseFloat(item.customer_total))
                }}
              </td>
              <td class="text-right">{{
                  new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: "IDR",
                    maximumFractionDigits: 0
                  }).format(parseFloat(item.margin))
                }}
              </td>
              <td class="text-right">{{
                  new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: "IDR",
                    maximumFractionDigits: 0
                  }).format(parseFloat(item.net_price))
                }}
              </td>
              <td class="text-right">{{
                  new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: "IDR",
                    maximumFractionDigits: 2
                  }).format(parseFloat(item.gross_total))
                }}
              </td>
              <td class="text-right">{{
                  new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: "IDR",
                    maximumFractionDigits: 2
                  }).format(parseFloat(item.ppn_total))
                }}
              </td>
              <td class="text-right">{{
                  new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: "IDR",
                    maximumFractionDigits: 2
                  }).format(parseFloat(item.pph22_total))
                }}
              </td>
              <td class="text-right">{{
                  new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: "IDR",
                    maximumFractionDigits: 2
                  }).format((parseFloat(item.gross_total) + parseFloat(item.ppn_total)) - parseFloat(item.pph22_total))
                }}
              </td>
              <td class="text-right">{{
                  new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: "IDR",
                    maximumFractionDigits: 2
                  }).format(parseFloat(item.gross_total) - (parseFloat(item.customer_total) + parseFloat(item.pph22_total)))
                }}
              </td>
            </tr>
          </template>

          </tbody>
        </q-markup-table>
      </q-card-section>
    </q-card>
  </q-page>

</template>


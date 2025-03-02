<script setup>
import { useCashTodayReportStore } from 'stores/report/cashTodayReport'
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { date } from 'quasar'

const cash = useCashTodayReportStore()
const { path } = useRoute()
const { table, form } = useCashTodayReportStore()
const { errors, users_option, selected_user } = storeToRefs(useCashTodayReportStore())
onMounted(async () => {
  cash.onReset()
  await cash.getUserList(path)
})

const searchUser = (val, update) => {
  update(() => {
    if (val === '') {
      cash.users_option = cash.users.slice(0, 10)
    } else {
      const needle = val.toLowerCase()
      cash.users_option = cash.users
        .filter(({ name }) => name.toLowerCase().indexOf(needle) > -1)
        .slice(0, 10)
    }
  })
}
watch(selected_user, (selected) => {
  table.data = []
  if (selected) {
    form.user_id = selected.id
  } else {
    form.user_id = null
  }
})

const showReport = async () => {
  await cash.getCashData(path)
}
</script>

<template>
  <q-page class="tw:space-y-4" padding>
    <q-card bordered>
      <q-toolbar class="text-primary">
        <q-toolbar-title> Laporan kas Kasir berdasarkan tanggal</q-toolbar-title>
      </q-toolbar>
      <q-card-section>
        <div class="tw:grid tw:md:grid-cols-3 tw:md:gap-4">
          <q-select
            v-model="cash.selected_user"
            :dense="$q.screen.lt.md"
            :error="errors.hasOwnProperty('user_id')"
            :error-message="errors.user_id"
            :options="users_option"
            class="tw:lg:col-span-1 tw:col-span-3"
            clearable
            fill-input
            filled
            hide-selected
            label="Pilih User"
            option-label="name"
            option-value="id"
            use-input
            @change="cash.unsetError('user_id')"
            @filter="searchUser"
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section avatar>
                  <q-icon name="person" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ scope.opt.name }}</q-item-label>
                  <q-item-label caption>
                    {{
                      new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        maximumFractionDigits: 2,
                      }).format(scope.opt.cash !== null ? scope.opt.cash.balance : 0)
                    }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey"> No results</q-item-section>
              </q-item>
            </template>
          </q-select>

          <q-field
            :error="errors.hasOwnProperty('date')"
            :error-message="errors.date"
            :stack-label="!!form.date"
            class="tw:lg:col-span-1 tw:col-span-3"
            filled
            label="Tanggal Transaksi"
          >
            <template v-slot:control>
              <div class="self-center full-width no-outline" tabindex="0">
                {{ date.formatDate(form.date, 'DD MMMM YYYY') }}
              </div>
            </template>
            <template v-slot:append>
              <q-icon class="cursor-pointer" name="calendar_month" tabindex="0">
                <q-popup-proxy cover transition-hide="scale" transition-show="scale">
                  <q-date v-model="form.date">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup color="primary" flat label="Close" />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-field>
        </div>
        <div class="q-gutter-sm">
          <q-btn
            :disable="!selected_user"
            label="Lihat Data"
            :loading="table.loading"
            color="secondary"
            glossy
            icon="add_circle"
            @click="showReport"
          />
          <q-btn
            :disable="!selected_user"
            label="Print Data"
            :loading="table.loading"
            color="warning"
            glossy
            icon="add_circle"
          />
        </div>
      </q-card-section>
      <q-card-section v-if="table.data.length > 0" padding>
        <q-markup-table flat bordered>
          <thead>
            <tr>
              <th class="text-left">No</th>
              <th class="text-left">Tanggal Transaksi</th>
              <th class="text-left">Keterangan</th>
              <th class="text-right">Saldo Awal</th>
              <th class="text-right">Uang Masuk</th>
              <th class="text-right">Uang Keluar</th>
              <th class="text-right">Saldo Akhir</th>
            </tr>
          </thead>
          <tbody v-if="table.data.length > 0">
            <tr v-for="(item, index) in table.data" :key="item.id">
              <td class="text-left">{{ index + 1 }}</td>
              <td class="text-left">{{ item.trade_date }}</td>
              <td class="text-left">{{ item.description }}</td>
              <td class="text-right">
                {{
                  new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    maximumFractionDigits: 2,
                  }).format(item.opening_balance)
                }}
              </td>
              <td class="text-right">
                {{
                  new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    maximumFractionDigits: 2,
                  }).format(item.balance_in)
                }}
              </td>
              <td class="text-right">
                {{
                  new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    maximumFractionDigits: 0,
                  }).format(item.balance_out)
                }}
              </td>
              <td class="text-right">
                {{
                  new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    maximumFractionDigits: 2,
                  }).format(item.ending_balance)
                }}
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

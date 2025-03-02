<script setup>
import {useIncomeFactoryDataStore} from "stores/report/IncomeFactoryReport";
import {useAuthStore} from "stores/auth";
import {useRoute, useRouter} from "vue-router";
import {onBeforeMount, onMounted, ref, watch} from "vue";
import {storeToRefs} from "pinia";
import {useQuasar} from "quasar";

const {can} = useAuthStore()
const {path} = useRoute()
const {errors, factories_option, selected_factory} = storeToRefs(useIncomeFactoryDataStore())
const {table, form} = useIncomeFactoryDataStore()
const income = useIncomeFactoryDataStore();
const router = useRouter();
const $q = useQuasar()
const tableRef = ref()

onBeforeMount(() => {
  income.table.data = []
})

onMounted(async () => {
  income.onReset()
  await income.getFactoryData(path)
  tableRef.value.requestServerInteraction()

})

const onSubmit = async () => {
  await income.getDeliveryFactoryID(path)
}

watch([selected_factory], ([selectedF]) => {

  if (selectedF) {
    if (Object.prototype.hasOwnProperty.call(selectedF,'id')) {
      form.factory_id = selectedF.id
      table.search.factory_id = selectedF.id
    }

  } else {
    form.factory_id = selectedF
    table.search.factory_id = selectedF

  }

  tableRef.value.requestServerInteraction()

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

const onRequest = async (props) => {
  await income.getDeliveriesData(path, props)
}

const viewDetails = async (id) => {
  await router.replace({name: 'admin.report.incomeReport.detailFactoryIncomeShow', params: {id: id}})
}

const exportExcel = async (id) => {
  $q.dialog({
    title: 'Export Data',
    message: 'Export dan download data pada periode terpilih?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    await income.exportDataToExcel(path, id)
  })
}
</script>

<template>
  <q-page class="tw:space-y-4" padding>
    <q-card bordered>
      <q-toolbar class="text-primary">
        <q-toolbar-title>
          Laporan detail bank transfer dari Pabrik
        </q-toolbar-title>
      </q-toolbar>
      <q-form
        @submit="onSubmit"
      >
        <q-card-section class="tw:space-y-4">
          <div class="tw:md:grid tw:md:grid-cols-3 tw:md:gap-4">
            <q-select
              v-model="income.selected_factory"
              :bg-color="!!form.id ? 'yellow-2' : ''"
              :dense="$q.screen.lt.md"
              :disable="table.loading"
              :error="errors.hasOwnProperty('factory_id')"
              :error-message="errors.factory_id"
              :options="factories_option"
              class="tw:w-full"
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
          </div>
        </q-card-section>
      </q-form>
      <q-card-section class="no-padding">
        <q-table
          ref="tableRef"
          v-model:pagination="table.pagination"
          :columns="table.headers"
          :dense="$q.screen.lt.md"
          :filter="table.filter"
          :loading="table.loading"
          :rows="table.data ?? []"
          binary-state-sort
          bordered
          row-key="id"
          @request="onRequest"
        >
          <template v-slot:body-cell-no="props">
            <q-td :props="props">
              {{ props.rowIndex + 1 }}
            </q-td>
          </template>

          <template v-slot:body-cell-action="props">
            <q-td :props="props">
              <q-btn-dropdown size="sm" color="primary" label="Action" :disable="!can('admin.report.incomeReport.detailFactoryIncomeShow') || !can('admin.report.incomeReport.detailFactoryIncomeExport')">
                <q-list>
                  <q-item :disable="!can('admin.report.incomeReport.detailFactoryIncomeShow')" clickable v-close-popup @click="viewDetails(`${props.row.id}`)">
                    <q-item-section avatar>
                      <q-avatar size="sm" icon="print" color="primary" text-color="white" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>View and Print</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item :disable="!can('admin.report.incomeReport.detailFactoryIncomeExport')" clickable v-close-popup @click="exportExcel(`${props.rowIndex}`)">
                    <q-item-section avatar>
                      <q-avatar size="sm" icon="download" color="secondary" text-color="white" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Export to Excel</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
            </q-td>
          </template>

          <template v-slot:body-cell-factory_name="props">
            <q-td :props="props">
              {{ props.row.factory?.name }}
            </q-td>
          </template>

          <template v-slot:body-cell-net_weight="props">
            <q-td :props="props">
              {{
                new Intl.NumberFormat('id-ID', {
                  style: 'unit',
                  unit: 'kilogram'

                }).format(props.row.summaries?.total_weight ?? 0)
              }}
            </q-td>
          </template>

          <template v-slot:body-cell-net_price="props">
            <q-td :props="props">
              {{
                new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 2,
                }).format(props.row.summaries?.factory_price ?? 0)
              }}
            </q-td>
          </template>

          <template v-slot:body-cell-margin="props">
            <q-td :props="props">
              {{
                new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 2,
                }).format(props.row.summaries?.margin ?? 0)
              }}
            </q-td>
          </template>

          <template v-slot:body-cell-ppn="props">
            <q-td :props="props">
              {{
                new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 2,
                }).format(props.row.summaries?.ppn_total ?? 0)
              }}
            </q-td>
          </template>

          <template v-slot:body-cell-pph22="props">
            <q-td :props="props">
              {{
                new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 2,
                }).format(props.row.summaries?.pph22_total ?? 0)
              }}
            </q-td>
          </template>

          <template v-slot:body-cell-gross_total="props">
            <q-td :props="props">
              {{
                new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 2,
                }).format(props.row.summaries?.gross_total ?? 0)
              }}
            </q-td>
          </template>

          <template v-slot:body-cell-customer_total="props">
            <q-td :props="props">
              {{
                new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 2,
                }).format(props.row.summaries?.customer_total ?? 0)
              }}
            </q-td>
          </template>

          <template v-slot:body-cell-bank_transfer="props">
            <q-td :props="props">
              {{
                new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 2,
                }).format(props.row.summaries?.total ?? 0)
              }}
            </q-td>
          </template>

          <template v-slot:body-cell-net_total="props">
            <q-td :props="props">
              {{
                new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 2,
                }).format(props.row.summaries?.net_income ?? 0)
              }}
            </q-td>
          </template>

        </q-table>
      </q-card-section>
    </q-card>
  </q-page>

</template>


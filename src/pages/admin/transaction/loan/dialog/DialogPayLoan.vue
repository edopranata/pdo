<script setup>
import {useLoanStore} from "stores/transaction/loan";
import {usePageStore} from "stores/pages";
import {useRoute} from "vue-router";
import {storeToRefs} from "pinia";
import {useAuthStore} from "stores/auth";
import {useQuasar} from 'quasar'

const $q = useQuasar();
const {can} = useAuthStore();
const {dialog, form, table} = useLoanStore();
const {errors} = storeToRefs(useLoanStore())
const loan = useLoanStore()
const {path} = useRoute()
const page = usePageStore()
const onSubmit = async () => {
  await loan.payLoan(path)
}
</script>
<template>
  <q-dialog v-model="dialog.take" persistent>
    <q-card class="tw:w-96">
      <q-toolbar class="bg-negative text-white">
        <q-toolbar-title>
          <div>Pay Loan</div>
        </q-toolbar-title>
        <q-btn v-close-popup dense flat icon="close" round/>
      </q-toolbar>
      <q-form
        class="q-gutter-md"
        @reset="loan.onReset()"
        @submit="onSubmit"
      >
        <q-card-section>
          <q-field
            bg-color="blue-grey"
            color="blue-grey-2"
            :dense="$q.screen.lt.md"
            filled
            hint=""
            label="Name"
            stack-label
            tabindex="-1">
            <template v-slot:control>
              <div class="self-center full-width no-outline" tabindex="-1">
                {{ form.name }}
              </div>
            </template>
          </q-field>
          <q-field
            bg-color="blue-grey"
            color="blue-grey-2"
            :dense="$q.screen.lt.md"
            filled
            hint=""
            label="Phone"
            stack-label
            tabindex="-1">
            <template v-slot:control>
              <div class="self-center full-width no-outline" tabindex="-1">
                {{ form.phone }}
              </div>
            </template>
          </q-field>
          <q-field
            bg-color="blue-grey"
            color="blue-grey-2"
            :dense="$q.screen.lt.md"
            filled
            hint=""
            label="Address"
            stack-label
            tabindex="-1">
            <template v-slot:control>
              <div class="self-center full-width no-outline" tabindex="-1">
                {{ form.address }}
              </div>
            </template>
          </q-field>
          <q-number
            v-model="form.balance"
            :dense="$q.screen.lt.md"
            :error="errors.hasOwnProperty('balance')"
            :error-message="errors.balance"
            :options="page.currencyFormat"
            class="tw:w-full"
            filled
            label="Amount (Rp)"
          />
          <q-field
            bg-color="blue-grey"
            color="blue-grey-2"
            :dense="$q.screen.lt.md"
            filled
            hint=""
            label="Current Balance"
            stack-label
            tabindex="-1">
            <template v-slot:control>
              <div class="self-center full-width no-outline" tabindex="-1">
                {{
                  Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0
                  }).format(form.current)
                }}
              </div>
            </template>
          </q-field>
          <q-field
            bg-color="blue-grey"
            color="blue-grey-2"
            :dense="$q.screen.lt.md"
            filled
            hint=""
            label="Ending Balance"
            stack-label
            tabindex="-1">
            <template v-slot:control>
              <div class="self-center full-width no-outline" tabindex="-1">
                {{
                  Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0
                  }).format(form.ending)
                }}
              </div>
            </template>
          </q-field>
          <q-checkbox v-if="can('admin.transaction.loan.print')" v-model="dialog.print" :val="dialog.print" label="Simpan dan print" size="lg"/>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn v-close-popup color="negative" flat label="Batalkan" type="reset"/>
          <q-space/>
          <q-btn :disable="table.loading" color="primary" flat label="Pay Loan" type="submit"/>
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

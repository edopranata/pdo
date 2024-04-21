<script setup>
import {useLoanStore} from "stores/transaction/loan";
import {usePageStore} from "stores/pages";
import {useRoute} from "vue-router";
import QNumber from "components/Input/QNumber.vue";
import {storeToRefs} from "pinia";
const {form, dialog, table} = useLoanStore();
const {errors} = storeToRefs(useLoanStore())
const {path} = useRoute()
const loan = useLoanStore()
const page = usePageStore()
const onSubmit = async () => {
  await loan.addLoan(path)
}
</script>
<template>
  <q-dialog v-model="dialog.give" persistent>
    <q-card class="tw-w-96">
      <q-toolbar class="bg-primary text-white">
        <q-toolbar-title>
          <div>Add Loan</div>
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
            class="tw-w-full"
            filled
            label="Amount (kg)"
          />
          <q-field
            bg-color="blue-grey"
            color="blue-grey-2"
            :dense="$q.screen.lt.md"
            filled
            hint=""
            label="Current Loan Balance"
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
            label="Ending Loan Balance"
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

          <q-checkbox v-model="dialog.print" :val="dialog.print" label="Simpan dan print" size="lg"/>

        </q-card-section>

        <q-card-actions align="right">
          <q-btn v-close-popup color="warning" flat label="Batalkan" type="reset"/>
          <q-space/>
          <q-btn :disable="table.loading" color="primary" flat label="Add Loan" type="submit"/>
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

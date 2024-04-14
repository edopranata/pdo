<script setup>
import {useCashStore} from "stores/management/cash";
import {usePageStore} from "stores/pages";
import {useRoute} from "vue-router";
import QNumber from "components/Input/QNumber.vue";
import {storeToRefs} from "pinia";
const {dialog, form, table} = useCashStore();
const {errors} = storeToRefs(useCashStore())
const cash = useCashStore()
const {path} = useRoute()
const page = usePageStore()
const onSubmit = async () => {
  await cash.takeCash(path)
}
</script>
<template>
  <q-dialog v-model="dialog.take" persistent>
    <q-card class="tw-w-96">
      <q-toolbar class="bg-negative text-white">
        <q-toolbar-title>
          <div>Take Cash</div>
        </q-toolbar-title>
        <q-btn v-close-popup dense flat icon="close" round/>
      </q-toolbar>
      <q-form
        class="q-gutter-md"
        @reset="cash.onReset()"
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
            label="Username"
            stack-label
            tabindex="-1">
            <template v-slot:control>
              <div class="self-center full-width no-outline" tabindex="-1">
                {{ form.username }}
              </div>
            </template>
          </q-field>
          <q-field
            bg-color="blue-grey"
            color="blue-grey-2"
            :dense="$q.screen.lt.md"
            filled
            hint=""
            label="Email"
            stack-label
            tabindex="-1">
            <template v-slot:control>
              <div class="self-center full-width no-outline" tabindex="-1">
                {{ form.email }}
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
        </q-card-section>

        <q-card-actions align="right">
          <q-btn v-close-popup color="negative" flat label="Batalkan" type="reset"/>
          <q-space/>
          <q-btn :disable="table.loading" color="primary" flat label="Take Cash" type="submit"/>
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup>
import {useFactoriesStore} from "stores/masterData/factory";
import {useRoute} from "vue-router";

const {path} = useRoute()
const {submitDelete, table, deleted} = useFactoriesStore()

</script>

<template>
  <q-dialog v-model="deleted.dialog" persistent transition-hide="scale" transition-show="scale">
    <q-card style="width: 600px;">
      <q-card-section>
        <div class="text-h6 text-red">Yakin akan menghapus {{ deleted.data.length }} data pabrik ini?
        </div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <q-chip v-for="(name, i) in deleted.data" :key="i">{{ name }}</q-chip>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn v-close-popup color="warning" flat label="Batalkan" type="reset"/>
        <q-space/>
        <q-btn :disable="table.loading"  color="primary" flat label="Delete Data" type="button" @click.prevent="submitDelete(path)"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import {useUsersStore} from "stores/management/user";
import {useRoute} from "vue-router";

const {path} = useRoute()
const {dialog, form, table} = useUsersStore()

const user = useUsersStore()
const onSubmit = async () => {
  await user.submitDelete(path)
}

</script>

<template>
  <q-dialog v-model="dialog.delete" persistent transition-hide="scale" transition-show="scale">
    <q-card style="width: 600px;">
      <q-card-section>
        <div class="text-h6">Yakin akan menghapus {{ form.delete_data.length > 1 ? form.delete_data.length : '' }} user
          ini?
        </div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <q-chip v-for="(name, i) in form.delete_data" :key="i">{{ name }}</q-chip>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn v-close-popup color="warning" flat label="Batalkan" type="reset"/>
        <q-space/>
        <q-btn :disable="table.loading"  color="primary" flat label="Delete Data" type="button" @click.prevent="onSubmit"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>

</style>

<script setup>
import {useDashboardStore} from "stores/dashboard";
import {onMounted} from "vue";
import {useRoute} from "vue-router";
import UserFactoryInfo from "pages/admin/dashboard/UserFactoryInfo.vue";
const {path} = useRoute();
const dashboard = useDashboardStore();
onMounted( async () => {
  await dashboard.getUserFactoryInfo(path)

})
</script>

<template>
  <q-page padding>
    <UserFactoryInfo />
  </q-page>
</template>


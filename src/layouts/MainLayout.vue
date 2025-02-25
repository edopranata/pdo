<template>
  <q-layout view="hHh Lpr lff">
    <q-header v-if="!print" class="bg-primary text-white print-hide" elevated>
      <MainHeader />
    </q-header>

    <q-drawer
      v-model="page.leftDrawerOpen"
      :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3'"
      :mini="!leftDrawerOpen || miniState"
      :width="300"
      bordered
      show-if-above
      @click.capture="drawerClick"
    >
      <MainLeftSidebar />
    </q-drawer>

    <q-drawer v-if="!print" v-model="rightDrawer" bordered class="print-hide" side="right">
      <MainRightSidebar />
    </q-drawer>

    <q-page-container>
      <router-view v-slot="{ Component, route }">
        <transition mode="out-in" name="slide-x">
          <component :is="Component" :key="route.name" />
        </transition>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { usePageStore } from 'stores/pages'
import { storeToRefs } from 'pinia'
import MainHeader from 'layouts/part/MainHeader.vue'
import MainLeftSidebar from 'layouts/part/MainLeftSidebar.vue'
import MainRightSidebar from 'layouts/part/MainRightSidebar.vue'
import { useDashboardStore } from 'stores/dashboard'
import { onMounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const page = usePageStore()
const { leftDrawerOpen, miniState, rightDrawer, print } = storeToRefs(usePageStore())
const dashboard = useDashboardStore()
const { drawerClick } = usePageStore()

onMounted(async () => {
  await dashboard.getUserFactoryInfo('/admin', 'user')
})
</script>

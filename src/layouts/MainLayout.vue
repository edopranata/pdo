<template>
  <q-layout view="lHh Lpr lff" class="full-height">
    <q-header v-if="!print" class="bg-primary text-white print-hide" elevated height-hint="98">
      <MainHeader/>
    </q-header>

    <q-drawer v-if="!print" v-model="leftDrawer" bordered class="print-hide" side="left">
      <MainLeftSidebar/>
    </q-drawer>

    <q-drawer v-if="!print" v-model="rightDrawer" bordered class="print-hide" side="right">
      <MainRightSidebar/>
    </q-drawer>

    <q-page-container>
      <router-view v-slot="{ Component, route }">
        <transition mode="out-in" name="slide-x">
          <component :is="Component" :key="route.name"/>
        </transition>
      </router-view>
    </q-page-container>

<!--    <q-footer v-if="!print" class="bg-grey-8 text-white print-hide" elevated>-->
<!--      <MainFooter/>-->
<!--    </q-footer>-->

  </q-layout>
</template>

<script setup>
import {usePageStore} from "stores/pages";
import {storeToRefs} from "pinia";
import MainHeader from "layouts/part/MainHeader.vue";
import MainLeftSidebar from "layouts/part/MainLeftSidebar.vue";
import MainRightSidebar from "layouts/part/MainRightSidebar.vue";
import {useDashboardStore} from "stores/dashboard";
import {onMounted} from "vue";

const {leftDrawer, rightDrawer, print} = storeToRefs(usePageStore())
const dashboard = useDashboardStore()

onMounted( async () => {
  await dashboard.getUserFactoryInfo('/admin', 'user')
})
</script>

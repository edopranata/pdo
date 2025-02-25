<script setup>
import {usePageStore} from "stores/pages";
import { storeToRefs } from 'pinia'

const {toggleLeftDrawer, toggleRightDrawer} = usePageStore()
const {leftDrawerOpen} = storeToRefs(usePageStore())
</script>

<template>
  <q-toolbar class="glossy">
    <q-btn :icon="!leftDrawerOpen ? 'menu' : 'menu_open' " dense flat round @click="toggleLeftDrawer"/>
    <q-toolbar-title>Palm Delivery Order</q-toolbar-title>

    <q-btn dense flat icon="manage_accounts" round @click="toggleRightDrawer"/>
  </q-toolbar>
</template>


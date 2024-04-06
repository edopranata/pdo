<script setup>
import {usePageStore} from "stores/pages";

const {toggleLeftDrawer, toggleRightDrawer} = usePageStore()
</script>

<template>
  <q-toolbar class="glossy">
    <q-btn flat round icon="menu" @click="toggleLeftDrawer" />
    <q-btn outline round label="PDO" to="/admin" class="tw-ml-2" />
    <q-toolbar-title>Palm Delivery Order</q-toolbar-title>

    <q-btn dense flat icon="manage_accounts" round @click="toggleRightDrawer"/>
  </q-toolbar>
</template>


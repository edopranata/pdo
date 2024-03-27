<template>
  <div>
    <q-layout view="hHh LpR lfr">
      <q-page-container>
        <router-view v-slot="{ Component, route }">
          <transition mode="out-in" name="slide-x">
            <component :is="Component" :key="route.name"/>
          </transition>
        </router-view>
      </q-page-container>
    </q-layout>
  </div>
</template>
<script setup>
</script>

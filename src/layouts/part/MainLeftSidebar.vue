<script setup>
import {usePageStore} from "stores/pages";
import {onBeforeMount} from "vue";
import {storeToRefs} from "pinia";
import {LocalStorage} from "quasar";
import {useRoute} from "vue-router";
import {useDashboardStore} from "stores/dashboard";
import {useAuthStore} from "stores/auth";

const {role} = storeToRefs(useAuthStore())
const {name: currentName} = useRoute()
const {menus, setActive} = usePageStore()
const page = usePageStore()
const {activeMenu} = storeToRefs(usePageStore())
const {user} = storeToRefs(useDashboardStore())
const {table} = useDashboardStore()

onBeforeMount(async () => {
  let current = currentName.split('.')
  if (current.length === 4) {
    current.pop()
    current = current.join('.') + '.index'
  } else {
    current = 'admin.index'
  }

  page.leftDrawer = LocalStorage.getItem('leftDrawer') ?? false
  page.setActive(current)
})
</script>

<template>
  <q-scroll-area style="height: calc(100% - 150px); margin-top: 200px; border-right: 1px solid #ddd">
    <q-list bordered class="rounded-borders">
      <q-item
        v-ripple
        :active="activeMenu === 'admin.index'"
        clickable
        to="/admin"
        @click="setActive('admin.index')">
        <q-item-section avatar>
          <q-icon name="home"/>
        </q-item-section>
        <q-item-section>Dashboard</q-item-section>
      </q-item>

      <template
        v-for="(menu, m) in menus"
        :key="m">

        <q-expansion-item
          v-if="menu.children.length > 0"
          :content-inset-level="1"
          :default-opened="activeMenu.startsWith(menu.name)"
          :icon="menu.icon ?? 'check'"
          :label="menu.title"
          expand-separator
          group="menu"
        >
          <q-list v-if="menu.children.length > 0" padding>
            <q-item
              v-for="(child, c) in menu.children"
              :key="c"
              v-ripple
              :active="activeMenu === child.name"
              :to="child.path"
              clickable
              @click="setActive(child.name)">
              <q-item-section>
                {{ child.title }}
              </q-item-section>
            </q-item>
          </q-list>
        </q-expansion-item>
      </template>
    </q-list>
  </q-scroll-area>

  <q-img class="absolute-top" src="/img/sawit.jpeg" style="height: 200px">

    <q-list class="absolute-bottom">
      <q-item class="no-padding" v-if="table.loading">
        <q-item-section side>
          <q-skeleton type="QAvatar" size="48px" />
        </q-item-section>
        <q-item-section>
          <q-skeleton type="rect" />
          <q-skeleton type="text" />
        </q-item-section>
        <q-item-section v-if="role === 'cashier'">
          <q-skeleton type="text" width="60px" />
        </q-item-section>
      </q-item>
      <q-item class="no-padding" v-if="!table.loading">
        <q-item-section side>
          <q-avatar rounded size="48px">
            <q-img :src="user.photo"/>
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ user.name }}</q-item-label>
          <q-item-label caption class="text-white">{{ user.username }}</q-item-label>
        </q-item-section>
        <q-item-section side class="text-white" v-if="role === 'cashier'">
          {{
            new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR'
            }).format(user.hasOwnProperty('cash') ? user.cash ? user.cash?.balance : 0 : 0)
          }}
        </q-item-section>
      </q-item>
    </q-list>
  </q-img>
</template>

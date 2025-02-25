<script setup>
import { usePageStore } from 'stores/pages'
import { onBeforeMount } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useDashboardStore } from 'stores/dashboard'
import { useAuthStore } from 'stores/auth'
import {useQuasar} from 'quasar'

const { role } = storeToRefs(useAuthStore())
const { name: currentName } = useRoute()
const { menus, setActive } = usePageStore()
const page = usePageStore()
const { activeMenu, miniState: iconMiniState } = storeToRefs(usePageStore())
const { user } = storeToRefs(useDashboardStore())
const { miniState, toggleMiniState } = usePageStore()
const $q = useQuasar()
onBeforeMount(async () => {
  let current = currentName.split('.')
  if (current.length === 4) {
    current.pop()
    current = current.join('.') + '.index'
  } else {
    current = 'admin.index'
  }

  page.setActive(current)
})
</script>

<template>
  <q-scroll-area style="height: calc(100% - 150px); margin-top: 70px">
    <q-list>
      <q-item
        v-ripple
        :active="activeMenu === 'admin.index'"
        clickable
        to="/admin"
        @click="setActive('admin.index')"
      >
        <q-item-section avatar>
          <q-icon name="home" />
        </q-item-section>
        <q-item-section>Dashboard</q-item-section>
      </q-item>

      <template v-for="(menu, m) in menus" :key="m">
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
              @click="setActive(child.name)"
            >
              <q-item-section>
                {{ child.title }}
              </q-item-section>
            </q-item>
          </q-list>
        </q-expansion-item>
      </template>
    </q-list>
  </q-scroll-area>

  <div class="absolute-top" style="top: 74px">
    <div class="absolute-bottom bg-transparent">
      <q-list>
        <q-item class="q-my-sm">
          <q-item-section side>
            <q-avatar rounded size="48px">
              <q-img :size="!miniState ? '38px' : ''" :src="user.photo" />
            </q-avatar>
          </q-item-section>
          <q-item-section v-if="!miniState">
            <q-item-label>{{ user.name }}</q-item-label>
            <q-item-label caption lines="1">@{{ user.username }} <span v-if="role === 'cashier'">
              <span> | </span><span class="text-orange-10"> {{
                new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                }).format(user.hasOwnProperty('cash') ? (user.cash ? user.cash?.balance : 0) : 0)
              }}</span>
            </span>
            </q-item-label>
          </q-item-section>

        </q-item>
      </q-list>
    </div>
  </div>

  <div v-if="$q.screen.gt.sm" class="absolute" style="top: 60px; right: -12px">
    <q-btn
      :icon="!iconMiniState ? 'chevron_left' : 'chevron_right'"
      color="accent"
      dense
      round
      size="sm"
      unelevated
      @click="toggleMiniState"
    />
  </div>

</template>

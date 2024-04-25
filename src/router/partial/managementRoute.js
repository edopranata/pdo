
export default [
  {
    path: 'management',
    name: 'admin.management',
    redirect: {name: 'admin.index'},
    children: [
      {
        path: 'users',
        name: 'admin.management.users.index',
        component: () => import('pages/admin/management/users/UserIndex.vue'),
        meta: {
          auth: true,
        },
      },
      {
        path: 'roles',
        name: 'admin.management.roles.index',
        component: () => import('pages/admin/management/roles/RoleIndex.vue'),
        meta: {
          auth: true,
        },
      },
      {
        path: 'roles/:id/view',
        name: 'admin.management.roles.viewRole',
        component: () => import('pages/admin/management/roles/RoleView.vue'),
        meta: {
          auth: true,
        },

      },
      {
        path: 'permissions',
        name: 'admin.management.permissions.index',
        component: () => import('pages/admin/management/permissions/PermissionIndex.vue'),
        meta: {
          auth: true,
        },
      },
      {
        path: 'permissions/:id/view',
        name: 'admin.management.permissions.viewPermission',
        component: () => import('pages/admin/management/permissions/PermissionView.vue'),
        meta: {
          middleware: {
            auth: true,
          },
        },
      },
      {
        path: 'cash',
        name: 'admin.management.cash.index',
        component: () => import('pages/admin/management/cash/CashIndex.vue'),
        meta: {
          auth: true,
        },
      },
      {
        path: 'price',
        name: 'admin.management.price.index',
        component: () => import('pages/admin/management/price/PriceIndex.vue'),
        meta: {
          auth: true,
        },
      },
    ]
  },
]

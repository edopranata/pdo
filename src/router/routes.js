import {LocalStorage} from "quasar";
import managementRoute from "src/router/partial/managementRoute";
import masterDataRoute from "src/router/partial/masterDataRoute";
import transactionRoute from "src/router/partial/transactionRoute";
import reportRoute from "src/router/partial/reportRoute";

const routes = [
  {
    path: '/',
    component: () => import('layouts/GuestLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('pages/auth/LoginIndex.vue'),
        beforeEnter: (to, from, next) => {
          if (LocalStorage.has('token')) {
            next({name: 'admin.index'});
          } else {
            next()
          }
        }
      },
      {
        path: "unauthorized",
        name: "home.unauthorized",
        component: () => import("pages/ErrorPage401.vue")
      },
    ],
  },
  {
    path: '/admin',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: "unauthorized",
        name: "admin.unauthorized",
        component: () => import("pages/ErrorPage403.vue")
      },
      {
        path: '',
        name: 'admin.index',
        component: () => import('pages/admin/AdminIndex.vue'),
        meta: {
          auth: true
        }
      },
      ...managementRoute,
      ...masterDataRoute,
      ...transactionRoute,
      ...reportRoute,
    ]
  },
]

export default routes

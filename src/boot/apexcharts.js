import VueApexCharts from 'vue3-apexcharts'
import { defineBoot } from '#q-app/wrappers'
import ApexCharts from "apexcharts";

export default defineBoot( async ({ app }) => {
  app.config.globalProperties.$ApexCharts = ApexCharts
  app.use(VueApexCharts)
})

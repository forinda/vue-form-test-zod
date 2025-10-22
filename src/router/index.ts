import { createRouter, createWebHistory } from 'vue-router'
import SurveyForm from '../components/survey/SurveyForm.vue'
import FormDemo from '../components/FormDemo.vue'
import NotFound from '../views/NotFound.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/survey'
    },
    {
      path: '/survey',
      name: 'survey',
      component: SurveyForm,
      meta: {
        title: 'Survey Form'
      }
    },
    {
      path: '/demo',
      name: 'demo',
      component: FormDemo,
      meta: {
        title: 'Form Components Demo'
      }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFound,
      meta: {
        title: 'Page Not Found'
      }
    }
  ]
})

// Update document title based on route
router.beforeEach((to) => {
  const title = to.meta.title as string
  if (title) {
    document.title = `${title} | Vue Form Test`
  }
})

export default router
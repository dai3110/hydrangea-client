import { photoBookHtml, screenAspectThreshold } from "~/const/photobook"
import type { Article, Content } from "~/types/photobook"

export const usePhotoFrameControl = (conf?: {
  coverContent?: {
    title: string
    content: string
  }
}) => {

  const mediaMatcher = window.matchMedia(`(min-aspect-ratio: ${screenAspectThreshold})`)
  const route = useRoute()
  const articleId = ref(Number(route.params.id as string))
  const articles = ref<Article[]>([])
  const currentIndex = ref<number>(-1)
  const nextIndex = ref<number>(-1)
  const operationLock = ref(false)
  const scrollerActivity = reactive({
    left: false,
    right: false
  })
  const historyState = reactive({
    article: null as number | null
  })
  const portrait = ref(false)
  const landscape = ref(false)
  const pathChanged = (state: any) => {
    const pageIndex = articles.value.findIndex((article) => article.id === state?.article)
    tasks.turnTo(pageIndex < 0 ? 0 : pageIndex)
    articleId.value = state?.article
  }
  const silentlyRouting = useSilentlyRouting(pathChanged)

  const generateBorderColor = () => {
    const gen = () => Math.round(Math.random() * 32) + 16
    const x = gen()
    const y = gen()
    return {
      x: `rgb(${x},${x},${x})`,
      y: `rgb(${y},${y},${y})`
    }
  }

  const restoreArticles = async (): Promise<Content[]> => {
    const storedContent = localStorage.getItem('content')
    const storedVersion = localStorage.getItem('version')

    const currentVersion = (await $fetch('/api/version', {
      method: 'get'
    }) as {content: number}).content

    if (Number(storedVersion) === Number(currentVersion)) {
      return JSON.parse(storedContent ?? '[]')
    }

    const result = (await $fetch('/api/articles', {
      method: 'get'
    }) as {articles: Content[]}).articles

    localStorage.setItem('version', String(currentVersion))
    localStorage.setItem('content', JSON.stringify(result ?? []))
    return result
  }

  const onAspectChanged = (event: MediaQueryListEvent | MediaQueryList) => {
    landscape.value = event.matches
    portrait.value = !event.matches

    articles.value.forEach((article, index) => {
      if (article.id === articleId.value || (!articleId.value && index === 0)) {
        articles.value[index].display.left = true
        articles.value[index].display.right = true
        currentIndex.value = index
        nextIndex.value = index
      } else {
        articles.value[index].display.left = false
        articles.value[index].display.right = false
      }
      articles.value[index].transition.left = 'none'
      articles.value[index].transition.right = 'none'
    })
    operationLock.value = false
  }
  
  const tasks = {
    async init() {
      const storedArticle = await restoreArticles()

      articles.value = [
        {
          type: 'index',
          title: photoBookHtml.home,
          display: {
            right: !articleId.value,
            left: !articleId.value
          },
          transition: {
            right: 'none',
            left: 'none'
          },
          border: generateBorderColor()
        } as Article
      ].concat(
        storedArticle.map((content) => {
          return {
            ...content,
            type: 'photo',
            display: {
              right: content.id === articleId.value,
              left: content.id === articleId.value
            },
            transition: {
              right: 'none',
              left: 'none'
            },
            border: generateBorderColor()
          }
        })
      ) as Article[]

      const index = articles.value.findIndex(article => article.id === articleId.value)
      currentIndex.value = index < 0 ? 0 : index
      nextIndex.value = index < 0 ? 0 : index
    },
    incrementalTurn() {
      tasks.turnPage(articles.value[currentIndex.value + 1]?.id)
    },
    incrementalTakeOver() {
      if (articles.value[currentIndex.value].transition.right === 'none') {
        return
      }
      if (articles.value[currentIndex.value]) {
        articles.value[currentIndex.value].transition.left = 'none'
        articles.value[currentIndex.value].transition.right = 'none'
      }
      if (articles.value[nextIndex.value]) {
        articles.value[nextIndex.value].transition.left = 'turn'
        articles.value[nextIndex.value].display.left = true
      }
    },
    decrementalTurn() {
      tasks.turnPage(articles.value[currentIndex.value - 1]?.id)
    },
    decrementalTakeOver() {
      if (articles.value[currentIndex.value].transition.left === 'none') {
        return
      }
      if (articles.value[currentIndex.value]) {
        articles.value[currentIndex.value].transition.right = 'none'
        articles.value[currentIndex.value].transition.left = 'none'
      }
      if (articles.value[nextIndex.value]) {
        articles.value[nextIndex.value].transition.right = 'turn'
        articles.value[nextIndex.value].display.right = true
      }
    },
    leave(targetIndex: number) {
      if (articles.value[targetIndex].transition.right === 'turn') {
        articles.value[targetIndex].transition.right = 'none'
        articles.value[targetIndex].display.left = false
        currentIndex.value = nextIndex.value
      }
      if (articles.value[targetIndex].transition.right === 'none') {
        articles.value[targetIndex].display.left = false
        currentIndex.value = nextIndex.value
        operationLock.value = false
      }
    },
    enter(targetIndex: number) {
      if (
        articles.value[targetIndex].transition.right === 'none'
      ) {
        if (articles.value[currentIndex.value]) {
          articles.value[currentIndex.value].transition.right = 'turn'
          articles.value[currentIndex.value].display.right = false
        }
        articles.value[targetIndex].display.left = true
        operationLock.value = false
      }
      if (
        articles.value[targetIndex].transition.right === 'turn'
      ) {
        articles.value[targetIndex].display.left = true
        articles.value[targetIndex].transition.right = 'none'

        if (articles.value[currentIndex.value]) {
          articles.value[currentIndex.value].transition.right = 'none'
          articles.value[currentIndex.value].display.right = false
        }
      }
      nextIndex.value = targetIndex
    },
    rightShown(targetIndex: number) {
      if (articles.value[targetIndex].transition.right === 'turn') {
        if (articles.value[targetIndex]) {
          articles.value[targetIndex].transition.right = 'none'
          articles.value[targetIndex].transition.left = 'none'
        }
        if (articles.value[currentIndex.value]) {
          articles.value[currentIndex.value].transition.left = 'none'
          articles.value[currentIndex.value].transition.right = 'none'
          articles.value[currentIndex.value].display.right = false
        }
        currentIndex.value = nextIndex.value
        operationLock.value = false
      } else if (
        articles.value[targetIndex].transition.right === 'none' &&
        articles.value[currentIndex.value]
      ) {
        articles.value[currentIndex.value].transition.right = 'turn'
        articles.value[currentIndex.value].display.right = false
        nextIndex.value = targetIndex
      }
    },
    leftShown(targetIndex: number) {
      if (articles.value[targetIndex].transition.left === 'turn') {
        if (articles.value[targetIndex]) {
          articles.value[targetIndex].transition.left = 'none'
          articles.value[targetIndex].transition.right = 'none'
        }
        if (articles.value[currentIndex.value]) {
          articles.value[currentIndex.value].transition.right = 'none'
          articles.value[currentIndex.value].transition.left = 'none'
          articles.value[currentIndex.value].display.left = false
        }
        currentIndex.value = nextIndex.value
        operationLock.value = false
      } else if (
        articles.value[targetIndex].transition.left === 'none' &&
        articles.value[currentIndex.value]
      ) {
        articles.value[currentIndex.value].transition.left = 'turn'
        articles.value[currentIndex.value].display.left = false
        nextIndex.value = targetIndex
      }
    },
    turnTo(targetIndex: number) {
      if (currentIndex.value < targetIndex && articles.value[targetIndex]) {
        articles.value[targetIndex].display.right = true
      }
      if (currentIndex.value > targetIndex && articles.value[targetIndex]) {
        if (landscape.value) {
          articles.value[targetIndex].display.left = true
        }
        if (portrait.value) {
          articles.value[targetIndex].transition.right = 'turn'
          articles.value[targetIndex].display.right = true
        }
      }
    },
    turnPage(pageId: number | null | undefined) {
      if (operationLock.value) {
        return
      }
      operationLock.value = true
      historyState.article = pageId ?? null
      silentlyRouting.push(pageId ? `/article/${pageId}` : '/', historyState)
    }
  }
  
  onMounted(() => {
    onAspectChanged(mediaMatcher)
    mediaMatcher.addEventListener('change', onAspectChanged)
  })
  onUnmounted(() => {
    mediaMatcher.removeEventListener('change', onAspectChanged)
  })

  return {
    tasks,
    articles,
    currentIndex,
    nextIndex,
    scrollerActivity,
    portrait,
    landscape
  }
}

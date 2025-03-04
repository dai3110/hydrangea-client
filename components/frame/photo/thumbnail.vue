<script setup lang="ts">
import type { Article } from '~/types/photobook'

const props = defineProps<{
  articles: Article[]
  activity: {
    left: boolean
    right: boolean
  }
  current: number
  orientation?: 'portrait' | 'landscape'
}>()

const naviScrollRate = 3 / 4
const thumbnailPanel = ref<HTMLElement>()
const resizeObserver = ref<ResizeObserver>()

const emits = defineEmits<{ (e: 'turn', value?: number | null | undefined): void }>()

const tasks = {
  adjustScrollArea() {
    const panel = thumbnailPanel.value
    const scrollWidth = panel?.scrollWidth ?? 0
    const scrollLeft = panel?.scrollLeft ?? 0
    const clientWidth = panel?.clientWidth ?? 0
    props.activity.left = scrollLeft > 0
    props.activity.right = scrollWidth - scrollLeft > clientWidth
  },
  naviScroll(direction: boolean) {
    const panel = thumbnailPanel.value
    const clientWidth = panel?.clientWidth ?? 0
    panel?.scrollBy({
      left: (direction ? 1 : -1) * clientWidth * naviScrollRate,
      behavior: 'smooth'
    })
  },
  intoView(behavior: 'auto' | 'instant' | 'smooth') {
    const elm = document.querySelector(`[data-thumb-index="${props.current}"]`)
    elm &&
      elm.scrollIntoView({
        behavior,
        inline: 'center'
      })
  }
}

watch(
  () => props.articles,
  () => {
    nextTick(() => tasks.intoView('instant'))
  }
)
watch(
  () => props.current,
  () => {
    nextTick(() => tasks.intoView('smooth'))
  }
)

onMounted(() => {
  resizeObserver.value = new ResizeObserver(tasks.adjustScrollArea)
  thumbnailPanel.value && resizeObserver.value.observe(thumbnailPanel.value)
  thumbnailPanel.value?.addEventListener('scroll', tasks.adjustScrollArea)
})

onUnmounted(() => {
  thumbnailPanel.value && resizeObserver.value?.unobserve(thumbnailPanel.value)
  resizeObserver.value?.disconnect()
  thumbnailPanel.value?.removeEventListener('scroll', tasks.adjustScrollArea)
})
</script>

<template>
  <div class="scroller" :data-more="activity.left ? 'left' : undefined">
    <button
      class="material-symbols-outlined"
      :disabled="!activity.left"
      @click="() => tasks.naviScroll(false)"
    >
      keyboard_double_arrow_left
    </button>
  </div>
  <div ref="thumbnailPanel" class="overflow">
    <div class="selector">
      <div
        v-for="(article, index) in articles"
        :key="index"
        class="thumbnail"
        @click="() => emits('turn', article.id)"
        :data-thumb-index="index"
        :data-stay="current === index || undefined"
      >
        <img v-if="article.image" :src="`https://hydrangea-photo.s3.ap-northeast-1.amazonaws.com/${article.image}`" />
        <span v-if="article.type === 'index'" class="material-symbols-outlined">house</span>
      </div>
    </div>
  </div>
  <div class="scroller" :data-more="activity.right ? 'right' : undefined">
    <button
      class="material-symbols-outlined"
      :disabled="!activity.right"
      @click="() => tasks.naviScroll(true)"
    >
      keyboard_double_arrow_right
    </button>
  </div>
</template>

<style lang="scss" scoped>
$control_height: 8.8rem;

.scroller {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 100%;
  position: relative;

  button {
    flex: 1;
    height: 100%;
    appearance: none;
    background-color: #111;
    border-style: solid;
    border-color: #000;
    border-width: 0 1px;
    color: rgba(#fff, 0.5);
    font-size: 2.4rem;
    cursor: pointer;

    &:disabled {
      color: rgba(#fff, 0.1);
      pointer-events: none;
    }
  }

  &[data-more] {
    &::after {
      content: '';
      display: block;
      width: 1.5rem;
      height: 100%;
      pointer-events: none;
      position: absolute;
      top: 0;
    }
  }
  &[data-more="right"] {
    button {
      border-left: none;
    }
    &::after {
      background-image: linear-gradient(
        to left,
        #111,
        transparent
      );
      right: 100%;
    }
  }
  &[data-more="left"] {
    button {
      border-right: none;
    }
    &::after {
      background-image: linear-gradient(
        to right,
        #111,
        transparent
      );
      left: 100%;
    }
  }
}

.overflow {
  width: calc(100% - 8rem);
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;

  -ms-overflow-style: none;
  scrollbar-width: none;

  &::scrollbar,
  &::-webkit-scrollbar {
    display: none;
  }
}

.selector {
  width: auto;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0.4rem;
  gap: 0.4rem;
}

.thumbnail {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  flex-basis: calc($control_height - 1rem);
  height: calc($control_height - 1rem);
  aspect-ratio: 1;
  border: 1px solid rgba(#000, 0.5);
  background-color: rgba(#333, 0.25);
  cursor: pointer;
  color: rgba(#fff, 0.4);

  :deep(.material-symbols-outlined) {
    font-size: 4rem;
  }

  & > img {
    width: auto;
    height: auto;
    max-width: calc($control_height - 2rem);
    max-height: calc($control_height - 2rem);
  }

  &[data-stay] {
    box-shadow: inset 0 0 2px 1px rgba(#fff, 0.4);
  }
}
</style>

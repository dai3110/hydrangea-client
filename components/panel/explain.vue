<script setup lang="ts">
const maxFontSize = 16
const props = defineProps<{
  content: string | null | undefined
}>()
const context = ref<HTMLElement>()
const baseWidth = ref(1)
const baseHeight = ref(1)
const contextWidth = ref(1)
const fontSize = ref(maxFontSize)
const scale = ref(1)
const resizeObserver = ref<ResizeObserver>()
const aspectRatio = computed(() => baseWidth.value / baseHeight.value)
const lines = computed(() => props.content?.split('\n').map((line) => line.trim()))

const fit = () => {
  const clientHeight = context.value?.clientHeight ?? 0
  const scrollHeight = context.value?.scrollHeight ?? 0

  if (clientHeight && scrollHeight > clientHeight) {
    contextWidth.value += 1
  } else {
    scale.value = baseWidth.value / contextWidth.value
  }
}

const adjust = () => {
  const style = context.value?.parentNode
    ? window.getComputedStyle(context.value.parentNode as HTMLElement)
    : null
  const width = (context.value?.parentNode as HTMLElement)?.clientWidth ?? 1
  const height = (context.value?.parentNode as HTMLElement)?.clientHeight ?? 1
  contextWidth.value = 0
  baseWidth.value = width
  baseHeight.value = height
  fontSize.value = Math.min(parseInt(style?.fontSize ?? `${maxFontSize}`), maxFontSize)
  nextTick(() => {
    contextWidth.value = width
  })
}

watch(aspectRatio, () => {
  nextTick(fit)
})

watch(contextWidth, () => {
  nextTick(fit)
})

onMounted(() => {
  resizeObserver.value = new ResizeObserver(adjust)
  context.value?.parentNode &&
    resizeObserver.value.observe(context.value.parentNode as HTMLElement)
})
onUnmounted(() => {
  context.value && resizeObserver.value?.unobserve(context.value)
  resizeObserver.value?.disconnect()
})
</script>

<template>
  <div class="message">
    <div>
      <div
        ref="context"
        :style="{
          fontSize: `${fontSize}px`,
          aspectRatio,
          width: `${contextWidth}px`,
          transform: `scale(${scale})`
        }"
      >
        <p v-for="(line, index) in lines" :key="index">{{ line }}</p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.message {
  display: flex;
  flex-direction: row;
  padding: 1em;

  & > div {
    position: relative;
    font-size: 1.6em;
    color: rgba(#fff, 0.8);
    width: 100%;
    height: 100%;

    & > div {
      position: absolute;
      width: 100%;
      height: auto;
      top: 0;
      left: 0;
      line-height: 2;
      letter-spacing: 0.04em;
      overflow-x: hidden;
      overflow-y: auto;
      transform-origin: top left;

      p {
        &:first-of-type {
          margin-top: 0;
        }
        &:last-of-type {
          margin-bottom: 0;
        }
      }
    }
  }
}
</style>

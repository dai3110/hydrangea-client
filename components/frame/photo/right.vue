<script setup lang="ts">
import { pageThicknessEmUnit, pageThicknessWidthRate } from '~/const/photobook'
import type { Article } from '~/types/photobook'
import MapPanel from '@/components/panel/map.vue'
import ExplainPanel from '@/components/panel/explain.vue'

const props = defineProps<{
  shadow: boolean
  total: number
  index: number
  current: number
  reserved: number
  article: Article
  next?: Article | null
  markers: {
    lat: number | null | undefined
    lng: number | null | undefined
    article: number | null | undefined
  }[]
}>()

const emits = defineEmits<{
  (e: 'takeover'): void
  (e: 'complete'): void
  (e: 'next'): void
  (e: 'select', v: number): void
}>()

</script>

<template>
  <div
    v-if="shadow"
    class="strong_shadow"
    :style="{
      zIndex: 0,
      top: '0px',
      left: '0px',
      width: `calc(${(total - 1) * pageThicknessEmUnit * pageThicknessWidthRate}em + 100%)`,
      borderRightColor: 'transparent',
      borderBottomColor: 'transparent'
    }"
  ></div>

  <Transition name="shadow">
    <div
      v-if="Math.max(current, reserved) < index"
      class="shadow"
      :style="{
        zIndex: total - index + 1,
        top: `${-(total - index) * pageThicknessEmUnit}em`,
        left: '0px',
        width: `calc(${index * pageThicknessEmUnit * pageThicknessWidthRate}em + 100%)`,
        borderRightColor: article.border.y,
        borderBottomColor: article.border.x
      }"
    ></div>
  </Transition>

  <Transition
    :name="article.transition.right"
    @after-leave="() => emits('takeover')"
    @after-enter="() => emits('complete')"
    v-bind="$attrs"
  >
    <div
      v-if="article.display.right"
      class="panel"
      :style="{
        zIndex: total - index + 100,
        top: `${-(total - index) * pageThicknessEmUnit}em`,
        left: '0px',
        width: `calc(${index * pageThicknessEmUnit * pageThicknessWidthRate}em + 100%)`,
        borderRightColor: article.border.y,
        borderBottomColor: article.border.x
      }"
    >
      <div
        class="groove"
        :style="{
          width: `${(total - index) * pageThicknessEmUnit}em`,
          borderTopLeftRadius: `100% ${(total - index) * pageThicknessEmUnit}em`
        }"
      >
        <div
          class="bevel"
          :style="{
            transform: `scaleY(${(total - index) / total})`
          }"
        ></div>
      </div>
      <div class="page">
        <div v-if="article.type === 'index'" class="index">
          <MapPanel
            :lat="37"
            :lng="139"
            :level="6"
            :markers="markers"
            map="aerial"
            class="map"
            @select="(id) => emits('select', id)"
          />
          <div class="operation">
            <button v-if="next" @click="() => emits('next')">
              <span>{{ next.title }}</span>
            </button>
          </div>
        </div>
        <div v-if="article.type === 'photo'" class="content">
          <ExplainPanel class="explain" :content="article.explain" />
          <MapPanel
            v-if="article.lat && article.lng"
            :lat="article.lat"
            :lng="article.lng"
            :level="11"
            class="map"
          />
          <div class="operation">
            <button v-if="next" @click="() => emits('next')">
              <span>{{ next.title }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
@use 'sass:color';
$control_height: 8.8rem;
$book_margin: 2.4rem;
$area_width: min(
  (100dvh - $control_height - $book_margin * 2) * 5 / 3,
  100dvw - $book_margin * 2
);
$page_border_color: #332c22;
$page_color: #333;
$groove_width: calc($area_width / 50);
$width: calc($area_width / 2 - $groove_width);

.panel {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  transform-origin: left;
  position: absolute;
  height: 100%;
}

.groove {
  position: relative;
  height: 100%;

  background-image: linear-gradient(
      to left,
      transparent 40%,
      color.adjust($page_color, $lightness: -10%) 100%
    ),
    url('/assets/canvasbg.jpg');
  background-size: 100%, 50%;

  .bevel {
    display: block;
    width: 100%;
    aspect-ratio: 1;
    top: 100%;
    left: 0;
    position: absolute;
    transform-origin: top;

    background-image: radial-gradient(
      circle at bottom right,
      transparent calc(100% / sqrt(2) - 5%),
      $page_color calc(100% / sqrt(2)),
      color.adjust($page_color, $lightness: -10%) calc(100% / sqrt(2))
    );
  }
}

.page {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  border-width: 1px 1px 1px 0;
  border-radius: 0 0.4rem 0.4rem 0;
  background-color: #fff;
  border-style: solid;
  border-color: $page_border_color;
  flex: 1;
  height: 100%;
  background-image: url('/assets/canvasbg.jpg');
}

.index,
.content {
  display: flex;
  flex-direction: column;
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.explain {
  flex: 2;
  margin: 1.2em 1.2em 0.6em;
  background-image: linear-gradient(
    to bottom,
    rgba($page_color, 0.5),
    rgba($page_color, 0.75) 100%
  );
  border: 1px solid rgba(#000, 0.5);
}

.map {
  border: 1px solid rgba(#000, 0.8);
  filter: grayscale(0.5);
  margin: 1.2em 1.2em 0.6em;

  .index & {
    flex: 1;
  }
  .content & {
    flex: 3;
  }
}

.operation {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  height: calc($width * 0.075);

  button {
    display: flex;
    flex-direction: row;
    align-items: center;
    appearance: none;
    border: none;
    background-color: transparent;
    color: rgba(#fff, 0.6);
    cursor: pointer;
    align-self: flex-end;

    &::after {
      content: '\f46a';
      font-family: 'Material Symbols Outlined';
      font-weight: normal;
      font-style: normal;
      font-size: 2em;
      line-height: 1;
      letter-spacing: normal;
      text-transform: none;
      display: inline-block;
      white-space: nowrap;
      word-wrap: normal;
      direction: ltr;
    }
  }
}

.none {
  &-leave-from,
  &-enter-to {
    transform: perspective(96rem) rotateY(0);
  }
  &-leave-to,
  &-enter-from {
    transform: perspective(96rem) rotateY(0);
  }
}
.turn {
  &-leave-from,
  &-enter-to {
    transform: perspective(96rem) rotateY(0);
  }
  &-enter-active {
    transition: transform 555ms cubic-bezier(0.34, 0.61, 0.34, 0.61);
  }
  &-leave-active {
    transition: transform 555ms cubic-bezier(0.61, 0.34, 0.61, 0.34);
  }
  &-leave-to,
  &-enter-from {
    transform: perspective(96rem) rotateY(-90deg);
  }
}
.shadow {
  border-style: solid;
  border-width: 0 1px 1px 0;
  border-style: solid;
  border-radius: 4em 0.4rem 0.4rem 0;
  box-shadow: 0.2em 0.2em 0.5em 0 rgba(#000, 0.01);
  position: absolute;
  height: 100%;

  &-leave-from,
  &-enter-to {
    opacity: 1;
  }
  &-leave-active {
    transition: opacity 33ms linear;
  }
  &-enter-active {
    transition: opacity 1ms linear;
  }
  &-leave-to,
  &-enter-from {
    opacity: 0;
  }
}
.strong_shadow {
  background-color: $page_color;
  border-style: solid;
  border-width: 0 1px 1px 0;
  border-radius: 4em 0.4rem 0.4rem 0;
  box-shadow: 0.2em 0.2em 0.5em 0 rgba(#000, 0.01);
  box-shadow: 0.2em 0.2em 0.5em 0 rgba(#000, 0.75);
  position: absolute;
  height: 100%;
}
</style>

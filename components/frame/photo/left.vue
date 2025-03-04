<script setup lang="ts">
import { pageThicknessEmUnit, pageThicknessWidthRate, photoBookHtml } from '~/const/photobook'
import type { Article } from '~/types/photobook'

const props = defineProps<{
  shadow: boolean
  total: number
  index: number
  current: number
  reserved: number
  article: Article
  previous?: Article | null
}>()

const emits = defineEmits<{
  (e: 'takeover'): void
  (e: 'complete'): void
  (e: 'prev'): void
}>()
</script>

<template>
  <div
    v-if="shadow"
    class="strong_shadow"
    :style="{
      zIndex: 0,
      top: '0px',
      right: '0px',
      width: `calc(${(total - 1) * pageThicknessEmUnit * pageThicknessWidthRate}em + 100%)`,
      borderLeftColor: 'transparent',
      borderBottomColor: 'transparent'
    }"
  ></div>

  <Transition name="shadow">
    <div
      v-if="Math.min(current, reserved) > index"
      class="shadow"
      :style="{
        zIndex: index,
        top: `${-index * pageThicknessEmUnit}em`,
        right: '0px',
        width: `calc(${
          (total - index) * pageThicknessEmUnit * pageThicknessWidthRate
        }em + 100%)`,
        borderLeftColor: article.border.y,
        borderBottomColor: article.border.x
      }"
      :data-index="index"
    ></div>
  </Transition>

  <Transition
    :name="article.transition.left"
    @after-leave="() => emits('takeover')"
    @after-enter="() => emits('complete')"
    v-bind="$attrs"
  >
    <article
      v-if="article.display.left"
      class="panel"
      :style="{
        zIndex: index + 100,
        top: `${-index * pageThicknessEmUnit}em`,
        right: '0px',
        width: `calc(${
          (total - index) * pageThicknessEmUnit * pageThicknessWidthRate
        }em + 100%)`,
        borderLeftColor: article.border.y,
        borderBottomColor: article.border.x
      }"
    >
      <div class="page">
        <div v-if="article.type === 'index'" class="index">
          <div class="title">
            <h1 v-html="photoBookHtml.title"></h1>
          </div>
          <div class="explain"><div v-html="photoBookHtml.explain"></div></div>
        </div>
        <div v-if="article.type === 'photo'" class="content">
          <div class="title">
            <h2>{{ article.title }}</h2>
          </div>
          <div class="photo">
            <figure>
              <img
                v-if="article.image"
                :src="`https://hydrangea-photo.s3.ap-northeast-1.amazonaws.com/${article.image}`"
              />
            </figure>
          </div>
          <div class="operation">
            <button v-if="previous" @click="() => emits('prev')">
              <span>{{ previous.title }}</span>
            </button>
          </div>
        </div>
      </div>
      <div
        class="groove"
        :style="{
          width: `${index * pageThicknessEmUnit}em`,
          borderTopRightRadius: `100% ${index * pageThicknessEmUnit}em`
        }"
      >
        <div
          class="bevel"
          :style="{
            transform: `scaleY(${index / total})`
          }"
        ></div>
      </div>
    </article>
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
  transform-origin: right;
  position: absolute;
  height: 100%;
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
    transform: perspective(96rem) rotateY(90deg);
  }
}

.shadow {
  border-style: solid;
  border-width: 0 0 1px 1px;
  border-radius: 0.4rem 4em 0 0.4rem;
  box-shadow: -0.2em 0.2em 0.5em 0 rgba(#000, 0.01);
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
  border-width: 0 0 1px 1px;
  border-radius: 0.4rem 4em 0 0.4rem;
  box-shadow: -0.2em 0.2em 0.5em 0 rgba(#000, 0.75);
  position: absolute;
  height: 100%;
}

.page {
  background-color: #fff;
  border-style: solid;
  border-color: $page_border_color;
  border-width: 1px 0 1px 1px;
  flex: 1;
  height: 100%;
  background-image: url('/assets/canvasbg.jpg');
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  border-radius: 0.4rem 0 0 0.4rem;
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

.title {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  font-size: inherit;
  margin: 1.2em 1.2em 0;
  color: rgba(#fff, 0.8);
  text-shadow: 0 0 1px #000;
  letter-spacing: 0.2em;

  .index & {
    $cover_base_color: rgb(144, 133, 108);
    flex: 3;
    background-image: linear-gradient(
      to bottom,
      rgba($cover_base_color, 0.35),
      rgba(color.adjust($cover_base_color, $lightness: -20%), 0.9)
    );
    box-shadow: inset 0 0 2em 0.6em rgba(color.adjust($cover_base_color, $lightness: 20%), 0.2);
    border: 2px dotted rgba(#111, 0.4);
    border-radius: 0.4em;

    & > h1,
    & > h2 {
      width: 100%;
      padding: 2.4rem;
      font-size: 2.4em;
      text-align: center;

      :deep(span) {
        display: block;
      }
      :deep(small) {
        font-size: 0.8em;
        color: rgba(#fff, 0.5);
      }
    }
  }
  .content & {
    flex: 1;
    border: 1px solid rgba(#000, 0.5);
    background-image: linear-gradient(
      to bottom,
      rgba($page_color, 0.5),
      rgba($page_color, 0.75) 100%
    );
    & > h1,
    & > h2 {
      font-size: 2em;
    }
  }
}

.explain {
  flex: 1;
  width: 100%;
  padding: 1.2em;

  & > div {
    width: 100%;
    height: 100%;
    border: 1px solid rgba(#000, 0.5);
    background-image: linear-gradient(
      to bottom,
      rgba(#000, 0.25),
      rgba(#000, 0.5) 100%
    );
    color: rgba(#fff, 0.6);
    font-size: 1em;
    padding: 1.2em;
    line-height: 1.8;

    :deep(ul) {
      padding-left: 1.5em;
    }
  }
}

.photo {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-image: linear-gradient(to bottom, rgba(#000, 0.15), rgba(#000, 0.3) 100%);
  border: 1px solid rgba(#000, 0.5);
  aspect-ratio: 1;
  margin: 1.2em 1.2em 0.6em;
  position: relative;

  figure {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;

    img {
      width: auto;
      height: auto;
      max-width: calc(100% - 2em);
      max-height: calc(100% - 2em);
    }
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
    align-self: flex-start;
    color: rgba(#fff, 0.6);
    cursor: pointer;

    &::before {
      content: '\e5cb';
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

.groove {
  position: relative;
  height: 100%;
  background-image: linear-gradient(
      to right,
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
      circle at bottom left,
      transparent calc(100% / sqrt(2) - 5%),
      $page_color calc(100% / sqrt(2)),
      color.adjust($page_color, $lightness: -10%) calc(100% / sqrt(2))
    );
  }
}
</style>

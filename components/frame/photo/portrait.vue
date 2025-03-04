<script setup lang="ts">
import { pageThicknessEmUnit, pageThicknessWidthRate, photoBookHtml } from '~/const/photobook'
import type { Article } from '~/types/photobook'
import MapPanel from '@/components/panel/map.vue'
import ExplainPanel from '@/components/panel/explain.vue'

const props = defineProps<{
  total: number
  index: number
  current: number
  reserved: number
  article: Article
}>()

const emits = defineEmits<{
  (e: 'leave'): void
  (e: 'enter'): void
}>()

const tabTarget = ref<'comment' | 'map'>('map')

</script>

<template>
  <Transition
    :name="article.transition.right"
    @after-leave="() => emits('leave')"
    @after-enter="() => emits('enter')"
    v-bind="$attrs"
  >
    <div
      v-if="article.display.right"
      class="panel"
      :style="{
        zIndex: total - index + 100
      }"
    >
      <div v-if="article.type === 'index'" class="title">
        <h1 v-html="photoBookHtml.title"></h1>
      </div>
      <div v-if="article.type === 'index'" class="notice">
        <div v-html="photoBookHtml.explain"></div>
      </div>
    
      <div v-if="article.type === 'photo'" class="head">
        <h2>{{ article.title }}</h2>
      </div>
      <div v-if="article.type === 'photo'" class="photo">
        <figure>
          <img v-if="article.image" :src="`https://hydrangea-photo.s3.ap-northeast-1.amazonaws.com/${article.image}`" />
        </figure>
      </div>
      <div v-if="article.type === 'photo'" class="operation">
        <div class="content">

          <ExplainPanel v-if="tabTarget === 'comment'" class="explain" :content="article.explain" />

          <MapPanel
            v-if="tabTarget === 'map' && article.lat && article.lng"
            :lat="article.lat"
            :lng="article.lng"
            class="map"
            :level="11"
          />
        </div>
        <div class="tab">
          <button type="button" @click="() => (tabTarget = 'map')" :data-stay="tabTarget === 'map' ? true : undefined">Map</button>
          <button type="button" @click="() => (tabTarget = 'comment')" :data-stay="tabTarget === 'comment' ? true : undefined">Comment</button>
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
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 1.6rem;
  position: absolute;
  width: 100vw;
  height: 100%;
  background-image: url('/assets/canvasbg.jpg');
  padding: 1.6rem 1.6rem 0.4rem;
  transform-origin: left;
}

.head {
  width: 100%;
  height: 8rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: rgba(#000, 0.5);
  border: 1px solid rgba(#000, 0.7);
  font-size: 1.8rem;
  color: rgba(#fff, 0.67);
  text-shadow: 0 0 1px #000;
  letter-spacing: 0.07em;
}

.title {
  $cover_base_color: rgb(144, 133, 108);

  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  font-size: 2rem;
  margin: 1.6rem 1.6rem 0;
  color: rgba(#fff, 0.8);
  text-shadow: 0 0 1px #000;
  letter-spacing: 0.1rem;
  flex: 2;
  background-image: linear-gradient(
    to bottom,
    rgba($cover_base_color, 0.35),
    rgba(color.adjust($cover_base_color, $lightness: -20%), 0.9)
  );
  box-shadow: inset 0 0 2rem 0.6rem rgba(color.adjust($cover_base_color, $lightness: 20%), 0.2);
  border: 0.2rem dotted rgba(#111, 0.4);
  border-radius: 0.4rem;

  & > h1,
  & > h2 {
    width: 100%;
    font-size: 2.4rem;
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

.notice{
  flex: 1;
  width: 100%;

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
    font-size: 1.4rem;
    padding: 1.6rem;
    line-height: 1.8;

    :deep(ul) {
      padding-left: 1.5em;
    }
  }
}

.photo {
  position: relative;
  width: 100%;
  height: calc((100dvw - 3.2rem)* 3 / 2);
  
  & > figure {
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
    background-color: rgba(#000, 0.5);
    border: 1px solid rgba(#000, 0.7);

    & > img {
      width: auto;
      height: auto;
      max-width: calc(100% - 3.2rem);
      max-height: calc(100% - 3.2rem);
    }
  }
}

.operation {
  display: flex;
  flex-direction: column;
  justify-content: stretch;

  width: 100%;
  min-height: 28rem;
  flex: 1;

  .tab {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    width: 100%;
    height: 4rem;

    & > button {
      appearance: none;
      outline: none;
      border-style: solid;
      border-color: rgba(#000, 0.7);
      background-color: rgba(#000, 0.3);
      flex: 1;
      height: calc(100% - 2px);
      color: rgba(#fff, 0.67);
      font-size: 1.6rem;
      letter-spacing: 1px;

      &[data-stay] {
        height: 100%;
        background-color: rgba(#000, 0.5);
      }

      &:first-of-type {
        border-width: 1px 0 1px 1px;

        &[data-stay] {
          border-top-width: 0;
          border-right-width: 1px;
        }
      }
      &:last-of-type {
        border-width: 1px 1px 1px 0;

        &[data-stay] {
          border-top-width: 0;
          border-left-width: 1px;
        }
      }
    }
  }

  .content {
    width: 100%;
    flex: 1;
    border-style: solid;
    border-color: rgba(#000, 0.7);
    border-width: 1px 1px 0;
    background-color: rgba(#000, 0.5);
  }
}

.explain {
  width: calc(100% - 1.6rem);
  height: calc(100% - 1.2rem);
  margin: 0.8rem 0.8rem 0.4rem;
  font-size: 1rem;
}

.map {
  width: calc(100% - 1.6rem);
  height: calc(100% - 1.2rem);
  margin: 0.8rem 0.8rem 0.4rem;
  filter: grayscale(0.5);
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
    transition: transform 999ms ease-in-out;
  }
  &-leave-active {
    transition: transform 999ms ease-in-out;
  }
  &-leave-to,
  &-enter-from {
    transform: perspective(96rem) rotateY(-90deg);
  }
}
</style>

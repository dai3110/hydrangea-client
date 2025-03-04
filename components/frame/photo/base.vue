<script setup lang="ts">
import LeftPanel from '@/components/frame/photo/left.vue'
import RightPanel from '@/components/frame/photo/right.vue'
import PortraitPanel from '@/components/frame/photo/portrait.vue'
import ThumbnailPanel from '@/components/frame/photo/thumbnail.vue'

const {
  completeLoading,
  tasks,
  articles,
  currentIndex,
  nextIndex,
  scrollerActivity,
  portrait,
  landscape
} = usePhotoFrameControl()

const indexMarkers = computed<
  {
    lat: number | null | undefined
    lng: number | null | undefined
    article: number | null | undefined
  }[]
>(() => {
  return articles.value
    .map((article) => {
      return {
        lat: article.lat,
        lng: article.lng,
        article: article.id
      }
    })
    .filter((marker) => marker.lat && marker.lng && marker.article)
})

onMounted(() => {
  tasks.init()
})
</script>

<template>
  <div
    :class="{
      photo_frame: true,
      portrait,
      landscape
    }"
  >
    <div v-if="completeLoading" class="book_area">
      <div class="book_main">
        <div v-if="landscape" data-panel="left">
          <LeftPanel
            v-for="(article, index) in articles"
            :key="index"
            :shadow="index === 0"
            :total="articles.length"
            :index="index"
            :current="currentIndex"
            :reserved="nextIndex"
            :article="article"
            :previous="articles[index - 1]"
            @takeover="tasks.decrementalTakeOver"
            @complete="() => tasks.leftShown(index)"
            @prev="() => tasks.decrementalTurn()"
          />
        </div>
        <div v-if="landscape" data-panel="right">
          <RightPanel
            v-for="(article, index) in articles"
            :key="index"
            :shadow="index === 0"
            :total="articles.length"
            :index="index"
            :current="currentIndex"
            :reserved="nextIndex"
            :article="article"
            :next="articles[index + 1]"
            :markers="indexMarkers"
            @takeover="tasks.incrementalTakeOver"
            @complete="() => tasks.rightShown(index)"
            @next="() => tasks.incrementalTurn()"
            @select="(id) => tasks.turnPage(id)"
          />
        </div>
        <div v-if="portrait" data-panel="portrait">
          <PortraitPanel
            v-for="(article, index) in articles"
            :total="articles.length"
            :index="index"
            :current="currentIndex"
            :reserved="nextIndex"
            :article="article"
            @enter="() => tasks.enter(index)"
            @leave="() => tasks.leave(index)"
          />
        </div>
      </div>
    </div>
    <div v-if="completeLoading" class="book_control">
      <ThumbnailPanel
        :current="currentIndex"
        :articles="articles"
        :activity="scrollerActivity"
        @turn="(index) => tasks.turnPage(index)"
      />
    </div>
    <div v-if="!completeLoading" class="loading">
      {{ `waiting... lambda's "cold start"` }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'sass:color';
$control_height: 8.8rem;
$book_margin: 2.4rem;
$area_width: min(
  (100dvh - $control_height - $book_margin * 2) * 5 / 3,
  100dvw - $book_margin * 2
);

.photo_frame {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: stretch;
  width: 100%;
  height: 100%;
  background-image: url('/assets/woodbg.jpg');
}

.book_control {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: $control_height;
  background-color: rgba(#000, 0.6);
  border-top: 1px solid #000;
}

.book_area {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: calc(100dvh - $control_height);
  font-size: calc($area_width / 100);
}

.book_main {
  display: flex;
  position: relative;

  $groove_width: calc($area_width / 50);

  & > div {
    flex: 1;
    position: relative;
  }

  .landscape & {
    aspect-ratio: 5/3;
    width: 100%;
    max-width: $area_width;
    flex-direction: row;
  }
  .portrait & {
    width: 100%;
    height: 100%;
  }
}

.loading {
  align-self: center;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  color: #999;
}
</style>

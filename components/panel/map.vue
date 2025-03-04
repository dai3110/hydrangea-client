<script setup lang="ts">
import leaflet from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps<{
  lat: number
  lng: number
  level?: number
  markers?: {
    lat: number | null | undefined
    lng: number | null | undefined
    article: number | null | undefined
  }[]
  map?: 'map' | 'aerial'
}>()

const emits = defineEmits<{
  (e: 'select', v: number): void
}>()

const context = ref<HTMLElement>()

const init = () => {
  if (!context.value || typeof props.lat !== 'number' || typeof props.lng !== 'number') {
    return
  }

  const pin = leaflet.icon({
    iconUrl: '/assets/marker-icon.png',
    shadowUrl: '/assets/marker-shadow.png',
    iconSize: [25, 41],
    shadowSize: [41, 41],
    iconAnchor: [15, 43],
    shadowAnchor: [16, 44],
    popupAnchor: [23, -3]
  })

  const map = leaflet.map(context.value, {
    center: {
      lat: props.lat,
      lng: props.lng
    },
    zoom: props.level ?? 11
  })
  const layers = {
    map: leaflet.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png', {
      attribution:
        '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル</a>'
    }),
    aerial: leaflet.tileLayer(
      'https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg',
      {
        attribution:
          '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル</a>'
      }
    )
  }
  layers[props.map ?? 'aerial']?.addTo(map)

  leaflet.control.layers({
    地図: layers.map,
    衛星写真: layers.aerial
  }).addTo(map)

  if (!props.markers) {
    leaflet
      .marker(
        {
          lat: props.lat,
          lng: props.lng
        },
        { icon: pin }
      )
      .addTo(map)
  }
  props.markers?.forEach((prop) => {
    if (prop.lat && prop.lng && prop.article) {
      leaflet
      .marker(
        {
          lat: prop.lat,
          lng: prop.lng
        },
        { icon: pin }
      )
      .on('click', () => {
        emits('select', prop.article!)
      })
      .addTo(map)
    }
  })
}

onMounted(init)
</script>

<template>
  <div ref="context"></div>
</template>

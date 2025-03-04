export const useSilentlyRouting = (
  pathStateChanged: (state?: any) => void
) => {
  const state = ref<{ [key: string]: string | number | null } | null>()

  const handleChangedPath = () => {
    pathStateChanged(state.value)
  }

  const handlePopState = (event: PopStateEvent) => {
    state.value = event.state
  }

  watch(state, handleChangedPath, {deep: true})

  onMounted(() => {
    window.addEventListener('popstate', handlePopState)
  })

  onUnmounted(() => {
    window.removeEventListener('popstate', handlePopState)
  })

  return {
    push(path: string, historyState?: { [key: string]: string | number | null }) {
      state.value = historyState ?? null
      window.history.pushState(
        {
          ...historyState
        },
        '',
        path
      )
    }
  }
}

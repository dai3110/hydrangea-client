
export type Content = {
  id?: number
  title: string
  image?: string
  date?: string
  explain?: string
  lat?: number
  lng?: number
  type: 'index' | 'photo'
}

export type DisplayStatus = {
  display: {
    right: boolean
    left: boolean
  }
  transition: {
    right: string
    left: string
  }
  border: {
    x: string
    y: string
  }
}

export type Article = Content & DisplayStatus
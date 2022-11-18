export type SingleFeedInstance = {
  [pageUrl: string]: RpdeItem[]
}

export type RpdeItem = {
  kind: string
  state: string
  data: string
  modified: number
}
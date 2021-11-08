// enum Action {
//   Pop = 'Pop'
// }

export interface StateHistoryOptions {
  window?: Window
}

export interface Path extends Partial<Record<'pathname' | 'search' | 'hash', string>> {}

export type To = string | Path

export interface Location extends Path {
  state: any
  key: string
}

export interface StateHistory {
  back: () => void
  forward: () => void
  go: (delta: number) => void
  pushState: (to: To) => void
  replaceState: (to: To) => void
}

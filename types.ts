export type BroswerHistoryOptions = { window?: Window }

export enum Action {
  Pop = 'POP',
  Push = 'PUSH',
  Replace = 'REPLACE'
}

export type Pathname = string
export type Search = string
export type Hash = string

export interface Path {
  pathname: Pathname
  search: Search
  hash: Hash
}

export type Key = string

export interface Location extends Path {
  state: unknown
  key: Key
}

export type To = string | Partial<Path>

export interface Update {
  action: Action
  location: Location
}

export interface Listener {
  (update: Update): void
}

export interface Transition extends Update {
  retry(): void
}

export interface Blocker {
  (tx: Transition): void
}

export interface History {
  readonly action: Action

  readonly location: Location

  createHref(to: To): string

  push(to: To, state?: any): void

  replace(to: To, state?: any): void

  go(delta: number): void

  back(): void

  forward(): void

  listen(listener: Listener): () => void

  block(blocker: Blocker): void
}

export interface BroswerHistory extends History {}

export type Events<F> = {
  length: number
  push: (fn: F) => () => void
  call: (arg: any) => void
}

export type HistoryState = {
  usr: any
  idx: number
  key?: string
}

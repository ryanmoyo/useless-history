import {
  Action,
  Blocker,
  BroswerHistory,
  BroswerHistoryOptions,
  HistoryState,
  Listener,
  Location,
  To,
  Transition
} from 'types'
import {
  createEvents,
  readOnly,
  createHref,
  promptBeforeUnload,
  createKey,
  parsePath
} from 'utils'

const { Pop, Push, Replace } = Action
const PopStateEvent = 'popstate'
const BeforeUnloadEventType = 'beforeunload'

export const createBroswerHistory = (
  options: BroswerHistoryOptions = {}
): BroswerHistory => {
  const { window = document.defaultView } = options
  if (!window) throw new Error('OH MY GOD, `window` is missing!!!')
  const history = window.history

  const getIndexAndLocation = (): [number, Location] => {
    const { pathname, search, hash } = window.location
    const state = history.state || {}
    return [
      state.idx,
      readOnly<Location>({
        pathname,
        search,
        hash,
        state: state.usr || null,
        key: state.key || 'default'
      })
    ]
  }

  let blockedTopTx: Transition | null = null
  const listeners = createEvents<Listener>()
  const blockers = createEvents<Blocker>()
  let [index, location] = getIndexAndLocation()
  let action = Pop

  // or === undefined
  if (index == null) {
    index = 0
    history.replaceState(
      {
        ...history,
        idx: index
      },
      ''
    )
  }

  const getNextLocation = (to: To, state: any = null): Location => {
    return readOnly<Location>({
      pathname: location.pathname,
      search: '',
      hash: '',
      ...(typeof to === 'string' ? parsePath(to) : to),
      state,
      key: createKey()
    })
  }

  const getHistoryStateAndUrl = (
    nextLocation: Location,
    index: number
  ): [HistoryState, string] => [
    { usr: nextLocation.state, key: nextLocation.key, idx: index },
    createHref(nextLocation)
  ]

  const allowTx = (action: Action, location: Location, retry: () => void) =>
    !blockers.length || (blockers.call({ action, location, retry }), false)

  const applyTx = (nextAction: Action) => {
    action = nextAction
    ;[index, location] = getIndexAndLocation()
    listeners.call({ action, location })
  }

  const push = (to: To, state?: any) => {
    const nextAction = Push
    const nextLocation = getNextLocation(to, state)
    const retry = () => push(to, state)

    if (allowTx(nextAction, nextLocation, retry)) {
      const [historyState, url] = getHistoryStateAndUrl(nextLocation, index + 1)

      // TODO: Support forced reloading
      // try...catch because iOS limits us to 100 pushState calls :/
      try {
        history.pushState(historyState, '', url)
      } catch (error) {
        // They are going to lose state here, but there is no real
        // way to warn them about it since the page will refresh...
        window.location.assign(url)
      }

      applyTx(nextAction)
    }
  }

  const replace = (to: To, state?: any) => {
    const nextAction = Replace
    const nextLocation = getNextLocation(to, state)
    const retry = () => push(to, state)

    if (allowTx(nextAction, nextLocation, retry)) {
      const [historyState, url] = getHistoryStateAndUrl(nextLocation, index + 1)

      // TODO: Support forced reloading
      history.replaceState(historyState, '', url)

      applyTx(nextAction)
    }
  }

  const handlePop = () => {
    if (blockedTopTx) {
      blockers.call(blockedTopTx)
      blockedTopTx = null
    } else {
      const nextAction = Pop
      const [nextIndex, nextLocation] = getIndexAndLocation()

      if (blockers.length) {
        // here is !=, not !==, {}.idx should be undefined!!!
        if (nextIndex != null) {
          const delta = index - nextIndex
          const retry = () => go(delta * -1)
          if (delta) {
            blockedTopTx = {
              action: nextAction,
              location: nextLocation,
              retry
            }
            go(delta)
          }
        }
      } else {
        applyTx(nextAction)
      }
    }
  }

  window.addEventListener(PopStateEvent, handlePop)

  const go = (delta: number) => history.go(delta)
  const back = () => history.go(-1)
  const forward = () => history.go(1)
  const listen = (listener: Listener) => listeners.push(listener)
  const block = (blocker: Blocker) => {
    const unblock = blockers.push(blocker)

    if (blockers.length === 1)
      window.addEventListener(BeforeUnloadEventType, promptBeforeUnload)

    return () => {
      unblock()

      // Remove the beforeunload listener so the document may
      // still be salvageable in the pagehide event.
      // See https://html.spec.whatwg.org/#unloading-documents
      if (!blockers.length) {
        window.removeEventListener(BeforeUnloadEventType, promptBeforeUnload)
      }
    }
  }

  return {
    get action() {
      return action
    },
    get location() {
      return location
    },
    push,
    replace,
    createHref,
    go,
    back,
    forward,
    listen,
    block
  }
}

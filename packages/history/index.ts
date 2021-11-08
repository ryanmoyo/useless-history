import { StateHistory, StateHistoryOptions, To } from './types'

export const createStateHistory = (
  stateHistoryOptions: StateHistoryOptions
): StateHistory => {
  //
  const { window = document.defaultView! } = stateHistoryOptions
  const { history } = window

  const popstateHandler = () => {}

  window.addEventListener('popstate', popstateHandler)

  return {
    go: history.go,
    back: () => history.go(-1),
    forward: () => history.go(1),
    pushState: (to: To) => {},
    replaceState: (to: To) => {}
  }
}

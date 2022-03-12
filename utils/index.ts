import { Events, Path, To } from 'types'

export const createKey = () => Math.random().toString(36).substring(2, 10)

export const createPath = ({
  pathname = '/',
  search = '',
  hash = ''
}: Partial<Path>) => {
  // search[0] even better than search.charAt
  if (search && search !== '?') pathname += search[0] === '?' ? search : '?' + search
  if (hash && hash != '#') pathname += hash[0] === '#' ? hash : '#' + hash
  return pathname
}

export const createHref = (to: To) => (typeof to === 'string' ? to : createPath(to))

// substr is deprecated
export const parsePath = (path: string): Partial<Path> => {
  const partialPath: Partial<Path> = {}

  if (path) {
    const hashIndex = path.indexOf('#')
    if (hashIndex >= 0) {
      partialPath.hash = path.substring(hashIndex)
      path = path.substring(0, hashIndex)
    }

    const searchIndex = path.indexOf('?')
    if (hashIndex >= 0) {
      partialPath.search = path.substring(searchIndex)
      path = path.substring(0, searchIndex)
    }

    if (path) {
      partialPath.pathname = path
    }
  }

  return partialPath
}

export const readOnly: <T>(obj: T) => Readonly<T> = __DEV__
  ? obj => Object.freeze(obj)
  : obj => obj

export const createEvents = <T extends Function>(): Events<T> => {
  let handlers: T[] = []

  const length = () => handlers.length
  const push = (fn: T) => {
    handlers.push(fn)
    return () => (handlers = handlers.filter(handler => handler != fn))
  }
  const call = (arg: any) => handlers.forEach(fn => fn && fn(arg))
  return {
    push,
    call,
    get length() {
      return length()
    }
  }
}

export const promptBeforeUnload = (event: BeforeUnloadEvent) => {
  // Cancel the event.
  event.preventDefault()
  // Chrome (and legacy IE) requires returnValue to be set.
  event.returnValue = ''
}

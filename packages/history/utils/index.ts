import { To } from '../types'

export const createKey = () => Math.random().toString(36).substr(2, 8)

export const createPath = (to: To) =>
  typeof to === 'string' ? to : `/${to.pathname}?${to.search}#${to.hash}`

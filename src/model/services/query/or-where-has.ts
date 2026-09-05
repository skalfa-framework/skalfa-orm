import { whereHasSubquery } from '../relation/where-has'



export function orWhereHas(query: any, Model: any, path: string, callback?: (q: any) => void) {
  if (!Model) return query

  const relations = path.split('.')
  whereHasSubquery(query, Model, relations, callback, 'orWhereExists')

  return query
}

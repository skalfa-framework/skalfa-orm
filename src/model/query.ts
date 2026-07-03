import type { Knex } from 'knex'
import { findOrNotFound, firstOrNotFound, find, search, filter, selects, sorts, get, getFirst, paginate, expand, whereHas, orWhereHas, whereDoesntHave, orWhereDoesntHave, scope, withoutScope, withAggregate, orderByAggregate, option, paginateOrOption, resolve, format } from './services'



export function extendModelQuery(query: Knex.QueryBuilder, Model: any) {
  ;(query as any).$model = Model
  ;(query as any)._withTree = {}
  ;(query as any)._softDeleteScope = 'default'
  ;(query as any)._formatter = null
  ;(query as any)._disabledScopes = new Set<string>()



  // =========================
  // ## Soft delete query
  // =========================
  ;(query as any).withTrashed = function () {
    this._softDeleteScope = 'with'
    return this
  }

  ;(query as any).onlyTrashed = function () {
    this._softDeleteScope = 'only'
    return this
  }



  // ==========================
  // ## find or not found 
  // ==========================
  if (!(query as any).findOrNotFound) {
    ;(query as any).findOrNotFound = async function (id: any) {
      return findOrNotFound(this, Model, id)
    }
  }



  // ==========================
  // ## first or not found 
  // ==========================
  if (!(query as any).firstOrNotFound) {
    ;(query as any).firstOrNotFound = async function () {
      return firstOrNotFound(this, Model)
    }
  }



  // ==========================
  // ## find
  // ==========================
  if (!(query as any).find) {
    ;(query as any).find = async function (id: any) {
      return find(this, Model, id)
    }
  }



  // ==========================
  // ## Search query
  // ==========================
  if (!(query as any).search) {
    ;(query as any).search = function (
      keyword                            :  string,
      { includes = [], searchable = [] } : { includes?: string[], searchable?: string[] } = {}
    ) {
      return search(this, Model, keyword, { includes, searchable })
    }
  }



  // ==========================
  // ## Filer query
  // ==========================
  if (!(query as any).filter) {
    ;(query as any).filter = function (filters?: Record<string, string>) {
      return filter(this, filters)
    }
  }



  // ==========================
  // ## Select query
  // ==========================
  if (!(query as any).selects) {
    ;(query as any).selects = function ({ includes = [], selectable = [] } : { includes?: string[], selectable?: string[] } = {}) {
      return selects(this, Model, { includes, selectable })
    }
  }



  // ==========================
  // ## Sort query
  // ==========================
  if (!(query as any).sorts) {
    ;(query as any).sorts = function (sortsList?: string[]) {
      return sorts(this, sortsList)
    }
  }



  // ==========================
  // ## Get query
  // ==========================
  ;(query as any).get = async function () {
    return get(this)
  }



  // ==========================
  // ## First query
  // ==========================
  ;(query as any).getFirst = async function () {
    return getFirst(this)
  }



  // ==========================
  // ## Paginate query
  // ==========================
  if (!(query as any).paginate) {
    ;(query as any).paginate = async function (page = 1, limit = 10) {
      return paginate(this, Model, page, limit)
    }
  }



  // =================================>
  // ## Expand query (Eager loading)
  // =================================>
  ;(query as any).expand = function (entries: Array<string | Record<string, (q: any) => void>> = []) {
    return expand(this, entries)
  }



  // ==========================
  // ## Where has query
  // ==========================
  if (!(query as any).whereHas) {
    ;(query as any).whereHas = function (path: string, callback?: (q: any) => void) {
      return whereHas(this, Model, path, callback)
    }
  }



  // ==========================
  // ## Or where has query
  // ==========================
  if (!(query as any).orWhereHas) {
    ;(query as any).orWhereHas = function (path: string, callback?: (q: any) => void) {
      return orWhereHas(this, Model, path, callback)
    }
  }



  // ==========================
  // ## Where doesn't have has query
  // ==========================
  if (!(query as any).whereDoesntHave) {
    ;(query as any).whereDoesntHave = function (path: string, callback?: (q: any) => void) {
      return whereDoesntHave(this, Model, path, callback)
    }
  }



  // ==========================
  // ## Or where doesn't have has query
  // ==========================
  if (!(query as any).orWhereDoesntHave) {
    ;(query as any).orWhereDoesntHave = function (path: string, callback?: (q: any) => void) {
      return orWhereDoesntHave(this, Model, path, callback)
    }
  }



  // ==========================
  // ## Scope query
  // =========================
  if (!(query as any).scope) {
    ;(query as any).scope = function (name: string, ...args: any[]) {
      return scope(this, Model, name, ...args)
    }
  }

  if (!(query as any).withoutScope) {
    ;(query as any).withoutScope = function (...names: string[]) {
      return withoutScope(this, ...names)
    }
  }



  // ==========================
  // ## with aggregate query
  // ==========================
  if (!(query as any).withAggregate) {
    ;(query as any).withAggregate = function (expr: string, fn: 'count' | 'sum' | 'avg' | 'min' | 'max', column: string = '*', callback?: (q: any) => void) {
      return withAggregate(this, expr, fn, column, callback)
    }
  }



  // ==========================
  // ## Order by aggregate query
  // ==========================
  if (!(query as any).orderByAggregate) {
    ;(query as any).orderByAggregate = function (expr: string, fn: 'count' | 'sum' | 'avg' | 'min' | 'max', column: string = '*', direction: 'asc' | 'desc' = 'asc', callback?: (q: any) => void) {
      return orderByAggregate(this, expr, fn, column, direction, callback)
    }
  }



  // =================================>
  // ## Get option query
  // =================================>
  if (!(query as any).option) {
    ;(query as any).option = async function (selectableOption?: string[]) {
      return option(this, Model, selectableOption)
    }
  }



  // ==========================
  // ## Paginate or option query
  // ==========================
  if (!(query as any).paginateOrOption) {
    ;(query as any).paginateOrOption = async function (
      page               :  number              =  1,
      limit              :  number              =  10,
      option            ?:  string | boolean,
      selectableOption  ?:  string[],
    ) {
      return paginateOrOption(this, page, limit, option, selectableOption)
    }
  }



  // ==========================
  // ## Resolve query
  // ==========================
  if (!(query as any).resolve) {
    ;(query as any).resolve = async function (input: any = {}) {
      return resolve(this, input)
    }
  }



  // ==========================
  // ## format result query
  // ==========================
  if (!(query as any).format) {
    ;(query as any).format = function (formatter: string | ((item: any) => any)) {
      return format(this, Model, formatter)
    }
  }

  return query
}

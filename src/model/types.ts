import 'knex'
import type { Knex } from 'knex'
import type { Model } from './model'

export class NotFoundError extends Error {
  constructor(message: string = "Error: Record not found!") {
    super(message)
    this.name = "NotFoundError"
  }
}

// ==========================
// ## Field Decorator Type
// ==========================
export type FieldFlag = 'fillable' | 'selectable' | 'searchable' | 'hidden'
export type FieldMeta = {
  cast        ?:  ModelCastType
  fillable    ?:  boolean
  selectable  ?:  boolean
  searchable  ?:  boolean
  hidden      ?:  boolean
}



// ==========================
// ## Payload Type
// ==========================
export type NonFunctionKeys<T> = {
  [K in keyof T]: T[K] extends Function ? never : K
}[keyof T]

export type DataShape<T> = Pick<T, NonFunctionKeys<T>>

export type ModelPayload<T> = Partial<DataShape<T>>



// ==========================
// ## Cast Type
// ==========================
export type ModelCastType = 'string' | 'number' | 'boolean' | 'date' | 'json'



// ==========================
// ## Relation Type
// ==========================
export type ModelRelationType        =  'hasMany' | 'hasOne' | 'belongsTo' | 'belongsToMany'
export type ModelRelationDescriptor  =  {
  type           :  ModelRelationType
  model          :  () => typeof Model
  foreignKey     :  string
  localKey       :  string
  pivotTable    ?:  string
  pivotLocal    ?:  string
  pivotForeign  ?:  string
  callback      ?:  (q: any) => void
}



// ==========================
// ## Hook type
// ==========================
export type ModelHookEventType    =  "before-create" | "after-create" | "before-update" | "after-update" | "before-delete" | "after-delete"
export type ModelHookFn           =  (ctx: ModelHookContextType) => any
export type ModelHookContextType<T extends Model = Model>  =  {
  model      :  T
  trx       ?:  any
  snapshot  ?:  any
}



// ==========================
// ## Scope type
// ==========================
export type ScopeType = {
  fn: Function
  mode: 'global' | 'internal'
}



// ==========================
// ## Override knex Query builder interface
// ==========================
declare module 'knex' {
  namespace Knex {
    interface QueryBuilder<TRecord extends {} = any, TResult = any> {
      $model?: any
      _withTree?: Record<string, any>
      _formatter?: ((item: any) => any) | null
      _softDeleteScope?: 'default' | 'with' | 'only'

      _withAggregates?: Array<{
        relation: string
        alias: string
        fn: 'count' | 'sum' | 'avg' | 'min' | 'max'
        column: string | Knex.Raw
        callback?: (q: any) => void
      }>

      _orderByAggregates?: Array<{
        relation: string
        alias?: string
        fn: 'count' | 'sum' | 'avg' | 'min' | 'max'
        column: string | Knex.Raw
        direction: 'asc' | 'desc'
        callback?: (q: any) => void
      }>

      findOrNotFound(id: string | number): Promise<TRecord>
      firstOrNotFound(): Promise<TRecord>
      getFirst(): Promise<TRecord>
      get(): Promise<TRecord[]>
      paginate(page?: number, limit?: number): Promise<{ data: TRecord[]; total: number }>
      option(selectableOption?: string[]): Promise<Array<{ value: any; label: any }>>
      paginateOrOption(page?: number, limit?: number, option?: string | boolean, selectableOption?: string[]): Promise<{ data: any[]; total: number }>
      resolve(input?: any): Promise<{ data: TRecord[]; total: number }>
      format(formatter: string | ((item: TRecord) => any)): this
      withoutScope(name: string | string[]): this
      withTrashed(): this
      onlyTrashed(): this
      expand(relations?: Array<string | Record<string, (q: any) => void>>): this
      search(keyword?: string, options?: { includes?: string[]; searchable?: string[] }): this
      filter(filters?: Record<string, string>): this
      selects(options?: { includes?: string[]; selectable?: string[] }): this
      sorts(sorts?: string[]): this
      whereHas(relation: string, callback?: (q: Knex.QueryBuilder<any>) => void): this
      orWhereHas(relation: string, callback?: (q: Knex.QueryBuilder<any>) => void): this
      whereDoesntHave(relation: string, callback?: (q: Knex.QueryBuilder<any>) => void): this
      orWhereDoesntHave(relation: string, callback?: (q: Knex.QueryBuilder<any>) => void): this
      withAggregate(expr: string, fn: 'count' | 'sum' | 'avg' | 'min' | 'max', column?: string | Knex.Raw, callback?: (q: Knex.QueryBuilder<any>) => void): this
      orderByAggregate(expr: string, fn: 'count' | 'sum' | 'avg' | 'min' | 'max', column?: string | Knex.Raw, direction?: 'asc' | 'desc', callback?: (q: Knex.QueryBuilder<any>) => void): this
    }
  }
}

export interface ModelQueryBuilder<T extends Record<string, any> = Record<string, any> > extends Knex.QueryBuilder<T, T[]> {
}

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
    interface QueryBuilder<TRecord = any, TResult = any> {
      $model?: any
      _withTree?: Record<string, any>
      _formatter?: ((item: any) => any) | null

      _softDeleteScope?: 'default' | 'with' | 'only'

      _withAggregates?: Array<{
        relation: string
        alias: string
        fn: 'count' | 'sum' | 'avg' | 'min' | 'max'
        column: string
        callback?: (q: any) => void
      }>

      _orderByAggregates?: Array<{
        relation: string
        alias?: string
        fn: 'count' | 'sum' | 'avg' | 'min' | 'max'
        column: string
        direction: 'asc' | 'desc'
        callback?: (q: any) => void
      }>
    }
  }
}

export interface ModelQueryBuilder<T extends Record<string, any> = Record<string, any> > extends Knex.QueryBuilder<T, T[]> {
  _withTree?: Record<string, any>
  _formatter?: ((item: T) => any) | null
  _softDeleteScope?: 'default' | 'with' | 'only'

  findOrNotFound(id: string | number): Promise<T>
  firstOrNotFound(): Promise<T>

  search(
    keyword?: string,
    options?: {
      includes?: string[]
      searchable?: string[]
    }
  ): this
  filter(filters?: Record<string, string>): this
  selects(options?: {
    includes?: string[]
    selectable?: string[]
  }): this
  sorts(sorts?: string[]): this

  with(relation: string, callback?: any): this
  expand(relations?: Array<string | Record<string, (q: any) => void>>): this

  whereHas(
    relation: string,
    callback?: (q: ModelQueryBuilder<any>) => void
  ): this
  orWhereHas(
    relation: string,
    callback?: (q: ModelQueryBuilder<any>) => void
  ): this
  whereDoesntHave(
    relation: string,
    callback?: (q: ModelQueryBuilder<any>) => void
  ): this
  orWhereDoesntHave(
    relation: string,
    callback?: (q: ModelQueryBuilder<any>) => void
  ): this

  withAggregate(
    expr: string,
    fn: 'count' | 'sum' | 'avg' | 'min' | 'max',
    column?: string,
    callback?: (q: ModelQueryBuilder<any>) => void
  ): this
  orderByAggregate(
    expr: string,
    fn: 'count' | 'sum' | 'avg' | 'min' | 'max',
    column?: string,
    direction?: 'asc' | 'desc',
    callback?: (q: ModelQueryBuilder<any>) => void
  ): this


  get(): Promise<T[]>
  getFirst(): Promise<T>
  paginate(
    page?: number,
    limit?: number
  ): Promise<{ data: T[]; total: number }>
  option(selectableOption?: string[]): Promise<Array<{ value: any; label: any }>>
  paginateOrOption(
    page?: number,
    limit?: number,
    option?: string | boolean,
    selectableOption?: string[]
  ): Promise<{ data: any[]; total: number }>
  resolve(input?: any): Promise<{ data: T[]; total: number }>

  format(formatter: string | ((item: T) => any)): this

  withoutScope(name: string | string[]): this

  withTrashed(): this
  onlyTrashed(): this
}

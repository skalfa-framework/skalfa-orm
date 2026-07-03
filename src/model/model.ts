import type { Knex } from 'knex'
import { db } from '../db'
import { conversion } from '../conversion'
import { extendModelQuery } from './query'
import { castFromDB, castToDB, hydrate, fill, create, update, upsert, save, pump, deleteModel, forceDelete, restore, toJSON } from './services'
import type { FieldMeta, ModelPayload, ScopeType, ModelHookFn, ModelHookEventType, ModelHookContextType,ModelQueryBuilder } from './types'



// ==========================
// ## Decorator Type
// ==========================
export const PRIMARY_KEY_META  =  Symbol('primary-key-meta')
export const FIELD_META        =  Symbol('field-meta')
export const RELATION_META     =  Symbol('relation-meta')
export const SOFT_DELETE_META  =  Symbol('soft-delete')
export const ATTRIBUTE_META    =  Symbol('attribute-meta')
export const FORMATTER_META    =  Symbol('formatter-meta')
export const SCOPE_META        =  Symbol('scope-meta')
export const EXPRESSION_META   =  Symbol('expression-meta')

export const Casts = {
  string    : {
    fromDB  :  (v: any) => v == null ? v  :  String(v),
    toDB    :  (v: any) => v,
  },
  number    : {
    fromDB  :  (v: any) => v == null ? v  :  Number(v),
    toDB    :  (v: any) => v,
  },
  boolean   : {
    fromDB  : (v: any) => Boolean(v),
    toDB    :   (v: any) => v ? 1 : 0,
  },
  date      : {
    fromDB  :  (v: any) => v ? new Date(v)                      :  null,
    toDB    :  (v: any) => v instanceof Date ? v.toISOString()  :  v,
  },
  json      : {
    fromDB  : (v: any) => {
      if (typeof v !== 'string') return v

      try {
        return JSON.parse(v)
      } catch {
        return null
      }
    },
    toDB    :  (v: any) => JSON.stringify(v),
  },
}



export abstract class Model {
  id!: number;
  created_at!: Date;
  updated_at!: Date;
  deleted_at!: Date;

  static table             :  string                           =  ""
  static primaryKey        :  string                           =  'id'
  static softDelete        :  boolean                          =  false
  static deletedAtColumn   :  string                           =  'deleted_at'
  static searchMode       ?:  'like' | 'fulltext'
  
  protected _original      :  Record<string, any>              = {}
  protected _exists        :  boolean                          = false
  protected _trx          ?:  Knex.Transaction                 = undefined

  private static _hooks    :  Record<string,  ModelHookFn[]>   =  {}
  private _instanceHooks   :  Record<string, ModelHookFn[]>    =  {}
  private _disabledHooks                                       =  new Set<string>()



  // ==========================
  // ## Constructor model
  // ==========================
  constructor(data: Record<string, any> = {}) {
    Object.assign(this, data)

    if ((this as any)[(this.constructor as typeof Model).primaryKey]) this._exists = true
  }

  protected static newInstance<T extends typeof Model>(this: T): InstanceType<T> & Model {
    return new (this as any)()
  }



  // ==========================
  // ## Field
  // ==========================
  static [FIELD_META]     ?:  Record<string, any>

  static getDefaultFields(): Record<string, FieldMeta> {
    const pk = (this as any)[PRIMARY_KEY_META] ?? this.primaryKey ?? 'id'

    return {
      [pk]: {
        cast        :  'number',
        selectable  :  true,
      },
      created_at  :  { cast: 'date' },
      updated_at  :  { cast: 'date' },
      deleted_at  :  { cast: 'date' },
    }
  }

  static get fields(): Record<string, FieldMeta> {
    const defaults = this.getDefaultFields?.() ?? {};

    return {...defaults,...(this[FIELD_META] ?? {})}
  }

  static get fillable() {
    return Object.entries(this.fields).filter(([, v]) => v.fillable).map(([k]) => k)
  }

  static get selectable() {
    return Object.entries(this.fields).filter(([, v]) => v.selectable).map(([k]) => k)
  }

  static get searchable() {
    return Object.entries(this.fields).filter(([, v]) => v.searchable).map(([k]) => k)
  }



  // ==========================
  // ## Table
  // ==========================
  static getTable(): string {
    if (this.table) return this.table

    return conversion.strPlural(conversion.strSnake(this.name))
  }



  // ==========================
  // ## Primary key
  // ==========================
  static getPrimaryKey(): string {
    return (this as any)[PRIMARY_KEY_META] ?? this.primaryKey ?? 'id'
  }



  // ==========================
  // ## Relation
  // ==========================
  static [RELATION_META]  ?:  Record<string, any>

  static get relations() {
    return this[RELATION_META] ?? {}
  }



  // ==========================
  // ## Attribute
  // ==========================
  static get attributes(): Record<string, Function> {
    return (this as any)[ATTRIBUTE_META] ?? {}
  }



  // ==========================
  // ## Formatter
  // ==========================
  static get formatters(): Record<string, Function> {
    return (this as any)[FORMATTER_META] ?? {}
  }



  // ==========================
  // ## Scope
  // ==========================
  static get scopes(): Record<string, ScopeType> {
    return (this as any)[SCOPE_META] ?? {}
  }



  // ==========================
  // ## Getter attribute
  // ==========================
  getOriginal(key?: string) {
    if (!key) return { ...this._original }

    return this._original[key]
  }

  getChanges() {
    const changes: Record<string, any> = {}

    for (const key in this._original) {
      if ((this as any)[key] != this._original[key]) {
        changes[key] = (this as any)[key]
      }
    }

    return changes
  }

  getPrevious() {
    const prev: Record<string, any> = {}
    for (const key in this._original) {
      if ((this as any)[key] != this._original[key]) {
        prev[key] = this._original[key]
      }
    }

    return prev
  }



  // ==========================
  // ## Query builder
  // ==========================
  static query<T extends Record<string, any> = Record<string, any>>(trx?: Knex | Knex.Transaction): ModelQueryBuilder<T> {
    const qb = (trx ?? db)(this.getTable())

    return extendModelQuery(qb, this) as ModelQueryBuilder<T>
  }



  // ==========================
  // ## Casting
  // ==========================
  castFromDB(row: Record<string, any>): this {
    return castFromDB(this, row)
  }

  castToDB() {
    return castToDB(this)
  }



  // ==========================
  // ## Dirty field
  // ==========================
  getDirty(): Record<string, any> {
    const dirty: any = {}

    for (const key in this._original) {
      if (Object.is((this as any)[key], this._original[key])) continue

      dirty[key] = (this as any)[key]
    }

    return dirty
  }



  // ==========================
  // ## Hydration
  // ==========================
  static hydrate<T extends typeof Model>(this: T, rows: any[] | null | undefined): InstanceType<T>[] {
    return hydrate(this, rows)
  }



  // ==========================
  // ## Fill model from payload
  // ==========================
  fill<T extends this>(this: T, payload: ModelPayload<T>): T {
    return fill(this, payload)
  }



  // ==========================
  // ## Create from fillable
  // ==========================
  static async create<T extends typeof Model>(this: T, payload: ModelPayload<InstanceType<T>>, trx?: Knex.Transaction): Promise<InstanceType<T>> {
    return create(this, payload, trx)
  }



  // ==========================
  // ## update from fillable
  // ==========================
  static async update<T extends typeof Model>(this: T, payload: ModelPayload<InstanceType<T>>, uniqueKeys: (keyof InstanceType<T> & string)[], trx?: Knex.Transaction): Promise<InstanceType<T>> {
    return update(this, payload, uniqueKeys, trx)
  }



  // ==========================
  // ## Update or insert from fillable
  // ==========================
  static async upsert<T extends typeof Model>(this: T, payload: ModelPayload<InstanceType<T>>, uniqueKeys: (keyof InstanceType<T> & string)[], trx?: Knex.Transaction): Promise<InstanceType<T>> {
    return upsert(this, payload, uniqueKeys, trx)
  }



  // ==========================
  // ## Save (insert / update)
  // ==========================
  async save() {
    return save(this)
  }



  // ==========================
  // ## Save with relation
  // ==========================
  async pump<T extends this>(this: T, payload: ModelPayload<T> | ModelPayload<T>[], options: { trx?: Knex.Transaction } = {}): Promise<T | T[]> {
    return pump(this, payload, options)
  }



  // ==========================
  // ## Soft Delete
  // ==========================
  static getSoftDeleteConfig() {
    return (this as any)[SOFT_DELETE_META] ?? null
  }

  static isSoftDelete(): boolean {
    return !!this.getSoftDeleteConfig()
  }

  static getDeletedAtColumn(): string | null {
    return this.getSoftDeleteConfig()?.column ?? null
  }



  // ==========================
  // ## Delete (with or without soft delete)
  // ==========================
  async delete(): Promise<Record<string, any> | null> {
    return deleteModel(this)
  }



  // ==========================
  // ## Delete without soft delete
  // ==========================
  async forceDelete() {
    return forceDelete(this)
  }



  // ==========================
  // ## Restore (soft delete)
  // ==========================
  async restore(): Promise<this> {
    return restore(this)
  }



  // ==========================
  // ## Model Hook
  // ==========================
  on<T extends this>(event: ModelHookEventType, fn: (ctx: ModelHookContextType<T>) => any) {
    if (!this._instanceHooks[event]) this._instanceHooks[event] = []

    this._instanceHooks[event].push(fn as ModelHookFn)

    return this
  }

  off(event: ModelHookEventType) {
    this._disabledHooks.add(event)

    return this
  }

  protected async runHook(event: ModelHookEventType, ctx: ModelHookContextType) {
    if (this._disabledHooks.has(event)) return

    const ctor = this.constructor as typeof Model

    const globals = ctor._hooks?.[event] ?? []
    for (const fn of globals) await fn(ctx)

    const locals = this._instanceHooks[event] ?? []
    for (const fn of locals) await fn(ctx)
  }



  // ==========================
  // ## To response data 
  // ==========================
  toJSON() {
    return toJSON(this)
  }



  // ==========================
  // ## Transaction binding
  // ==========================
  useTransaction(trx: Knex.Transaction) {
    this._trx = trx

    return this
  }
}
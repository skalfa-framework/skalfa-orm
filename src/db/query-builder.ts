import knex, { Knex } from 'knex'
import { conversion } from '../conversion'



// ==============================
// ## Schema Builder Extensions
// ==============================
declare module "knex" {
  namespace Knex {
    interface TableBuilder {
      softDelete(): Knex.ColumnBuilder
      foreignIdFor(tableName: string, columnName?: string): Knex.ColumnBuilder
    }

    interface ColumnBuilder {
      searchable(): Knex.ColumnBuilder
    }

    interface QueryBuilder<TRecord = any, TResult = any> {
      where(...args: any[]): this
      orWhere(...args: any[]): this
      whereNot(...args: any[]): this

      whereNull(...args: any[]): this
      whereNotNull(...args: any[]): this

      whereIn(...args: any[]): this
      whereNotIn(...args: any[]): this

      whereBetween(...args: any[]): this
      whereNotBetween(...args: any[]): this

      whereExists(...args: any[]): this
      whereNotExists(...args: any[]): this

      // ===== JOIN =====
      join(...args: any[]): this
      leftJoin(...args: any[]): this
      rightJoin(...args: any[]): this
      innerJoin(...args: any[]): this

      // ===== SELECT =====
      select(...args: any[]): this
      distinct(...args: any[]): this

      // ===== ORDER / LIMIT =====
      orderBy(...args: any[]): this
      orderByRaw(...args: any[]): this

      limit(...args: any[]): this
      offset(...args: any[]): this

      // ===== GROUP =====
      groupBy(...args: any[]): this
      having(...args: any[]): this

      // ===== RAW =====
      whereRaw(...args: any[]): this
      selectRaw(...args: any[]): this

      // ===== JOIN WITH =====
      joinWith(
        type: "BELONGSTO" | "HASONE" | "HASMANY" | "BELONGSTOMANY",
        table: string,
        relation:
          | {
              localKey: string
              foreignKey: string
            }
          | {
              pivotTable: string
              localKey: string
              pivotLocalKey: string
              pivotForeignKey: string
              foreignKey: string
            },
        as: string,
        callback?: (qb: Knex.QueryBuilder) => void
      ): Knex.QueryBuilder<TRecord, TResult>

      whereJoinHas(
        type: "BELONGSTO" | "HASONE" | "HASMANY" | "BELONGSTOMANY",
        table: string,
        relation:
          | string
          | {
              pivotTable: string
              localKey: string
              pivotLocalKey: string
              pivotForeignKey: string
              foreignKey: string
            },
        foreignKey?: string,
        callback?: (qb: Knex.QueryBuilder) => void
      ): Knex.QueryBuilder<TRecord, TResult>

      orWhereJoinHas(
        type: "BELONGSTO" | "HASONE" | "HASMANY" | "BELONGSTOMANY",
        table: string,
        relation:
          | string
          | {
              pivotTable: string
              localKey: string
              pivotLocalKey: string
              pivotForeignKey: string
              foreignKey: string
            },
        foreignKey?: string,
        callback?: (qb: Knex.QueryBuilder) => void
      ): Knex.QueryBuilder<TRecord, TResult>

      whereJoinDoesntHave(
        type: "BELONGSTO" | "HASONE" | "HASMANY" | "BELONGSTOMANY",
        table: string,
        relation:
          | string
          | {
              pivotTable: string
              localKey: string
              pivotLocalKey: string
              pivotForeignKey: string
              foreignKey: string
            },
        foreignKey?: string,
        callback?: (qb: Knex.QueryBuilder) => void
      ): Knex.QueryBuilder<TRecord, TResult>

      orWhereJoinDoesntHave(
        type: "BELONGSTO" | "HASONE" | "HASMANY" | "BELONGSTOMANY",
        table: string,
        relation:
          | string
          | {
              pivotTable: string
              localKey: string
              pivotLocalKey: string
              pivotForeignKey: string
              foreignKey: string
            },
        foreignKey?: string,
        callback?: (qb: Knex.QueryBuilder) => void
      ): Knex.QueryBuilder<TRecord, TResult>
    }
  }
}



// ==============================
// ## migration schema extension
// ==============================
try {
  knex.TableBuilder.extend("softDelete", function(this: Knex.TableBuilder) {
    return this.timestamp("deleted_at").nullable()
  })
} catch (e: any) {
  if (!e.message?.includes("Can't extend")) throw e
}

try {
  knex.TableBuilder.extend("foreignIdFor", function(this: Knex.TableBuilder, tableName: string, columnName?: string) {
    const col = columnName || `${conversion.strSingular(tableName)}_id`
    
    return this.bigInteger(col).unsigned().index()
  })
} catch (e: any) {
  if (!e.message?.includes("Can't extend")) throw e
}

knex.ColumnBuilder.extend("searchable", function(this: any) {
  const client      =  this.client?.config?.client
  const isPostgres  =  typeof client  ===  'string' && (client.includes('postgres') || client.includes('pg'))

  if (isPostgres) {
    const tableBuilder  =  this._tableBuilder
    const tableName     =  tableBuilder._tableName
    const columnName    =  this._args[0]
    const indexName     =  `idx_${tableName}_${columnName}_search`

    tableBuilder.index(this.client.raw(`to_tsvector('simple', coalesce(??, ''))`, [columnName]), indexName, 'GIN')
  }

  return this
})




// ==============================
// ## get table
// ==============================
function getBaseTable(qb: any): string {
  return qb._single?.table
}



// ==============================
// ## where has
// ==============================
function buildWhereHas(
  qb: Knex.QueryBuilder,
  type: "BELONGSTO" | "HASONE" | "HASMANY" | "BELONGSTOMANY",
  table: string,
  localKeyOrRelation: any,
  foreignKey?: string,
  callback?: (qb: Knex.QueryBuilder) => void
) {
  const baseTable = getBaseTable(qb)
  if (!baseTable) {
    throw new Error("whereHas harus dipanggil setelah table()")
  }

  qb.select(1).from(table)

  if (type != "BELONGSTOMANY") {
    qb.whereRaw(`${foreignKey} = ${baseTable}.${localKeyOrRelation}`)
  } else {
    const r = localKeyOrRelation
    qb.join(r.pivotTable, `${r.pivotTable}.${r.pivotForeignKey}`, `${table}.${r.foreignKey}`).whereRaw(`${r.pivotTable}.${r.pivotLocalKey} = ${baseTable}.${r.localKey}`)
  }

  if (callback) callback(qb)
}



// ==============================
// ## join with
// ==============================
knex.QueryBuilder.extend("joinWith", function (
  this: Knex.QueryBuilder,
  type: "BELONGSTO" | "HASONE" | "HASMANY" | "BELONGSTOMANY",
  table: string,
  relation:
    | {
        localKey: string
        foreignKey: string
      }
    | {
        pivotTable: string
        localKey: string
        pivotLocalKey: string
        pivotForeignKey: string
        foreignKey: string
      },
  as: string,
  callback?: (qb: Knex.QueryBuilder) => void
) {
  const baseTable = getBaseTable(this)
  if (!baseTable) throw new Error("joinWith() must be after table()")

  let subquery: string | null = null

  if (type === "BELONGSTO") {
    const r = relation as any

    subquery = `
      (
        select row_to_json(${table})
        from ${table}
        where ${table}.${r.foreignKey} = ${baseTable}.${r.localKey}
        limit 1
      )
    `
  }

  if (type === "HASONE") {
    const r = relation as any

    subquery = `
      (
        select row_to_json(${table})
        from ${table}
        where ${table}.${r.foreignKey} = ${baseTable}.${r.localKey}
        limit 1
      )
    `
  }

  if (type === "HASMANY") {
    const r = relation as any

    subquery = `
      (
        select coalesce(json_agg(${table}), '[]'::json)
        from ${table}
        where ${table}.${r.foreignKey} = ${baseTable}.${r.localKey}
      )
    `
  }

  if (type === "BELONGSTOMANY") {
    const r = relation as any

    subquery = `
      (
        select coalesce(json_agg(${table}), '[]'::json)
        from ${table}
        inner join ${r.pivotTable}
          on ${r.pivotTable}.${r.pivotForeignKey} = ${table}.${r.foreignKey}
        where ${r.pivotTable}.${r.pivotLocalKey} = ${baseTable}.${r.localKey}
      )
    `
  }

  if (!subquery) {
    throw new Error(`Unsupported relation type: ${type}`)
  }

  if (callback) {
    callback(this)
  }

  return this.select(this.client.raw(`${subquery} as "${as}"`))
})



// ==============================
// ## where join
// ==============================
knex.QueryBuilder.extend("whereJoinHas", function (this: Knex.QueryBuilder, type, table, localKeyOrRelation, foreignKey?, callback? ) {
  return this.whereExists(function (this: Knex.QueryBuilder) {
    buildWhereHas(
      this,
      type,
      table,
      localKeyOrRelation,
      foreignKey,
      callback
    )
  })
})


knex.QueryBuilder.extend("orWhereJoinHas", function (this: Knex.QueryBuilder, type, table, localKeyOrRelation, foreignKey?, callback? ) {
  return this.orWhereExists(function (this: Knex.QueryBuilder) {
    buildWhereHas(
      this,
      type,
      table,
      localKeyOrRelation,
      foreignKey,
      callback
    )
  })
})


knex.QueryBuilder.extend("whereJoinDoesntHave", function (this: Knex.QueryBuilder, type, table, localKeyOrRelation, foreignKey?, callback? ) {
  return this.whereNotExists(function (this: Knex.QueryBuilder) {
    buildWhereHas(
      this,
      type,
      table,
      localKeyOrRelation,
      foreignKey,
      callback
    )
  })
})


knex.QueryBuilder.extend("orWhereJoinDoesntHave", function (this: Knex.QueryBuilder, type, table, localKeyOrRelation, foreignKey?, callback? ) {
  return this.orWhereNotExists(function (this: Knex.QueryBuilder) {
    buildWhereHas(
      this,
      type,
      table,
      localKeyOrRelation,
      foreignKey,
      callback
    )
  })
})

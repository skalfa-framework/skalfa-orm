import { applyGlobalScopes } from '../scope/apply-global-scopes'



export async function find(query: any, Model: any, id: any) {
  applyGlobalScopes(query)

  const pk   =  Model.primaryKey ?? 'id'
  const row  =  await query.where(pk, id).first()

  if (!row) return null

  return Model.hydrate([row])[0]
}

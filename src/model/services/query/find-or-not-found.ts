import { NotFoundError } from '../../types'
import { applyGlobalScopes } from '../scope/apply-global-scopes'



export async function findOrNotFound(query: any, Model: any, id: any) {
  applyGlobalScopes(query)

  const pk   =  Model.primaryKey ?? 'id'
  const row  =  await query.where(pk, id).first()

  if (!row) throw new NotFoundError("Error: Record not found!")


  return Model.hydrate([row])[0]
}

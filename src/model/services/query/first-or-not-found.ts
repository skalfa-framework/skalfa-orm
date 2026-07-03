import { NotFoundError } from '../../types'
import { applyGlobalScopes } from '../scope/apply-global-scopes'



export async function firstOrNotFound(query: any, Model: any) {
  applyGlobalScopes(query)

  const row = await query.first()

  if (!row) throw new NotFoundError("Error: Record not found!")


  return Model.hydrate([row])[0]
}

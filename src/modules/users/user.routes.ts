import { Request, Response, Router } from 'express'

// #swagger.path = '/api/users'
const r = Router()
export const getUsers = (_req: Request, res: Response) => res.json([])
r.get('/', getUsers)
export default r

import Errors = require('../errors')
import User = require('../user')

// Storage of the current users name

interface NameStorage {
    create: (user: User, callback: (err: Errors.AlreadyExistsError | Errors.UnexpectedException, id: number) => void) => void
    read: (id: number, callback: (err: Errors.NotFoundError | Errors.UnexpectedException, res: User) => void) => void
    update: (id: number, user: User, callback: (err: Errors.NotFoundError | Errors.UnexpectedException) => void) => void
    delete: (id: number, callback: (err: Errors.NotFoundError | Errors.UnexpectedException) => void) => void
    list: (callback: (err: Errors.UnexpectedException, res: User[]) => void) => void
}

export = NameStorage

import Errors = require('../errors')
import NameStorage = require('nameStorage')
import User = require('../user')

interface Dict { [key: number]: User }

function handleUnexpectedExceptions(fn: () => void, callback): void {
    'use strict';
    try {
        fn()
    } catch (e) {
        callback(new Errors.UnexpectedException(e))
    }
}

function dictToArray(dict: Dict): User[] {
    'use strict';
    var users = []

    for (var key in dict) {
        if (dict[key]) // This is not easily testable
            users.push(dict[key])
    }

    return users;
}

class MemoryNameStorage implements NameStorage {
    private dict: Dict

    constructor(dict: Dict) {
        this.dict = dict
    }

    create(user: User, callback): void {
        handleUnexpectedExceptions(() => {
            if (dictToArray(this.dict).some((existingUser) => user.name === existingUser.name)) {
                callback(new Errors.AlreadyExistsError(user.name))
            }
            else {
                var id = this.newId()

                this.dict[id] = user

                callback(null, id)
            }
        }, callback)
    }

    read(id: number, callback): void {
        handleUnexpectedExceptions(() => {
            var user = this.dict[id]

            if (!user) callback(new Errors.NotFoundError(id.toString()))
            else callback(null, user)
        }, callback)
    }

    public update(id: number, user: User, callback): void {
        handleUnexpectedExceptions(() => {
            if (this.dict[id]) {
                this.dict[id] = user
                callback()
            }
            else callback(new Errors.NotFoundError(id.toString()))
        }, callback)
    }

    public delete(id: number, callback): void {
        handleUnexpectedExceptions(() => {
            if (this.dict[id]) {
                delete this.dict[id]
                callback()
            }
            else callback(new Errors.NotFoundError(id.toString()))
        }, callback)
    }

    public list(callback): void {
        handleUnexpectedExceptions(() => {
            callback(null, dictToArray(this.dict))
        }, callback)
    }

    private newId(): number {
        var id

        do {
            id = Math.floor(Math.random() * 1000)
        } while (this.dict[id] !== undefined)

        return id
    }
}

export = MemoryNameStorage

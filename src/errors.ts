export class UnexpectedException {
    name: string = 'UnexpectedException'
    exception: any

    constructor(exception: any) {
        this.exception = exception
    }

}

export class AlreadyExistsError implements Error {
    name: string = 'AlreadyExistsError'
    message: string

    constructor(message: string) {
        this.message = message
    }
}

export class NotFoundError implements Error {
    name: string = 'NotFoundError'
    message: string

    constructor(message: string) {
        this.message = message
    }
}

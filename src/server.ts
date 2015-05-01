/// <reference path="../typings/tsd.d.ts"/>

import express = require('express')
import bodyParser = require('body-parser')
import expressValidator = require('express-validator')

import httpStatus = require('http-status')
import util = require('util')

import Bunyan = require('bunyan')

import Errors = require('./errors')
import NameStorage = require('storage/nameStorage')

function create(storage: NameStorage, loggerOptions: Bunyan.LoggerOptions): express.Express {
    'use strict';

    var server = express()

    server.use(require('express-bunyan-logger')(loggerOptions))

    function validateInput(req: expressValidator.ValidatedRequest, res: express.Response, callback): void {
        req.validate('name', 'Required alphanumeric parameter').isAlphanumeric()

        req.sanitize('name').trim()

        var errors = req.validationErrors(true)

        if (errors)
            res.status(httpStatus.BAD_REQUEST).send('Invalid arguments: ' + util.inspect(errors))
        else
            callback(req, res)
    }

    function errToStatus(err): number {
        if (err instanceof Errors.NotFoundError)
            return httpStatus.NOT_FOUND
        if (err instanceof Errors.AlreadyExistsError)
            return httpStatus.CONFLICT
        else
            return httpStatus.INTERNAL_SERVER_ERROR
    }

    server.post('/user', bodyParser.json(), expressValidator(), (req: expressValidator.ValidatedRequest, res: express.Response) => {
        validateInput(req, res, (req, res) => {
            storage.create({ name: req.body.name }, (err, id) => {
                err ? res.status(errToStatus(err)).send(err) : res.status(httpStatus.CREATED).send({ id: id })
            })
        })
    })

    server.get('/user/:id', (req, res) => {
        storage.read(req.params.id, (err, user) => {
            err ? res.status(errToStatus(err)).send(err) : res.status(httpStatus.OK).send(user)
        })
    })

    server.put('/user/:id', bodyParser.json(), expressValidator(), (req: expressValidator.ValidatedRequest, res: express.Response) => {
        validateInput(req, res, (req, res) => {
            storage.update(req.params.id, { name: req.body.name }, (err) => {
                err ? res.status(errToStatus(err)).send(err) : res.sendStatus(httpStatus.OK)
            })
        })
    })

    server.delete('/user/:id', (req, res) => {
        storage.delete(req.params.id, (err) => {
            err ? res.status(errToStatus(err)).send(err) : res.sendStatus(httpStatus.OK)
        })
    })

    server.get('/users', (req, res) => {
        storage.list((err, users) => {
            err ? res.status(errToStatus(err)).send(err) : res.status(httpStatus.OK).send({ users: users })
        })
    })

    return server

}

export = create

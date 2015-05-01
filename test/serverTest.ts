/// <reference path="../typings/tsd.d.ts"/>

import async = require('async')
import supertest = require('supertest')

import chai = require('chai')
import sinon = require('sinon')
import sinonChai = require('sinon-chai')

var expect = chai.expect
chai.use(sinonChai)

import server = require('../src/server')

import NameStorage = require('../src/storage/nameStorage')
import MemoryNameStorage = require('../src/storage/memoryNameStorage')
import User = require('../src/user')

var testLoggerOptions = { name: 'testService', streams: [] }

describe('Server', () => {
    var request = supertest(server(new MemoryNameStorage({}), testLoggerOptions))

    function createUser(user, callback): void {
        request
            .post('/user/')
            .send(user)
            .end((err, res: supertest.Response) => {
            expect(err).to.be.null
            expect(res.status).to.equal(201)
            expect(res.body).to.have.property('id')

            callback(res.body.id)
        })
    }

    function updateNonexistentUser(id, callback): void {
        request
            .put('/user/' + id)
            .send({ name: 'testUser' })
            .end((err, res: supertest.Response) => {
            expect(err).to.be.null
            expect(res.status).to.equal(404)
            expect(res.text).to.contain('NotFoundError')

            callback()
        })
    }

    function deleteNonexistentUser(id, callback): void {
        request
            .del('/user/' + id)
            .end((err, res: supertest.Response) => {
            expect(err).to.be.null
            expect(res.status).to.equal(404)
            expect(res.text).to.contain('NotFoundError')

            callback()
        })
    }

    function getNonexistentUser(id, callback): void {
        request
            .get('/user/' + id)
            .end((err, res: supertest.Response) => {
            expect(err).to.be.null
            expect(res.status).to.equal(404)
            expect(res.text).to.contain('NotFoundError')

            callback()
        })
    }

    function getUser(id, user, callback): void {
        request
            .get('/user/' + id)
            .end((err, res: supertest.Response) => {
            expect(err).to.be.null
            expect(res.status).to.equal(200)
            expect(res.body).to.deep.equal(user)

            callback()
        })
    }

    function updateUser(id, updatedUser, callback): void {
        request
            .put('/user/' + id)
            .send(updatedUser)
            .end((err, res: supertest.Response) => {
            expect(err).to.be.null
            expect(res.status).to.equal(200)
            expect(res.text).to.equal('OK')

            callback()
        })
    }

    function deleteUser(id, callback): void {
        request
            .del('/user/' + id)
            .end((err, res: supertest.Response) => {
            expect(err).to.be.null
            expect(res.status).to.equal(200)
            expect(res.text).to.equal('OK')

            callback()
        })
    }

    function listUsers(expectedUsers, callback): void {
        request
            .get('/users')
            .end((err, res: supertest.Response) => {
            expect(err).to.be.null

            expect(res.status).to.equal(200)

            expect(res.body.users).to.be.instanceof(Array)
            expect(res.body.users.length).to.equal(expectedUsers.length)
            expect(res.body.users).to.deep.include.members(expectedUsers)

            callback()
        })
    }

    describe('Users', () => {
        it('Calling "get" on an undefined user should return an error', (done) => getNonexistentUser(1234, done))
        it('Calling "delete" on an undefined user should return an error', (done) => deleteNonexistentUser(1234, done))
        it('Calling "update" on an undefined user should return an error', (done) => updateNonexistentUser(1234, done))


        it('Calling "create" with invalid user should return an error', (done) =>
            request
                .post('/user/')
                .send({})
                .end((err, res: supertest.Response) => {
                expect(err).to.be.null
                expect(res.status).to.equal(400)
                expect(res.text).to.include('name')

                done()
            }))

        it('Basic CRUD command chain should work as expected', (done) => {
            var id
            var user = { name: 'testUser' }
            var updatedUser = { name: 'testUserUpdated' }

            async.waterfall([
                (cb) => createUser(user, (newId) => {
                    id = newId
                    cb()
                }),
                (cb) => getUser(id, user, cb),
                (cb) => updateUser(id, updatedUser, cb),
                (cb) => getUser(id, updatedUser, cb),
                (cb) => deleteUser(id, cb),
                (cb) => getNonexistentUser(id, cb)
            ], (err, res) => {
                    expect(err).to.be.undefined
                    done()
                })
        })

        it('Calling "list" on an empty repository should return an empty list', (done) => listUsers([], done))

        it('Calling "list" should return all created users', (done) => {
            var expectedUsers = []

            async.times<string>(13, (n, next) => {
                var user = { name: 'testUser' + n }
                expectedUsers.push(user)
                createUser(user, (id) => next(null, user.name))
            }, (err, res) => {
                    expect(err).to.be.undefined
                    listUsers(expectedUsers, done)
                })
        })
    })

    describe('Storage Failures', () => {
        var storage = new MemoryNameStorage({})

        it('POST with storage failure', (done) => {
            var mockStorage = sinon.mock(storage)
            mockStorage.expects('create').once().callsArgWith(1, 'expected create error')

            var mockedService = server(storage, testLoggerOptions)

            var mockRequest = supertest(mockedService)

            mockRequest
                .post('/user/')
                .send({ name: 'testName' })
                .end((err, res: supertest.Response) => {
                expect(err).to.be.null
                expect(res.status).to.equal(500)
                expect(res.text).to.include('expected create error')

                mockStorage.restore()

                done()
            })
        })

        it('GET with storage failure', (done) => {
            var mockStorage = sinon.mock(storage)
            mockStorage.expects('read').once().callsArgWith(1, 'expected read error')

            var mockedService = server(storage, testLoggerOptions)

            var mockRequest = supertest(mockedService)

            mockRequest
                .get('/user/123')
                .end((err, res: supertest.Response) => {
                expect(err).to.be.null
                expect(res.status).to.equal(500)
                expect(res.text).to.include('expected read error')

                mockStorage.restore()

                done()
            })
        })


        it('LIST with storage failure', (done) => {
            var mockStorage = sinon.mock(storage)
            mockStorage.expects('list').once().callsArgWith(0, 'expected list error')

            var mockedService = server(storage, testLoggerOptions)

            var mockRequest = supertest(mockedService)

            mockRequest
                .get('/users')
                .end((err, res: supertest.Response) => {
                expect(err).to.be.null
                expect(res.status).to.equal(500)
                expect(res.text).to.include('expected list error')

                mockStorage.restore()

                done()
            })
        })

        it('LIST with bad entry in storage should not fail or return it', (done) => {
          var testService = server(new MemoryNameStorage({1: null}), testLoggerOptions)

          var testRequest = supertest(testService)

          testRequest
                .get('/users')
                .end((err, res: supertest.Response) => {
                expect(err).to.be.null
                expect(res.status).to.equal(200)
                expect(res.body.users).to.deep.equal([])

                done()
            })
        })

        it('GET with unexpected storage failure', (done) => {
            var badService = server(new MemoryNameStorage(null), testLoggerOptions)

            var testRequest = supertest(badService)

            testRequest
                .get('/user/1234')
                .end((err, res: supertest.Response) => {
                expect(err).to.be.null
                expect(res.status).to.equal(500)
                expect(res.text).to.include('UnexpectedException')

                done()
            })
        })

        it('POST same user twice should fail', (done) => {
            var testService = server(new MemoryNameStorage({}), testLoggerOptions)

            var testRequest = supertest(testService)

            testRequest
                .post('/user')
                .send({ name: 'testUser' })
                .end((err, res: supertest.Response) => {
                expect(err).to.be.null
                expect(res.status).to.equal(201)

                testRequest
                    .post('/user')
                    .send({ name: 'testUser' })
                    .end((err, res: supertest.Response) => {
                    expect(err).to.be.null
                    expect(res.status).to.equal(409)
                    expect(res.text).to.include('AlreadyExistsError')

                    done()
                })
            })
        })
    })
})

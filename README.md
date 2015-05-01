# Barebones Typescript Node.js Project

This is a barebones Node.js application written in TypeScript, following best practices. It defines a simple `sayHello` function as well as the standard 'hello world' executable. Additionally, it has a test suite and code coverage tooling.

To see all the functionality in action, run the following:

    make all

This command will download all dependencies and type definitions, perform linting, compile to JavaScript, and run code coverage.

## Build Overview

This project uses the following technologies for build:

* [NPM](https://github.com/npm/npm) - Node Package Manager, for all your node library and tool needs.
* [TSD](https://github.com/DefinitelyTyped/tsd) - TypeScript Definition manager for community-supported definition files of popular libraries and tools.
* [Gulp](https://github.com/gulpjs/gulp) - Streaming build framework that utilizes plugin model to define build targets in JavaScript (or in our case, TypeScript)
* [Make](https://www.gnu.org/software/make/) - GNU Make tool. You know what this tool is already. We use this to wrap all the other build tools for a consistent interface.

Most of the targets are defined in `Gulpfile.ts`. However, targets for cleaning the project and downloading NPM packages and TSD definitions are defined in `Makefile` as they are dependencies of Gulp.

Most likely, the Makefile should never need another target defined, all additional build targets should be defined using Gulp.

## Static Analysis

This project utilizes:

* [TSLint](https://github.com/palantir/tslint) - TypeScript Linting tool, used to promote consistency in the code base.

## Test Overview

This project uses the following test stack:

* [Mocha](https://github.com/mochajs/mocha) - Test framework that utilizes interfaces for third-party assertion libraries and reporters.
* [Chai](https://github.com/chaijs/chai) - Test assertion library that includes assert, expect, and should syntaxes as well as a plugin model for extending functionality.
* [Istanbul](https://github.com/gotwarlost/istanbul) - Test code coverage tool that supports unit tests, server side tests, and browser tests. Includes a HTML report generator.

### Mocking

Mocking libraries are critical testing tools. However, this project does not currently include one. This is left as a TODO for the moment.

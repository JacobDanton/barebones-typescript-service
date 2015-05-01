import server = require('./server')
import config = require('./configuration')

import Bunyan = require('bunyan')

var envConfig = config.developmentConfiguration

var logger = Bunyan.createLogger(envConfig.loggerOptions)

logger.info('Starting service...')

server(envConfig.storage, envConfig.loggerOptions).listen(envConfig.port)

logger.info('Service listening on port %s', envConfig.port)

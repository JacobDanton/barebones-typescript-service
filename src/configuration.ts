import Bunyan = require('bunyan')

import NameStorage = require('./storage/nameStorage')
import MemoryNameStorage = require('./storage/memoryNameStorage')

var Elasticsearch = require('bunyan-elasticsearch');
var esStream = new Elasticsearch({
  indexPattern: '[logstash-]YYYY.MM.DD',
  type: 'logs',
  host: 'http://172.17.0.10:9200/'
});

export interface Configuration {
    loggerOptions: Bunyan.LoggerOptions
    port: number
    storage: NameStorage
}

export var developmentConfiguration: Configuration = {
    loggerOptions: {
        name: 'testService',
        streams: [{
            level: Bunyan.DEBUG,
            type: 'file',
            path: './tmp/logs/testService/debug.log'
        },
        {
          stream: esStream
        }],
        serializers: Bunyan.stdSerializers
    },
    port: 1337,
    storage: new MemoryNameStorage({})
}

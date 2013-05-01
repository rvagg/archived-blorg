const fs      = require('fs')
    , path    = require('path')
    , execute = require('execute')
    , xtend   = require('xtend')

    , DEFAULT_POST_PATH    = '{year}/{month}/{title}.html'
    , DIRECTORY_PROPERTIES = [ 'templateRoot', 'postRoot', 'outputRoot' ]

function toDirectory (root, config, prop) {
  return function (callback) {
    if (typeof config[prop] != 'string')
      return callback(new Error('Required configuration property not set: ' + prop))

    var uri = path.resolve(root, config[prop])
    fs.stat(uri, function (err, stat) {
      if (err)
        return callback(err)
      if (!stat.isDirectory())
        return callback(new Error('Config property "' + prop + '" is not a directory: ' + uri))
      return callback(null, uri)
    })
  }
}

function configToStat (root, config, properties, callback) {
  execute(
      properties.reduce(function (p, k) {
        p[k] = toDirectory(root, config, k)
        return p
      }, {})
    , callback
  )
}

function configSetup (root, config, callback) {
  configToStat(root, config, DIRECTORY_PROPERTIES, function (err, result) {
    if (err)
      return callback(err)

    config = xtend(config, result)
    if (typeof config.postPath != 'string')
      config.postPath = DEFAULT_POST_PATH

    callback(null, config)
  })
}

module.exports = configSetup
const fs    = require('fs')
    , path  = require('path')
    , xtend = require('xtend')
    , after = require('after')

module.exports = Blorg
module.exports.archetypes = {
    blog         : require('./archetypes/blog')
  , presentation : require('./archetypes/presentation')
}

function handleError (err) {
  console.error(err.stack)
  process.exit(-1)
}

function Blorg (root, config) {
  if (!(this instanceof Blorg))
    return new Blorg(root, config)

  this.root                = root
  this.config              = config
  this.data                = { date: new Date() }
  this.resolvedDirectories = {}
  this.resolvedFiles       = {}

  this.loadData(function (err) {
    if (err)
      return handleError(err)

    this.processOutput(function (err) {
      if (err)
        return handleError(err)
    })
  }.bind(this))
}

Blorg.prototype.processOutput = function (callback) {
  if (!Array.isArray(this.config.output))
    return callback(new Error('You must supply a list of "output" processors in your config'))


  var done = after(this.config.output.length, callback)

  this.config.output.forEach(function (output) {
    var data         = (output.data || []).reduce(function (p, c) {
          if (p) { // else already returned
            p[c] = this.data[c]
            if (!p[c]) {
              p = null
              callback(new Error('Output "' + output.id + '" requires unknown data "' + c + '"'))
            }
          }
          return p
        }.bind(this), {})
      , pluginConfig = xtend(this.config, output, { data: data })

    if (data) // else already returned error
      this.loadPlugin(pluginConfig, false, done)
  }.bind(this))
}

Blorg.prototype.loadData = function (callback) {
  if (!Array.isArray(this.config.data))
    return callback(new Error('You must supply a list of "data" sources in your config'))

  var i    = 0
    , load = function () {
        if (i == this.config.data.length)
          return callback()

        // config gets entire root config as with its own config on the top
        var pluginConfig = xtend(this.config, this.config.data[i++])

        this.loadPlugin(pluginConfig, true, function (err) {
          if (err)
            return callback(err)

          load()
        })
      }.bind(this)

  load()
}

// utility function for plugins
Blorg.prototype.toDirectory = function (value, callback) {
  return this._toPath(value, 'dir', callback)
}

// utility function for plugins
Blorg.prototype.toFile = function (value, callback) {
  return this._toPath(value, 'file', callback)
}

Blorg.prototype._toPath = function (value, type, callback) {
  var uri   = path.resolve(this.root, value)
    , cache = this['resolved' + (type == 'dir' ? 'Directories' : 'Files')]

  if (cache[value])
    return callback(null, cache[value])

  fs.stat(uri, function (err, stat) {
    if (err)
      return callback(err)
    if (type == 'dir' && !stat.isDirectory())
      return callback(new Error('Config property "' + value + '" is not a directory: ' + uri))
    else if (type == 'file' && !stat.isFile())
      return callback(new Error('Config property "' + value + '" is not a file: ' + uri))

    cache[value] = uri

    return callback(null, uri)
  }.bind(this))
}

Blorg.prototype.getData = function (id) {
  return this.data[id]
}

Blorg.prototype.loadPlugin = function (pluginConfig, saveOutput, callback) {
  if (typeof pluginConfig.type != 'string')
    return callback(new Error('Plugin must have a "type" string'))
  if (typeof pluginConfig.id != 'string')
    return callback(new Error('Plugin must have an "id" string'))

  var plugin

  try {
    plugin = require('blorg-' + pluginConfig.type)
  } catch (e) {}
  if (!plugin) {
    try {
      plugin = require('./plugins/' + pluginConfig.type)
    } catch (e) {}
  }
  if (!plugin)
    return callback(new Error('Could not load plugin type "' + pluginConfig.type + '"'))

  plugin(this, pluginConfig, function (err, plugin) {
    if (err)
      return callback(err)

    if (saveOutput)
      this.data[pluginConfig.id] = plugin
    callback()
  }.bind(this))
}
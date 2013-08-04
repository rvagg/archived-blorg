const brucedown = require('brucedown')
    , map       = require('map-async')
    , fs        = require('fs')

    , defaultSplitter = /^\s*~~~~~~~~*\s*$/mg

function convert (key, file, splitter, callback) {
  fs.readFile(file, 'utf8', function (err, data) {
    if (err)
      return callback(err)

    var contents = data.toString().split(splitter)

    map(
        contents
      , function (value, i, callback) {
          brucedown(value, callback)
        }
      , callback
    )
  })
}

function multiPageMarkdown (blorg, config, callback) {
  if (typeof config.files != 'object')
    return callback(new Error('Must supply a "files" object map for multi-page-markdown'))

  var splitter = config.splitter || defaultSplitter
    , keys     = Object.keys(config.files)

  map(
      keys
    , function (k, i, callback) {
        blorg.toFile(config.files[k], function (err, uri) {
          if (err)
            return callback(err)

          convert(k, uri, splitter, callback)
        })
      }
    , function (err, data) {
        var result = {}
        keys.forEach(function (k, i) {
          result[k] = data[i]
        })
        callback(null, result)
      }
  )

}

module.exports = multiPageMarkdown

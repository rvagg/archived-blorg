const fs   = require('fs')
    , path = require('path')
    , swig = require('swig')

var init = false

function swigTemplate (blorg, config, callback) {
  if (typeof config.templateRoot != 'string')
    return callback(new Error('Must supply a "templateRoot" value for swig-template'))
  if (typeof config.file != 'string')
    return callback(new Error('Must supply a "file" value for swig-template'))

  blorg.toDirectory(config.templateRoot, function (err, uri) {
    if (err)
      return callback(err)

    if (!init) {
      swig.init({ root: uri })
      init = true
    }

    fs.readFile(path.join(uri, config.file), 'utf8', function (err, content) {
      if (err)
        return callback(err)

      var template = swig.compile(content, { filename: config.file })
      callback(null, template)
    })
  })
}

module.exports = swigTemplate
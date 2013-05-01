const fs     = require('fs')
    , path   = require('path')
    , mkdirp = require('mkdirp')

function renderTemplate (blorg, templateId, data, outputRoot, outputFile, callback) {
  var template = blorg.getData(templateId)
    , rendered = template(data)

  blorg.toDirectory(outputRoot, function (err, uri) {
    if (err)
      return callback(err)

    var out = path.join(uri, outputFile)

    mkdirp(path.dirname(out), function (err) {
      if (err)
        return callback(err)
      fs.writeFile(out, rendered, 'utf8', callback)
    })
  })
}

module.exports = renderTemplate
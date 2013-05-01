const renderTemplate = require('../render-template')

function singleFile (blorg, config, callback) {
  if (typeof config.outputRoot != 'string')
    return callback(new Error('Must supply a "outputRoot" value for single-file'))
  if (typeof config.template != 'string')
    return callback(new Error('Must supply a "template" value for single-file'))
  if (typeof config.output != 'string')
    return callback(new Error('Must supply a "output" value for single-file'))

  renderTemplate(
      blorg
    , config.template
    , config.data
    , config.outputRoot
    , config.output
    , callback
  )
}

module.exports = singleFile
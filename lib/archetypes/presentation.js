var baseConfig = {
    'templateRoot' : './'
  , 'outputRoot'   : './'

  , 'data' : [
        {
            // This plugin loads and provides all markdown files in a directory by using the 'ssbl' package
            'id'       : 'slides'
          , 'type'     : 'multi-page-markdown'
        }
    ]

  , 'output' : [
        {
            // This output plugin takes a template, a bunch of data and merges to a single file
            'id'       : 'presentation'
          , 'type'     : 'single-file'
          , 'output'   : 'index.html'
          , 'template' : 'presentationTemplate'
          , 'data'     : [ 'slides' ]
        }
    ]
}

const xtend = require('xtend')

function config (options) {
  var conf           = xtend(baseConfig)
    , templateEngine = typeof options.templateEngine == 'string'
        ? options.templateEngine
        : 'swig'

  if (typeof options.files != 'object')
    throw new Error('Must provide a "files" parameter mapping keys to mardown files')

  conf.data[0].files = options.files
  conf.data.push({
      id   : 'presentationTemplate'
    , type : templateEngine + '-template'
    , file : typeof options.template == 'string'
        ? options.template
        : 'template.html'
  })

  if (typeof options.output == 'string')
    conf.output[0].output = options.output

  if (typeof options.splitter == 'string')
    conf.data[0].splitter = options.splitter

  if (typeof options.outputRoot == 'string')
    conf.outputRoot = options.outputRoot

  return conf
}

module.exports = config
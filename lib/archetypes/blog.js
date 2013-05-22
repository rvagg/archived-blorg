var baseConfig = {
    'templateRoot' : './templates/'

  , 'data' : [
        {
            // This plugin loads and provides all markdown files in a directory by using the 'ssbl' package
            'id'       : 'blogPosts'
          , 'type'     : 'markdown-posts'
          , 'postRoot' : './posts/'
          , 'path'     : '/{year}/{month}/{title}.html'
        }
      , {
            // This plugin provides just the 'spec' part of every post, for summary purposes
            'id'       : 'postSpecs'
          , 'type'     : 'post-specs'
          , 'blogData' : 'blogPosts'
        }
    ]

  , 'output' : [
        {
            // This output plugin takes a template, a bunch of data and merges to a single file
            'id'       : 'feed'
          , 'type'     : 'single-file'
          , 'output'   : 'atom.xml'
          , 'template' : 'feedTemplate'
          , 'data'     : [ 'date', 'blogPosts' ]
        }
      , {
            // This output plugin takes the list of posts and merges with a template for individual files
            'id'       : 'posts'
          , 'type'     : 'post-files'
          , 'template' : 'postTemplate'
          , 'data'     : [ 'date', 'blogPosts', 'postSpecs' ]
        }
      , {
            // This output plugin takes the list of posts and merges with an index template to write the index & archive files
            'id'       : 'index'
          , 'type'     : 'index-files'
          , 'postsPerPage' : 5
          , 'indexFile'    : 'index.html'
          , 'archiveFile'  : 'page{number}.html'
          , 'template' : 'indexTemplate'
          , 'data'     : [ 'date', 'blogPosts', 'postSpecs' ]
        }
    ]
}

const xtend = require('xtend')

function config (options) {
  var conf           = xtend(baseConfig)
    , templateEngine = typeof options.templateEngine == 'string'
        ? options.templateEngine
        : 'swig'
    , templates      = options.templates

  ![ 'post', 'index', 'feed' ].forEach(function (file) {
    conf.data.push({
        id   : file + 'Template'
      , type : templateEngine + '-template'
      , file : templates && typeof templates[file] == 'string'
          ? templates[file]
          : file + (file == 'feed' ? '.xml' : '.html')
    })
  })

  if (options.templateRoot)
    conf.templateRoot = options.templateRoot

  if (options.postRoot)
    conf.data[0].postRoot = options.postRoot

  if (options.postPath)
    conf.data[0].path = options.postPath

  if (options.feedOutput)
    conf.output[0].output = options.feedOutput

  if (options.archiveOutput)
    conf.output[2].archiveFile = options.archiveFile

  if (options.indexOutput)
    conf.output[2].indexFile = options.indexOutput

  if (typeof options.outputRoot != 'string')
    throw new Error('Must provide an "outputRoot" parameter')
  conf.outputRoot = options.outputRoot

  return conf
}

module.exports = config
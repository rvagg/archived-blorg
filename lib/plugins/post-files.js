const renderTemplate = require('../render-template')
    , after          = require('after')
    , xtend          = require('xtend')

function postFiles (blorg, config, callback) {
  if (typeof config.outputRoot != 'string')
    return callback(new Error('Must supply a "outputRoot" value for post-files'))
  if (typeof config.template != 'string')
    return callback(new Error('Must supply a "template" value for post-files'))

  var done = after(config.data.blogPosts.length, callback)

  config.data.blogPosts.forEach(function (post) {
    renderTemplate(
        blorg
      , config.template
      , xtend(config.data, post)
      , config.outputRoot
      , post.spec.path
      , done
    )
  })
}

module.exports = postFiles
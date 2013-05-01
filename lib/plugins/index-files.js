const renderTemplate = require('../render-template')
    , after          = require('after')
    , xtend          = require('xtend')

function processIndex (blorg, config, page, nextPage, prevPage, posts, callback) {
  var path = page === 0
      ? config.indexFile
      : config.archiveFile.replace(/\{number\}/g, page)

  renderTemplate(
      blorg
    , config.template
    , xtend(config.data, {
          posts    : posts
        , nextPage : nextPage
        , prevPage : prevPage
      })
    , config.outputRoot
    , path
    , callback
  )
}

function indexFiles (blorg, config, callback) {
  var postsPerPage = typeof config.postsPerPage == 'number'
        ? config.postsPerPage
        : 5
    , posts = config.data.blogPosts
    , i     = 0
    , page  = 0
    , nextPage
    , prevPage
    , done  = after(Math.ceil(posts.length / postsPerPage), callback)

  if (typeof config.outputRoot != 'string')
    return callback(new Error('Must supply a "outputRoot" value for index-files'))
  if (typeof config.template != 'string')
    return callback(new Error('Must supply a "template" value for index-files'))
  if (typeof config.indexFile != 'string')
    return callback(new Error('Must supply a "indexFile" value for index-files'))
  if (typeof config.archiveFile != 'string')
    return callback(new Error('Must supply a "archiveFile" value for index-files'))

  for (; i < posts.length; i += postsPerPage, page++) {
    nextPage = i + postsPerPage >= posts.length ? null : page + 1
    prevPage = i === 0 ? null : page - 1
    processIndex(
        blorg
      , config
      , page
      , nextPage
      , prevPage
      , posts.slice(i, i + postsPerPage)
      , done
    )
  }
}

module.exports = indexFiles
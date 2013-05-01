const ssbl        = require('ssbl')
    , fs          = require('fs')
    , path        = require('path')
    , mkdirp      = require('mkdirp')
    , after       = require('after')
    , swig        = require('swig')
    , xtend       = require('xtend')
    , configSetup = require('./config-setup')

var postTemplate
  , indexTemplate
  , feedTemplate

function handleError (err) {
  console.error('Error:', err.message || err)
  process.exit(-1)
}

function specToPath (postPath, spec) {
  var p = postPath
    .replace(/\{year\}/g, spec.date.getFullYear())
    .replace(/\{month\}/g, (spec.date.getMonth() < 9 ? '0' : '') + (spec.date.getMonth() + 1))
    .replace(/\{title\}/g, spec.base)
  if (p[0] != '/')
    p = '/' + p

  return p
}

function titleToBase (title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s\.\-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function processPost (config, allPostSpecs, post, callback) {
  var postPath = path.join(config.outputRoot, post.spec.path)
    , ctx      = xtend(post, { allPosts: allPostSpecs })
    , content  = postTemplate.render(ctx)

  mkdirp(path.dirname(postPath), function (err) {
    if (err)
      return callback(err)

    fs.writeFile(postPath, content, 'utf8', function (err) {
      if (err)
        return callback(err)

      console.log('Wrote post:', postPath)
      callback()
    })
  })
}

function processIndex (config, posts, allPostSpecs, callback) {
  var indexPath   = path.join(config.outputRoot, config.indexFile   || 'index.html')
    , archivePath = path.join(config.outputRoot, config.archivePath || 'page{number}.html')
    , maxPosts    = config.maxIndexPosts || 5
    , ctx         = {
          allPosts      : allPostSpecs
        , maxIndexPosts : maxPosts
      }
    , _page = 0
    , i     = 0
    , done  = after(Math.ceil(posts.length / maxPosts), callback)

    for (; i < posts.length; i+= maxPosts, _page++) {
      (function (i, _page) {
        var _posts = posts.slice(i, i + maxPosts)
          , content = indexTemplate.render(xtend(ctx, {
                posts    : _posts
              , page     : _page
              , nextPage : i + maxPosts >= posts.length ? null : _page + 1
              , prevPage : i === 0 ? null : _page - 1
            }))
          , _path = i === 0 ? indexPath : archivePath.replace(/\{number\}/g, _page)

        fs.writeFile(_path, content, 'utf8', function (err) {
          if (err)
            return done(err)

          console.log('Wrote index / archive (' + _page + '):', _path)
          done()
        })
      }(i, _page))
    }
}

function processFeed (config, posts, callback) {
  var feedPath = path.join(config.outputRoot, config.feedFile || 'feed.xml')
    , content  = feedTemplate.render({
          posts : posts
        , date  : new Date()
      })

  fs.writeFile(feedPath, content, 'utf8', function (err) {
    if (err)
      return callback(err)

    console.log('Wrote feed:', feedPath)
    callback()
  })
}

function fixPosts (config, posts) {
  posts.forEach(function (post) {
    if (!post.spec.base)
      post.spec.base = titleToBase(post.spec.title)
    post.spec.path = specToPath(config.postPath, post.spec)
  })
}

function blorg (root, config) {
  configSetup(root, config, function (err, config) {
    if (err)
      return handleError(err)

    swig.init({ root: config.templateRoot })
    postTemplate = swig.compileFile('post.html')
    indexTemplate = swig.compileFile('index.html')
    feedTemplate = swig.compileFile('feed.xml')

    ssbl(config.postRoot, function (err, postData) {
      if (err)
        return handleError(err)

      var allPostSpecs = postData.map(function (post) {
            return post.spec
          })

        , done = after(postData.length + 2 /* posts + index + feed */, function (err) {
            if (err)
              return handleError(err)

            console.log('Done!')
          })


      fixPosts(config, postData)

      postData.forEach(function (post) {
        processPost(config, allPostSpecs, post, done)
      })

      processIndex(config, postData, allPostSpecs, done)
      processFeed(config, postData, done)
    })
  })
}

module.exports = blorg
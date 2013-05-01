const ssbl = require('ssbl')

function specToPath (postPath, spec) {
  var p = postPath
    .replace(/\{year\}/g, spec.date.getFullYear())
     // padded month
    .replace(/\{month\}/g, (spec.date.getMonth() < 9 ? '0' : '') + (spec.date.getMonth() + 1))
    .replace(/\{title\}/g, spec.base)
    .replace(/^\/?/, '/') // always / at the start

  return p
}

function titleToBase (title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s\.\-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function fixPosts (config, posts) {
  posts.forEach(function (post) {
    if (!post.spec.base)
      post.spec.base = titleToBase(post.spec.title)
    post.spec.path = specToPath(config.path, post.spec)
  })
}

function markdownBlog (blorg, config, callback) {
  if (typeof config.postRoot != 'string')
    return callback(new Error('Must supply a "postRoot" value for markdown-blog'))
  if (typeof config.path != 'string')
    config.path = '{title}.html'

  blorg.toDirectory(config.postRoot, function (err, uri) {
    if (err)
      return callback(err)

    ssbl(uri, function (err, posts) {
      if (err)
        return callback(err)

      fixPosts(config, posts)
      callback(null, posts)
    })
  })
}

module.exports = markdownBlog
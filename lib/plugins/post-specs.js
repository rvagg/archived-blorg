function postSpecs (blorg, config, callback) {
  if (typeof config.blogData != 'string')
    return callback(new Error('Must supply a "blogData" value for post-specs'))

  var blogData = blorg.getData(config.blogData)
    , specData

  if (!Array.isArray(blogData))
    return callback(
      new Error('"blogData" setting for post-specs doesn\'t seem to point to a blog data plugin id'))

  specData = blogData.map(function (post) {
    return post.spec
  })

  callback(null, specData)
}

module.exports = postSpecs
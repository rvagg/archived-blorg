#!/usr/bin/env node

const blorg = require('..')
    , fs    = require('fs')
    , path  = require('path')

function printUsage () {
  console.error('Usage: blorg <config file>')
}

var configFile
  , config

try {
  configFile = fs.readFileSync(process.argv[2], 'utf8')
} catch (e) {
  return printUsage()
}

try {
  config = JSON.parse(configFile)
} catch (e) {
  console.error('Error parsing JSON:', e)
  return printUsage()
}

blorg(
    path.dirname(path.resolve(process.argv[2]))
  , config
)
'use strict';

const chroma = require('chroma-js')
const fs = require('fs')
const Task = require('data.task')
const { lumSet, hueSet } =  require('./config')

const colors = {}

/*
 * return evenly spaced luminance values as floats
 * this modulates to keep the ends from getting too light or dark to be useful
 */
const stepsToFloat = options =>
  Array.from({length: options.luminance}, (n, i) =>
    (i + 0.5 )/ 10).reverse()
  .map( s => modulate(s, [0, 1], [options.start, options.end]))

// returns a set of values mapped from one func to another
// from https://github.com/koenbok/Framer/blob/master/framer/Utils.coffee
const modulate = (value, [fromLow = rangeA, fromHigh = rangeB], [toLow = rangeC, toHigh = rangeD]) =>
  toLow + (((value - fromLow) / (fromHigh - fromLow)) * (toHigh - toLow))

// shift color on quadradic curve
// TODO: error handling
const shiftColor = (color, s, index, shift) =>
  chroma(s)
  .set('hsl.h', chroma(color).get('hsl.h') - ( (index * (index * 2) ) * (shift * 0.01)) ).hex()

// shift saturation on logorithmic curve
// TODO: error handling
const shiftSat = (color, s, index, sat) =>
  chroma(s)
  .saturate( ( ( sat * 0.1) * Math.log(index + 1)) )
  .hex()

// return an object of color steps for a given hue, with options
// TODO: error handling
const buildColor = (key, sat, shift) => {

  const color = hueSet[key]

  const steps = stepsToFloat(lumSet)
  .map( (s, index) => chroma(color.hue).luminance(s).hex() )
  .map ( (s, index) => sat   ?  shiftSat(color.hue, s, index, sat) : s )
  .map ( (s, index) => shift ?  shiftColor(color.hue, s, index, shift) : s )

  // return values as incremented key value pair
  const values = expandColors(key, steps)

  colors[key] = values

}

// expand the color array to allow them to be accessed by name in the JSON
// TODO: error handling
const expandColors = (key, steps) => {
  const resolvedColors = {}

  for(var index in steps) {
    const color = key+index
    const value = steps[index]
    resolvedColors[color] = value
  }
  return resolvedColors
}

// modify via config.js
// TODO: error handling
const buildPalette = (set) => {
  for(var key in set) {
    buildColor(key, set[key].sat, set[key].shift)
  }
  return colors
}

const writeFile = (filename, contents) =>
  new Task( (rej, res) =>
    fs.writeFile(filename, contents, (err, success)  => err ? rej(err) : res(success) ))

// refactor to be a task. run as app().fork()
const app = () => {
  buildPalette(hueSet)
  writeFile('colorPalette.json', JSON.stringify(colors, null, 4))
  .fork(e => console.log(e),
        s => console.log("Success"))
}

app()








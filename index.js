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
const modulate = (value, [fromLow = rangeA, fromHigh = rangeB], [toLow = rangeC, toHigh = rangeD]) =>
  toLow + (((value - fromLow) / (fromHigh - fromLow)) * (toHigh - toLow))

// shift color on quadradic curve
const shiftColor = (color, s, index, shift) =>
  chroma(s)
  .set('hsl.h', chroma(color).get('hsl.h') - ( (index * (index * 2) ) * (shift * 0.01)) ).hex()

// shift saturation on logorithmic curve
const shiftSat = (color, s, index, sat) =>
  chroma(s)
  .saturate( ( ( sat * 0.1) * Math.log(index + 1)) )
  .hex()

// an object of color steps for a given hue, with modifications
const buildColor = (key, sat, shift) => {

  // set starting point
  const color = hueSet[key]

  const steps = stepsToFloat(lumSet)
  .map( (s, index) => chroma(color).luminance(s).hex() )
  .map ( (s, index) => sat   ?  shiftSat(color, s, index, sat) : s )
  .map ( (s, index) => shift ?  shiftColor(color, s, index, shift) : s )

  const values = expandColors(key, steps)

  colors[key] = values

}

// * expand the color array to allow them to be accessed by name
const expandColors = (key, steps) => {
  const resolvedColors = {}

  for(var index in steps) {
    const color = key+index
    const value = steps[index]
    resolvedColors[color] = value
  }
  return resolvedColors
}

/*
Can this be refactored ?
Wrap these values for satShift/hueShift in an object -> so everything can be in a config file
*/
const buildPalette = () => {
  buildColor("red", 5, 2)
  buildColor("redOrange", 5)
  buildColor("orange", 3)
  buildColor("yellow", 3, 12)
  buildColor("green", 3)
  buildColor("mint", 3)
  buildColor("cyan", 3)
  buildColor("blue", 3)
  buildColor("indigo", 3)
  buildColor("gray")

  return colors
}

const writeFile = (filename, contents) =>
  new Task( (rej, res) =>
    fs.writeFile(filename, contents, (err, success)  => err ? rej(err) : res(success) ))

const app = () => {
  buildPalette()
  writeFile('colorPalette.json', JSON.stringify(colors, null, 4))
  .fork(e => console.log(e),
        s => console.log("Success"))
}

app()








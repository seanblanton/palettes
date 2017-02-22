const chroma = require('chroma-js');
const fs = require('fs');
const Task = require('data.task');

const colorSet = [];
const results = {};
const checks = [];


const minimumRatios = {
  aa: 4.5,
  aaLarge: 3,
  aaa: 7,
  aaaLarge: 4.5
};

const Box = x =>
  ({
    map: f => Box(f(x)),
    fold: f => f(x),
    inspect: () => `Box(${x}))`
  })

const Right = x =>
  ({
    chain:f => f(x),
    map: f => Right(f(x)),
    fold: (f, g) => g(x),
    inspect: () =>  'Right(${x})',
  })

const Left = x =>
  ({
    chain: f => Left(x),
    map: f => Left(x),
    fold: (f, g) => f(x),
    inspect: () => 'Left(${x})'
  })

const fromNullable = x =>
  x != null ? Right(x) : Left(null);

const tryCatch = f => {
  try {
    return Right(f());
  } catch(e) {
    return Left(e);
  }
}

const writeFile = (filename, contents) =>
  new Task((rej, res) =>
    fs.writeFile(filename, contents, (err, success) => (err ? rej(err) : res(success))));

// THIS IS TOTALLY GOOD
const readFile = (filename) =>
  tryCatch(() => fs.readFileSync( filename, 'utf8'))
  .chain(r => tryCatch(() => JSON.parse(r)))
  .fold(e => 3000,
        r => r);

const colors = readFile("./colorPalette.json");

// THIS IS TOTALLY GOOD
// Given two numbers, return their contrast ratio. Pass in true to truncate values at 2 decimals
const getRatio = (hex1, hex2, round) =>
  Box(chroma.contrast(hex1, hex2))
  .fold( r => round ? Math.round(r * 100)/100 : r )

// Flatten json object into an array of objects with name and hex props
// THIS SHOULD BE CHECKING FOR NULL VALUES USING RIGHT/LEFT
const getColors = obj =>
  Object.keys(obj).forEach(k => {
    Object.keys(obj[k]).forEach((v, index) => {
      const color = {
        name: v,
        hex: obj[k][v]
      };
      colorSet.push(color);
    });
  });


// Check color contrast ratio against WCAG guidelines and print as object
// # SHOULD THE PUSH REALLY BE IN THIS FUNC?
const getColorContrastRatioForPair = (color, bg) => {
  const comparison = {};
  comparison.hex = bg.hex;
  comparison.name = bg.name;
  comparison.contrast = getRatio(color, bg.hex, true);
  comparison.a11y = {
    aa: comparison.contrast >= minimumRatios.aa,
    aaLarge: comparison.contrast >= minimumRatios.aaLarge,
    aaa: comparison.contrast >= minimumRatios.aaa,
    aaaLarge: comparison.contrast >= minimumRatios.aaaLarge
  };
  return Box(comparison);
}

// Check a given color against an array of colors
// If the comparison doesn't meet a minimum ratio, do not pass the set into the results
const checkColorAgainstSet = (primaryColor, colors) => {
  const set = {};
  set.hex = primaryColor.hex;
  set.name = primaryColor.name;
  set.combinations = [];

  Object.keys(colors).forEach(c =>
    getColorContrastRatioForPair(primaryColor.hex, colors[c])
    .map(pair => pair.contrast > 4.5 ? set.combinations.push(pair) : false));

  set.combinations.length > 0 ? checks.push(set) : false ;
}

const app = output => {
  // Flatten json object into an array of objects with name and hex props
  getColors(colors);

  // check each object against all others in the set
  colorSet.map(color => {
    checkColorAgainstSet(color, colorSet);
    });

  writeFile(output, JSON.stringify(checks, null, 4) )
  .fork(e => console.log(e),
        s => console.log('Success'));
};

app('a11y.json');






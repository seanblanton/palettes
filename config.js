/*
 * CONFIG
 */

// steps of luminance with restraints to return
const lumSet = {
  luminance: 10,
  start: 0.02,
  end: 0.97,
};

// base hues to start from
const hueSet = {
  red: {
    hue: 'FF6F52',          // 10
    sat: '5',
    shift: '2',
  },
  redOrange: {
    hue: 'F77A31',          // 20
    sat: '5',
    shift: null,
  },
  orange: {
    hue: 'FF8E24',          // 30
    sat: '3',
    shift: null,
  },
  yellow: {
    hue: 'FFCC00',          // 50
    sat: '3',
    shift: '12',
  },
  green: {
    hue: '41CA86',          // 150
    sat: '3',
    shift: null,
  },
  mint: {
    hue: '43C4AF',          // 170
    sat: '3',
    shift: null,
  },
  cyan: {
    hue: '57B0C2',          // 190
    sat: '3',
    shift: null,
  },
  blue: {
    hue: '54A2F0',          // 210
    sat: '3',
    shift: null,
  },
  indigo: {
    hue: 'BB74E3',          // 270
    sat: '3',
    shift: null,
  },
  gray: {
    hue: 'B2B8BD',          // 205
    sat: null,
    shift: null,
  },
};

/*  eslint no-undef: "error"  */
module.exports = {
  lumSet,
  hueSet,
};

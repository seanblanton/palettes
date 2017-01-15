/*
 * CONFIG
 */

// steps of luminance with restraints to return
const lumSet = {
  luminance: 10,
  start: 0.05,
  end: 0.95
};

// base hues to start from
const hueSet = {
  red: "FF6F52",          // 10
  redOrange: "F77A31",    // 20
  orange: "FF8E24",       // 30
  yellow: "FFCC00",       // 50
  green: "41CA86",        // 150
  mint: "43C4AF",         // 170
  cyan: "57B0C2",         // 190
  blue: "54A2F0",         // 210
  indigo: "BB74E3",       // 270
  gray: "B2B8BD"          // 205
};

module.exports = {
  lumSet,
  hueSet,
}

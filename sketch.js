const PADDING = 10;
const FILTERS_HEIGHT = 50;
let cIDMIL, cDDMAL, cCAML, cSPCL, cMPCL;
const DISCIPLINES = {
  IDMIL: 0,
  DDMAL: 1,
  CAML: 2,
  SPCL: 3,
  MPCL: 4,
}

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(0);
  
  // Filters
  
  
  let listsStart = windowWidth * 0.6;
  
  //Visualizations
  fill(100);
  rect(PADDING, PADDING, listsStart - 2 * PADDING, windowHeight - 2 * PADDING, PADDING);
}
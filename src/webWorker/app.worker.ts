// cannot import function in a worker
//import { createCanvasBuffer, renderSquare, getContext, resizeImageCanvas } from "../tools";
type RubickFace = [
  RubickPixel,
  RubickPixel,
  RubickPixel,
  RubickPixel,
  RubickPixel,
  RubickPixel,
  RubickPixel,
  RubickPixel,
  RubickPixel
];

interface Color {
  red: number;
  green: number;
  blue: number;
}

interface dataSend {
  imageData: ImageData;
  width: number;
  height: number;
  tileSize: number;
  noise: number
}




export default () => {
  const RubickTiles : RubickTile[] = [
    { name: "white", color: {red: 255, green: 255, blue:255}, hexColor: "#FFFFFF" },
    { name: "green", color: {red: 124, green: 178, blue:87}, hexColor: "#7CCF57" },
    { name: "yellow", color: {red: 238, green: 207, blue:78}, hexColor: "#EECF4E" },
    { name: "orange", color: {red: 236, green: 112, blue:45}, hexColor: "#EC702D" },
    { name: "red", color: {red: 189, green: 40, blue:39}, hexColor: "#BD2827" },
    { name: "blue", color: {red: 44, green: 93, blue:166}, hexColor: "#2C5DA6" }
  ];

  const minBy = (arr, key) => {
    const min = Math.min(...arr.map(d => d[key]))
    return arr.find(d => d[key] === min);
  }

  function colorDistance(color1: Color, color2: Color) : number {
    const redDiff = (color2.red - color1.red);
    const greenDiff = (color2.green - color1.green);
    const blueDiff = (color2.blue - color1.blue);
    return (redDiff * redDiff) + (greenDiff * greenDiff) + (blueDiff * blueDiff);
  }

  function getImageDataRect(imageData: ImageData, x: number, y: number, sw: number, sh: number) :  ImageData {
    const numberOfChannels = 4;
    const numberOfOctetByRowImageData = imageData.width * numberOfChannels;

    const { data } = imageData;
    const rect = new Uint8ClampedArray(sw * sh * numberOfChannels);
    const numberOfOctetByRowRect = sw * numberOfChannels;

    for(let i = 0 ; i < sw; i++) {
      for(let j= 0; j < sh; j++) {
        rect[(i * numberOfChannels) + (j * numberOfOctetByRowRect)    ] = data[((x + i) * numberOfChannels) + ((y + j) * numberOfOctetByRowImageData)];
        rect[(i * numberOfChannels) + (j * numberOfOctetByRowRect) + 1] = data[((x + i) * numberOfChannels) + ((y + j) * numberOfOctetByRowImageData) + 1];
        rect[(i * numberOfChannels) + (j * numberOfOctetByRowRect) + 2] = data[((x + i) * numberOfChannels) + ((y + j) * numberOfOctetByRowImageData) + 2];
        rect[(i * numberOfChannels) + (j * numberOfOctetByRowRect) + 3] = data[((x + i) * numberOfChannels) + ((y + j) * numberOfOctetByRowImageData) + 3];
      }
    }

    return new ImageData(rect, sw, sh);
  }


  function generateRubicksCube(
    imageData: ImageData,
    width: number,
    height: number,
    tileSize: number,
    noise: number
  ) {
      let newRubicksPixels : RubickFace[] = []

      for(let y = 0; y < height; y += (3*tileSize)) {
        for(let x = 0; x < width; x += (3*tileSize)) {

          const color11 = fromColorToDominantRubikColorWithRandom(
            interpolateArea(imageData, tileSize, x,y),
            noise
          );
          const color12 = fromColorToDominantRubikColorWithRandom(
            interpolateArea(imageData, tileSize, x+tileSize,y),
            noise
          );
          const color13 = fromColorToDominantRubikColorWithRandom(
            interpolateArea(imageData, tileSize, x+(2*tileSize),y),
            noise
          );

          const color21 = fromColorToDominantRubikColorWithRandom(
            interpolateArea(imageData, tileSize, x,y+tileSize),
            noise
          );
          const color22 = fromColorToDominantRubikColorWithRandom(
            interpolateArea(imageData, tileSize, x+tileSize,y+tileSize),
            noise
          );
          const color23 = fromColorToDominantRubikColorWithRandom(
            interpolateArea(imageData, tileSize, x+(2*tileSize),y+tileSize),
            noise
          );

          const color31 = fromColorToDominantRubikColorWithRandom(
            interpolateArea(imageData, tileSize, x,y+(2*tileSize)),
            noise
          );
          const color32 = fromColorToDominantRubikColorWithRandom(
            interpolateArea(imageData, tileSize, x+tileSize,y+(2*tileSize)),
            noise
          );

          const color33 = fromColorToDominantRubikColorWithRandom(
            interpolateArea(imageData, tileSize, x+(2*tileSize),y+(2*tileSize)),
            noise
          );

          const rubickFace : RubickFace = [
            {
              color: color11, x, y
            },
            {
              color: color12, x: (x+tileSize), y
            },
            {
              color: color13, x: (x+(2*tileSize)), y
            },
            {
              color: color21, x, y: (y+tileSize)
            },
            {
              color: color22, x: (x+tileSize), y: (y+tileSize)
            },
            {
              color: color23, x: (x+(2*tileSize)), y: (y+tileSize)
            },
            {
              color: color31, x, y: (y+(2*tileSize))
            },
            {
              color: color32, x: (x+tileSize), y: (y+(2*tileSize))
            },
            {
              color: color33, x: (x+(2*tileSize)), y: (y+(2*tileSize))
            }
          ];
          newRubicksPixels.push(rubickFace);
        }
      }
      return newRubicksPixels;
  }

  function interpolateArea(imageData: ImageData, tileSize: number, x: number, y: number) : Color {
    const pixels = getImageDataRect(imageData, x,y, tileSize, tileSize);
    const { data } = pixels;
    const numberOfPixels = tileSize * tileSize;
    let red = 0;
    let green = 0;
    let blue = 0;


    for (let i = 0; i < data.length; i += 4) {
      red += data[i];
      green += data[i + 1];
      blue += data[i + 2];
    }

    return { red: (red/numberOfPixels), green: (green/numberOfPixels), blue: (blue/numberOfPixels) };
  }


  function fromColorToDominantRubikColor(color: Color) : string {
    const comparaisonValues = RubickTiles.map(rubickTile => ({ ...rubickTile, value: colorDistance(color, rubickTile.color)}) );
    const foundPixel = minBy(comparaisonValues, 'value');
    if(!foundPixel) {
      throw `No sprite found for the pixel with the value ${color}`;
    }
    return foundPixel.hexColor;
  }

  function fromColorToDominantRubikColorWithRandom(color: Color, noise: number) : string {

    if(Math.random() < (noise)/100) {
      const pickedColor = sample(RubickTiles);
      return fromColorToDominantRubikColor(pickedColor!.color);
    }

    return fromColorToDominantRubikColor(color);
  }


  self.addEventListener('message', e => { // eslint-disable-line no-restricted-globals
      if (!e) return;
      const { imageData, width, height, tileSize, noise } = e.data;
      const rubickTiles = generateRubicksCube(imageData, width, height, tileSize, noise);
      postMessage(rubickTiles);
  })
};

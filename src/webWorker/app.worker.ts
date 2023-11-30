// cannot import function in a worker
//import { createCanvasBuffer, renderSquare, getContext, resizeImageCanvas } from "../tools";

interface dataSend {
  offscreenCanvas: HTMLCanvasElement;
  pixels : ImageData;
  tileSize: number;
  expectedWidth: number;
  expectedHeight: number;
}


export default () => {


  function fromColorArrayToStringCSS(color: Color) : string {
    return `rgb(${color.red}, ${color.green}, ${color.blue})`;
  }

  // WARNING: This is not a drop in replacement solution and
// it might not work for some edge cases. Test your code!
const minBy = (arr, func) => {
  const min = Math.min(...arr.map(func))
  return arr.find(item => func(item) === min)
}

  function interpolateArea(context: CanvasRenderingContext2D, tileSize: number, x: number, y: number) : Color {
    const pixels = context.getImageData(x,y, tileSize, tileSize);
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

  const rubickFaces : RubickFace[] = [
    { name: "white", color: {red: 255, green: 255, blue:255} },
    { name: "green", color: {red: 124, green: 178, blue:87} },
    { name: "yellow", color: {red: 238, green: 207, blue:78} },
    { name: "orange", color: {red: 236, green: 112, blue:45} },
    { name: "red", color: {red: 189, green: 40, blue:39} },
    { name: "blue", color: {red: 44, green: 93, blue:166} }
  ];

  function fromColorToDominantRubikColor(color: Color) : string {
    const comparaisonValues = rubickFaces.map(rubickFace => ({ ...rubickFace, value: colorDistance(color, rubickFace.color)}) );
    const foundPixel = minBy(comparaisonValues, o => o.value);
    if(!foundPixel) {
      throw `No sprite found for the pixel with the value ${color}`;
    }

    return fromColorArrayToStringCSS(foundPixel.color);
  }

  function fromColorToDominantRubikColorWithRandom(color: Color) : string {

    //if(Math.random() < (noise)/100) {
      //const pickedColor = sample(rubickFaces);
      //return fromColorToDominantRubikColor(pickedColor!.color);
    //}

    return fromColorToDominantRubikColor(color);
  }

  function getContext(canvas:  HTMLCanvasElement) : CanvasRenderingContext2D {
    const context = canvas.getContext("2d");
    if(!context) {
        throw new Error("cannot find the context 2d for the canvas");
    }
    return context;
  }


  function renderSquare(context : CanvasRenderingContext2D, color: string, x: number, y: number, tileSize: number) {
      context.fillStyle = color;

      /*if(hasBorder) {
        context.lineWidth = 2;
      }*/

      context.beginPath();
      context.rect(x, y, tileSize, tileSize);
      /*if(hasBorder) {
        context.stroke();
      }*/
      context.fill();
      context.closePath();
  }

    // a tester
  function getPixel(imageData: ImageData,x: number, y: number) {
    const { height, data } = imageData;
    const index = (y * height + x) * 4;
     return { red: data[index], green: data[index + 1], blue: data[index + 2] };
  }

  function colorDistance(color1: Color, color2: Color) : number {
    const redDiff = (color2.red - color1.red);
    const greenDiff = (color2.green - color1.green);
    const blueDiff = (color2.blue - color1.blue);
    return (redDiff * redDiff) + (greenDiff * greenDiff) + (blueDiff * blueDiff);
  }




  self.addEventListener('message', e => { // eslint-disable-line no-restricted-globals

      if (!e) return;
      const { offscreenCanvas,  expectedWidth, expectedHeight, tileSize, pixels } = e.data;
      const users = e.data.users.sort((a, b) => a.commentCount - b.commentCount);
      const contextTarget = getContext(offscreenCanvas);
      console.log(e.data)

      for(let y = 0; y < expectedHeight; y += tileSize) {
        for(let x = 0; x < expectedWidth; x += tileSize) {
          const color = fromColorToDominantRubikColorWithRandom(getPixel(pixels,x,y));
          renderSquare(contextTarget, color, x, y, tileSize);
        }
      }

      setTimeout(() =>{
        postMessage(users);
      }, [5000]);
  })
};

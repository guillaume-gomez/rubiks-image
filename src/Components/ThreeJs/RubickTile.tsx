import {MeshStandardMaterial, BoxGeometry} from 'three';

interface RubickTileProps {
  color: string;
  position: [number, number, number];
}

const colorsMaterialsArray = [
  new MeshStandardMaterial({color: "#2C5DA6"}), // bleu -> right
  new MeshStandardMaterial({color: "#7CCF57"}), // green -> left
  new MeshStandardMaterial({color: "#BD2827"}), // red -> top
  new MeshStandardMaterial({color: "#EC702D"}), // orange -> down
  new MeshStandardMaterial({color: "#EECF4E"}), // yellow -> front
  new MeshStandardMaterial({color: "#FFFFFF"}), //white -> back
]

const BORDER_SIZE = 0.1;
const SIZE = 1 - BORDER_SIZE;
const boxGeometry = new BoxGeometry(SIZE, SIZE, SIZE);


function fromColorToRotation(color: string) : string {
  switch(color) {
    case "#2C5DA6": return [0,-Math.PI/2, 0];
    case "#7CCF57": return [0, Math.PI/2, 0];
    case "#BD2827": return [Math.PI/2, 0, 0];
    case "#EC702D": return [-Math.PI/2, 0, 0];
    case "#EECF4E":
    default:
     return [0,0, 0];
    case "#FFFFFF": return [0,-Math.PI, 0];
  }
}

function RubickTile({ color, position } : RubickTileProps) {
  return (
    <mesh
      rotation={fromColorToRotation(color)}
      position={position}
      material={colorsMaterialsArray}
      geometry={boxGeometry}
    />
  );
}

export default RubickTile;
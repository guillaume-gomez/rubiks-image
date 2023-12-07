import {MeshStandardMaterial, BoxGeometry} from 'three';

interface RubickTileProps {
  color: string;
  position: [number, number, number];
}

const colorsMaterials = {
  "#FFFFFF": new MeshStandardMaterial({color: "#FFFFFF"}),
  "#7CCF57": new MeshStandardMaterial({color: "#7CCF57"}),
  "#EECF4E": new MeshStandardMaterial({color: "#EECF4E"}),
  "#EC702D": new MeshStandardMaterial({color: "#EC702D"}),
  "#BD2827":  new MeshStandardMaterial({color: "#BD2827"}),
  "#2C5DA6":  new MeshStandardMaterial({color: "#2C5DA6"}),
}

const BORDER_SIZE = 0.1;
const SIZE = 1 - BORDER_SIZE;
const boxGeometry = new BoxGeometry(SIZE, SIZE, SIZE);

function RubickTile({ color, position } : RubickTileProps) {
  return (
    <mesh
      position={position}
      material={colorsMaterials[color]}
      geometry={boxGeometry}
    />
  );
}

export default RubickTile;
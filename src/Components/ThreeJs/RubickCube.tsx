import { RubickFace } from "../../types";
import RubickFaceThree from "./RubickFace";
import { MeshStandardMaterial, BoxGeometry } from 'three';

interface RubickCubesProps {
  hideOtherFaces: boolean;
  rubickFace: RubickFace;
  tileSize: number;
  position: [number, number, number];
  hasBorder: boolean
}

export const BORDER_SIZE = 0.1;


const borderMaterial = new MeshStandardMaterial({ color: "black" });
const borderGeometry = new BoxGeometry(2.8, 2.8 , 2.8);

const borderGeometryFace = new BoxGeometry(2.8,2.8,0.8);


function RubickCube({ hideOtherFaces, rubickFace, tileSize, position, hasBorder } : RubickCubesProps) {
  if(hideOtherFaces) {
    return (
      <group
      position={position}
      >
        <RubickFaceThree
          rubickFace={rubickFace}
          tileSize={tileSize}
        />

        {hasBorder && <mesh
        geometry={borderGeometryFace}
        material={borderMaterial}
        position={[1,-1,0.01]}
        />}
    </group>);
  }

  return (
    <group
      position={position}
    >
      {hasBorder && <mesh
        geometry={borderGeometry}
        material={borderMaterial}
        position={[1,-1,1]}
      />}
      <RubickFaceThree
        rubickFace={rubickFace}
        tileSize={tileSize}
        position={[0, 0, 0]}
      />
      <RubickFaceThree
        rubickFace={rubickFace}
        tileSize={tileSize}
        position={[0, 0, 1]}
        isMiddle
      />
      <RubickFaceThree
        rubickFace={rubickFace}
        tileSize={tileSize}
        position={[0, 0, 2]}
      />
    </group>
  );
}

export default RubickCube;
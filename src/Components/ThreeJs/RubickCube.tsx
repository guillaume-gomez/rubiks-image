import { useMemo } from "react";
import { RubickFace } from "../../types";
import RubickFaceThree from "./RubickFace";
import { MeshStandardMaterial, BoxGeometry } from 'three';

interface RubickCubesProps {
  hideOtherFaces: boolean;
  rubickFace: RubickFace;
  position: [number, number, number];
  hasBorder: boolean
}

export const BORDER_SIZE = 0.1;


const borderMaterial = new MeshStandardMaterial({ color: "black" });
const borderGeometry = new BoxGeometry(2.8, 2.8 , 2.8);

const borderGeometryFace = new BoxGeometry(2.8,2.8,0.8);

/*
blue <-> green
orange <-> red
yellow <-> white
*/
function findOppositeTile(hexColor: string) : string {
  switch(hexColor) {
    case "#FFFFFF": return "#EECF4E";
    case "#EECF4E": return "#FFFFFF";

    case "#EC702D": return "#BD2827";
    case "#BD2827": return "#EC702D";

    case "#2C5DA6": return "#7CCF57";
    case "#7CCF57": return "#2C5DA6";

    default: return "#000000";
  }
}

function computeOppositeFace(rubickFace: RubickFace) : RubickFace {
  return rubickFace.map((rubickTile) => ({...rubickTile, color: findOppositeTile(rubickTile.color)}));
}

function RubickCube({ hideOtherFaces, rubickFace, position, hasBorder } : RubickCubesProps) {
  const oppositeFace = useMemo(() => computeOppositeFace(rubickFace), [rubickFace]);

  if(hideOtherFaces) {
    return (
      <group
      position={position}
      >
        <RubickFaceThree
          rubickFace={rubickFace}
          position={[0,0,0]}
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
        position={[0, 0, 0]}
      />
      <RubickFaceThree
        rubickFace={rubickFace}
        position={[0, 0, 1]}
        isMiddleFace
      />
      <RubickFaceThree
        rubickFace={rubickFace}
        position={[0, 0, 2]}
      />
    </group>
  );
}

export default RubickCube;
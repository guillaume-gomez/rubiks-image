import { RubickFace } from "../../types";
import RubickFaceThree from "./RubickFace";


interface RubickCubesProps {
  hideOtherFaces: boolean;
  rubickFace: RubickFace;
  tileSize: number;
  position: [number, number, number];
}

function RubickCube({ hideOtherFaces, rubickFace, tileSize, position } : RubickCubesProps) {
  if(hideOtherFaces) {
    return (
    <RubickFaceThree
      rubickFace={rubickFace}
      tileSize={tileSize}
      position={position}
    />);
  }

  return (
    <group
      position={position}
    >
      <RubickFaceThree
        rubickFace={rubickFace}
        tileSize={tileSize}
        position={[0, 0, 0]}
      />
      <RubickFaceThree
        rubickFace={rubickFace}
        tileSize={tileSize}
        position={[0, 0, 1]}
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
import { RubickFace } from "../../types";
import RubickTile from "./RubickTile";

interface RubickFaceProps {
  rubickFace: RubickFace;
  position: [number, number, number]
}

export const BORDER_SIZE = 0.1;

function RubickFace({ rubickFace, position } : RubickFaceProps) {
  return (
    <group
      position={position}
    >
    {
      rubickFace.map(({color}, index) => {
        const x = index % 3;
        const y = Math.floor(index / 3);

        return (
          <RubickTile
            color={color}
            position={[x, -y, 0]}
          />
        );
      })
    }
    </group>
  );
}

export default RubickFace;
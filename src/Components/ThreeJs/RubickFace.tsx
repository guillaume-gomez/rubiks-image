import { RubickFace } from "../../types";
import RubickTile from "./RubickTile";

interface RubickFaceProps {
  rubickFace: RubickFace;
  position: [number, number, number]
  isMiddle: boolean
}

function RubickFace({ rubickFace, position, isMiddle } : RubickFaceProps) {
  return (
    <group
      position={position}
    >
    {
      rubickFace.map(({color}, index) => {
        const x = index % 3;
        const y = Math.floor(index / 3);
        if(x === 1 && y === 1 && isMiddle) {
          return <></>;
        }
        return (
          <RubickTile
            key={`${index}_${color}_${x}_${y}`}
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
import { useRef , useEffect, useMemo } from 'react';
import { sample } from "lodash";
import { useSpring, useSpringRef} from '@react-spring/web';
import { Object3D, Matrix4, Vector3, InstancedMesh, Euler } from 'three';
import { RubickFace } from "../../types";
import { boxGeometry, colorsMaterialsArray, fromColorToRotation } from "./CubeCommon";

interface RubickCubesInstancedMeshProps {
  tileSize: number;
  rubickFaces: RubickFace[];
}

type axisType = "X"| "Y" | "Z";
type faceType = 0 | 1 | 2;

interface Move {
  axis: axisType;
  direction: number;
  face: faceType;
}

interface ParamsMove {
  moves: Move[];
  movesLength: number;
  currentMove: number;
  width: number;
  height: number;
}

function RubickCubesInstancedMesh({ tileSize, rubickFaces, width, height } : RubickCubesInstancedMeshProps) {
  const meshRef = useRef<InstancedMesh>(null);
  const origin = useRef<Vector3>(new Vector3());
  const pivots = useRef<Vector3[]>([]);
  const oldRotation = useRef<number>(0.0);
  const params= useRef<ParamsMove[]>([]);
  const numberOfCubes =  rubickFaces.length * 9 * 3;
  const centerPos = useMemo(() => ({ x: width/2, y: height/2 }), [width, height]);


  const api = useSpringRef()
  useSpring({
    ref: api,
    from: { rotationStep: 0 },
    to  : { rotationStep: 1 },
    config: {
      duration: 200,
    },
    delay: 500,
    reset: true,
    onRest: () => {
      params.current = params.current.map(param => ({...param, currentMove: param.currentMove + 1}) )
      oldRotation.current = 0.0;
      if(isAnimationFinish()) {
        api.stop();
        return;
      }
      api.start({from: {rotationStep: 0}, to:{rotationStep: 1}});
    },
    onChange: ({value: {rotationStep}}) => {
      if(rubickFaces.length>0) {
        rotateRubickCubes((rotationStep - oldRotation.current)*(Math.PI/2));
      }
      oldRotation.current = rotationStep
    }
  })

  function init() {
    pivots.current = [];
    params.current = [];
    origin.current.set(0, 0, 0);

    let id = 0;
    rubickFaces.forEach((rubickFace, index) => {
      for(let z = -1; z <= 1; z++)
      {
        rubickFace.forEach( ({x, y, color}) => {
            const object = new Object3D();

            object.position.set((x/tileSize) + origin.current.x, -(y/tileSize) + origin.current.y, z + origin.current.z);
            object.rotation.set(...fromColorToRotation(color));
            object.updateMatrix();
            meshRef.current?.setMatrixAt(id, object.matrix);
            id++;
        })

        const { x, y } = rubickFace[0]
        pivots.current.push(new Vector3(x/tileSize, y/tileSize, z));
      }
      const { x, y } = rubickFace[0];
      //make some moves to avoid the user to see the final result is in the first step
      const randomMoves = scrambleBeforeRunning(index, generateRandomMoves(x, y), 3);

      params.current.push(randomMoves);
    })
  }

  function generateWaveRandomMoves(x: number, y: number) : number {
    const radiusX = Math.abs(centerPos.x - x);
    const radiusY = Math.abs(centerPos.y - y);

    const distance = Math.sqrt(radiusX * radiusX + radiusY * radiusY);
    // empirical value to reduce the number of moves
    const factor = 40;

    return distance / factor;
  }

  function generateRandomMoves(x: number, y: number): ParamsMove {
    let moves : Move[] = [];
    const minimumMoves = 10;
    const movesLength = Math.ceil(generateWaveRandomMoves(x,y)) + minimumMoves;
    console.log(movesLength);

    for(let i=0; i < movesLength; i++) {
      const axis : axisType = sample(["X", "Y", "Z"]);
      const face : faceType = sample([0,1,2]);
      const direction = sample([-1,1]);
      moves.push({axis, face, direction});
    }

    for(let i=movesLength-1; i >= 0; i--) {
      const { axis, face, direction } = moves[i];
      moves.push({axis, face, direction: -direction});
    }

    return { movesLength: movesLength*2, currentMove: 0, moves };
  }

  function scrambleBeforeRunning(rubickCubeIndex: number, randomMoves: ParamsMove, numberOfMoves: number) : ParamsMove {
    const { movesLength, moves } = randomMoves;

    if(numberOfMoves > movesLength) {
      return { movesLength, moves, currentMove: 0};
    }

    for(let i=0; i < numberOfMoves; i++) {
      rotate(moves[i].axis, rubickCubeIndex, moves[i].face, moves[i].direction * Math.PI/2);
    }

    return { movesLength, moves, currentMove: numberOfMoves};
  }

  function rotateRubickCubes(elapsedTime: number) {
    if(!meshRef.current) {
      return;
    }

    rubickFaces.forEach((_rubickFace, index) => {
      const { moves, currentMove, movesLength } = params.current[index];
      if(currentMove >= movesLength) {
        return;
      }
      const { axis, face, direction} = moves[currentMove];
      rotate(axis, index, face, direction * elapsedTime);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }


  function rotate(rotationAxis: axisType, rubickCubeIndex: number, face: faceType, iterationAngleInRadian: number) {
    const pivot = pivots.current[(rubickCubeIndex *3) + face];
    let cubes = findCubes(rotationAxis, rubickCubeIndex, face, pivot);

    cubes.forEach(({id, object}) => {
      const [translation, translationInverse] = getTranslationFromRotationAxis(rotationAxis, face, pivot, origin.current);
      const rotate = new Matrix4().makeRotationFromEuler(getEulerFromRotationAxis(rotationAxis, iterationAngleInRadian));

      object.applyMatrix4(translation.multiply(rotate).multiply(translationInverse));
      meshRef.current?.setMatrixAt(id, object.matrix);
    });
  }

  function getTranslationFromRotationAxis(rotationAxis: axisType, face: faceType, pivot: Vector3, origin: Vector3) : [Matrix4, Matrix4] {
    switch(rotationAxis) {
      case "X":
      default:

        return [
          new Matrix4().setPosition(new Vector3( 0 , -(origin.y + 1) - pivot.y, origin.z + pivot.z + (1-face))),
          new Matrix4().setPosition(new Vector3( 0 , -(origin.y - 1) + pivot.y, -origin.z - pivot.z - (1-face)))
        ];
      case "Y":
        return [
          new Matrix4().setPosition(new Vector3( (origin.x + 1) + pivot.x,  0,  origin.z + pivot.z + (1-face))),
          new Matrix4().setPosition(new Vector3(-(origin.x + 1) - pivot.x,  0, -origin.z - pivot.z - (1- face)))
        ];
      case "Z":
        return [
          new Matrix4().setPosition(new Vector3( (origin.x + 1) + pivot.x,  -(origin.y +1) - pivot.y,  0)),
          new Matrix4().setPosition(new Vector3( -(origin.x + 1) - pivot.x, -(origin.y -1)  + pivot.y, 0))
        ];
    }
  }

  function findCubes(rotationAxis: axisType, rubickCubeIndex: number, face: faceType, pivot: Vector3)  {
    let foundCubes = [];
    const beginRubickCube = rubickCubeIndex * 3 * 9;
    for(let id = beginRubickCube; id < 27 + beginRubickCube; id++) {
      const object = new Object3D();
      const matrix = new Matrix4();

      meshRef.current?.getMatrixAt(id, matrix);
      matrix.decompose(object.position, object.quaternion, object.scale);

      if(isIntheFace(rotationAxis, face, pivot, object.position)) {
        foundCubes.push({id, object});
      }
    }
    return foundCubes;
  }

  function isIntheFace(rotationAxis: axisType, face: faceType, pivot: Vector3, position: Vector3) : boolean {
    switch(rotationAxis) {
      case "X": return (Math.round(position.x) - origin.current.x - pivot.x) === (face);
      case "Y": return (Math.round(-position.y) - origin.current.y - pivot.y) === (face);
      case "Z": return (Math.round(position.z) - origin.current.z) === (face-1);
      default: return false;
    }
  }

  function getEulerFromRotationAxis(rotationAxis: axisType, angleInRadian: number): Euler {
    switch(rotationAxis) {
      case "X":
      default:
        return new Euler(angleInRadian, 0, 0);
      case "Y":
        return new Euler(0, angleInRadian, 0);
      case "Z":
        return new Euler(0, 0, angleInRadian);
    }
  }

  function isAnimationFinish() :boolean {
    const animationFinishedArray = params.current.filter((param) => param.currentMove >= param.movesLength);
    return animationFinishedArray.length === params.current.length;
  }

  useEffect(() => {
    if (meshRef == null) return;
    if (meshRef.current == null) return;
    if (rubickFaces.length <= 0) return;
    init();

    oldRotation.current = 0.0;
    api.start();

    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [rubickFaces.length]);

  return (
    <instancedMesh receiveShadow={true} ref={meshRef} args={[boxGeometry, colorsMaterialsArray, numberOfCubes ]} />
  );
}

export default RubickCubesInstancedMesh;
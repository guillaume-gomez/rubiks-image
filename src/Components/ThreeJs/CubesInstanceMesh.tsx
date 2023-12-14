import { useRef , useEffect } from 'react';
import { useFrame } from "@react-three/fiber";
import { sample } from "lodash";
import { Object3D, Matrix4, Vector3, InstancedMesh, MeshStandardMaterial, Euler } from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RubickFace } from "../../types";

interface InstancedMeshProps {
  tileSize: number;
  rubickFaces: RubickFace[];
  hasBorder?: boolean;
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
const boxGeometry = new RoundedBoxGeometry(SIZE, SIZE, SIZE);

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

const colors = ["#2C5DA6", "#7CCF57", "#BD2827", "#EC702D", "#EECF4E", "#FFFFFF"];

function Cubes({ tileSize, rubickFaces, hasBorder } : InstancedMeshProps) {
  const meshRef = useRef<InstancedMesh>();
  const origin = useRef<Vector3>(new Vector3());
  const pivots = useRef<Vector3[]>([]);
  const tempObject = new Object3D();
  const numberOfCubes =  rubickFaces.length * 9 * 3;

  const oldRotation = useRef<number>(0.0);
  const rotation = useRef<number>(0.0);
  const params= useRef({ direction: -1, axis: "X", face: 2});

  function finalResult() {
    let id = 0;
    rubickFaces.forEach(rubickFace => {
      for(let z = 0; z < 3; z++) {
        rubickFace.forEach( ({x, y, color}) => {
            tempObject.position.set((x/tileSize), -(y/tileSize), z);
            tempObject.rotation.set(...fromColorToRotation(color));
            tempObject.updateMatrix();
            meshRef.current.setMatrixAt(id, tempObject.matrix);
            id++;
        })
      }
    })
  }

  function init() {
    pivots.current = [];
    origin.current.set(0, 0, 0);

    let id = 0;
    rubickFaces.forEach(rubickFace => {
      for(let z = -1; z <= 1; z++) {
        rubickFace.forEach( ({x, y, color}) => {
            //const indexColor = Math.floor(Math.random() * 6);

            tempObject.position.set((x/tileSize) + origin.current.x, (y/tileSize) + origin.current.y, z + origin.current.z);
            //tempObject.rotation.set(...fromColorToRotation(colors[indexColor]));
            tempObject.updateMatrix();
            meshRef.current.setMatrixAt(id, tempObject.matrix);
            id++;
        })

        const { x, y } = rubickFace[0]
        pivots.current.push(new Vector3(x/tileSize, y/tileSize, z));
      }
    })
  }


  function initTest() {
    if(rubickFaces.length <= 0) {
      return;
    }
    pivots.current = [];
    origin.current.set(5, -4, 3);

    let id = 0;
    for(let z = -1; z <= 1; z++) {
      rubickFaces[0].forEach( ({x, y, color}) => {
          const indexColor = Math.floor(Math.random() * 6);
          tempObject.position.set((x/tileSize) + origin.current.x, (y/tileSize) + origin.current.y, z + origin.current.z);
          tempObject.updateMatrix();
          meshRef.current.setMatrixAt(id, tempObject.matrix);
          id++;
      })
      const { x, y } = rubickFaces[0][0]
      pivots.current.push(new Vector3(x/tileSize, y/tileSize, z));
    }
  }

  function rotateRubickCubes(elapsedTime) {
    rotation.current = Math.min(rotation.current + 0.1, 1);
    const iteration = (rotation.current - oldRotation.current) * Math.PI/2;
    //console.log(springs.rotation.get())
    const { axis, face, direction } = params.current
    rotate(axis, 0, face, direction, iteration);
    oldRotation.current = rotation.current;

    if(rotation.current + 0.1 >= 1.0) {
      oldRotation.current = 0.0;
      rotation.current = 0.0

      const axis = sample(["X", "Y", "Z"]);
      const face = sample([0,1,2]);
      const direction = sample([-1,1]);
      params.current = {axis, face, direction};
    }

    // test
    //rotate("Y", 0, 0, 1, elapsedTime);
    //rotate("Z", 0, 1, 1, elapsedTime);
    //rotate("Z", 0, 2, 1, elapsedTime);
    // end test

    /*const iteration = (springs.rotation.get() - oldRotation.current) * Math.PI/2;
    rubickFaces.forEach((rubickFace, index) => {
      rotate(springs.axis.get(), index, springs.face.get(), springs.direction.get(), iteration);
    })
    oldRotation.current = springs.rotation.get();*/
  }


  function rotate(rotationAxis: "X"|"Y"|"Z", rubickCubeIndex: number, face: number, direction: number, iterationAngleInRadian: number) {
    const pivot = pivots.current[(rubickCubeIndex *3) + face];
    let cubes = findCubes(rotationAxis, rubickCubeIndex, face, pivot);

    cubes.forEach(({id, object}) => {
      const [translation, translationInverse] = getTranslationFromRotationAxis(rotationAxis, face, pivot, origin.current);
      const rotate = new Matrix4().makeRotationFromEuler(getEulerFromRotationAxis(rotationAxis, iterationAngleInRadian));

      object.applyMatrix4(translation.multiply(rotate).multiply(translationInverse));
      meshRef.current.setMatrixAt(id, object.matrix);
    });
  }

  function getTranslationFromRotationAxis(rotationAxis: "X"|"Y"|"Z", face: number, pivot: Vector3, origin: Vector3) : [Matrix4, Matrix4] {
    switch(rotationAxis) {
      case "X":
      default:

        return [
          new Matrix4().setPosition(new Vector3( 0 ,  (origin.y + 1) + pivot.y, origin.z + pivot.z + (1-face))),
          new Matrix4().setPosition(new Vector3( 0 , -(origin.y + 1) - pivot.y, -origin.z - pivot.z - (1-face)))
        ];
      case "Y":
        return [
          new Matrix4().setPosition(new Vector3( (origin.x + 1) + pivot.x,  0,  origin.z + pivot.z + (1-face))),
          new Matrix4().setPosition(new Vector3(-(origin.x + 1) - pivot.x,  0, -origin.z - pivot.z - (1- face)))
        ];
      case "Z":
        return [
          new Matrix4().setPosition(new Vector3( (origin.x + 1) + pivot.x,  (origin.y + 1) + pivot.y,  0)),
          new Matrix4().setPosition(new Vector3( -(origin.x + 1) - pivot.x, -(origin.y + 1) - pivot.y, 0))
        ];
    }
  }

  function findCubes(rotationAxis: "X"|"Y"|"Z", rubickCubeIndex: number, face: number, pivot: Vector3)  {
    let foundCubes = [];
    const beginRubickCube = rubickCubeIndex * 3 * 9;
    for(let id = beginRubickCube; id < 27 + beginRubickCube; id++) {
      const object = new Object3D();
      const matrix = new Matrix4();

      meshRef.current.getMatrixAt(id, matrix);
      matrix.decompose(object.position, object.quaternion, object.scale);

      if(isIntheFace(rotationAxis, face, pivot, object.position)) {
        foundCubes.push({id, object});
      }
    }
    return foundCubes;
  }

  function isIntheFace(rotationAxis: "X"|"Y"|"Z", face: number, pivot: Vector3, position: Vector3) : boolean {
    switch(rotationAxis) {
      case "X": return (Math.round(position.x) - origin.current.x - pivot.x) === (face);
      case "Y": return (Math.round(position.y) - origin.current.y - pivot.y) === (face);
      case "Z": return (Math.round(position.z) - origin.current.z) === (face-1);
      default: return false;
    }
  }

  function getEulerFromRotationAxis(rotationAxis: "X"|"Y"|"Z", angleInRadian: number): Euler {
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

  useEffect(() => {
    if (meshRef == null) return;
    if (meshRef.current == null) return;
    //init();
    initTest();

    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [rubickFaces]);

  useFrame((state, elapsedTime) => {
    if(rubickFaces.length>0) {
      rotateRubickCubes(elapsedTime);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;

  });

  return (
    <instancedMesh ref={meshRef} args={[boxGeometry, colorsMaterialsArray, numberOfCubes ]} />
  );
}

export default Cubes;
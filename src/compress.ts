import { RubickFace } from "./types";

type CaracterColorType = "W"| "R" | "Y" |"O" |"B" | "G";


function fromHexToCaracterColor(color: string) : CaracterColorType  {
    switch(color) {
    case "#FFFFFF":
    default:
        return "W";
    case "#7CCF57":
        return "G";
    case "#EECF4E":
        return "Y";
    case "#EC702D":
        return "O";
    case "#FFFFFF":
        return "W";
    case "#BD2827":
        return "R";
    case "#2C5DA6":
        return "B";
    }
}

export function compressRubickCubeData(rubickFaces: RubickFace[], width: number) : string {
    const rubickFacesFlatten = rubickFaces.flat(2);

    const rubickFacesFlattenSortByXAndY = rubickFacesFlatten.slice().sort( (a,b) => {
        return (a.x + (a.y * width)) - (b.x + (b.y * width));
    });

    let compressRubickFaces = "";

    let nbOccurenceContigous = 0;
    let contigousColor = "";

    rubickFacesFlattenSortByXAndY.forEach(({color}) => {
        const caracterColor = fromHexToCaracterColor(color);

        if(caracterColor === contigousColor) {
            nbOccurenceContigous += 1;
        } else {
            if(nbOccurenceContigous !== 0) {
                compressRubickFaces += `${contigousColor}${nbOccurenceContigous}`;
            }

            nbOccurenceContigous = 1;
            contigousColor = caracterColor
        }
    });

    if(nbOccurenceContigous !== 0) {
        compressRubickFaces += `${contigousColor}${nbOccurenceContigous}`;
    }

    return compressRubickFaces;
}

export function createRubickFacesFromCompressData(compressData: string) : RubickFace[] {

}
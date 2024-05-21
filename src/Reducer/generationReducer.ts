import { createContext, useContext, useReducer, ReactElement, Dispatch } from 'react';

type ActionName = 'add' | 'update' | 'delete' | 'clear-cache' | 'force-update' | 'own-settings' ;

type Action =
  { type: 'update' } |
  { type: 'start' } |
  { type: 'finish' } |
;

interface GenerationData {
    duration: number;

}

function generationReducer(generationData: GenerationData, action: Action) : GenerationData {
    switch(action.type) {
        case "update" {
            return generationData;
        }
        case "update" {
            return generationData;
        }
        case "update" {
            return generationData;
        }
    }
    return generationData;
}
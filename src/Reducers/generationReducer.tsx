import { createContext, useContext, useReducer, ReactElement, Dispatch } from 'react';

type Action =
  { type: 'start' } |
  { type: 'finish' }
;

interface GenerationData {
    duration: number;
    started: boolean;

}

function generationReducer(generationData: GenerationData, action: Action) : GenerationData {
    switch(action.type) {
        case "start": {
            console.log("start frefo");
            return {...generationData, started: true };
        }
        case "finish": {
            return {...generationData, started: false };
        }
    }
    return generationData;
}

const GenerationReducerContext = createContext<GenerationData>({duration: 10000, started: false});
const GenerationDispatchContext = createContext<Dispatch<Action>>(()=> null);

export function useGeneration() {
  return useContext(GenerationReducerContext);
}

export function useGenerationDispatch() {
  return useContext(GenerationDispatchContext);
}

interface GenerationProviderProps {
    children: ReactElement;
}

export function GenerationProvider({ children } : GenerationProviderProps ) {
    const [generation, dispatch] = useReducer(generationReducer,{duration: 10000, started: false});

    return (
        <GenerationReducerContext.Provider value={generation}>
          <GenerationDispatchContext.Provider value={dispatch}>
            {children}
          </GenerationDispatchContext.Provider>
        </GenerationReducerContext.Provider>
   );
}

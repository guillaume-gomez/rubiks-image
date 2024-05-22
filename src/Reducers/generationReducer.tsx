import { createContext, useContext, useReducer, ReactElement, Dispatch } from 'react';

type Action =
  { type: 'update' } |
  { type: 'start' } |
  { type: 'finish' }
;

interface GenerationData {
    duration: number;

}

function generationReducer(generationData: GenerationData, action: Action) : GenerationData {
    switch(action.type) {
        case "update": {
            return generationData;
        }
        case "start": {
            return generationData;
        }
        case "finish": {
            return generationData;
        }
    }
    return generationData;
}

const GenerationReducerContext = createContext<GenerationData>({duration: 10000});
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
    const [generation, dispatch] = useReducer(generationReducer,{duration: 10000});

    return (
        <GenerationReducerContext.Provider value={generation}>
          <GenerationDispatchContext.Provider value={dispatch}>
            {children}
          </GenerationDispatchContext.Provider>
        </GenerationReducerContext.Provider>
   );
}

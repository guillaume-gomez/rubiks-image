import { createContext, useContext, useReducer, ReactElement, Dispatch } from 'react';

type Action =
  { type: 'start' } |
  { type: 'finish' }
;

interface animationData {
    duration: number;
    started: boolean;

}

function animationReducer(animationData: animationData, action: Action) : animationData {
    switch(action.type) {
        case "start": {
            return {...animationData, started: true };
        }
        case "finish": {
            return {...animationData, started: false };
        }
    }
    return animationData;
}

const AnimationReducerContext = createContext<animationData>({duration: 10000, started: false});
const GenerationDispatchContext = createContext<Dispatch<Action>>(()=> null);

export function useAnimation() {
  return useContext(AnimationReducerContext);
}

export function useAnimationDispatch() {
  return useContext(GenerationDispatchContext);
}

interface AnimationProviderProps {
    children: ReactElement;
}

export function AnimationProvider({ children } : AnimationProviderProps ) {
    const [generation, dispatch] = useReducer(animationReducer,{duration: 10000, started: false});

    return (
        <AnimationReducerContext.Provider value={generation}>
          <GenerationDispatchContext.Provider value={dispatch}>
            {children}
          </GenerationDispatchContext.Provider>
        </AnimationReducerContext.Provider>
   );
}

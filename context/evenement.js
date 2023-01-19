import { createContext, useContext, useReducer, useMemo  } from "react";

const Context = createContext();

export const initialState = {
  evenement: undefined,
  listeInventaire: [],
};

export const AppReducer = (state, action) => {
   switch (action.type){
      case "evenement_choix": {
         return {
            ...state,
            evenement: action.payload,
         };
      }
      break
      case "evenement_reset": {
         return {
            ...state,
            evenement: undefined,
         };
      }
      break

      case "inventaire_ajout": {

         // un nouvel objet ?
         var newListeInventaire = [...state.listeInventaire]
         if ( !newListeInventaire.includes(action.payload) ) {
           newListeInventaire.push(action.payload)
         }
         return {
            ...state,
            listeInventaire: newListeInventaire
         };
      }
      break

      case "inventaire_retire": {

         // un nouvel objet ?
         var newListeInventaire = [...state.listeInventaire]

         newListeInventaire = newListeInventaire.filter(
           function (unInventaireDansListe) {
             if (!(unInventaireDansListe.id == action.payload.id)) {
               return unInventaireDansListe
             }
         })
         return {
            ...state,
            listeInventaire: newListeInventaire
         };
      }
      break

      case "inventaire_reset": {

         // un nouvel objet ?
         var newListeInventaire = []
         return {
            ...state,
            listeInventaire: newListeInventaire
         };
      }
      break

      default:
            throw new Error(`Action du reducer inconnue : ${action.type}`);
   }
};


export function EvenementProvider({ children }) {
  const [ state, dispatch ] = useReducer(AppReducer, initialState);

  // tout ce qu'on expose
  const contextValue = useMemo(() => {
        return { state, dispatch };
     }, [state, dispatch]);

  return (
    <Context.Provider value={contextValue}>{children}</Context.Provider>
  );
}

export function useEvenementContext() {
  return useContext(Context);
}
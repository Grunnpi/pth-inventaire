import { createContext, useContext, useState } from "react";

const Context = createContext();

export function EvenementProvider({ children }) {
  const [evenement, setEvenement] = useState(null);
  const [listeInventaire, setListeInventaire] = useState(null);
  return (
    <Context.Provider value={[evenement, setEvenement, listeInventaire, setListeInventaire]}>{children}</Context.Provider>
  );
}

export function useEvenementContext() {
  return useContext(Context);
}
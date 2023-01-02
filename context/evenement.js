import { createContext, useContext, useState } from "react";

const Context = createContext();

export function EvenementProvider({ children }) {
  const [evenement, setEvenement] = useState(null);
  return (
    <Context.Provider value={[evenement, setEvenement]}>{children}</Context.Provider>
  );
}

export function useEvenementContext() {
  return useContext(Context);
}
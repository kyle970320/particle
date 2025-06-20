import { createContext, useState } from "react";

export const ClickPosContext = createContext({
  lastPos: { x: 0, y: 0 },
  setLastPos: () => null,
});

const ClickPosProvider = ({ children }) => {
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  return (
    <ClickPosContext.Provider value={{ lastPos, setLastPos }}>
      {children}
    </ClickPosContext.Provider>
  );
};

export default ClickPosProvider;

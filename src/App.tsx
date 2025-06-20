import { useContext, useEffect, useState } from "react";
import "./App.css";
import RotatingSphereBasic from "./Canv";
import WebGLTextParticle from "./CanText";
import SphereParticleCanvas from "./CanCube";
import ClickPosProvider, { ClickPosContext } from "./ClickPos";
import { AppProvider } from "./AppProvider";
import CircleScreen from "./CircleToScreen";

function App() {
  const [count, setCount] = useState(-2);
  const [color, setColor] = useState("black");
  const [bg, setBg] = useState("white");
  const [isBlockClick, setIsBlockClick] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const context = useContext(ClickPosContext);
  useEffect(() => {
    if (count === -2) {
      setColor("white");
    }
    if (count === 2) {
      setColor("black");
    }
  }, [count]);
  console.log(count < 0 ? "black" : "white");
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "absolute",
        top: 0,
      }}
    >
      <ClickPosProvider>
        <AppProvider>
          <div
            style={{
              position: "absolute",
              top: "100px",
              left: "100px",
              zIndex: 100,
              color: "white",
              mixBlendMode: "difference",
            }}
          >
            <p
              onClick={(e) => {
                const { pageX: x, pageY: y } = e.nativeEvent;
                console.log(x, y);
                setLastPos({ x, y: y - (window.scrollY || 0) });
                if (count !== -2 && !isBlockClick) {
                  setBg("black");
                  setCount(-1);
                  setIsBlockClick(true);
                }
              }}
            >
              1
            </p>
            <p
              onClick={(e) => {
                const { pageX: x, pageY: y } = e.nativeEvent;
                const currnetY = y - (window.scrollY || 0);
                console.log(x, y);
                setLastPos({ x, y: currnetY });
                if (count !== 2 && !isBlockClick) {
                  setBg("black");
                  setCount(1);
                  setIsBlockClick(true);
                }
              }}
            >
              2
            </p>
          </div>

          <CircleScreen
            mode={count}
            lastPos={lastPos}
            setMode={setCount}
            bg={bg}
            setBg={setBg}
            setIsBlockClick={setIsBlockClick}
          />
          <RotatingSphereBasic mode={count} />
        </AppProvider>
      </ClickPosProvider>
    </div>
  );
}

export default App;

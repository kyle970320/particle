import { useCallback, useContext, useMemo, useRef, useState } from "react";
import styles from "./app.module.css";
import AppContext from "./AppProvider";
import { ClickPosContext } from "./ClickPos";

const CircleScreen = ({
  setMode,
  mode,
  lastPos,
  bg,
  setBg,
  setIsBlockClick,
}) => {
  const appContext = useContext(AppContext);

  const subContainer = useRef();

  const circleSize = useMemo(() => {
    const max = Math.max(appContext.size.w, appContext.size.h);
    return Math.floor(max * 2);
  }, [appContext.size]);

  //   console.log(mode, bg);
  const handleAnimationEnd = (e) => {
    if (e.target === subContainer.current) {
      if (mode === -1) {
        setBg("");
      }
      setMode(mode * 2);
      setIsBlockClick(false);
    }
  };
  return (
    <>
      {Math.abs(mode) === 1 && (
        <style>
          {`
          .focus-box {
            will-change: clip-path, webkit-clip-path, opacity;
            ${
              mode < 0
                ? `
            clip-path: ellipse(${circleSize}px ${circleSize}px at ${lastPos.x}px ${lastPos.y}px); 
            -webkit-clip-path: ellipse(${circleSize}px ${circleSize}px at ${lastPos.x}px ${lastPos.y}px); 
            animation-direction: reverse;
            `
                : `
            clip-path: ellipse(0px 0px at ${lastPos.x}px ${lastPos.y}px);
            -webkit-clip-path: ellipse(0px 0px at ${lastPos.x}px ${lastPos.y}px);
            `
            }
            animation-name: focus-show;
            animation-duration: 0.6s;
            animation-timing-function: linear;
            animation-fill-mode: forwards;
          }
          @keyframes focus-show {
            0% { 
              clip-path: ellipse(0px 0px at ${lastPos.x}px ${lastPos.y}px); 
              -webkit-clip-path: ellipse(0px 0px at ${lastPos.x}px ${lastPos.y}px); 
              opacity: 0;
            }
            50% { opacity: 1; }
            100% { 
              clip-path: ellipse(${circleSize}px ${circleSize}px at ${lastPos.x}px ${lastPos.y}px); 
              -webkit-clip-path: ellipse(${circleSize}px ${circleSize}px at ${lastPos.x}px ${lastPos.y}px); 
              opacity: 1; 
            }
          }
          `}
        </style>
      )}
      <div
        ref={subContainer}
        style={{
          backgroundColor: bg,
        }}
        className={`${styles.sub_container} ${Math.abs(mode) === 1 ? "focus-box" : ""}`}
        onAnimationEnd={handleAnimationEnd}
      ></div>
    </>
  );
};

export default CircleScreen;

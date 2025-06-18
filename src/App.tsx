import { useState } from "react";
import "./App.css";
import RotatingSphereBasic from "./Canv";
import WebGLTextParticle from "./CanText";
import SphereParticleCanvas from "./CanCube";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      {/* <RotatingSphereBasic /> */}
      {/* <WebGLTextParticle /> */}
      <SphereParticleCanvas />
      <div
        style={{
          width: "100%",
          height: "100vh",
          backgroundColor: "rgba(0,0,0,1)",
        }}
      />
      <div
        style={{
          width: "100%",
          height: "100vh",
          backgroundColor: "rgba(0,0,0,1)",
        }}
      />
      <div
        style={{
          width: "100%",
          height: "100vh",
          backgroundColor: "rgba(0,0,0,1)",
        }}
      />
      <div
        style={{
          width: "100%",
          height: "100vh",
          backgroundColor: "rgba(0,0,0,1)",
        }}
      />
      <div
        style={{
          width: "100%",
          height: "100vh",
          backgroundColor: "rgba(0,0,0,1)",
        }}
      />
      <div
        style={{
          width: "100%",
          height: "100vh",
          backgroundColor: "rgba(0,0,0,1)",
        }}
      />
      <div
        style={{
          width: "100%",
          height: "100vh",
          backgroundColor: "rgba(0,0,0,1)",
        }}
      />
      <div
        style={{
          width: "100%",
          height: "100vh",
          backgroundColor: "rgba(0,0,0,1)",
        }}
      />
      <div
        style={{
          width: "100%",
          height: "100vh",
          backgroundColor: "rgba(0,0,0,1)",
        }}
      />
      <div
        style={{
          width: "100%",
          height: "100vh",
          backgroundColor: "rgba(0,0,0,1)",
        }}
      />
    </>
  );
}

export default App;

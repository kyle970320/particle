import React, { useEffect, useRef, useState } from "react";
import { createNoise3D } from "simplex-noise";

export default function SphereParticleCanvas() {
  const randomRGB = { r: Math.random(), g: Math.random(), b: Math.random() };
  const vertexShaderSource = `
attribute vec3 a_position;
uniform mat4 u_matrix;
void main() {
    gl_Position = u_matrix * vec4(a_position * 1.0, 1.0);
    gl_PointSize = 3.2;
    }
    `;

  const fragmentShaderSource = `
    precision mediump float;
    void main() {
        vec2 c = gl_PointCoord - vec2(0.5);  // 중심에서 거리 계산
        if (length(c) > 0.5) discard;        // 반지름 0.5 초과면 버림
        gl_FragColor = vec4(1.0,1.0,1.0, 1.0); // 흰색 원
        }
        `;
  const positionRef = useRef({
    perX: 0,
    perZ: 0,
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
  });
  const onScroll = () => {
    const totalScroll = document.body.scrollHeight;
    console.log(totalScroll);
    const getRatio = (ratio: number) => {
      const maxTotal = Math.min(totalScroll, 1200);
      const maxValue = Math.min((window.scrollY / maxTotal) * ratio, ratio);
      return maxValue;
    };
    positionRef.current = {
      perX: getRatio(3),
      perZ: getRatio(4),
      rotateX: getRatio(0.8),
      rotateY: getRatio(1),
      rotateZ: getRatio(1.2),
    };
  };
  useEffect(() => {
    window.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext("webgl");
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    // 셰이더 컴파일 함수
    const compileShader = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        return null;
      }
      return shader;
    };

    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = compileShader(
      gl.FRAGMENT_SHADER,
      fragmentShaderSource,
    );

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Link error:", gl.getProgramInfoLog(program));
      return;
    }

    const aPosition = gl.getAttribLocation(program, "a_position");
    const uMatrix = gl.getUniformLocation(program, "u_matrix");

    const count = 16 * 16 * 5 + 72;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    // 초기 버퍼
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const positions = new Float32Array(count * 3);

    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);

    const noise3D = createNoise3D();
    let time = 0;

    const getRotationMatrix = (angleX, angleY, angleZ) => {
      const cx = Math.cos(angleX),
        sx = Math.sin(angleX);
      const cy = Math.cos(angleY),
        sy = Math.sin(angleY);
      const cz = Math.cos(angleZ),
        sz = Math.sin(angleZ);
      return new Float32Array([
        cy * cz,
        cz * sx * sy - cx * sz,
        cx * cz * sy + sx * sz,
        0,
        cy * sz,
        cx * cz + sx * sy * sz,
        -cz * sx + cx * sy * sz,
        0,
        -sy,
        cy * sx,
        cx * cy,
        0,
        0,
        0,
        0,
        1,
      ]);
    };

    const getProjectionMatrix = (fov, aspect, near, far) => {
      const f = 1.0 / Math.tan(fov / 2);

      return new Float32Array([
        f / aspect,
        0,
        0,
        0,
        0,
        f,
        0,
        0,
        0,
        0,
        (far + near) / (near - far),
        -1,
        0,
        0,
        (2 * far * near) / (near - far) + (3 - positionRef.current.perX),
        5.5 - positionRef.current.perZ,
      ]);
    };

    const multiplyMatrices = (a, b) => {
      const out = new Float32Array(16);
      for (let row = 0; row < 4; ++row) {
        for (let col = 0; col < 4; ++col) {
          out[col * 4 + row] =
            a[0 * 4 + row] * b[col * 4 + 0] +
            a[1 * 4 + row] * b[col * 4 + 1] +
            a[2 * 4 + row] * b[col * 4 + 2] +
            a[3 * 4 + row] * b[col * 4 + 3];
        }
      }
      return out;
    };

    const render = () => {
      time += 0.01;
      let offset = 0;

      const resolution = 16; // 각 축당 점 개수 (16×16×16 = 4096점)
      const spacing = 2 / resolution;
      const start = -1 + spacing / 2;
      for (let z = 0; z < resolution; z++) {
        for (let y = 0; y < resolution; y++) {
          for (let x = 0; x < resolution; x++) {
            if (
              z === 0 ||
              y === 0 ||
              x === 0 ||
              z === resolution - 1 ||
              y === resolution - 1 ||
              x === resolution - 1
            ) {
              const nx = start + x * spacing;
              const ny = start + y * spacing;
              const nz = start + z * spacing;

              // const deform = 1 + strength * noise3D(nx * 1, ny * 1, time * 2);
              positions[offset++] = nx;
              positions[offset++] = ny;
              positions[offset++] = nz;
            }
          }
        }
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.enable(gl.DEPTH_TEST);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      const angleX = time * (0.8 - positionRef.current.rotateX);
      const angleY = time * (1.0 - positionRef.current.rotateY);
      const angleZ = time * (1.2 - positionRef.current.rotateZ);
      const rotation = getRotationMatrix(angleX, angleY, angleZ);
      const aspect = canvas.width / canvas.height;
      const projection = getProjectionMatrix(Math.PI / 4, aspect, 0.5, 1);
      const matrix = multiplyMatrices(projection, rotation);

      gl.uniformMatrix4fv(uMatrix, false, matrix);
      gl.drawArrays(gl.POINTS, 0, positions.length / 3);

      animationRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth}
      height={window.innerHeight}
      style={{
        height: "100vh",
        position: "fixed",
        top: "0",
        left: "0",
        display: "block",
        mixBlendMode: "difference",
      }}
    />
  );
}

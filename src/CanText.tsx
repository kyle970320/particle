import React, { useEffect, useRef } from "react";
import { createNoise3D } from "simplex-noise";

export default function WebGLTextParticle() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext("webgl");
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    // 텍스트 추출용 캔버스
    const textCanvas = document.createElement("canvas");
    const ctx = textCanvas.getContext("2d");
    textCanvas.width = 300;
    textCanvas.height = 150;

    ctx.fillStyle = "white";
    ctx.font = "100px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("ㅎㅇ", textCanvas.width / 2, textCanvas.height / 2);

    const imageData = ctx.getImageData(
      0,
      0,
      textCanvas.width,
      textCanvas.height,
    );
    const positions = [];
    const layers = 4; // 글자 두께를 위한 z 슬라이스 개수
    const depth = 0.1; // 전체 깊이 범위
    for (let z = 0; z < layers; z++) {
      const zOffset = (z / (layers - 1) - 0.5) * depth; // -depth/2 ~ +depth/2

      for (let y = 0; y < imageData.height; y += 2) {
        for (let x = 0; x < imageData.width; x += 2) {
          const i = (y * imageData.width + x) * 4;
          const alpha = imageData.data[i + 3];
          if (alpha > 128) {
            const nx = ((x + 0.5) / imageData.width) * 2 - 1;
            const ny = -(((y + 0.5) / imageData.height) * 2 - 1);
            const nz = zOffset;
            positions.push(nx, ny, nz);
          }
        }
      }
    }

    const vertexShaderSource = `
    attribute vec3 a_position;
    uniform mat4 u_matrix;
    void main() {
      gl_Position = u_matrix * vec4(a_position, 1.0);
      gl_PointSize = 3.0;
    }
    `;

    const fragmentShaderSource = `
    precision mediump float;
    void main() {
      vec2 c = gl_PointCoord - vec2(0.5);
      if (length(c) > 0.5) discard;
      float depth = gl_FragCoord.z;
      gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0 - depth * 0.5);
    }
    `;

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
    const ratio = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * ratio;
    canvas.height = canvas.clientHeight * ratio;
    gl.viewport(0, 0, canvas.width, canvas.height);
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const aPosition = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);

    const uMatrix = gl.getUniformLocation(program, "u_matrix");

    const degToRad = (d) => (d * Math.PI) / 180;
    const angleX = degToRad(-50); // 15도 회전
    const angleY = degToRad(-50); // 15도 회전
    const angleZ = degToRad(0); // 15도 회전

    const cx = Math.cos(angleX),
      sx = Math.sin(angleX);
    const cy = Math.cos(angleY),
      sy = Math.sin(angleY);
    const cz = Math.cos(angleZ),
      sz = Math.sin(angleZ);

    const rotationMatrix = new Float32Array([
      cy * cz,
      -cy * sz,
      sy,
      0,
      sx * sy * cz + cx * sz,
      -sx * sy * sz + cx * cz,
      -sx * cy,
      0,
      -cx * sy * cz + sx * sz,
      cx * sy * sz + sx * cz,
      cx * cy,
      0,
      0,
      0,
      -2.5,
      1,
    ]);

    const aspect = canvas.width / canvas.height;
    const fov = Math.PI / 4;
    const near = 0.1;
    const far = 100;
    const f = 1.0 / Math.tan(fov / 2);

    const projectionMatrix = new Float32Array([
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
      (2 * far * near) / (near - far),
      0,
    ]);

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

    const finalMatrix = multiplyMatrices(projectionMatrix, rotationMatrix);

    gl.uniformMatrix4fv(uMatrix, false, finalMatrix);

    let time = 0;
    const noise3D = createNoise3D();
    const render = () => {
      time += 0.01;
      const animatedPositions = new Float32Array(positions.length);
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        const z = positions[i + 2];
        const strength = Math.sin(time * 1.5) * 0.2;
        const deform = 1 + strength * noise3D(x * 1, y * 1, time * 2);

        animatedPositions[i] = x * deform;
        animatedPositions[i + 1] = y * deform;
        animatedPositions[i + 2] = z * deform;
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, animatedPositions, gl.DYNAMIC_DRAW);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      gl.drawArrays(gl.POINTS, 0, positions.length / 3);

      animationRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={300}
      style={{
        height: "100vh",
        position: "fixed",
        display: "block",
        background: "black",
        width: "100%",
      }}
    />
  );
}

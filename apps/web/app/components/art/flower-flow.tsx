import { useEffect, useRef } from "react";

import {
  add,
  bindProgram,
  createProgram,
  cross,
  loadTexture,
  lookAt,
  multiply,
  normalize,
  perspective,
  runLoop,
  scale,
  sub,
  type Vec3,
} from "./gl";

// Curtis plates flowing along the petal outlines of an invisible 3D flower. The flower itself is
// never drawn: its shape appears from the tiles riding over it. Every plate comes from one
// texture atlas (public/flowers/atlas.webp, built by `pnpm flowers:thumbs`), so the whole scene
// is a single draw call of ~250 small quads.

const ATLAS = { src: "/flowers/atlas.webp", cols: 8, rows: 8, plates: 61 };
const TILE_ASPECT = 160 / 256; // width / height of one atlas cell

type Layer = {
  radius: number; // petal length
  petals: number;
  turn: number; // rotation of the layer (radians)
  lift: number; // height of the layer's centre
  cup: number; // how much the petals curve upwards
  tiles: number;
  size: number; // tile height
  speed: number; // loops per second along the outline (sign = direction)
};

const LAYERS: Layer[] = [
  { radius: 1.0, petals: 5, turn: 0, lift: 0, cup: 0.38, tiles: 130, size: 0.12, speed: 0.004 },
  {
    radius: 0.66,
    petals: 5,
    turn: Math.PI / 5,
    lift: 0.1,
    cup: 0.46,
    tiles: 84,
    size: 0.1,
    speed: -0.006,
  },
  { radius: 0.34, petals: 5, turn: 0, lift: 0.2, cup: 0.52, tiles: 40, size: 0.075, speed: 0.008 },
];

/** A point on the closed outline that runs along every petal of a layer, s in [0, 1). */
function outline(layer: Layer, s: number, spin: number): Vec3 {
  const t = (((s % 1) + 1) % 1) * layer.petals;
  const petal = Math.floor(t);
  const a = (t - petal) * Math.PI * 2;
  const r = (layer.radius * (1 - Math.cos(a))) / 2; // out from the centre and back
  const theta =
    spin +
    layer.turn +
    (petal * Math.PI * 2) / layer.petals +
    (Math.PI / layer.petals) * 0.85 * Math.sin(a);
  const k = r / layer.radius;
  return [r * Math.cos(theta), r * Math.sin(theta), layer.lift + layer.cup * k * k * layer.radius];
}

const VERTEX = `#version 300 es
in vec3 aPosition;
in vec2 aUv;
uniform mat4 uMvp;
out vec2 vUv;
out float vDepth;
void main() {
  gl_Position = uMvp * vec4(aPosition, 1.0);
  vUv = aUv;
  vDepth = gl_Position.w;
}`;

const FRAGMENT = `#version 300 es
precision highp float;
in vec2 vUv;
in float vDepth;
uniform sampler2D uAtlas;
uniform vec3 uFog;
out vec4 outColor;
void main() {
  vec3 color = texture(uAtlas, vUv).rgb;
  float fog = smoothstep(2.2, 3.4, vDepth);
  outColor = vec4(mix(color, uFog, fog * 0.45), 1.0);
}`;

export function FlowerFlow({ light, still = false }: { light: boolean; still?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext("webgl2", { antialias: true, alpha: true });
    if (!canvas || !gl) return;

    const program = createProgram(gl, VERTEX, FRAGMENT);
    const tileCount = LAYERS.reduce((sum, layer) => sum + layer.tiles, 0);
    const data = new Float32Array(tileCount * 6 * 5);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data.byteLength, gl.DYNAMIC_DRAW);
    const aPosition = gl.getAttribLocation(program, "aPosition");
    const aUv = gl.getAttribLocation(program, "aUv");
    const uMvp = gl.getUniformLocation(program, "uMvp");
    const uAtlas = gl.getUniformLocation(program, "uAtlas");
    const uFog = gl.getUniformLocation(program, "uFog");
    const fog = light ? [0.98, 0.953, 0.89] : [0.125, 0.098, 0.078];
    let ready = false;

    const writeTiles = (time: number) => {
      let o = 0;
      let index = 0;
      const spin = time * 0.04;
      for (const layer of LAYERS) {
        for (let i = 0; i < layer.tiles; i++, index++) {
          const s = i / layer.tiles + time * layer.speed;
          const p = outline(layer, s, spin);
          const tangent = normalize(
            sub(outline(layer, s + 0.002, spin), outline(layer, s - 0.002, spin)),
          );
          // Normal of the cup surface z = cup * r² / R at p.
          const g = (2 * layer.cup) / layer.radius;
          const normal = normalize([-g * p[0], -g * p[1], 1]);
          const across = normalize(cross(normal, tangent));
          const h = layer.size / 2;
          const w = (layer.size * TILE_ASPECT) / 2;
          const plate = index % ATLAS.plates;
          const col = plate % ATLAS.cols;
          const row = Math.floor(plate / ATLAS.cols);
          const u0 = col / ATLAS.cols;
          const u1 = (col + 1) / ATLAS.cols;
          const vTop = 1 - row / ATLAS.rows;
          const vBottom = 1 - (row + 1) / ATLAS.rows;
          // The plate stands across the outline: its width runs along the flow.
          const corner = (a: number, b: number): Vec3 =>
            add(add(p, scale(tangent, a * w)), scale(across, b * h));
          const quad: [Vec3, number, number][] = [
            [corner(-1, -1), u0, vBottom],
            [corner(1, -1), u1, vBottom],
            [corner(1, 1), u1, vTop],
            [corner(-1, -1), u0, vBottom],
            [corner(1, 1), u1, vTop],
            [corner(-1, 1), u0, vTop],
          ];
          for (const [v, uu, vv] of quad) {
            data[o++] = v[0];
            data[o++] = v[1];
            data[o++] = v[2];
            data[o++] = uu;
            data[o++] = vv;
          }
        }
      }
    };

    const loop = runLoop(
      canvas,
      ({ time, width, height }) => {
        gl.viewport(0, 0, width, height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        if (!ready) return;
        writeTiles(time);
        const aspect = width / height;
        // Keep the whole flower in view on tall phone screens too.
        const fov = aspect >= 1 ? 0.75 : 2 * Math.atan(Math.tan(0.375) / aspect);
        const mvp = multiply(
          perspective(fov, aspect, 0.1, 10),
          lookAt([0, -1.45, 2.05], [0, 0.05, 0.2], [0, 0, 1]),
        );
        gl.enable(gl.DEPTH_TEST);
        bindProgram(gl, program);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, data);
        gl.enableVertexAttribArray(aPosition);
        gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 20, 0);
        gl.enableVertexAttribArray(aUv);
        gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 20, 12);
        gl.uniformMatrix4fv(uMvp, false, mvp);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(uAtlas, 0);
        gl.uniform3fv(uFog, fog);
        gl.drawArrays(gl.TRIANGLES, 0, tileCount * 6);
      },
      { still },
    );

    const texture = loadTexture(gl, ATLAS.src, () => {
      ready = true;
      loop.requestFrame();
    });

    return () => {
      loop.stop();
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, [light, still]);

  return <canvas ref={canvasRef} className="block h-full w-full" />;
}

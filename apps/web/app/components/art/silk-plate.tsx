import { useEffect, useRef } from "react";

import { bindProgram, createProgram, loadTexture, runLoop } from "./gl";

// Curtis flowers, cut out of their paper, printed on slowly rippling silk and covering the screen.
// The fold pattern and lighting follow React Bits' Silk; the folds also bend the print and the
// sheen passes over it. Where the image is transparent, the silk itself shows: that is why the
// flowers are cut out (`pnpm flowers:cutout`, `pnpm flowers:bouquet`) instead of printed on their
// yellow plate paper. One full-screen triangle, one texture.

const VERTEX = `#version 300 es
in vec2 aPosition;
void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }`;

const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 uView;
uniform float uTime;
uniform sampler2D uImage;
uniform float uImageAspect;
uniform float uReady;
uniform vec3 uSilk;
uniform float uLight;
uniform float uContain;
out vec4 outColor;

float silk(vec2 p) {
  vec2 tex = p;
  tex.y += 0.03 * sin(8.0 * tex.x - uTime);
  return 0.6 + 0.4 * sin(5.0 * (tex.x + tex.y + cos(3.0 * tex.x + 5.0 * tex.y) + 0.02 * uTime));
}

// Screen UV to image UV. "Cover" fills the screen and crops the image; "contain" fits the whole
// image on screen with silk around it, which is what a single flower needs so its head is not cut
// off. The "inside" output is 0 outside the image, where only silk is drawn.
const float MARGIN = 0.86; // how much of the screen a contained flower may take

vec2 imageUv(vec2 uv, out float inside) {
  float va = uView.x / uView.y;
  float ia = uImageAspect;
  vec2 c = uv - 0.5;
  if (uContain > 0.5) {
    if (va > ia) { c.x *= va / ia; } else { c.y *= ia / va; }
    c /= MARGIN;
  } else {
    if (va > ia) { c.y *= ia / va; } else { c.x *= va / ia; }
  }
  vec2 r = c + 0.5;
  inside = (r.x > 0.0 && r.x < 1.0 && r.y > 0.0 && r.y < 1.0) ? 1.0 : 0.0;
  return r;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uView;
  vec2 p = vec2(uv.x * uView.x / uView.y, uv.y) * 1.1;
  float h = silk(p);
  float e = 0.002;
  float gx = (silk(p + vec2(e, 0.0)) - h) / e;
  float gy = (silk(p + vec2(0.0, e)) - h) / e;
  vec3 normal = normalize(vec3(-gx * 0.05, -gy * 0.05, 1.0));

  vec3 toLight = normalize(vec3(-0.55, 0.7, 0.85));
  float relief = 1.0 + (dot(normal, toLight) - toLight.z) * 1.1;
  float n01 = clamp((h - 0.2) / 0.8, 0.0, 1.0);
  float fold = smoothstep(0.28, 0.9, h);
  vec3 halfway = normalize(toLight + vec3(0.0, 0.0, 1.0));
  float gloss = pow(max(dot(normal, halfway), 0.0), 48.0) * smoothstep(0.25, 0.85, n01);

  vec3 cloth = mix(uSilk * 0.58, uSilk * 1.12, fold) * mix(1.0, relief, 0.85);

  // The print rides the folds: sample the image slightly displaced along the fold's slope.
  float inside;
  vec2 iuv = imageUv(uv + normal.xy * 0.022, inside);
  vec4 sampled = texture(uImage, clamp(iuv, 0.0, 1.0));
  vec3 printed = sampled.rgb * mix(0.66, 1.1, fold) * mix(1.0, relief, 0.85) * mix(0.55, 1.0, uLight);

  // Transparent parts of the image are bare silk, so the cloth keeps its own depth between the
  // flowers. The cut-outs have a feathered edge, and a straight mix would leave a pale halo
  // around every flower, so the edge is tightened here.
  float ink = smoothstep(0.2, 0.7, sampled.a) * inside;
  vec3 color = mix(cloth, printed, uReady * ink * 0.97);
  color += vec3(1.0) * (gloss * 0.34 + pow(n01, 5.0) * 0.07) * mix(0.45, 1.0, uLight);
  outColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}`;

export function SilkPlate({
  src,
  light,
  fit = "cover",
  still = false,
}: {
  src: string;
  light: boolean;
  /** "contain" shows the whole image with silk around it; "cover" fills the screen. */
  fit?: "cover" | "contain";
  still?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext("webgl2", { antialias: false, alpha: false });
    if (!canvas || !gl) return;

    const program = createProgram(gl, VERTEX, FRAGMENT);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "aPosition");
    const u = (name: string) => gl.getUniformLocation(program, name);
    const uniforms = {
      view: u("uView"),
      time: u("uTime"),
      image: u("uImage"),
      aspect: u("uImageAspect"),
      ready: u("uReady"),
      silk: u("uSilk"),
      light: u("uLight"),
      contain: u("uContain"),
    };

    let aspect = 1;
    let ready = 0;
    const silkColor = light ? [0.93, 0.83, 0.67] : [0.29, 0.24, 0.18];

    const loop = runLoop(
      canvas,
      ({ time, width, height }) => {
        gl.viewport(0, 0, width, height);
        bindProgram(gl, program);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(uniforms.image, 0);
        gl.uniform2f(uniforms.view, width, height);
        gl.uniform1f(uniforms.time, time * 0.6);
        gl.uniform1f(uniforms.aspect, aspect);
        gl.uniform1f(uniforms.ready, ready);
        gl.uniform3fv(uniforms.silk, silkColor);
        gl.uniform1f(uniforms.light, light ? 1 : 0);
        gl.uniform1f(uniforms.contain, fit === "contain" ? 1 : 0);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      },
      { still },
    );

    const texture = loadTexture(gl, src, ([w, h]) => {
      aspect = w / h;
      ready = 1;
      loop.requestFrame();
    });

    return () => {
      loop.stop();
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, [src, light, fit, still]);

  return <canvas ref={canvasRef} className="block h-full w-full" />;
}

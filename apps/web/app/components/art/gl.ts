// Small WebGL2 helpers for the hand-written art background (silk-plate).
// No library: these scenes are tiny, and a raw context keeps the bundle small.

export function createProgram(gl: WebGL2RenderingContext, vertex: string, fragment: string) {
  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) throw new Error("Could not create shader");
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(`Shader compile failed: ${log ?? ""}`);
    }
    return shader;
  };
  const vs = compile(gl.VERTEX_SHADER, vertex);
  const fs = compile(gl.FRAGMENT_SHADER, fragment);
  const program = gl.createProgram();
  if (!program) throw new Error("Could not create program");
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`Program link failed: ${gl.getProgramInfoLog(program) ?? ""}`);
  }
  return program;
}

export function loadTexture(
  gl: WebGL2RenderingContext,
  src: string,
  onLoad: (size: [number, number]) => void,
) {
  const texture = gl.createTexture();
  const image = new Image();
  image.decoding = "async";
  image.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    onLoad([image.naturalWidth, image.naturalHeight]);
  };
  image.src = src;
  return texture;
}

export type FrameInfo = { time: number; width: number; height: number };

/**
 * Runs `draw` on every animation frame while the canvas is on screen and the tab is visible.
 * With `still` (or the user's "reduce motion" setting) it draws a single frame per resize and
 * stops. Pixel ratio is capped (1 on phones, 1.5 elsewhere) to save battery. Returns a cleanup
 * function; call `requestFrame` after async work (a texture arriving) to redraw.
 */
export function runLoop(
  canvas: HTMLCanvasElement,
  draw: (frame: FrameInfo) => void,
  options: { still: boolean },
) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const still = options.still || reduce;
  const maxRatio = window.matchMedia("(max-width: 767px)").matches ? 1 : 1.5;
  let raf = 0;
  let visible = true;
  let time = 0;
  let last = 0;

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, maxRatio);
    const width = Math.max(1, Math.round(canvas.clientWidth * ratio));
    const height = Math.max(1, Math.round(canvas.clientHeight * ratio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
  };

  const frame = (now: number) => {
    raf = 0;
    if (!visible || document.hidden) return;
    const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
    last = now;
    if (!still) time += dt;
    resize();
    draw({ time, width: canvas.width, height: canvas.height });
    if (!still) raf = requestAnimationFrame(frame);
  };

  const requestFrame = () => {
    if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);
  };

  const onVisibility = () => {
    last = 0;
    requestFrame();
  };
  const sizeObserver = new ResizeObserver(() => requestFrame());
  sizeObserver.observe(canvas);
  const viewObserver = new IntersectionObserver((entries) => {
    visible = entries.some((entry) => entry.isIntersecting);
    last = 0;
    requestFrame();
  });
  viewObserver.observe(canvas);
  document.addEventListener("visibilitychange", onVisibility);
  requestFrame();

  return {
    requestFrame,
    stop: () => {
      cancelAnimationFrame(raf);
      sizeObserver.disconnect();
      viewObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    },
  };
}

/** Activates a program. (A plain function so lint does not mistake `gl.useProgram` for a hook.) */
export function bindProgram(gl: WebGL2RenderingContext, program: WebGLProgram) {
  // biome-ignore lint/correctness/useHookAtTopLevel: WebGL's useProgram is not a React hook.
  gl.useProgram(program);
}

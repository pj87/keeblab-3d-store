const canvas = document.getElementById("keyboardCanvas");
const fallback = document.getElementById("viewerFallback");

const viewerState = {
  gl: null,
  program: null,
  positionBuffer: null,
  normalBuffer: null,
  indexBuffer: null,
  locations: null,
  rotationX: -0.72,
  rotationY: -0.58,
  targetX: -0.72,
  targetY: -0.58,
  dragging: false,
  lastX: 0,
  lastY: 0,
  caseColor: [0.07, 0.09, 0.12],
  keycapTheme: "dark-pbt",
  layout: "75",
};

const vertexShaderSource = `
  attribute vec3 aPosition;
  attribute vec3 aNormal;
  uniform mat4 uModel;
  uniform mat4 uViewProjection;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vec4 world = uModel * vec4(aPosition, 1.0);
    vPosition = world.xyz;
    vNormal = mat3(uModel) * aNormal;
    gl_Position = uViewProjection * world;
  }
`;

const fragmentShaderSource = `
  precision mediump float;
  uniform vec3 uColor;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 light = normalize(vec3(-0.35, 0.7, 0.55));
    float diffuse = max(dot(normal, light), 0.0);
    float rim = pow(1.0 - max(dot(normal, normalize(vec3(0.0, 0.0, 1.0))), 0.0), 2.0);
    vec3 color = uColor * (0.34 + diffuse * 0.78) + rim * vec3(0.12, 0.18, 0.16);
    gl_FragColor = vec4(color, 1.0);
  }
`;

const cubePositions = new Float32Array([
  -0.5, -0.5,  0.5,  0.5, -0.5,  0.5,  0.5,  0.5,  0.5, -0.5,  0.5,  0.5,
  -0.5, -0.5, -0.5, -0.5,  0.5, -0.5,  0.5,  0.5, -0.5,  0.5, -0.5, -0.5,
  -0.5,  0.5, -0.5, -0.5,  0.5,  0.5,  0.5,  0.5,  0.5,  0.5,  0.5, -0.5,
  -0.5, -0.5, -0.5,  0.5, -0.5, -0.5,  0.5, -0.5,  0.5, -0.5, -0.5,  0.5,
   0.5, -0.5, -0.5,  0.5,  0.5, -0.5,  0.5,  0.5,  0.5,  0.5, -0.5,  0.5,
  -0.5, -0.5, -0.5, -0.5, -0.5,  0.5, -0.5,  0.5,  0.5, -0.5,  0.5, -0.5,
]);

const cubeNormals = new Float32Array([
   0,  0,  1,  0,  0,  1,  0,  0,  1,  0,  0,  1,
   0,  0, -1,  0,  0, -1,  0,  0, -1,  0,  0, -1,
   0,  1,  0,  0,  1,  0,  0,  1,  0,  0,  1,  0,
   0, -1,  0,  0, -1,  0,  0, -1,  0,  0, -1,  0,
   1,  0,  0,  1,  0,  0,  1,  0,  0,  1,  0,  0,
  -1,  0,  0, -1,  0,  0, -1,  0,  0, -1,  0,  0,
]);

const cubeIndices = new Uint16Array([
   0,  1,  2,  0,  2,  3,
   4,  5,  6,  4,  6,  7,
   8,  9, 10,  8, 10, 11,
  12, 13, 14, 12, 14, 15,
  16, 17, 18, 16, 18, 19,
  20, 21, 22, 20, 22, 23,
]);

function compileShader(gl, source, type) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader));
  }
  return shader;
}

function createProgram(gl) {
  const vertex = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
  const fragment = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program));
  }
  return program;
}

function identity() {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}

function multiply(a, b) {
  const out = new Array(16);
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      out[col * 4 + row] =
        a[0 * 4 + row] * b[col * 4 + 0] +
        a[1 * 4 + row] * b[col * 4 + 1] +
        a[2 * 4 + row] * b[col * 4 + 2] +
        a[3 * 4 + row] * b[col * 4 + 3];
    }
  }
  return out;
}

function translate(matrix, x, y, z) {
  return multiply(matrix, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]);
}

function scale(matrix, x, y, z) {
  return multiply(matrix, [x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1]);
}

function rotateX(matrix, angle) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return multiply(matrix, [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]);
}

function rotateY(matrix, angle) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return multiply(matrix, [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]);
}

function perspective(fov, aspect, near, far) {
  const f = 1 / Math.tan(fov / 2);
  const range = 1 / (near - far);
  return [
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (near + far) * range, -1,
    0, 0, 2 * near * far * range, 0,
  ];
}

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  return [
    parseInt(value.slice(0, 2), 16) / 255,
    parseInt(value.slice(2, 4), 16) / 255,
    parseInt(value.slice(4, 6), 16) / 255,
  ];
}

function resize() {
  const ratio = window.devicePixelRatio || 1;
  const width = Math.max(1, Math.floor(canvas.clientWidth * ratio));
  const height = Math.max(1, Math.floor(canvas.clientHeight * ratio));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
}

function drawBox(center, size, color) {
  const gl = viewerState.gl;
  let model = identity();
  model = rotateX(model, viewerState.rotationX);
  model = rotateY(model, viewerState.rotationY);
  model = translate(model, center[0], center[1], center[2]);
  model = scale(model, size[0], size[1], size[2]);

  gl.uniformMatrix4fv(viewerState.locations.model, false, new Float32Array(model));
  gl.uniform3fv(viewerState.locations.color, new Float32Array(color));
  gl.drawElements(gl.TRIANGLES, cubeIndices.length, gl.UNSIGNED_SHORT, 0);
}

function keycapColor(index) {
  if (viewerState.keycapTheme === "minimal") return index % 7 === 0 ? [0.18, 0.22, 0.25] : [0.9, 0.92, 0.9];
  if (viewerState.keycapTheme === "retro") return index % 6 === 0 ? [0.85, 0.42, 0.22] : [0.78, 0.72, 0.6];
  if (viewerState.keycapTheme === "mint") return index % 5 === 0 ? [0.52, 0.88, 0.67] : [0.12, 0.16, 0.18];
  return index % 5 === 0 ? [0.52, 0.82, 0.28] : [0.12, 0.14, 0.16];
}

function layoutColumns() {
  if (viewerState.layout === "65") return 12;
  if (viewerState.layout === "tkl") return 16;
  if (viewerState.layout === "full") return 18;
  return 14;
}

function render() {
  const gl = viewerState.gl;
  resize();
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.055, 0.07, 0.09, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  viewerState.rotationX += (viewerState.targetX - viewerState.rotationX) * 0.12;
  viewerState.rotationY += (viewerState.targetY - viewerState.rotationY) * 0.12;

  const aspect = canvas.width / canvas.height;
  const projection = perspective(Math.PI / 4, aspect, 0.1, 100);
  const view = translate(identity(), 0, -0.25, -9.2);
  const viewProjection = multiply(projection, view);
  gl.uniformMatrix4fv(viewerState.locations.viewProjection, false, new Float32Array(viewProjection));

  const columns = layoutColumns();
  const boardWidth = columns * 0.48 + 0.8;
  const boardDepth = 2.6;
  drawBox([0, 0, 0], [boardWidth, 0.34, boardDepth], viewerState.caseColor);
  drawBox([0, 0.22, 0], [boardWidth - 0.26, 0.08, boardDepth - 0.26], [
    viewerState.caseColor[0] + 0.04,
    viewerState.caseColor[1] + 0.04,
    viewerState.caseColor[2] + 0.04,
  ]);

  let keyIndex = 0;
  const rows = 4;
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < columns; col += 1) {
      if (viewerState.layout === "65" && row === 3 && col > 9) continue;
      const wide = row === 3 && (col === 0 || col === 5 || col === columns - 2);
      const width = wide ? 0.72 : 0.36;
      const x = (col - columns / 2 + 0.5) * 0.46;
      const z = (row - rows / 2 + 0.5) * 0.52;
      drawBox([x, 0.46, z], [width, 0.2, 0.34], keycapColor(keyIndex));
      keyIndex += 1;
    }
  }

  requestAnimationFrame(render);
}

function bindInteraction() {
  canvas.addEventListener("pointerdown", (event) => {
    viewerState.dragging = true;
    viewerState.lastX = event.clientX;
    viewerState.lastY = event.clientY;
    canvas.setPointerCapture(event.pointerId);
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!viewerState.dragging) return;
    const dx = event.clientX - viewerState.lastX;
    const dy = event.clientY - viewerState.lastY;
    viewerState.lastX = event.clientX;
    viewerState.lastY = event.clientY;
    viewerState.targetY += dx * 0.01;
    viewerState.targetX = Math.max(-1.15, Math.min(-0.25, viewerState.targetX + dy * 0.01));
  });

  canvas.addEventListener("pointerup", () => {
    viewerState.dragging = false;
  });

  canvas.addEventListener("pointerleave", () => {
    viewerState.dragging = false;
  });
}

function initViewer() {
  try {
    const gl = canvas.getContext("webgl", { antialias: true });
    if (!gl) throw new Error("WebGL unavailable");
    viewerState.gl = gl;
    viewerState.program = createProgram(gl);
    viewerState.locations = {
      position: gl.getAttribLocation(viewerState.program, "aPosition"),
      normal: gl.getAttribLocation(viewerState.program, "aNormal"),
      model: gl.getUniformLocation(viewerState.program, "uModel"),
      viewProjection: gl.getUniformLocation(viewerState.program, "uViewProjection"),
      color: gl.getUniformLocation(viewerState.program, "uColor"),
    };

    gl.useProgram(viewerState.program);
    gl.enable(gl.DEPTH_TEST);

    viewerState.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, viewerState.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cubePositions, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(viewerState.locations.position);
    gl.vertexAttribPointer(viewerState.locations.position, 3, gl.FLOAT, false, 0, 0);

    viewerState.normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, viewerState.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cubeNormals, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(viewerState.locations.normal);
    gl.vertexAttribPointer(viewerState.locations.normal, 3, gl.FLOAT, false, 0, 0);

    viewerState.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, viewerState.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cubeIndices, gl.STATIC_DRAW);

    bindInteraction();
    render();
  } catch {
    canvas.style.display = "none";
    fallback.classList.add("active");
  }
}

window.keebViewer = {
  update(options) {
    if (options.caseColor) viewerState.caseColor = hexToRgb(options.caseColor);
    if (options.layout) viewerState.layout = options.layout;
    if (options.keycaps) viewerState.keycapTheme = options.keycaps;
  },
};

initViewer();

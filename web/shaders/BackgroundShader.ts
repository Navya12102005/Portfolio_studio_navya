export const BackgroundVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

export const BackgroundFragmentShader = `
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  uniform float uTime;
  varying vec2 vUv;

  // Pseudo-random noise function for blueprint grid & particle grain
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  // Manhattan-routed PCB trace lines + glowing via-dots on a coarse grid,
  // with a travelling signal pulse along each trace.
  float pcbTraces(vec2 p, float time) {
    vec2 cell = floor(p * 6.0);
    vec2 local = fract(p * 6.0) - 0.5;
    float h = random(cell);
    // each cell picks a horizontal or vertical trace segment
    float trace = h > 0.5
      ? smoothstep(0.04, 0.0, abs(local.y))
      : smoothstep(0.04, 0.0, abs(local.x));
    float via = smoothstep(0.08, 0.0, length(local)) * step(0.85, fract(h * 7.0));
    float pulse = 0.5 + 0.5 * sin((h > 0.5 ? local.x : local.y) * 20.0 - time * 3.0 + h * 30.0);
    return trace * (0.4 + 0.6 * pulse) + via;
  }

  // A few animated sine streamlines — a stand-in for fluid-dynamics flow
  // visualization, not a real CFD solve.
  float flowLines(vec2 p, float time) {
    float v = 0.0;
    for (int i = 0; i < 3; i++) {
      float fi = float(i);
      float freq = 2.0 + fi * 0.7;
      float speed = 0.3 + fi * 0.15;
      float phase = fi * 2.1;
      float y = p.y - 0.25 * sin(p.x * freq + time * speed + phase) - fi * 0.18 + 0.18;
      v += smoothstep(0.015, 0.0, abs(y));
    }
    return v;
  }

  // Procedural strokes evoking mathematical notation (an integral-like
  // S-curve, a sigma-like zigzag) — analytic distance-to-polyline shapes,
  // not real glyph/font rendering.
  float mathGlyphs(vec2 p, float time) {
    float t = time * 0.4;
    vec2 q = p * 3.0;
    q.x += sin(t) * 0.5;

    // integral-sign S-curve
    float integral = smoothstep(0.05, 0.0, abs(q.x - 0.35 * sin(q.y * 2.0)) - 0.0) * step(abs(q.y), 1.1);

    // sigma-like zigzag (two diagonal strokes forming a Z)
    vec2 s = q - vec2(1.6, 0.0);
    float top = smoothstep(0.05, 0.0, abs(s.y - 0.9)) * step(abs(s.x), 0.5);
    float bottom = smoothstep(0.05, 0.0, abs(s.y + 0.9)) * step(abs(s.x), 0.5);
    float diag = smoothstep(0.05, 0.0, abs(s.y - s.x * 1.8)) * step(abs(s.x), 0.5) * step(abs(s.y), 0.9);
    float sigma = top + bottom + diag;

    return clamp(integral + sigma, 0.0, 1.0);
  }

  void main() {
    vec2 st = gl_FragCoord.xy / uResolution.xy;
    vec2 p = (gl_FragCoord.xy * 2.0 - uResolution.xy) / min(uResolution.x, uResolution.y);

    // Base carbon-obsidian void color
    vec3 color = vec3(0.011, 0.019, 0.031);

    // Subtle grid lines (blueprint aesthetic)
    vec2 grid = fract(st * 40.0);
    float line = step(0.98, grid.x) + step(0.98, grid.y);
    vec3 gridColor = vec3(0.0, 0.94, 1.0) * line * 0.08;

    // Cursor spotlight calculation
    vec2 mouseNDC = (uMouse / uResolution.xy) * 2.0 - 1.0;
    mouseNDC.y = -mouseNDC.y; // Flip Y for WebGL coordinates
    float dist = distance(p, vec2(mouseNDC.x * (uResolution.x/uResolution.y), mouseNDC.y));

    // Spotlight radius & smoothfalloff
    float spotlight = smoothstep(0.6, 0.05, dist);

    // Dynamic accent color (Cyan to Molten Amber near cursor)
    vec3 spotlightColor = mix(vec3(0.0, 0.94, 1.0), vec3(1.0, 0.36, 0.0), spotlight * 0.5);

    // Apply grid and spotlight illumination
    color += gridColor + (spotlightColor * spotlight * 0.35);

    // Schematic reveal, masked tightly to the cursor spotlight: PCB
    // traces (cyan), flow streamlines (amber), and math-notation strokes
    // (bright white-cyan) — all fade out together away from the cursor.
    vec2 cursorLocal = p - vec2(mouseNDC.x * (uResolution.x / uResolution.y), mouseNDC.y);
    float revealMask = smoothstep(0.55, 0.0, length(cursorLocal));
    if (revealMask > 0.001) {
      float pcb = pcbTraces(cursorLocal * 2.5, uTime);
      float flow = flowLines(cursorLocal * 1.8, uTime);
      float glyphs = mathGlyphs(cursorLocal, uTime);

      color += vec3(0.0, 0.85, 1.0) * pcb * revealMask * 0.9;
      color += vec3(1.0, 0.56, 0.0) * flow * revealMask * 0.75;
      color += vec3(0.75, 0.97, 1.0) * glyphs * revealMask * 0.8;
    }

    // Vignette
    color *= (1.0 - 0.5 * length(p));

    gl_FragColor = vec4(color, 1.0);
  }
`;

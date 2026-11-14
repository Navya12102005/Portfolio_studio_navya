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

    // Vignette
    color *= (1.0 - 0.5 * length(p));

    gl_FragColor = vec4(color, 1.0);
  }
`;

export const BackgroundVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

/**
 * Deliberately minimal, per the "Stark-Minimalist" direction: a pure
 * carbon-obsidian void with one soft cursor-reactive glow and a
 * vignette — no grid lines, no PCB/flow/math-notation reveal, no
 * raymarched floor, no starfield. Those all existed in earlier
 * iterations of this shader and were removed outright (not dimmed) per
 * explicit feedback that the background read as cluttered.
 */
export const BackgroundFragmentShader = `
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vec2 p = (gl_FragCoord.xy * 2.0 - uResolution.xy) / min(uResolution.x, uResolution.y);

    // Base carbon-obsidian void color
    vec3 color = vec3(0.011, 0.019, 0.031);

    // A single soft, slow-breathing glow that follows the cursor —
    // the only reactive element left in this shader.
    vec2 mouseNDC = (uMouse / uResolution.xy) * 2.0 - 1.0;
    mouseNDC.y = -mouseNDC.y;
    float dist = distance(p, vec2(mouseNDC.x * (uResolution.x / uResolution.y), mouseNDC.y));
    float breathe = 0.85 + 0.15 * sin(uTime * 0.6);
    float glow = smoothstep(0.75, 0.0, dist) * 0.06 * breathe;
    color += vec3(0.0, 0.7, 0.9) * glow;

    // Vignette
    color *= (1.0 - 0.45 * length(p));

    gl_FragColor = vec4(color, 1.0);
  }
`;

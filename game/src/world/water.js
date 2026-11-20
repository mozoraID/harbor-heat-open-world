// Ocean and lagoon water planes with animated wave shader.
import * as THREE from 'three';
import { COLORS } from '../core/constants.js';

export function createWater(scene, layout) {
  const uniforms = {
    time: { value: 0 },
    colorA: { value: new THREE.Color(COLORS.ocean) },
    colorB: { value: new THREE.Color(0x5ec4d8) },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    vertexShader: `
      uniform float time;
      varying vec2 vUv;
      varying float vWave;
      void main() {
        vUv = uv;
        vec3 pos = position;
        float w = sin(pos.x * 0.03 + time * 0.8) * 0.5 + cos(pos.y * 0.04 + time * 0.6) * 0.4;
        pos.z += w;
        vWave = w;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 colorA;
      uniform vec3 colorB;
      varying vec2 vUv;
      varying float vWave;
      void main() {
        float m = 0.5 + vWave * 0.25 + sin(vUv.x * 40.0) * 0.02;
        vec3 col = mix(colorA, colorB, clamp(m, 0.0, 1.0));
        gl_FragColor = vec4(col, 0.92);
      }
    `,
  });
  const ocean = new THREE.Mesh(new THREE.PlaneGeometry(layout.width * 2.5, 220, 64, 32), mat);
  ocean.rotation.x = -Math.PI / 2;
  ocean.position.set(0, -0.2, layout.depth / 2 + 150);
  ocean.receiveShadow = true;
  scene.add(ocean);

  // marina water inlet
  const inlet = new THREE.Mesh(new THREE.PlaneGeometry(120, 90, 16, 16), mat.clone());
  inlet.rotation.x = -Math.PI / 2;
  inlet.position.set(-layout.width * 0.28, -0.15, layout.depth / 2 - 15);
  scene.add(inlet);

  return {
    update(dt) {
      uniforms.time.value += dt;
      inlet.material.uniforms.time.value += dt;
    },
  };
}

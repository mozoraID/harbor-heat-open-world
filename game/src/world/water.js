// Ocean and marina water with animated waves and shore-to-deep color gradient.
import * as THREE from 'three';

export function createWater(scene, layout) {
  const uniforms = {
    time: { value: 0 },
    shore: { value: new THREE.Color(0x45d6c9) },
    mid: { value: new THREE.Color(0x1fa3b8) },
    deep: { value: new THREE.Color(0x0b3d66) },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    vertexShader: `
      uniform float time;
      varying vec2 vUv;
      varying float vWave;
      varying float vDist;
      void main() {
        vUv = uv;
        vec3 pos = position;
        float w1 = sin(pos.x * 0.025 + time * 0.9) * 0.7;
        float w2 = cos(pos.y * 0.045 + time * 0.7) * 0.45;
        float w3 = sin((pos.x + pos.y) * 0.02 + time * 1.2) * 0.25;
        pos.z += w1 + w2 + w3;
        vWave = w1 + w2 + w3;
        vDist = uv.y;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 shore; uniform vec3 mid; uniform vec3 deep;
      varying vec2 vUv; varying float vWave; varying float vDist;
      void main() {
        vec3 col = mix(shore, mid, smoothstep(0.0, 0.45, vDist));
        col = mix(col, deep, smoothstep(0.45, 1.0, vDist));
        float highlight = smoothstep(0.35, 1.0, sin(vUv.x * 50.0 + vWave * 2.0) * 0.5 + 0.5);
        col += vec3(0.55, 0.75, 0.85) * highlight * 0.18 * (1.0 - vDist * 0.5);
        float foam = smoothstep(0.82, 1.0, sin(vUv.x * 22.0 + vUv.y * 6.0 + vWave * 4.0) * 0.5 + 0.5) * (1.0 - smoothstep(0.0, 0.18, vDist));
        col = mix(col, vec3(0.95, 0.98, 1.0), foam * 0.35);
        gl_FragColor = vec4(col, 0.94);
      }
    `,
  });

  const ocean = new THREE.Mesh(new THREE.PlaneGeometry(layout.width * 2.8, 260, 80, 40), mat);
  ocean.rotation.x = -Math.PI / 2;
  ocean.position.set(0, -0.25, layout.depth / 2 + 165);
  ocean.receiveShadow = true;
  scene.add(ocean);

  const inlet = new THREE.Mesh(new THREE.PlaneGeometry(140, 100, 24, 16), mat.clone());
  inlet.rotation.x = -Math.PI / 2;
  inlet.position.set(-layout.width * 0.28, -0.18, layout.depth / 2 - 15);
  scene.add(inlet);

  return {
    update(dt) {
      uniforms.time.value += dt;
      inlet.material.uniforms.time.value += dt;
    },
  };
}

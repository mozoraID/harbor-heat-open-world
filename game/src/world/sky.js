// Sky dome and lighting for golden-hour Port Solenne atmosphere.
import * as THREE from 'three';
import { COLORS } from '../core/constants.js';

export function createSky(scene) {
  const geo = new THREE.SphereGeometry(900, 32, 16);
  const uniforms = {
    topColor: { value: new THREE.Color(COLORS.skyTop) },
    horizonColor: { value: new THREE.Color(COLORS.skyHorizon) },
    bottomColor: { value: new THREE.Color(0x5d8aa8) },
    offset: { value: 20 },
    exponent: { value: 0.35 },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPosition = wp.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 horizonColor;
      uniform vec3 bottomColor;
      uniform float offset;
      uniform float exponent;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition + vec3(0.0, offset, 0.0)).y;
        float t = max(pow(max(h, 0.0), exponent), 0.0);
        vec3 col = mix(horizonColor, topColor, t);
        if (h < 0.0) col = mix(horizonColor, bottomColor, clamp(-h * 1.5, 0.0, 1.0));
        gl_FragColor = vec4(col, 1.0);
      }
    `,
    side: THREE.BackSide,
    fog: false,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);

  const hemi = new THREE.HemisphereLight(0xffd7a8, 0x5a6a4a, 0.85);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xffd2a1, 1.5);
  sun.position.set(180, 140, 80);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 10;
  sun.shadow.camera.far = 500;
  sun.shadow.camera.left = -220;
  sun.shadow.camera.right = 220;
  sun.shadow.camera.top = 220;
  sun.shadow.camera.bottom = -220;
  sun.shadow.bias = -0.0002;
  scene.add(sun);
  scene.add(sun.target);

  // simple sun sprite
  const sunGeo = new THREE.SphereGeometry(18, 16, 16);
  const sunMat = new THREE.MeshBasicMaterial({ color: 0xfff2cc, fog: false });
  const sunMesh = new THREE.Mesh(sunGeo, sunMat);
  sunMesh.position.copy(sun.position).multiplyScalar(2.2);
  scene.add(sunMesh);

  return { mesh, sun, hemi, sunMesh };
}

// Golden-hour sky dome, sun, clouds, fog, and shadow-casting lighting.
import * as THREE from 'three';

export function createSky(scene) {
  const geo = new THREE.SphereGeometry(950, 40, 24);
  const uniforms = {
    top: { value: new THREE.Color(0x2b5cb8) },
    mid: { value: new THREE.Color(0x6fa8dc) },
    horizon: { value: new THREE.Color(0xffb36b) },
    glow: { value: new THREE.Color(0xfff1b8) },
    sunDir: { value: new THREE.Vector3(0.55, 0.18, 0.82).normalize() },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    side: THREE.BackSide,
    fog: false,
    depthWrite: false,
    vertexShader: `
      varying vec3 vPos;
      void main(){ vPos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
    `,
    fragmentShader: `
      uniform vec3 top; uniform vec3 mid; uniform vec3 horizon; uniform vec3 glow; uniform vec3 sunDir;
      varying vec3 vPos;
      void main(){
        vec3 dir = normalize(vPos);
        float h = clamp(dir.y, 0.0, 1.0);
        vec3 col = mix(horizon, mid, smoothstep(0.0, 0.35, h));
        col = mix(col, top, smoothstep(0.25, 1.0, h));
        float sun = max(dot(dir, normalize(sunDir)), 0.0);
        col += glow * pow(sun, 32.0) * 0.9 + glow * pow(sun, 256.0) * 1.4;
        if (dir.y < 0.0) col = mix(horizon, vec3(0x3a/255.0,0x6f/255.0,0x8f/255.0), clamp(-dir.y*1.4,0.0,1.0));
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);

  scene.fog = new THREE.FogExp2(0xf6b38a, 0.0022);

  const hemi = new THREE.HemisphereLight(0x9ec9ff, 0xe0a070, 0.95);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xffe0b0, 2.1);
  sun.position.set(220, 90, 320);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 10;
  sun.shadow.camera.far = 650;
  const s = 220;
  sun.shadow.camera.left = -s; sun.shadow.camera.right = s; sun.shadow.camera.top = s; sun.shadow.camera.bottom = -s;
  sun.shadow.bias = -0.00025;
  sun.shadow.normalBias = 0.02;
  scene.add(sun);
  scene.add(sun.target);

  const sunMesh = new THREE.Mesh(
    new THREE.SphereGeometry(16, 20, 20),
    new THREE.MeshBasicMaterial({ color: 0xfff2c2, fog: false })
  );
  sunMesh.position.copy(sun.position).multiplyScalar(2.0);
  scene.add(sunMesh);

  // soft clouds
  const cloudGroup = new THREE.Group();
  const cloudMat = new THREE.MeshStandardMaterial({ color: 0xffe8d2, transparent: true, opacity: 0.55, roughness: 1, depthWrite: false });
  for (let i = 0; i < 18; i++) {
    const c = new THREE.Group();
    const blobs = 3 + Math.floor(Math.random() * 3);
    for (let j = 0; j < blobs; j++) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(10 + Math.random() * 12, 10, 10), cloudMat);
      b.position.set((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 20);
      b.scale.y = 0.5;
      c.add(b);
    }
    const a = Math.random() * Math.PI * 2;
    const r = 350 + Math.random() * 250;
    c.position.set(Math.cos(a) * r, 90 + Math.random() * 50, Math.sin(a) * r - 100);
    cloudGroup.add(c);
  }
  scene.add(cloudGroup);

  return {
    mesh, sun, hemi, sunMesh, cloudGroup,
    update(dt, targetPos) {
      if (targetPos) {
        sun.target.position.copy(targetPos);
        sun.position.set(targetPos.x + 220, 90, targetPos.z + 320);
        sun.target.updateMatrixWorld();
      }
      cloudGroup.rotation.y += dt * 0.003;
    },
  };
}

import * as THREE from 'three';

export function createWaterSparkle(ctx) {
  const { scene } = ctx;
  const group = new THREE.Group();

  const count = 26;
  const sprites = [];
  // simple radial gradient texture
  const c = document.createElement('canvas');
  c.width = 64; c.height = 64;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,240,1)');
  grad.addColorStop(0.3, 'rgba(255,245,200,0.7)');
  grad.addColorStop(1, 'rgba(255,245,200,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;

  for (let i = 0; i < count; i++) {
    const mat = new THREE.SpriteMaterial({
      map: tex,
      color: 0xfff6cc,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const s = new THREE.Sprite(mat);
    // ocean near horizon/sun glitter area (south, far z)
    s.position.set((Math.random() - 0.5) * 500, 0.6 + Math.random() * 0.8, 420 + Math.random() * 220);
    s.scale.setScalar(2.5 + Math.random() * 4.5);
    s.userData = {
      baseX: s.position.x,
      baseZ: s.position.z,
      phase: Math.random() * Math.PI * 2,
      speed: 0.6 + Math.random() * 1.2,
      drift: 0.3 + Math.random() * 0.6,
    };
    group.add(s);
    sprites.push(s);
  }
  scene.add(group);

  let t = 0;
  function update(dt, state) {
    t += dt;
    const h = state && state.timeOfDayHours != null ? state.timeOfDayHours : 18.7;
    // golden hour: ~17.5 - 19.2
    let vis = 0;
    if (h >= 17.0 && h <= 19.5) {
      // peak around 18.5
      const d = Math.abs(h - 18.4);
      vis = Math.max(0, 1 - d / 1.3);
    }
    // also slight morning sparkle
    if (h >= 6.0 && h <= 7.5) {
      const d = Math.abs(h - 6.8);
      vis = Math.max(vis, (1 - d / 0.9) * 0.5);
    }

    // bias sparkles toward sun side if possible
    const sunX = (state && state.player) ? state.player.x + 220 : 220;
    for (const s of sprites) {
      const u = s.userData;
      // gentle drift
      s.position.x = u.baseX + Math.sin(t * 0.2 + u.phase) * 3 * u.drift;
      s.position.z = u.baseZ + Math.cos(t * 0.17 + u.phase) * 2 * u.drift;
      const tw = 0.5 + 0.5 * Math.sin(t * u.speed * 2.2 + u.phase) * Math.sin(t * u.speed * 1.3 + u.phase * 1.7);
      const sxBias = 1 - Math.min(1, Math.abs(s.position.x - sunX) / 600);
      const o = vis * (0.15 + 0.85 * Math.max(0, tw)) * (0.4 + 0.6 * sxBias);
      s.material.opacity = o * 0.7;
      const sc = (2.5 + (u.speed - 0.6) * 3.5) * (0.8 + 0.4 * Math.max(0, tw));
      s.scale.setScalar(sc);
    }
  }

  return { update, group };
}

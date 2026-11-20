// Slow orbiting title-screen camera around Marigold Beach at sunset.
import * as THREE from 'three';

export function createTitleCamera(app, state) {
  let active = false;
  let angle = Math.PI * 0.85;
  let time = 0;
  const center = new THREE.Vector3(-20, 0, 300); // Marigold Beach (south side)
  const look = new THREE.Vector3(-40, 6, 285);

  function activate() {
    active = true;
    time = 0;
    if (state) state.mode = 'title';
  }
  function deactivate() { active = false; }
  function isActive() { return active; }

  function update(dt = 0) {
    if (!active || !app || !app.camera) return;
    time += dt;
    angle += dt * 0.08; // slow orbit
    const radius = 95 + Math.sin(time * 0.15) * 6;
    const height = 22 + Math.sin(time * 0.2) * 3;
    const cam = app.camera;
    cam.position.x = center.x + Math.cos(angle) * radius;
    cam.position.z = center.z + Math.sin(angle) * radius * 0.7;
    cam.position.y = height;
    const lx = look.x + Math.sin(time * 0.07) * 10;
    const lz = look.z + Math.cos(time * 0.05) * 8;
    cam.lookAt(lx, look.y, lz);
    if (cam.fov !== 55) { cam.fov = 55; cam.updateProjectionMatrix(); }
  }

  // Call this from render/main when chase camera should be suppressed in title mode.
  function apply(dt) { update(dt); }

  return { update, apply, activate, deactivate, isActive, get active() { return active; } };
}

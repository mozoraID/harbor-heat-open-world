// Slow drifting title-screen camera high above the Marigold Beach shoreline at sunset.
import * as THREE from 'three';

export function createTitleCamera(app, state) {
  let active = false;
  let time = 0;
  // Out over the ocean (south of the beach), well above the palms so no buildings block the view.
  const anchor = new THREE.Vector3(-190, 52, 468);
  const look = new THREE.Vector3(210, 8, 385);

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
    const cam = app.camera;
    cam.position.set(
      anchor.x + Math.sin(time * 0.09) * 14,
      anchor.y + Math.sin(time * 0.13) * 3,
      anchor.z + Math.cos(time * 0.07) * 8,
    );
    cam.lookAt(
      look.x + Math.sin(time * 0.05) * 16,
      look.y,
      look.z + Math.cos(time * 0.04) * 10,
    );
    if (cam.fov !== 55) { cam.fov = 55; cam.updateProjectionMatrix(); }
  }

  // Call this from render/main when chase camera should be suppressed in title mode.
  function apply(dt) { update(dt); }

  return { update, apply, activate, deactivate, isActive, get active() { return active; } };
}

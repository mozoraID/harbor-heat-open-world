// Third-person chase camera for on-foot and vehicle modes.
import * as THREE from 'three';
import { damp, clamp } from './math.js';

export function updateCamera(app, state, dt) {
  const cam = app.camera;
  const p = state.player;
  const car = p.inCar ? state.car : null;
  const look = state.inputLookCache || { dx: 0, dy: 0 };

  if (car) {
    state.camera.yaw = dampAngle(state.camera.yaw, car.yaw + Math.PI, 6, dt);
    state.camera.pitch = damp(state.camera.pitch, 0.22, 4, dt);
    state.camera.dist = damp(state.camera.dist, 8.5, 4, dt);
    const speed = Math.abs(car.speed || 0);
    const fovTarget = 60 + clamp(speed * 0.7, 0, 18);
    cam.fov = damp(cam.fov, fovTarget, 4, dt);
    cam.updateProjectionMatrix();

    const yaw = state.camera.yaw;
    const pitch = state.camera.pitch;
    const dist = state.camera.dist;
    const tx = car.mesh.position.x;
    const ty = 1.5;
    const tz = car.mesh.position.z;
    const cx = tx + Math.sin(yaw) * dist * Math.cos(pitch);
    const cy = ty + Math.sin(pitch) * dist + 2.2;
    const cz = tz + Math.cos(yaw) * dist * Math.cos(pitch);
    cam.position.x = damp(cam.position.x, cx, 8, dt);
    cam.position.y = damp(cam.position.y, cy, 8, dt);
    cam.position.z = damp(cam.position.z, cz, 8, dt);
    cam.lookAt(tx, ty + 0.8, tz);
    // keep player position synced for HUD/logic
    p.x = car.mesh.position.x; p.z = car.mesh.position.z; p.y = 0;
  } else {
    // on-foot follow camera: mouse moves camera orbit
    // camera yaw follows player facing with some offset from look system in state.camera
    if (!state._camYawInit) { state.camera.yaw = p.yaw + Math.PI; state._camYawInit = true; }
    // align camera yaw toward behind player smoothly while allowing orbit drift via stored camera yaw in player controls
    const desiredYaw = p.yaw + Math.PI;
    state.camera.yaw = dampAngle(state.camera.yaw, desiredYaw, 2.5, dt);
    const yaw = state.camera.yaw;
    const pitch = clamp(state.camera.pitch, -0.2, 0.9);
    const dist = 6.5;
    const tx = p.x;
    const ty = p.y + 1.7;
    const tz = p.z;
    const cx = tx + Math.sin(yaw) * dist * Math.cos(pitch);
    const cy = ty + Math.sin(pitch) * dist + 0.8;
    const cz = tz + Math.cos(yaw) * dist * Math.cos(pitch);
    cam.position.x = damp(cam.position.x, cx, 10, dt);
    cam.position.y = damp(cam.position.y, cy, 10, dt);
    cam.position.z = damp(cam.position.z, cz, 10, dt);
    cam.fov = damp(cam.fov, 60, 4, dt);
    cam.updateProjectionMatrix();
    cam.lookAt(tx, ty, tz);
  }
}

function dampAngle(a, b, lambda, dt) {
  let diff = b - a;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return a + diff * (1 - Math.exp(-lambda * dt));
}

// Handles on-foot player movement, jumping, camera-relative controls, and animation.
import * as THREE from 'three';
import { PHYSICS } from '../core/constants.js';
import { damp, clamp } from '../core/math.js';
import { resolveCircleColliders, findDistrict } from '../core/collisions.js';
import { createPlayerModel, animatePlayerModel } from './playerModel.js';

export function createPlayer(scene, state) {
  const model = createPlayerModel();
  scene.add(model);

  // spawn near beach boulevard
  state.player.x = 0;
  state.player.z = state.world.layout.depth / 2 - 35;
  state.player.y = 0;
  state.player.yaw = Math.PI;

  const tmpForward = new THREE.Vector3();
  const tmpRight = new THREE.Vector3();

  function update(dt, input, cameraYaw) {
    const p = state.player;
    if (p.inCar) {
      model.visible = false;
      return;
    }
    model.visible = true;

    const look = input.consumeLook();
    if (look.dx || look.dy) {
      p.yaw -= look.dx * 0.0025;
      state.camera.pitch = clamp(state.camera.pitch - look.dy * 0.002, -0.35, 0.9);
    } else {
      // small follow when using arrows/keys without mouse lock
      // keep yaw controlled by camera system mostly
    }

    const forward = input.state.forward;
    const right = input.state.right;
    const moving = Math.abs(forward) + Math.abs(right) > 0.01;
    const speed = input.state.sprint ? PHYSICS.playerSprint : PHYSICS.playerSpeed;
    let moveX = 0, moveZ = 0;
    if (moving) {
      const yaw = cameraYaw;
      tmpForward.set(Math.sin(yaw), 0, Math.cos(yaw));
      tmpRight.set(Math.cos(yaw), 0, -Math.sin(yaw));
      moveX = (tmpForward.x * forward + tmpRight.x * right);
      moveZ = (tmpForward.z * forward + tmpRight.z * right);
      const len = Math.hypot(moveX, moveZ) || 1;
      moveX = (moveX / len) * speed * dt;
      moveZ = (moveZ / len) * speed * dt;
      p.yaw = Math.atan2(moveX, moveZ);
      p.speed = speed;
    } else {
      p.speed = damp(p.speed, 0, 10, dt);
    }

    // gravity/jump
    if (p.onGround && input.state.jump) {
      p.vy = PHYSICS.playerJump;
      p.onGround = false;
    }
    p.vy -= PHYSICS.gravity * dt;
    p.y += p.vy * dt;
    if (p.y <= 0) { p.y = 0; p.vy = 0; p.onGround = true; }

    const resolved = resolveCircleColliders(p.x + moveX, p.z + moveZ, 0.45, state.colliders, state.world.bounds);
    p.x = resolved.x;
    p.z = resolved.z;

    model.position.set(p.x, p.y, p.z);
    model.rotation.y = p.yaw;
    animatePlayerModel(model, moving && p.onGround, speed, dt);

    state.districtName = findDistrict(state.world.blocks, p.x, p.z);
  }

  return { model, update };
}

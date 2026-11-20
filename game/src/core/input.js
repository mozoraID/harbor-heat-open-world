// Keyboard and mouse input handling with pointer lock support.
export function createInput(target = window) {
  const keys = new Set();
  const state = {
    forward: 0,
    right: 0,
    sprint: false,
    jump: false,
    enterPressed: false,
    lookDX: 0,
    lookDY: 0,
    pointerLocked: false,
  };

  function onKey(e, down) {
    const k = e.key.toLower();
    if (['w','a','s','d','shift',' ','f','arrowup','arrowdown','arrowleft','arrowright'].includes(k)) e.preventDefault();
    if (down) keys.add(k); else keys.delete(k);
    if (down && k === 'f') state.enterPressed = true;
  }

  target.addEventListener('keydown', (e) => onKey(e, true));
  target.addEventListener('keyup', (e) => onKey(e, false));

  const canvas = document.querySelector('canvas');
  if (canvas) {
    canvas.addEventListener('click', () => {
      if (!state.pointerLocked && document.pointerLockElement !== canvas) {
        canvas.requestPointerLock?.();
      }
    });
  }
  document.addEventListener('pointerlockchange', () => {
    state.pointerLocked = document.pointerLockElement === canvas;
  });
  document.addEventListener('mousemove', (e) => {
    if (!state.pointerLocked) return;
    state.lookDX += e.movementX || 0;
    state.lookDY += e.movementY || 0;
  });

  return {
    state,
    update() {
      const up = keys.has('w') || keys.has('arrowup');
      const down = keys.has('s') || keys.has('arrowdown');
      const left = keys.has('a') || keys.has('arrowleft');
      const right = keys.has('d') || keys.has('arrowright');
      state.forward = (up ? 1 : 0) - (down ? 1 : 0);
      state.right = (right ? 1 : 0) - (left ? 1 : 0);
      state.sprint = keys.has('shift');
      state.jump = keys.has(' ');
    },
    consumeEnter() {
      const v = state.enterPressed;
      state.enterPressed = false;
      return v;
    },
    consumeLook() {
      const dx = state.lookDX, dy = state.lookDY;
      state.lookDX = 0; state.lookDY = 0;
      return { dx, dy };
    },
  };
}

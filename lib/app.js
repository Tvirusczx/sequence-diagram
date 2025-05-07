// Import canvas initialization and resizing
import { initializeCanvas, resizeCanvas } from './initializeCanvas.js';

// Import UI and drag/drop handlers
import {
  bindDragHandlers,
  bindNavigationHandlers,
  handleKeyDown
} from './dragHandlers.js';

// Import snapshot manager
import {
  createSnapshot,
  enableSnapshotHandlers,
} from './snapshotManager.js';

let canvas;

/**
 * Initializes the application once DOM is ready.
 */
window.addEventListener('DOMContentLoaded', () => {
  canvas = initializeCanvas();
  bindDragHandlers(canvas);
  bindNavigationHandlers(canvas);
  enableSnapshotHandlers(canvas);
  createSnapshot(canvas);
  window.addEventListener('keydown', (e) => handleKeyDown(e, canvas));
});


/**
 * Handles window resize to keep canvas dimensions in sync.   
 */
window.addEventListener('resize', () => {
  if (canvas) {
    resizeCanvas(canvas);
  }
});

/**
 * Initializes zoom behavior (Ctrl + Mouse Wheel).
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvasEl = document.getElementById('myCanvas');
  const canvasContainer = document.getElementById('canvas_container');
  const workspace = document.getElementById('workspace');

  let zoomLevel = 1;

  workspace.addEventListener('wheel', (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
      zoomLevel += e.deltaY * -0.001;
      zoomLevel = Math.min(Math.max(zoomLevel, 0.2), 4);

      canvas.setZoom(zoomLevel);
      canvas.setViewportTransform([zoomLevel, 0, 0, zoomLevel, 0, 0]);

      const ratio = window.devicePixelRatio || 1;
      const width = canvasContainer.clientWidth;
      const height = canvasContainer.clientHeight;

      canvas.setWidth(width);
      canvas.setHeight(height);
      canvasEl.width = width * ratio;
      canvasEl.height = height * ratio;

      const ctx = canvas.getContext();
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      canvas.requestRenderAll();
    }
  }, { passive: false });
});

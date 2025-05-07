import { overrideToObjectSerialization } from './ImportExportManager.js';

/**
 * Initializes the Fabric.js canvas with default settings.
 * 
 * - Enables stacking, disables selection.
 * - Applies white background and disables image smoothing.
 * - Calls serialization override for custom diagram export.
 * - Sets retina scaling, zoom, and interaction sensitivity.
 * 
 * @returns {fabric.Canvas} The initialized Fabric.js canvas instance.
 */
export function initializeCanvas() {
  const canvas = new fabric.Canvas('myCanvas', {
    preserveObjectStacking: true,
    selection: false,
    backgroundColor: 'white',
    imageSmoothingEnabled: false,
  });

  // Add custom properties to exported object JSON
  overrideToObjectSerialization();

  // Disable object caching for better performance with dynamic changes
  fabric.Object.prototype.objectCaching = false;

  // Set size and scaling based on current container and device DPI
  resizeCanvas(canvas);

  canvas._initRetinaScaling(); // Internal Fabric.js high-DPI support
  canvas.targetFindTolerance = 10; // Easier selection with some tolerance

  return canvas;
}

/**
 * Resizes the canvas based on its container and applies DPI scaling.
 * 
 * Called during initialization and on window resize events to keep
 * the canvas responsive and pixel-perfect.
 * 
 * @param {fabric.Canvas} canvas - The canvas instance to resize.
 */
export function resizeCanvas(canvas) {
  const canvasEl = document.getElementById('myCanvas');
  const canvasContainer = document.getElementById('canvas_container');
  const ratio = window.devicePixelRatio || 1;
  fabric.devicePixelRatio = ratio;

  const width = canvasContainer.clientWidth;
  const height = canvasContainer.clientHeight;

  canvas.setWidth(width);
  canvas.setHeight(height);
  canvas.setZoom(1);

  canvasEl.width = width * ratio;
  canvasEl.height = height * ratio;

  const ctx = canvas.getContext();
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  canvas.calcOffset();
  canvas.requestRenderAll();
}



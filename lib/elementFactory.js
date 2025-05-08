import { createSnapshot, isListeningToCreatingClass } from './snapshotManager.js';

/**
 * Creates a diagram element and automatically triggers a snapshot if enabled. 
 *
 * @param {Function} ClassType - Diagram element class constructor
 * @param {fabric.Canvas} canvas - Fabric.js canvas
 * @param {object} position - Initial position
 * @param  {...any} args - Additional arguments for constructor
 * @returns {object} - Created instance
 */
export function createElementWithSnapshot(ClassType, canvas, position, ...args) {
  const element = new ClassType(canvas, position, ...args);

  if (isListeningToCreatingClass) {
    queueMicrotask(() => {
      createSnapshot(canvas);
    });
  }

  return element;
}

import { exportCanvas, importCanvas } from './ImportExportManager.js';

let snapshots = [];
let currentSnapshotIndex = -1;
export let isListeningToCreatingClass = true;

/**
 * Creates a snapshot of the current canvas state and adds it to the history stack.
 * If the user made changes after undoing, future snapshots are discarded.
 * 
 * @param {fabric.Canvas} canvas - The Fabric.js canvas to snapshot.
 */
export function createSnapshot(canvas) {
  const snapshot = exportCanvas(canvas);

  if (currentSnapshotIndex !== snapshots.length - 1) {
    snapshots = snapshots.slice(0, currentSnapshotIndex + 1);
  }

  snapshots.push(snapshot);
  currentSnapshotIndex++;
}

/**
 * Reverts the canvas to the previous snapshot state.
 * 
 * @param {fabric.Canvas} canvas - The Fabric.js canvas to restore.
 */
export function undo(canvas) {
  if (currentSnapshotIndex > 0) {
    currentSnapshotIndex--;
    const snapshot = snapshots[currentSnapshotIndex];
    disableSnapshotHandlers(canvas);
    importCanvas(snapshot, canvas);
    enableSnapshotHandlers(canvas);
  } else {
    console.log("Cannot undo further.");
  }
}

/**
 * Restores the canvas to the next snapshot in the history stack.
 * 
 * @param {fabric.Canvas} canvas - The Fabric.js canvas to restore.
 */
export function redo(canvas) {
  if (currentSnapshotIndex < snapshots.length - 1) {
    currentSnapshotIndex++;
    const snapshot = snapshots[currentSnapshotIndex];
    disableSnapshotHandlers(canvas);
    importCanvas(snapshot, canvas);
    enableSnapshotHandlers(canvas);
  } else {
    console.log("Cannot redo further.");
  }
}

/**
 * Enables automatic snapshot creation on canvas object modifications.
 * 
 * @param {fabric.Canvas} canvas - The Fabric.js canvas to monitor.
 */
export function enableSnapshotHandlers(canvas) {
  canvas.on('object:modified', () => createSnapshot(canvas));
  isListeningToCreatingClass = true;
}

/**
 * Disables automatic snapshot creation for object modifications.
 * 
 * @param {fabric.Canvas} canvas - The Fabric.js canvas to stop monitoring.
 */
export function disableSnapshotHandlers(canvas) {
  canvas.off('object:modified');
  isListeningToCreatingClass = false;
}

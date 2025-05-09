import DiagramElement from './diagramElement.js';
import ClassWithLifeline from './classWithLifeline.js';
import ActorWithLifeline from './actorWithLifeline.js';
import Note from './note.js';
import Message from './message.js';
import CombinedFragment from './combinedFragment.js';
import { handleDragEnd } from './dragHandlers.js';

let canvas;
let snapshots = [];
let currentSnapshotIndex = -1;
export let isListeningToCreatingClass = true;
let canvasJsonLastExported;


/**
 * Binds navigation buttons to their corresponding functions.
 */
function bindNavigationHandlers() {
    document.getElementById('btnImport')?.addEventListener('click', () => importCanvas(canvasJsonLastExported));
    document.getElementById('btnExport')?.addEventListener('click', exportCanvas);
    document.getElementById('btnImportFile')?.addEventListener('click', importCanvasFile);
    document.getElementById('btnExportFile')?.addEventListener('click', exportCanvasFile);
    document.getElementById('btnSaveImage')?.addEventListener('click', saveCanvasAsImage);
    document.getElementById('btnUndo')?.addEventListener('click', undo);
    document.getElementById('btnRedo')?.addEventListener('click', redo);
    document.getElementById('btnClear')?.addEventListener('click', clearCanvas);
  }
window.addEventListener('DOMContentLoaded', () => {
    initializeCanvas();
    bindDragHandlers();
    bindNavigationHandlers(); 
    enableSnapshotHandlers();
    createSnapshot();
    window.addEventListener('keydown', handleKeyDown);
  });
/**
 * Initializes the Fabric.js canvas.
 */
function initializeCanvas() {
  canvas = new fabric.Canvas('myCanvas', {
    preserveObjectStacking: true,
    selection: false,
    backgroundColor: 'white',
    imageSmoothingEnabled: false,
  });

  // Retina scaling a DPI
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

  canvas._initRetinaScaling();
  canvas.targetFindTolerance = 10;

  // Override toObject...
  const originalToObject = fabric.Object.prototype.toObject;
  fabric.Object.prototype.toObject = function (additionalProperties = []) {
    const properties = [
      'id', 'diagramElement', 'elementPart',
      'lockMovementX', 'lockMovementY', 'hasControls',
      'selectable', 'padding', 'lineStartDistance'
    ].concat(additionalProperties);
  
    const obj = originalToObject.call(this, properties);
  
    // Include controlsVisibility manually
    obj.controlsVisibility = this._controlsVisibility;
  
    return obj;
  };

  fabric.Object.prototype.objectCaching = false;
}

window.addEventListener('resize', () => {
  if (canvas) {
    // Použijeme stejnou logiku jako v initializeCanvas
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
});


/**
 * Binds dragend handlers to toolbar images.
 */
function bindDragHandlers() {
  document.querySelectorAll('img[draggable]').forEach(img => {
    img.addEventListener('dragend', (e) => {
      const type = e.target.dataset.type;
      if (type) {
        handleDragEnd(e, type, canvas);
      }
    });
  });
}

/**
 * Clears the canvas.
 */
function clearCanvas() {
  if (confirm("Are you sure you want to clear the canvas?")) {
    canvas.clear();
    canvas.renderAll();
  }
}

/**
 * Saves the canvas as a PNG image.
 */
function saveCanvasAsImage() {
  const dataURL = canvas.toDataURL({
    format: 'png',
    enableRetinaScaling: true
  });
  downloadImage(dataURL, 'canvas_image.png');
}

/**
 * Exports canvas elements to a JSON file.
 */
async function exportCanvasFile() {
  DiagramElement.allElements.forEach(object => {
    object.addIdentificationToCanvasElements();
  });
  await saveJsonToFile(JSON.stringify(canvas));
}

/**
 * Exports canvas to a global variable.
 */
function exportCanvas() {
  DiagramElement.allElements.forEach(object => {
    object.addIdentificationToCanvasElements();
  });
  const json = JSON.stringify(canvas);
  canvasJsonLastExported = json;
  console.log(canvas.toObject());
  return json;
}

/**
 * Imports canvas from a file.
 */
async function importCanvasFile() {
  try {
    const jsonData = await loadJsonFromFile();
    if (typeof jsonData === 'object' && jsonData !== null) {
      canvas.loadFromJSON(jsonData, () => {
        reconstructStructure(canvas.getObjects());
      });
    } else {
      alert('Invalid JSON data. Unable to import.');
    }
  } catch (error) {
    alert('Selected file is invalid! Please provide a valid file.');
  }
}

/**
 * Imports canvas from JSON.
 * @param {string} json 
 */
function importCanvas(json) {
  canvas.loadFromJSON(json, () => {
    reconstructStructure(canvas.getObjects());
  });
}

/**
 * Downloads an image.
 * @param {string} dataURL 
 * @param {string} filename 
 */
function downloadImage(dataURL, filename) {
  const a = document.createElement('a');
  a.href = dataURL;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Handles keydown events (e.g., delete selected object).
 */
function handleKeyDown(e) {
  if (e.keyCode === 46) { // Delete key
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      DiagramElement.allElements.forEach(object => {
        object.addIdentificationToCanvasElements();
      });
      const idParent = activeObject.id;
      const foundObject = DiagramElement.allElements.find(obj => obj.elementId == idParent);

      if (activeObject.elementPart === "activeBox" && foundObject) {
        foundObject.activeBoxes = foundObject.activeBoxes.filter(item => item !== activeObject);
        canvas.remove(activeObject);
      } else if (foundObject) {
        foundObject.delete();
      }
    }
  }
}

/**
 * Creates a snapshot of the current canvas state.
 */
export function createSnapshot() {
  const snapshot = exportCanvas();

  if (currentSnapshotIndex !== snapshots.length - 1) {
    snapshots = snapshots.slice(0, currentSnapshotIndex + 1);
  }

  snapshots.push(snapshot);
  currentSnapshotIndex++;
}

/**
 * Undo to the previous snapshot.
 */
function undo() {
  if (currentSnapshotIndex > 0) {
    currentSnapshotIndex--;
    const snapshot = snapshots[currentSnapshotIndex];
    disableSnapshotHandlers();
    importCanvas(snapshot);
    enableSnapshotHandlers();
  } else {
    console.log("Cannot undo further.");
  }
}

/**
 * Redo to the next snapshot.
 */
function redo() {
  if (currentSnapshotIndex < snapshots.length - 1) {
    currentSnapshotIndex++;
    const snapshot = snapshots[currentSnapshotIndex];
    disableSnapshotHandlers();
    importCanvas(snapshot);
    enableSnapshotHandlers();
  } else {
    console.log("Cannot redo further.");
  }
}

/**
 * Enables snapshot handlers for object changes.
 */
function enableSnapshotHandlers() {
    const events = ['object:modified'];
  
    events.forEach(eventName => {
      canvas.on(eventName, createSnapshot);
    });
  
    isListeningToCreatingClass = true;
  }
  
  /**
   * Disables snapshot handlers for object changes.
   */
  function disableSnapshotHandlers() {
    const events = ['object:modified'];
  
    events.forEach(eventName => {
      canvas.off(eventName, createSnapshot);
    });
  
    isListeningToCreatingClass = false;
  }
  
/**
 * Reconstructs the structure based on fabric objects.
 */
function reconstructStructure(fabricObjects) {
  const groupedElements = groupById(fabricObjects);

  groupedElements.forEach(subArray => {
    const activeBox = 'activeBox';
    const activeBoxesArray = subArray.filter(item => item.elementPart === activeBox);
    const filteredSubArray = subArray.filter(item => item.elementPart !== activeBox);

    if (filteredSubArray.length > 0) {
      const elementType = filteredSubArray[0].diagramElement;
      const position = filteredSubArray[0].getCoords()[0];

      const allItems = [...filteredSubArray, ...activeBoxesArray];
      allItems.forEach(item => {
        if (item.controlsVisibility) {
          item.setControlsVisibility(item.controlsVisibility);
        }
      });

      let diagramElement;

      switch (elementType) {
        case 'ClassWithLifeline':
          diagramElement = new ClassWithLifeline(canvas, position, ...filteredSubArray);
          break;
        case 'ActorWithLifeline':
          diagramElement = new ActorWithLifeline(canvas, position, ...filteredSubArray);
          break;
        case 'CombinedFragment':
          diagramElement = new CombinedFragment(canvas, position, ...filteredSubArray);
          break;
        case 'Note':
          diagramElement = new Note(canvas, position, ...filteredSubArray);
          break;
        case 'Message':
          diagramElement = new Message(canvas, position, ...filteredSubArray);
          break;
        default:
          console.warn('Unknown diagram element type:', elementType);
      }

      if (diagramElement && activeBoxesArray.length > 0) {
        diagramElement.addActiveBoxes(activeBoxesArray);
      }
    }
  });
}

  

/**
 * Groups elements by id.
 * @param {Array} array 
 * @returns {Array}
 */
function groupById(array) {
  const map = new Map();
  array.forEach(item => {
    const key = item.id;
    const collection = map.get(key);
    if (!collection) {
      map.set(key, [item]);
    } else {
      collection.push(item);
    }
  });
  return [...map.values()];
}

/**
 * Loads JSON content from a file.
 * @returns {Object}
 */
async function loadJsonFromFile() {
  const options = {
    types: [{
      description: "JSON Files",
      accept: { "application/json": [".json"] }
    }],
    multiple: false
  };

  const [fileHandle] = await window.showOpenFilePicker(options);
  const file = await fileHandle.getFile();
  const content = await file.text();
  return JSON.parse(content);
}

/**
 * Saves JSON content to a file.
 * @param {string} json 
 * @param {string} [defaultFileName='sequential_diagram.json']
 */
async function saveJsonToFile(json, defaultFileName = 'sequential_diagram.json') {
  const options = {
    suggestedName: defaultFileName,
    types: [{
      description: "JSON Files",
      accept: { "application/json": [".json"] }
    }]
  };

  const fileHandle = await window.showSaveFilePicker(options);
  const writable = await fileHandle.createWritable();
  await writable.write(json);
  await writable.close();
}

document.addEventListener('DOMContentLoaded', () => {
  const canvasEl = document.getElementById('myCanvas');
  const canvasContainer = document.getElementById('canvas_container');
  const zoomContainer = document.getElementById('zoomContainer');
  const workspace = document.getElementById('workspace');

  let zoomLevel = 1;
  // Function to resize canvas
  function resizeCanvas() {
    const ratio = window.devicePixelRatio || 1;
    fabric.devicePixelRatio = ratio;

    const containerRect = canvasContainer.getBoundingClientRect();
    const width = containerRect.width;
    const height = containerRect.height;

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


  // Zoom with Ctrl + Mouse Wheel
  workspace.addEventListener('wheel', (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
      zoomLevel += e.deltaY * -0.001;
      zoomLevel = Math.min(Math.max(zoomLevel, 0.2), 4);
  
      // Set zoom and interaction transform
      canvas.setZoom(zoomLevel);
      canvas.setViewportTransform([zoomLevel, 0, 0, zoomLevel, 0, 0]);
  
      // Retina rendering adjustment
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
      //console.log('Zoom level set to', zoomLevel);
      //console.log('Canvas width:', canvas.getWidth());
      //console.log('Canvas height:', canvas.getHeight());
    }
  }, { passive: false });
  
});





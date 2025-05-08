import { createElementWithSnapshot } from './elementFactory.js';
import {
  DiagramElement,
  ClassWithLifeline,
  ActorWithLifeline,
  Note,
  CombinedFragment,
  Message
} from './elements/elementsUML.js';
import { exportCanvasFile, importCanvasFile } from './ImportExportManager.js';
import { undo, redo } from './snapshotManager.js';

/**
 * Binds dragend handlers to toolbar images.
 */
export function bindDragHandlers(canvas) {
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
 * Handles drop and creates appropriate diagram element.
 */
function handleDragEnd(event, objectType, canvas) {
  const cElement = document.getElementById('myCanvas');
  const rect = cElement.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
    const position = { x, y };
    const type = objectType.toLowerCase();

    switch (type) {
      case 'class':
        createElementWithSnapshot(ClassWithLifeline, canvas, position, null, null, null, 'Class');
        break;
      case 'actor':
        createElementWithSnapshot(ActorWithLifeline, canvas, position, null, null, null, 'User');
        break;
      case 'note':
        createElementWithSnapshot(Note, canvas, position);
        break;
      case 'message':
        createElementWithSnapshot(Message, canvas, position);
        break;
      case 'opt':
      case 'alt':
      case 'sd':
      case 'neg':
      case 'par':
      case 'loop':
      case 'critical':
      case 'ref':
        createElementWithSnapshot(CombinedFragment, canvas, position, null, null, null, type);
        break;
      default:
        console.warn(`Unknown diagram type: ${objectType}`);
    }
  } else {
    console.log('Dropped outside canvas.');
  }
}


/**
 * Binds navigation buttons to actions.
 */
export function bindNavigationHandlers(canvas) {
  document.getElementById('btnImportFile')?.addEventListener('click', () => importCanvasFile(canvas));
  document.getElementById('btnExportFile')?.addEventListener('click', () => exportCanvasFile(canvas));
  document.getElementById('btnSaveImage')?.addEventListener('click', () => saveCanvasAsImage(canvas));
  document.getElementById('btnUndo')?.addEventListener('click', () => undo(canvas));
  document.getElementById('btnRedo')?.addEventListener('click', () => redo(canvas));
  document.getElementById('btnClear')?.addEventListener('click', () => clearCanvas(canvas));
}

/**
 * Clears the canvas.
 */
function clearCanvas(canvas) {
  if (confirm("Are you sure you want to clear the canvas?")) {
    canvas.clear();
    // Clean up old diagram elements
    DiagramElement.allElements = [];
    canvas.renderAll();
  }
}

/**
 * Handles delete key for removing objects.
 */
export function handleKeyDown(e, canvas) {
  if (e.keyCode === 46) { // Delete
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
 * Exports canvas as image and downloads it.
 */
function saveCanvasAsImage(canvas) {
  const dataURL = canvas.toDataURL({
    format: 'png',
    enableRetinaScaling: true
  });
  downloadImage(dataURL, 'canvas_image.png');
}

/**
 * Triggers browser download.
 */
function downloadImage(dataURL, filename) {
  const a = document.createElement('a');
  a.href = dataURL;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

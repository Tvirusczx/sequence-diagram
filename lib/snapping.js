import DiagramElement from './elements/diagramElement.js';

const SNAP_THRESHOLD = 15;
let guideLines = [];

/**
 * Enables center-based snapping between DiagramElements.
 * @param {fabric.Canvas} canvas 
 */
export function enableSnapping(canvas) {
  canvas.on('object:moving', (e) => {
    const movingObject = e.target;
    const parentElement = findParentDiagramElement(movingObject);
    if (!parentElement || typeof parentElement.getSnapCenter !== 'function') return;

    if (parentElement.disableSnapping) return;
  
    const mainObject = parentElement.rect || parentElement.shape || movingObject;
    const movingCenter = parentElement.getSnapCenter();
  
    let snapped = false;
    let closestDx = null;
    let closestDy = null;
    let closestX = null;
    let closestY = null;
  
    // Prepare to update guide lines dynamically
    //clearGuideLines(canvas);
  
    DiagramElement.allElements.forEach(el => {
      if (
        el === parentElement ||
        typeof el.getSnapCenter !== 'function' ||
        el.disableSnapping
      ) {
        return;
      }
  
      const targetCenter = el.getSnapCenter();
      const dx = targetCenter.x - movingCenter.x;
      const dy = targetCenter.y - movingCenter.y;
  
      if (Math.abs(dx) < SNAP_THRESHOLD && (closestDx === null || Math.abs(dx) < Math.abs(closestDx))) {
        closestDx = dx;
        closestX = targetCenter.x;
      }
  
      if (Math.abs(dy) < SNAP_THRESHOLD && (closestDy === null || Math.abs(dy) < Math.abs(closestDy))) {
        closestDy = dy;
        closestY = targetCenter.y;
      }
    });
  
    if (closestDx !== null) {
      mainObject.left += closestDx;
      showGuideLine(canvas, 'v', closestX);
      snapped = true;
    }
  
    if (closestDy !== null) {
      mainObject.top += closestDy;
      showGuideLine(canvas, 'h', closestY);
      snapped = true;
    }
  
    if (!snapped) {
      clearGuideLines(canvas); // actively remove guide lines if no snap occurs this frame
    }
  
    if (snapped && typeof parentElement.updatePositions === 'function') {
      parentElement.updatePositions('rect');
    }
  
    canvas.requestRenderAll();
  });
  

  canvas.on('object:modified', () => {
    clearGuideLines(canvas);
  });
}

/**
 * Finds the parent DiagramElement of a fabric object.
 * @param {fabric.Object} object 
 * @returns {DiagramElement|null}
 */
function findParentDiagramElement(object) {
  for (const el of DiagramElement.allElements) {
    for (const key of el.componentsList) {
      if (el[key] === object) return el;
    }
  }
  return null;
}

/**
 * Draws a visual guide line (horizontal or vertical).
 * @param {fabric.Canvas} canvas 
 * @param {'h' | 'v'} orientation 
 * @param {number} position 
 */
function showGuideLine(canvas, orientation, position) {
  const line = new fabric.Line(
    orientation === 'v'
      ? [position, 0, position, canvas.height]
      : [0, position, canvas.width, position],
    {
      stroke: 'rgba(0, 122, 255, 0.6)',
      strokeWidth: 1,
      selectable: false,
      evented: false,
      excludeFromExport: true,
    }
  );
  guideLines.push(line);
  canvas.add(line);
}

/**
 * Removes all guide lines from canvas.
 * @param {fabric.Canvas} canvas 
 */
export function clearGuideLines(canvas) {
  guideLines.forEach(line => canvas.remove(line));
  guideLines = [];
}

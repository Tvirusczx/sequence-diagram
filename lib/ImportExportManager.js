import {
    DiagramElement,
    ClassWithLifeline,
    ActorWithLifeline,
    Note,
    CombinedFragment,
    Message
  } from './elements/elementsUML.js';


/**
 * Overrides the default Fabric.js object serialization behavior.
 * 
 * Adds custom diagram-related properties to each object's exported JSON:
 * - id, diagramElement, elementPart
 * - lockMovementX, lockMovementY, hasControls, selectable, padding, lineStartDistance
 * - controlsVisibility (manually appended)
 * 
 * Call this once during canvas initialization to ensure all relevant data
 * is preserved when exporting with `canvas.toJSON()` or `canvas.toObject()`.
 */
export function overrideToObjectSerialization() {
    const originalToObject = fabric.Object.prototype.toObject;
    fabric.Object.prototype.toObject = function (additionalProperties = []) {
      const properties = [
        'id', 'diagramElement', 'elementPart',
        'lockMovementX', 'lockMovementY', 'hasControls',
        'selectable', 'padding', 'lineStartDistance'
      ].concat(additionalProperties);
  
      const obj = originalToObject.call(this, properties);
      obj.controlsVisibility = this._controlsVisibility;
      return obj;
    };
  }
  

/**
 * Exports canvas as JSON string.
 * @param {fabric.Canvas} canvas 
 * @returns {string}
 */
export function exportCanvas(canvas) {
  DiagramElement.allElements.forEach(object => {
    object.addIdentificationToCanvasElements();
  });
  const json = JSON.stringify(canvas);
  //console.log(canvas.toObject());
  return json;
}

/**
 * Imports canvas from JSON string.
 * @param {string} json 
 * @param {fabric.Canvas} canvas 
 */
export function importCanvas(json, canvas) {
  canvas.loadFromJSON(json, () => {
    reconstructStructure(canvas, canvas.getObjects());
  });
}

/**
 * Exports canvas and prompts file save.
 * @param {fabric.Canvas} canvas 
 */
export async function exportCanvasFile(canvas) {
  DiagramElement.allElements.forEach(object => {
    object.addIdentificationToCanvasElements();
  });
  const json = JSON.stringify(canvas);
  await saveJsonToFile(json);
}

/**
 * Prompts user to select and load JSON file into canvas.
 * @param {fabric.Canvas} canvas 
 */
export async function importCanvasFile(canvas) {
  try {
    const jsonData = await loadJsonFromFile();
    if (typeof jsonData === 'object' && jsonData !== null) {
      canvas.loadFromJSON(jsonData, () => {
        reconstructStructure(canvas, canvas.getObjects());
      });
    } else {
      alert('Invalid JSON data. Unable to import.');
    }
  } catch (error) {
    alert('Selected file is invalid! Please provide a valid file.');
  }
}

/**
 * Prompts user to select and load a JSON file.
 * @returns {Object}
 */
export async function loadJsonFromFile() {
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
 * Prompts user to save a JSON string to file.
 * @param {string} json 
 * @param {string} [defaultFileName='sequential_diagram.json']
 */
export async function saveJsonToFile(json, defaultFileName = 'sequential_diagram.json') {
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

/**
 * Reconstructs canvas structure from fabric objects.
 * @param {fabric.Canvas} canvas 
 * @param {fabric.Object[]} fabricObjects 
 */
function reconstructStructure(canvas, fabricObjects) {
  const groupedElements = groupById(fabricObjects);

  groupedElements.forEach(subArray => {
    const activeBoxesArray = subArray.filter(item => item.elementPart === 'activeBox');
    const filteredSubArray = subArray.filter(item => item.elementPart !== 'activeBox');

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
 * Groups fabric objects by shared `id` value.
 * @param {fabric.Object[]} array 
 * @returns {fabric.Object[][]}
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

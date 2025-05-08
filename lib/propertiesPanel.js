import DiagramElement from './elements/diagramElement.js';
import { createSnapshot } from './snapshotManager.js';

// Custom light color palette for element fills
const LIGHT_COLOR_PALETTE = [
  { name: 'Light Blue', value: 'lightblue' },
  { name: 'Light Yellow', value: 'lightyellow' },
  { name: 'Lavender', value: 'lavender' },
  { name: 'Honeydew', value: 'honeydew' },
  { name: 'Misty Rose', value: 'mistyrose' },
  { name: 'Light Cyan', value: 'lightcyan' },
  { name: 'Peach Puff', value: 'peachpuff' },
  { name: 'Lemon Chiffon', value: 'lemonchiffon' },
];


/**
 * Initializes property panel event listeners for the canvas.
 * @param {fabric.Canvas} canvas 
 */
export function enablePropertiesPanel(canvas) {
  canvas.on('selection:created', e => updatePropertiesPanel(e.selected[0], canvas));
  canvas.on('selection:updated', e => updatePropertiesPanel(e.selected[0], canvas));
  canvas.on('selection:cleared', clearPropertiesPanel);
}

/**
 * Updates the properties panel based on the selected object.
 * @param {fabric.Object} selectedObject 
 * @param {fabric.Canvas} canvas 
 */
function updatePropertiesPanel(selectedObject, canvas) {
  const parent = DiagramElement.allElements.find(el =>
    el.componentsList.some(key => el[key] === selectedObject)
  );
  if (!parent || typeof parent.getEditableProperties !== 'function') return;

  const container = document.querySelector('.properties-content');
  container.innerHTML = '';

  const properties = parent.getEditableProperties();
  properties.forEach(prop => {
    const input = createLabeledInput(
      prop.label,
      prop.value,
      (value) => {
        parent.updateProperty(prop.key, value);
        canvas.requestRenderAll();
        createSnapshot(canvas);
      },
      prop.type,
      prop.options || []
    );
    container.appendChild(input);
  });
}


/**
 * Clears the properties panel to default state.
 */
function clearPropertiesPanel() {
  const container = document.querySelector('.properties-content');
  container.innerHTML = '<p>Select a diagram element to edit its properties.</p>';
}

/**
 * Creates a labeled input field for the properties panel.
 * @param {string} labelText - The label to display above the input.
 * @param {string|number} value - Initial value for the input.
 * @param {(value: string) => void} onChange - Callback for value change.
 * @param {string} [type='text'] - Type of the input: 'text', 'number', or 'color'.
 * @returns {HTMLElement}
 */
function createLabeledInput(labelText, value, onChange, type = 'text', options = []) {
  const wrapper = document.createElement('div');
  wrapper.style.marginBottom = '10px';

  const label = document.createElement('label');
  label.textContent = labelText;
  label.style.display = 'block';
  label.style.marginBottom = '4px';

  let input;

  if (type === 'color') {
    input = document.createElement('select');
    input.style.width = '100%';
    input.style.padding = '5px';
    input.style.border = '1px solid #ccc';
    input.style.borderRadius = '4px';

    const updateSelectColor = (colorValue) => {
      input.style.backgroundColor = colorValue;
      input.style.color = 'black';
    };

    LIGHT_COLOR_PALETTE.forEach(color => {
      const option = document.createElement('option');
      option.value = color.value;
      option.textContent = color.name;
      option.style.backgroundColor = color.value;
      option.style.color = 'black';
      if (color.value === value) {
        option.selected = true;
        updateSelectColor(color.value);
      }
      input.appendChild(option);
    });

    input.addEventListener('input', () => {
      updateSelectColor(input.value);
      onChange(input.value);
    });

  } else if (type === 'text') {
    input = document.createElement('textarea');
    input.value = value;
    input.rows = 4;
    input.style.width = '100%';
    input.style.padding = '6px';
    input.style.resize = 'vertical';
    input.style.border = '1px solid #ccc';
    input.style.borderRadius = '4px';
    input.addEventListener('input', () => onChange(input.value));
  
  } else if (type === 'select') {
    input = document.createElement('select');
    input.style.width = '100%';
    input.style.padding = '5px';
    input.style.border = '1px solid #ccc';
    input.style.borderRadius = '4px';
  
    options.forEach(opt => {
      const option = document.createElement('option');
      option.value = opt;
      option.textContent = opt.charAt(0).toUpperCase() + opt.slice(1);
      if (opt === value) option.selected = true;
      input.appendChild(option);
    });
  
    input.addEventListener('change', () => onChange(input.value));

  } else if (type === 'boolean') {
    input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = value;
    input.addEventListener('change', () => onChange(input.checked));
  } else {
    input = document.createElement('input');
    input.type = type;
    input.value = value;
    input.style.width = '100%';
    input.style.padding = '5px';
    input.style.border = '1px solid #ccc';
    input.style.borderRadius = '4px';
    input.addEventListener('input', () => onChange(input.value));
  }

  wrapper.appendChild(label);
  wrapper.appendChild(input);
  return wrapper;
}


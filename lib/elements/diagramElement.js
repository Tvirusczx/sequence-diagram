/**
 * The `DiagramElement` class represents basic diagram elements with a unique ID.
 * This class provides a foundation for more specific diagram elements, and it also
 * maintains a list of all its instances.
 */
export default class DiagramElement {

    /**
     * A static property that keeps track of the last used ID across all instances.
     * It's incremented every time a new instance of `DiagramElement` is created.
     * @type {number}
     */
    static lastID = 0;

    /**
     * A static array that stores all instances of the `DiagramElement` class.
     * Useful for operations that need to reference or manipulate all elements.
     * @type {Array<DiagramElement>}
     */
    static allElements = [];

    /**
     * Constructs a new `DiagramElement` object and assigns a unique ID to the instance.
     * The instance is then added to the `allElements` static array.
     */
    constructor() {
        this.elementId = ++DiagramElement.lastID; 
        DiagramElement.allElements.push(this);
        this.componentsList = [];
        /*
        if (isListeningToCreatingClass) {
            // Defers snapshot until after child constructor completes
            queueMicrotask(() => {
              createSnapshot();
            });
          }
        */
    }

    /**
     * A static method that retrieves all instances of the `DiagramElement` class.
     *
     * @returns {Array<DiagramElement>} - An array of all instances.
     */
    static getAllElements() {
        return DiagramElement.allElements;
    }

    addIdentificationToCanvasElements() {
        const className = this.constructor.name;
    
        for (let key of this.componentsList) {
            if (this[key]) {
                this[key].id = this.elementId;
                this[key].diagramElement = className;
                this[key].elementPart = key;
            }
        }
    }

    delete() {
        for (let key of this.componentsList) {
          if (this[key]) {
            this.canvas.remove(this[key]);
          }
        }

        // Remove from global list to avoid ghost snapping
        const index = DiagramElement.allElements.indexOf(this);
        if (index !== -1) {
            DiagramElement.allElements.splice(index, 1);
        }
    }
    
    /**
     * Returns the center point of the main visual component for snapping.
     * By default, uses `shape` if available.
     * 
     * @returns {{x: number, y: number}}
     */
    getSnapCenter() {
        if (this.shape) {
        return {
            x: this.shape.left + this.shape.width / 2,
            y: this.shape.top + this.shape.height / 2
        };
        }
        return { x: 0, y: 0 }; // fallback to origin
    }


    /**
 * Returns editable properties shared across all diagram elements.
 * Override in subclasses for custom behavior.
 */
getEditableProperties() {
    const props = [];
  
    if (this.text?.text !== undefined) {
      props.push({
        key: 'text',
        label: 'Label',
        type: 'text',
        value: this.text.text
      });
    }
  
    const shape = this.shape || this.rect;
    if (shape?.fill) {
      props.push({
        key: 'fill',
        label: 'Fill Color',
        type: 'color',
        value: shape.fill
      });
    }
  
    return props;
  }
  
  /**
   * Updates the element based on key/value from the property panel.
   * Can be extended in subclasses for custom fields.
   * @param {string} key 
   * @param {any} value 
   */
  updateProperty(key, value) {
    switch (key) {
      case 'text':
        if (this.text) this.text.set({ text: value });
        break;
      case 'fill':
        const shape = this.shape || this.rect;
        if (shape) shape.set({ fill: value });
        break;
    }
  
    this.rect?.canvas?.requestRenderAll();
  }
    
}

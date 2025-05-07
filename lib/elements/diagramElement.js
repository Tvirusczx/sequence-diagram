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
        this.conponentsList = [];
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
    
        for (let key of this.conponentsList) {
            if (this[key]) {
                this[key].id = this.elementId;
                this[key].diagramElement = className;
                this[key].elementPart = key;
            }
        }
    }

    delete(){
        for (let key of this.conponentsList) {
            if (this[key]) {
                canvas.remove(this[key]);
            }
        }
        delete this;
    }
    /**
    addObjectsToCanvas(canvas) {
        createSnapshot();
    }
    */
    
}

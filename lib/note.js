import DiagramElement from './diagramElement.js';
/**
 * Note class to create a sticky-note like diagram element with a folded corner.
 * 
 * @extends DiagramElement
 */

export default class Note extends DiagramElement{
    /**
     * @property {number} rectWidth - The width of the rectangle part of the note.
     * @property {number} rectHeight - The height of the rectangle part of the note.
     * @property {number} foldSize - The size of the folded corner of the note.
     */

    static rectWidth = 150;
    static rectHeight = 100;
    static foldSize = 20;

     /**
     * Constructs the Note object.
     *
     * @param {object} canvas - The canvas to draw on.
     * @param {object} position - The x and y position where the note starts.
     * @param {object} [rect=null] - The fabric rect object.
     * @param {object} [foldedCorner=null] - The fabric path object for the folded corner.
     * @param {object} [text=null] - The fabric textbox object for note text.
     */

    constructor(canvas, position , rect = null, foldedCorner = null, text = null) {
        super();
        this.conponentsList = ['text', 'rect', 'foldedCorner'];
        this.rect = rect;
        this.foldedCorner = foldedCorner;
        this.text = text;
        if (this.rect == null && this.foldedCorner == null && this.text== null) {
            this.createObjects(position);
            this.addObjectsToCanvas(canvas);
        }
        this.setControls();
        this.addEvents();
        this.addIdentificationToCanvasElements()
    }

    /**
     * Creates the fabric objects for the note: rectangle, folded corner, and text.
     *
     * @param {object} position - The x and y position where the note starts.
     */

    createObjects(position) {
        // Draw the rectangle
        this.rect= new fabric.Path(
        `M ${position.x} ${position.y} 
        L ${position.x + Note.rectWidth - Note.foldSize} ${position.y} 
        L ${position.x + Note.rectWidth} ${position.y + Note.foldSize} 
        L ${position.x + Note.rectWidth} ${position.y + Note.rectHeight} 
        L ${position.x} ${position.y + Note.rectHeight} Z`,

        {
            fill: 'lightblue',
            stroke: 'black',
            strokeUniform: true,
            lockScalingFlip: true,
        });

         // Draw the folded corner
        this.foldedCorner = new fabric.Path(
            `M ${position.x + Note.rectWidth - Note.foldSize} ${position.y}
            L ${position.x + Note.rectWidth - Note.foldSize} ${position.y + Note.foldSize} 
            L ${position.x + Note.rectWidth} ${position.y + Note.foldSize} 
            Z`, 
        {
            fill: 'white',
            stroke: 'black',
        });

        // Draw the text
        this.text = new fabric.Textbox('Tohle test poznámky', { 
            left: this.rect.left + 5,
            top: this.rect.top + 5,
            fontSize: 15,
            width: Note.rectWidth - 30,

            hasControls: false
        });
    }

    /**
     * Sets controls for the rect, like hiding the rotate control.
     */

    setControls(){
        this.rect.setControlsVisibility({
            mtr: false
        });
    }

     /**
     * Adds event listeners to the note, e.g., to handle movement and scaling.
     */
    
     addEvents() {
        this.rect.on('moving', () => this.updatePositions('rect'));
        this.rect.on('scaling', () => this.updatePositions('rect'));
    
        this.text.on('moving', () => this.updatePositions('text'));
    }

    /**
     * Updates the position and dimensions of the note's elements 
     * based on changes in the rectangle's or text's position.
     * 
     * @param {string} from - 'rect' if the rectangle moved, 'text' if the text moved
     */
    updatePositions(from) {
        const canvas = this.rect.canvas;
        const MIN_WIDTH = 75;
        const MIN_HEIGHT = 50;

    
        if (!canvas) {
            console.error('Canvas not found on rect.');
            return;
        }
    
        // Enforce minimum dimensions
        const currentWidth = this.rect.width * this.rect.scaleX;
        const currentHeight = this.rect.height * this.rect.scaleY;
    
        if (currentWidth < MIN_WIDTH) {
            this.rect.scaleX = MIN_WIDTH / this.rect.width;
        }
    
        if (currentHeight < MIN_HEIGHT) {
            this.rect.scaleY = MIN_HEIGHT / this.rect.height;
        }
    
        if (from === 'text') {
            // Move rectangle to follow text
            this.rect.set({
                left: this.text.left - 5,
                top: this.text.top - 5
            });
            this.rect.setCoords();
        } else {
            // Default: move text to follow rectangle
            this.text.set({
                left: this.rect.left + 5,
                top: this.rect.top + 5
            });
            this.text.setCoords();
        }
    
        // Update folded corner position
        this.foldedCorner.set({
            left: this.rect.left + (Note.rectWidth * this.rect.scaleX) - Note.foldSize,
            top: this.rect.top
        });
    
        // Update path manually
        this.rect.path[1][1] = this.rect.path[0][1] + Note.rectWidth - (Note.foldSize / this.rect.scaleX);
        this.rect.path[1][2] = this.rect.path[0][2];
        this.rect.path[2][1] = this.rect.path[0][1] + Note.rectWidth;
        this.rect.path[2][2] = this.rect.path[0][2] + (Note.foldSize / this.rect.scaleY);
    
        canvas.renderAll();
    }
    

    

    /**
     * Adds the fabric objects (rectangle, folded corner, and text) to the canvas.
     *
     * @param {object} canvas - The canvas to add the objects to.
     */

    addObjectsToCanvas(canvas) {
        canvas.add(this.rect, this.foldedCorner, this.text);
    }
}
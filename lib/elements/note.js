import DiagramElement from './diagramElement.js';
/**
 * Note class to create a sticky-note like diagram element with a folded corner.
 * 
 * @extends DiagramElement
 */

export default class Note extends DiagramElement{
    /**
     * @property {number} defaultRectWidth - The default width for the rectangle part of a note. Used when creating new instances.
     * @property {number} defaultRectHeight - The default height for the rectangle part of a note. Used when creating new instances.
     * @property {number} defaultFoldSize - The default size of the folded corner. Used when creating new instances.
     */

    static defaultRectWidth = 150;
    static defaultRectHeight = 100;
    static defaultFoldSize = 20;

     /**
     * Constructs the Note object.
     *
     * @param {object} canvas - The canvas to draw on.
     * @param {object} position - The x and y position where the note starts.
     * @param {object} [rect=null] - The fabric rect object.
     * @param {object} [foldedCorner=null] - The fabric path object for the folded corner.
     * @param {object} [text=null] - The fabric textbox object for note text.
     */

     constructor(canvas, position, rect = null, foldedCorner = null, text = null) {
        super();
    
        // Instance-specific values initialized from static defaults
        this.rectWidth = Note.defaultRectWidth;
        this.rectHeight = Note.defaultRectHeight;
        this.foldSize = Note.defaultFoldSize;

        this.canvas = canvas;
        this.componentsList = ['text', 'rect', 'foldedCorner'];
        this.rect = rect;
        this.foldedCorner = foldedCorner;
        this.text = text;
        this.disableSnapping = true;
    
        if (!this.rect && !this.foldedCorner && !this.text) {
          this.createObjects(position);
          this.addObjectsToCanvas(canvas);
        }
    
        this.setControls();
        this.addEvents();
        this.addIdentificationToCanvasElements();
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
        L ${position.x + this.rectWidth - this.foldSize} ${position.y} 
        L ${position.x + this.rectWidth} ${position.y + this.foldSize} 
        L ${position.x + this.rectWidth} ${position.y + this.rectHeight} 
        L ${position.x} ${position.y + this.rectHeight} Z`,

        {
            fill: 'lightblue',
            stroke: 'black',
            strokeUniform: true,
            lockScalingFlip: true,
            hasControls: false
        });

         // Draw the folded corner
        this.foldedCorner = new fabric.Path(
            `M ${position.x + this.rectWidth - this.foldSize} ${position.y}
            L ${position.x + this.rectWidth - this.foldSize} ${position.y + this.foldSize} 
            L ${position.x + this.rectWidth} ${position.y + this.foldSize} 
            Z`, 
        {
            fill: 'white',
            stroke: 'black',
            hasControls: false,
            selectable: false
        });

        // Draw the text
        this.text = new fabric.Textbox('Tohle test poznámky', { 
            left: this.rect.left + 5,
            top: this.rect.top + 5,
            fontSize: 15,
            width: this.rectWidth - 30,
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
    
        this.text.on('changed', () => this.updateSizeFromText());
    }



    updateSizeFromText() {
        const text = this.text.text.trim();
        const ctx = this.text.canvas.getContext();
    
        ctx.font = `${this.text.fontSize}px ${this.text.fontFamily}`;
    
        const lines = text.split('\n');
        let maxLineWidth = 0;
        for (const line of lines) {
            const lineWidth = ctx.measureText(line).width;
            if (lineWidth > maxLineWidth) {
                maxLineWidth = lineWidth;
            }
        }
    
        const PADDING = 10;
        const MIN_WIDTH = 80;
        const newWidth = Math.max(maxLineWidth + PADDING, MIN_WIDTH);
    
        this.text.set({ width: newWidth });
        this.text.initDimensions();
    
        const textHeight = this.text.height;
        const rectWidth = newWidth + 20;
        const rectHeight = textHeight + 10;
    
        this.rectWidth = rectWidth;
        this.rectHeight = rectHeight;
    
        this.updatePositions('text');
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
            left: this.rect.left + (this.rectWidth * this.rect.scaleX) - this.foldSize,
            top: this.rect.top
        });
        
        // Update path manually
        this.rect.path[1][1] = this.rect.path[0][1] + this.rectWidth - (this.foldSize / this.rect.scaleX);  //make corrner stay same size
        this.rect.path[1][2] = this.rect.path[0][2];
        this.rect.path[2][1] = this.rect.path[0][1] + this.rectWidth;
        this.rect.path[2][2] = this.rect.path[0][2] + (this.foldSize / this.rect.scaleY);
        this.rect.path[3][1] = this.rect.path[0][1] + this.rectWidth;
        this.rect.path[3][2] = this.rect.path[0][2] + this.rectHeight;
        this.rect.path[4][2] = this.rect.path[1][2] + this.rectHeight;
        //console.log(this.rect.getBoundingRect());
        
        // For change of selectable area
        this.rect.set({
            dirty: true
          });
        this.rect.setCoords();
        
        canvas.renderAll();
    }
    

    fromFabricObjects() {
        if (this.rect) {
          this.rectWidth = this.rect.width * this.rect.scaleX;
          this.rectHeight = this.rect.height * this.rect.scaleY;
        }
      }

    /**
     * Adds the fabric objects (rectangle, folded corner, and text) to the canvas.
     *
     * @param {object} canvas - The canvas to add the objects to.
     */

    addObjectsToCanvas(canvas) {
        canvas.add(this.rect, this.foldedCorner, this.text);
    }

    
    /**
     * Returns the center point of the Note element for snapping logic.
     * Uses instance-specific rectWidth and rectHeight rather than scaled fabric dimensions.
     * 
     * @returns {{x: number, y: number}}
     */
    getSnapCenter() {
        return {
            x: this.rect.left + (this.rectWidth / 2),
            y: this.rect.top + (this.rectHeight / 2)
        };
    }


    /**
     * Returns editable properties for the Note.
     * These will be used in the properties panel.
     */
    getEditableProperties() {
        return [
        { key: 'text', label: 'Note Text', type: 'text', value: this.text.text },
        { key: 'fill', label: 'Fill Color', type: 'color', value: this.rect.fill },
        ];
    }
    
    /**
     * Updates the Note element with the given property key and value.
     * @param {string} key 
     * @param {any} value 
     */
    updateProperty(key, value) {
        switch (key) {
            case 'text':
                this.text.set({ text: value });
                this.updateSizeFromText(); // trigger dynamic resizing
                break;
            case 'fill':
                this.rect.set({ fill: value });
                break;
        }
        this.rect.canvas.requestRenderAll();
    }

}
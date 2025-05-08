import DiagramElement from './diagramElement.js';
/**
 * ElementWithLifeline class represents diagram elements with lifelines.
 * 
 * @extends DiagramElement
 */
export default class ElementWithLifeline extends DiagramElement {

    /**
     * Constructs the ElementWithLifeline object.
     *
     * @param {object} canvas - The canvas on which the element is drawn.
     * @param {object} position - Initial position of the element.
     * @param {fabric.Object} [shape=null] - Visual representation of the element.
     * @param {fabric.Textbox} [text=null] - Text label associated with the element.
     * @param {fabric.Line} [line=null] - Lifeline representation of the element.
     * @param {string} [label=null] - Label for the element.
     */
    constructor(canvas, position, shape = null, text = null, line = null, label = null){
        super();
        this.componentsList = ['shape', 'line', 'text'];
        this.canvas = canvas;
        this.label = label;
        this.position = position;
        this.activeBoxes = [];
        this.shape = shape;
        this.text = text;
        this.line = line;
        this.destroy = false;
        this.destroyMarker = null;
        if (this.shape == null && this.text== null && this.line== null) {
           this.createObjects();
           this.addObjectsToCanvas();
        }

        this.attachEvents();
        this.addLineHeight();
        this.addIdentificationToCanvasElements();
    }

    /**
     * Adds the height of the lifeline to the class.
     */
    addLineHeight()
    {
        this.lineHeight = this.line.y2 - this.line.y1;
    }

    /**
     * Creates the visual shape for class representation.
     * (Should be implemented with specific drawing logic.)
     */
    createShape(){
    }

    /**
     * Creates the label for the element using a fabric textbox.
     */
    createLabel(){
        this.text = new fabric.Textbox(this.label, {
            left: this.position.x,
            top: this.shape.top + this.shape.height + 5,
            width: this.shape.width,
            fontSize: 15,
            underline: true,
            textAlign: 'center',
            lockScalingX: true,
            lockScalingY: true,
            hasControls: false,
            hasBorders: false
        });
        this.centerText();

    }

    /**
     * Creates the visual representation of the lifeline.
     * (Should be implemented with specific drawing logic.)
     */
    createLifeline(){ 
    }

    /**
     * Creates all visual elements associated with the object.
     */
    createObjects() {
        this.createShape();
        this.createLabel();
        this.createLifeline();
    }

    createDestroyMarker() {
        const x = this.line.x2;
        const y = this.line.y2 + 5; // pár pixelů pod konec lifeliny
        const size = 10;
    
        const line1 = new fabric.Line([x - size / 2, y - size / 2, x + size / 2, y + size / 2], {
            stroke: 'red',
            strokeWidth: 2,
            selectable: false,
            evented: false
        });
    
        const line2 = new fabric.Line([x - size / 2, y + size / 2, x + size / 2, y - size / 2], {
            stroke: 'red',
            strokeWidth: 2,
            selectable: false,
            evented: false
        });
    
        this.destroyMarker = new fabric.Group([line1, line2], {
            left: x,
            top: y,
            selectable: false,
            evented: false
        });
    
        this.canvas.add(this.destroyMarker);
        this.destroyMarker.sendToBack();
    }

    /**
     * Modifies the visual appearance of the lifeline when hovered.
     *
     * @param {string} colour - The color to change to on hover.
     */
    lineHoverEffect(colour){
        this.line.set({stroke:colour})
        this.canvas.renderAll();
    }

    /**
     * Creates an "active" box on the lifeline at the given vertical position.
     *
     * @param {number} y - Vertical position on the lifeline to create the box.
     */
    createActivBox(y) {
        const lineEndY = this.line.top + this.line.height * this.line.scaleY;
        const forbiddenZoneStart = lineEndY - 30;
    
        if (y >= forbiddenZoneStart) {
            console.warn('Cannot create activation box in the last 30px of the lifeline.');
            return;
        }
    
        const invertedTransform = fabric.util.invertTransform(this.canvas.viewportTransform);
        const canvasY = fabric.util.transformPoint({ x: 0, y: y }, invertedTransform).y;
        const lineCenterX = this.line.left + this.line.width / 2;
    
        const box = new fabric.Rect({
            left: lineCenterX - 9,
            top: canvasY,
            fill: this.getBoxFill(),
            stroke: 'black',
            strokeWidth: 1.5,
            strokeUniform: true,
            width: 18,
            height: 25,
            lockScalingY: false,
            lockMovementX: true,
            lineStartDistance: canvasY - this.line.top
        });
    
        box.setControlsVisibility({
            mt: true, mb: true, ml: false, mr: false, bl: false, br: false, tl: false, tr: false, mtr: false
        });
    
        box.on('modified', () => box.lineStartDistance = box.top - this.line.top);
        box.on('moving', () => box.lineStartDistance = box.top - this.line.top);
    
        this.canvas.add(box);
        this.canvas.renderAll();
        this.activeBoxes.push(box);
    }
    

    /**
     * Configures the draggable functionality of all "active" boxes on the lifeline.
     */
    setBoxFuncionality() {
        this.activeBoxes.forEach(box => {
            box.setControlsVisibility({
                mt: true, mb: true, ml: false, mr: false, bl: false, br: false, tl: false, tr: false, mtr: false
            });
    
            box.on('modified', () => box.lineStartDistance = box.top - this.line.y1);
            box.on('moving', () => box.lineStartDistance = box.top - this.line.y1);
        });
    }

    /**
     * Centers the text within the visual shape.
     */
    centerText() {

    }

    /**
     * Sets up the draggable controls for the bottom edge of the lifeline.
     */
    setupLineControls() {
        this.line.setControlsVisibility({
            mt: false, mb: true, ml: false, mr: false, bl: false, br: false, tl: false, tr: false, mtr: false
        });
    }

    /**
     * Updates the appearance of the lifeline (like dashed patterns).
     */
    updateLine(){
        let scale = this.line.scaleY
        this.line.set({
        strokeDashArray: [5/scale, 5/scale],// overcome stretching of line stripes
        }); 
    }

     /**
     * Updates the position and dimensions of associated elements due to movements.
     *
     * @param {string} from - Represents the source of the movement.
     */
    updatePositions(from) {
        if (this.destroy) {
            this.updateDestroyMarker();
        }
    }

    /**
     * Attaches event handlers for movement updates to the shape and text.
     */
    attachEvents() {
        
    }

     /**
     * Adds the created visual elements to the canvas.
     */
    addObjectsToCanvas() {
        this.canvas.add(this.shape, this.text, this.line);
    }

    /**
     * Adds identification properties to the shape, text, lifeline, and "active" boxes.
     */
    addIdentificationToCanvasElements() {
        super.addIdentificationToCanvasElements();
        this.addIdentificationToActiveBoxes();
    }
     /**
     * Appends identification properties to the "active" boxes.
     */
    addIdentificationToActiveBoxes(){
        const className = this.constructor.name;
         // Logic for activeBoxes
         if (this.activeBoxes && Array.isArray(this.activeBoxes)) {
            for (let box of this.activeBoxes) {
                box.id = this.elementId;
                box.diagramElement = className;
                box.elementPart = "activeBox";  // Using a generic "activeBox" value here
            }
        }
    }

    delete() {
        if (this.activeBoxes && Array.isArray(this.activeBoxes)) {
            for (let box of this.activeBoxes) {
                this.canvas.remove(box);  // ✅ fix applied here
            }
        }
        if (this.destroyMarker) {
            this.canvas.remove(this.destroyMarker);
        }
        super.delete();
    }
    
    
     /**
     * Adds a set of "active" boxes to the element.
     *
     * @param {Array<fabric.Rect>} [array=[]] - List of "active" boxes to be added.
     */
    addActiveBoxes(array = []){
        this.activeBoxes = array
    }

    updateActiveBoxesColor() {
        const fillColor = this.getBoxFill() || 'lightblue';
        this.activeBoxes.forEach(box => {
            box.set({ fill: fillColor });
        });
        this.canvas.requestRenderAll();
    }

    getBoxFill() {
        return this.shape.fill || 'lightblue';
    }

    updateDestroyMarker() {
        if (this.destroy) {
            if (!this.destroyMarker) {
                this.createDestroyMarker();
            } else {
                const x = this.line.x2;
                const y = this.line.y2 + 5;
                this.destroyMarker.set({ left: x, top: y });
                this.destroyMarker.setCoords();
            }
        } else if (this.destroyMarker) {
            this.canvas.remove(this.destroyMarker);
            this.destroyMarker = null;
        }
        this.canvas.renderAll();
    }
    updateProperty(key, value) {
        switch (key) {
          case 'destroy':
            this.destroy = value === true || value === 'true';
            this.updateDestroyMarker();
            break;
          default:
            break;
        }
        this.canvas.requestRenderAll();
    }
    getEditableProperties() {
        return [
          {
            key: 'destroy',
            label: 'Destroy Marker',
            type: 'boolean',
            value: this.destroy
          }
        ];
    }
}
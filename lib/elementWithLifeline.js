/**
 * ElementWithLifeline class represents diagram elements with lifelines.
 * 
 * @extends DiagramElement
 */
class ElementWithLifeline extends DiagramElement {

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
        this.canvas = canvas;
        this.label = label;
        this.position = position;
        this.activeBoxes = [];
        this.shape = shape;
        this.text = text;
        this.line = line;
        if (this.shape == null && this.text== null && this.line== null) {
           this.createObjects();
           this.addObjectsToCanvas();
        }

        this.attachEvents();
        this.addLineHeight();
        this.addIdentificationToCanvasElements();
        if(isLiseningToCreatingClass){
            createSnapshot();    
        } 
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
    createActivBox(y){
        var box = new fabric.Rect({
            left: this.line.x1-9,
            top: y,
            fill: 'lightblue',
            stroke: 'black',
            strokeWidth: 1.5,
            strokeUniform: true,
            width: 18,
            height: 25,
            lockScalingY: false,
            lockMovementX: true,
            lineStartDistance: y - this.line.y1
        });
        
        box.setControlsVisibility({
            mt: true, mb: true, ml: false, mr: false, bl: false, br: false, tl: false, tr: false, mtr: false
        });

        box.on('modified',() => box.lineStartDistance = box.top - this.line.y1);
        box.on('moving',() => box.lineStartDistance = box.top - this.line.y1);
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
        const className = this.constructor.name;
    
        // Existing logic for shape, line, and text
        for (let key of ['shape', 'line', 'text']) {
            if (this[key]) {
                this[key].id = this.elementId;
                this[key].diagramElement = className;
                this[key].elementPart = key;
            }
        }
        this.addIdentificationToActiveBoxes()
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


    delete(){
        for (let key of ['shape', 'line', 'text']) {
            if (this[key]) {
                canvas.remove(this[key]);
            }
        }

        if (this.activeBoxes && Array.isArray(this.activeBoxes)) {
            for (let box of this.activeBoxes) {
                canvas.remove(box);
            }
        }

        delete this;
    }
    
    
     /**
     * Adds a set of "active" boxes to the element.
     *
     * @param {Array<fabric.Rect>} [array=[]] - List of "active" boxes to be added.
     */
    addActiveBoxes(array = []){
        this.activeBoxes = array
    }
}
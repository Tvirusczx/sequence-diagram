class ElementWithLifeline extends DiagramElement {
    constructor(canvas, label, position) {
        super();
        this.canvas = canvas;
        this.label = label;
        this.position = position;
        this.activeBoxes = [];

        this.createObjects();
        this.attachEvents();
        this.addObjectsToCanvas();
        this.addLineHeight()
    }
    addLineHeight()
    {
        this.lineHeight = this.line.y2 - this.line.y1;
    }
    // Create rectangle for class representation
    createShape(){
    }
    // Create text for label
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
    // Create dashed line (lifeline)
    createLifeline(){
        this.line = new fabric.Line([this.shape.left + this.shape.width / 2, this.text.top + this.text.height + 10, this.shape.left + this.shape.width / 2, this.canvas.height], {
            strokeDashArray: [5, 5],
            stroke: 'black',
            strokeWidth: 2,
            lockMovementX: true,
            lockMovementY: true
        });
        this.setupLineControls();
    }
    //Create all visual elements: shape, text, and lifeline.
    createObjects() {
        this.createShape();
        this.createLabel();
        this.createLifeline();
    }

    lineHoverEffect(colour){
        this.line.set({stroke:colour})
        this.canvas.renderAll();
    }

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
        this.activeBoxes.push(box)

    }

    //Center the text within the rectangle.
    centerText() {

    }

    //Set up the draggable controls for the lifeline's bottom edge.
    setupLineControls() {
        this.line.setControlsVisibility({
            mt: false, mb: true, ml: false, mr: false, bl: false, br: false, tl: false, tr: false, mtr: false
        });
    }
    updateLine(){
        let scale = this.line.scaleY
        this.line.set({
        strokeDashArray: [5/scale, 5/scale],// overcome stretching of line stripes
        }); 
    }

    //Update positions of elements based on movements.
    updatePositions(from) {
    }
    // Attach event handlers to the shape and text for movement updates.
    attachEvents() {
        
    }

     //Add visual elements (shape, text, lifeline) to the canvas.
    addObjectsToCanvas() {
        this.canvas.add(this.shape, this.text, this.line);
    }
}
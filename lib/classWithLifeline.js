class ClassWithLifeline extends ElementWithLifeline {
    constructor(canvas, position, shape , text , line ) {
        super(canvas, position, shape , text , line );
    }
    // Create rectangle for class representation
    createShape(){
        this.shape = new fabric.Rect({
            left: this.position.x,
            top: this.position.y,
            fill: 'lightblue',
            stroke: 'black',
            strokeWidth: 2,
            width: 200,
            height: 50,
            lockScalingX: true,
            lockScalingY: true,
            hasControls: false
        });

    }

    // Create dashed line (lifeline)
    createLifeline(){
        this.line = new fabric.Line([this.shape.left + this.shape.width / 2, this.shape.top + this.shape.height, this.shape.left + this.shape.width / 2, this.canvas.height], {
            strokeDashArray: [5, 5],
            stroke: 'black',
            strokeWidth: 2,
            lockMovementX: true,
            lockMovementY: true
        });
        this.setupLineControls();
    }
  
    //Center the text within the rectangle.
    centerText() {
        this.text.set({
            left: this.shape.left + this.shape.width / 2 - this.text.width / 2,
            top: this.shape.top + 2
        });
    }

    //Update positions of elements based on movements.
    updatePositions(from) {
        
        if (from === 'text') {
            this.shape.set({
                left: this.text.left,
                top: this.text.top - 2
            });
            this.shape.setCoords(); // Update shape's coordinates after changing its position
        } else {
            this.centerText();
            this.text.setCoords(); // Update text's coordinates after changing its position
        }

        // Update the line position
        this.line.set({
            x1: this.shape.left + this.shape.width / 2,
            y1: this.shape.top + this.shape.height,
            x2: this.shape.left + this.shape.width / 2,
            y2: this.shape.top + this.shape.height + this.lineHeight
        });
        this.line.setCoords(); // Update line's coordinates after changing its position

        for (let box of this.activeBoxes) {
            box.set({
                left: this.line.x1 - 9,
                top: this.line.y1 + box.lineStartDistance
            });

        
            box.setCoords();
        }

        this.canvas.renderAll();
    }

    // Attach event handlers to the shape and text for movement updates.
    attachEvents() {
        this.shape.on('moving', () => this.updatePositions('rect'));
        this.text.on('moving', () => this.updatePositions('text'));
        this.line.on('scaling', () => this.updateLine());

        this.line.on('mouseover',() => this.lineHoverEffect('blue'));
        this.line.on('mouseout',() => this.lineHoverEffect('black'));

        this.line.on('mousedown',(options) => this.createActivBox(options.pointer.y));
    }
}
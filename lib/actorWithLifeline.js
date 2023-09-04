class ActorWithLifeline extends ElementWithLifeline{
    constructor(canvas, position, shape , text , line , label) {
        super(canvas, position, shape , text , line , label);
    }
    // Create stickman for actor representation
    createShape(){
        const scaleFactor = 0.7; // Factor for 70% reduction

        // Adjust head's radius by scaleFactor
        const head = new fabric.Circle({
            radius: 20 * scaleFactor, 
            stroke: 'black',
            strokeWidth: 2.5,
            fill: 'lightblue',
            left: this.position.x - (20 * scaleFactor),
            top: this.position.y
        });

        // Adjust body's length by scaleFactor
        const body = new fabric.Line([this.position.x, this.position.y + (40 * scaleFactor), this.position.x, this.position.y + (102.5 * scaleFactor)], {
            stroke: 'black',
            strokeWidth: 3.5
        });

        // Adjust legs by scaleFactor
        const leftLeg = new fabric.Line([this.position.x, this.position.y + (100 * scaleFactor), this.position.x - (25 * scaleFactor), this.position.y + (150 * scaleFactor)], {
            stroke: 'black',
            strokeWidth: 3.5
        });

        const rightLeg = new fabric.Line([this.position.x, this.position.y + (100 * scaleFactor), this.position.x + (25 * scaleFactor), this.position.y + (150 * scaleFactor)], {
            stroke: 'black',
            strokeWidth: 3.5
        });

        // Adjust arms by scaleFactor
        const leftArm = new fabric.Line([this.position.x, this.position.y + (50 * scaleFactor), this.position.x - (25 * scaleFactor), this.position.y + (75 * scaleFactor)], {
            stroke: 'black',
            strokeWidth: 3.5
        });

        const rightArm = new fabric.Line([this.position.x, this.position.y + (50 * scaleFactor), this.position.x + (25 * scaleFactor), this.position.y + (75 * scaleFactor)], {
            stroke: 'black',
            strokeWidth: 3.5
        });

        this.shape = new fabric.Group([head, body, leftLeg, rightLeg, leftArm, rightArm], {
            left: this.position.x,
            top: this.position.y,
            lockScalingX: true,
            lockScalingY: true,
            hasControls: false
        });

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
   
    //Center the text within the rectangle.
    centerText() {
        this.text.set({
            left: this.shape.left + this.shape.width / 2 - this.text.width / 2
        });
    }

    //Update positions of elements based on movements.
    updatePositions() {
        this.text.set({ top: this.shape.top + this.shape.height + 5 });
        this.centerText();
        this.text.setCoords();

        // Update the line position
        this.line.set({
            x1: this.shape.left + this.shape.width / 2,
            y1: this.text.top + this.text.height + 10,
            x2: this.shape.left + this.shape.width / 2,
            y2: this.text.top + this.text.height + this.lineHeight + 10
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
        this.shape.on('moving', () => this.updatePositions());
        this.line.on('scaling', () => this.updateLine());
        this.text.on('moving', () => this.updatePositions());

        this.line.on('mouseover',() => this.lineHoverEffect('blue'));
        this.line.on('mouseout',() => this.lineHoverEffect('black'));

        this.line.on('mousedown',(options) => this.createActivBox(options.pointer.y));
    }
}
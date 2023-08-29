class ClassWithLifeline {
    constructor(canvas, className, position) {
        this.canvas = canvas;
        this.className = className;
        this.position = position;
        this.activeBox = [];

        this.createObjects();
        this.lineHeight = this.line.y2 - this.line.y1;
        this.attachEvents();
        this.addObjectsToCanvas();
    }

    //Create all visual elements: rectangle, text, and lifeline.
    createObjects() {
        // Create rectangle for class representation
        this.rect = new fabric.Rect({
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

        // Create text for class name
        this.text = new fabric.Textbox(this.className, {
            left: this.position.x,
            top: this.position.y,
            width: 200,
            fontSize: 15,
            underline: true,
            textAlign: 'center',
            lockScalingX: true,
            lockScalingY: true,
            hasControls: false,
            hasBorders: false
        });
        this.centerText();

        // Create dashed line (lifeline)
        this.line = new fabric.Line([this.rect.left + this.rect.width / 2, this.rect.top + this.rect.height, this.rect.left + this.rect.width / 2, this.canvas.height], {
            strokeDashArray: [5, 5],
            stroke: 'black',
            strokeWidth: 2,
            lockMovementX: true,
            lockMovementY: true,
            padding: 20
        });
        this.setupLineControls();
    }

   

    addActiveBox (y1, y2){
        this.rect = new fabric.Rect({
            left: this.position.x,
            top: this.position.y,
            fill: 'lightblue',
            stroke: 'black',
            strokeWidth: 1.5,
            width: 20,
            height: 10,
            lockScalingY: true
        });
        this.activeBox.push(box)
    }

    lineHoverEffect(colour){
        this.line.set({stroke:colour})
        this.canvas.renderAll();
    }

    //Center the class name text within the rectangle.
    centerText() {
        this.text.set({
            left: this.rect.left + this.rect.width / 2 - this.text.width / 2,
            top: this.rect.top + 2
        });
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
        
        if (from === 'text') {
            this.rect.set({
                left: this.text.left,
                top: this.text.top - 2
            });
            this.rect.setCoords(); // Update rect's coordinates after changing its position
        } else {
            this.centerText();
            this.text.setCoords(); // Update text's coordinates after changing its position
        }

        // Update the line position
        this.line.set({
            x1: this.rect.left + this.rect.width / 2,
            y1: this.rect.top + this.rect.height,
            x2: this.rect.left + this.rect.width / 2,
            y2: this.rect.top + this.rect.height + this.lineHeight
        });
        this.line.setCoords(); // Update line's coordinates after changing its position
        this.canvas.renderAll();
    }

    // Attach event handlers to the rectangle and text for movement updates.
    attachEvents() {
        this.rect.on('moving', () => this.updatePositions('rect'));
        this.text.on('moving', () => this.updatePositions('text'));
        this.line.on('scaling', () => this.updateLine());
        this.line.on('mouseover',() => this.lineHoverEffect('blue'));
        this.line.on('mouseout',() => this.lineHoverEffect('black'));
    }

     //Add visual elements (rectangle, text, lifeline) to the canvas.
    addObjectsToCanvas() {
        this.canvas.add(this.rect, this.text, this.line);
    }
}
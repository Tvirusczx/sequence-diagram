/**
 * Message class to create a diagram message element with an arrow tip.
 * 
 * @extends DiagramElement
 */

class Message extends DiagramElement {
    /**
     * Constructs the Message object.
     *
     * @param {object} canvas - The canvas to draw on.
     * @param {object} position - The starting x and y position of the message.
     * @param {object} [text=null] - The fabric textbox object for the message text.
     * @param {object} [line=null] - The fabric line object representing the arrow's shaft.
     * @param {object} [arrowTip=null] - The fabric triangle object representing the arrow tip.
     */
    constructor(canvas, position, text = null, line = null, arrowTip = null) {
        super();
        this.canvas = canvas;
        this.position1 = position;
        this.position2 = { x: this.position1.x + 200, y: this.position1.y };
        this.line = line;
        this.arrowTip = arrowTip;
        this.text = text;
        if (this.line == null && this.arrowTip == null && this.text== null) {
            this.createObjects();
            this.addObjectsToCanvas();
        }
        this.setControls();
        this.addEvents();
        this.addIdentificationToCanvasElements();
        if(isLiseningToCreatingClass){
            createSnapshot();    
        }
    }

    /**
     * Sets controls visibility for the arrow's shaft (line), hides most of the controls and leaves only left and right.
     */
    setControls(){
        this.line.setControlsVisibility({
            mt: false, mb: false, ml: true, mr: true, bl: false, br: false, tl: false, tr: false, mtr: false
        });
    }

    /**
     * Creates the fabric objects for the message: arrow's shaft (line), arrow tip, and the associated text.
     */
    createObjects() {
        // Draw the line
        this.line = new fabric.Line([this.position1.x, this.position1.y, this.position2.x, this.position2.y], {
            stroke: 'black',
            strokeWidth: 2,
            padding: 10
        });

    

        // Calculate angle for the arrow tip
        let angle = Math.atan2(this.position2.y - this.position1.y, this.position2.x - this.position1.x) * (180 / Math.PI);

        // Draw the arrow tip
        this.arrowTip = new fabric.Triangle({
            originX: 'center',     // Add these two lines to set the origin to the center
            originY: 'center',     // of the triangle. This will help in centering the triangle on the line end.
            left: this.position2.x,
            top: this.position2.y,
            width: 20,
            height: 20,
            fill: 'black',
            angle: angle + 90,
            lockMovementX: true,
            lockMovementY: true,
            hasControls: false ,
            selectable: false 
        });


        // Draw the text
        this.text = new fabric.Textbox('text', { 
            left: this.position1.x + 50,
            top: this.position1.y + 10,
            fontSize: 15,
            width: 100,
            lockMovementX: true,
            lockMovementY: true,
            hasControls: false,
            textAlign: "center"
        });
    }

     /**
     * Adds event listeners to the arrow's shaft (line), e.g., to handle movement and scaling.
     */
    addEvents() {
        this.line.on('moving', () => this.updatePositions());
        this.line.on('scaling', () => this.updatePositions());
    }

    /**
     * Updates the position and dimensions of the message's elements based on changes 
     * in the arrow's shaft (line) position or dimensions.
     */
    updatePositions() {
        // Calculate the new coordinates of the line's endpoints
        let x1 = this.line.left;
        let y1 = this.line.top;
        let x2 = x1 + this.line.width * this.line.scaleX * Math.cos(this.line.angle * Math.PI / 180);
        let y2 = y1 + this.line.width * this.line.scaleX * Math.sin(this.line.angle * Math.PI / 180);
    
        // Update the text position
        this.text.set({
            left: x1 - this.text.width/2 + this.line.width * this.line.scaleX/2,
            top: y1 + 10
        });
        
        // Calculate the angle for the arrow tip based on the new positions
        let newAngle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
    
        // Update the arrow tip's position and angle
        this.arrowTip.set({
            left: x2,
            top: y2,
            angle: newAngle + 90
        });
    
        this.text.setCoords();
        this.arrowTip.setCoords();
        this.canvas.renderAll();
    
        console.log("end update" + this.line.width * this.line.scaleX);
    }
    
    /**
     * Adds the fabric objects (arrow's shaft, arrow tip, and text) to the canvas.
     *
     * @param {object} canvas - The canvas to add the objects to.
     */
    addObjectsToCanvas() {
        this.canvas.add(this.text, this.line, this.arrowTip); 
    }

     /**
     * Adds identification properties to each fabric object (e.g., arrow's shaft, arrow tip, text).
     * This helps in identifying which part of the diagram a fabric object belongs to.
     */
    addIdentificationToCanvasElements() {
        const className = this.constructor.name;
    
        for (let key of ['line', 'arrowTip', 'text']) {
            if (this[key]) {
                this[key].id = this.elementId;
                this[key].diagramElement = className;
                this[key].elementPart = key;
            }
        }
    }

    delete(){
        for (let key of ['line', 'arrowTip', 'text']) {
            if (this[key]) {
                canvas.remove(this[key]);
            }
        }
        delete this;
    }
}

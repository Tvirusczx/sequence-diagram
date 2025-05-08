const MessageType = Object.freeze({
    SYNCHRONOUS: 'synchronous',
    ASYNCHRONOUS: 'asynchronous',
    RETURN: 'return',
    CREATE: 'create',
    DESTROY: 'destroy',
    SELF: 'self'
  });


import DiagramElement from './diagramElement.js';
/**
 * Message class to create a diagram message element with an arrow tip.
 * 
 * @extends DiagramElement
 */

export default class Message extends DiagramElement {
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
        this.componentsList = ['line', 'arrowTip', 'text'];
        this.canvas = canvas;
        this.position1 = position;
        this.position2 = { x: this.position1.x + 200, y: this.position1.y };
        this.line = line;
        this.arrowTip = arrowTip;
        this.text = text;
        this.type = MessageType.SYNCHRONOUS;
        this.orientation = 'right';

        if (this.line == null && this.arrowTip == null && this.text== null) {
            this.createObjects();
            this.addObjectsToCanvas();
        }
        this.setControls();
        this.addEvents();
        this.addIdentificationToCanvasElements();
        this.updateVisualStyle();
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
            left: this.orientation === 'right' ? this.position2.x : this.position1.x,
            top: this.orientation === 'right' ? this.position2.y : this.position1.y,
            angle: this.orientation === 'right' ? 90 : 270,
            width: 20,
            height: 20,
            fill: 'black',
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
        this.updateVisualStyle();
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
    
        // Update the arrow tip's position and angle
        this.arrowTip.set({
            left: this.orientation === 'right' ? x2 : x1,
            top: this.orientation === 'right' ? y2 : y2,
            angle: this.orientation === 'right' ? 90 : 270
        });
        this.updateVisualStyle();
        this.text.setCoords();
        this.arrowTip.setCoords();
        this.canvas.renderAll();
    
        //console.log("end update" + this.line.width * this.line.scaleX);
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
     * Returns editable properties for the message.
     */
    getEditableProperties() {
        return [
          { key: 'text', label: 'Message Text', type: 'text', value: this.text.text },
          {
            key: 'type',
            label: 'Message Type',
            type: 'select',
            value: this.type,
            options: Object.values(MessageType)
          },
          {
            key: 'orientation',
            label: 'Orientation',
            type: 'select',
            value: this.orientation,
            options: ['right', 'left']
          }
        ];
      }
      
    
    /**
     * Updates the message element with the given property.
     * @param {string} key 
     * @param {any} value 
     */
    updateProperty(key, value) {
        switch (key) {
          case 'text':
            this.text.set({ text: value });
            break;
          case 'orientation':
            this.orientation = value;
            this.updatePositions();
            break;
          case 'type':
            this.type = value;
            this.updateVisualStyle(); // Apply new style when type changes
            break;
        }
        this.canvas.requestRenderAll();
    }
      
    updateVisualStyle() {
        let scale = this.line.scaleX
        switch (this.type) {
          case MessageType.ASYNCHRONOUS:
            this.line.set({ strokeDashArray: [5/scale, 5/scale] });
            break;
          case MessageType.RETURN:
            this.line.set({ strokeDashArray: [2/scale, 4/scale] });
            break;
          default:
            this.line.set({ strokeDashArray: null });
            break;
        }
      
        this.line.setCoords();
        this.arrowTip.setCoords();
    }
}

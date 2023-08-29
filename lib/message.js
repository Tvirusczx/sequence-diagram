class Message {
    constructor(canvas, position1, position2, line1, line2) {
        this.canvas = canvas;
        this.position1 = position1;
        this.position2 = position2;
        this.rectWidth = 150; // arbitrary width for the rectangle

        this.createObjects();
        this.addEvents();
        this.addObjectsToCanvas();
    }

    createObjects() {
        // Draw the line
        this.line = new fabric.Line([this.position1.x, this.position1.y, this.position2.x, this.position2.y], {
            stroke: 'black',
            strokeWidth: 2
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
            controls: false   
        });


        // Draw the text
        this.text = new fabric.Textbox('text', { 
            left: this.position1.x,
            top: this.position1.y,
            fontSize: 15,
            width: this.rectWidth - 30,
            lockMovementX: true,
            lockMovementY: true,
            hasControls: false
        });
    }
    
    addEvents() {
        this.line.on('moving', () => this.updatePositions());
        this.line.on('scaling', () => this.updatePositions());
    }

    updatePositions() {
        // Calculate the new coordinates of the line's endpoints
        let x1 = this.line.left;
        let y1 = this.line.top;
        let x2 = x1 + this.line.width * Math.cos(this.line.angle * Math.PI / 180);
        let y2 = y1 + this.line.width * Math.sin(this.line.angle * Math.PI / 180);
    
        // Update the text position
        this.text.set({
            left: x1,
            top: y1
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
    
        console.log("end update" + this.line.left);
    }
    

    addObjectsToCanvas() {
        this.canvas.add(this.text, this.line, this.arrowTip); // Removed `this.rect` from here
    }
}

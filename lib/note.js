class Note {
    constructor(canvas, position) {
        this.createObjects(position);
        this.addEvents();
        this.addObjectsToCanvas(canvas);
    }

    

    createObjects(position) {

         // Define rectangle and folded corner dimensions
        this.rectWidth = 150;
        this.rectHeight = 100;
        this.foldSize = 20;

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
        });

        // Draw the text
        this.text = new fabric.Textbox('Tohle test poznámky', { 
            left: this.rect.left + 5,
            top: this.rect.top + 5,
            fontSize: 15,
            width: this.rectWidth - 30,
            lockMovementX: true,
            lockMovementY: true,
            hasControls: false
        });

        this.rect.setControlsVisibility({
            mtr: false
        });

    }
    
    addEvents() {
        this.rect.on('moving', () => this.updatePositions());
        this.rect.on('scaling', () => this.updatePositions())

    }

    updatePositions() {
        
        this.text.set({
        left: this.rect.left + 5,
        top: this.rect.top + 5
        });

        this.foldedCorner.set({
        left: this.rect.left + (this.rectWidth *this.rect.scaleX)  - this.foldSize,
        top: this.rect.top
        });
        this.text.setCoords();
     

        this.rect.path[1][1]= this.rect.path[0][1] + this.rectWidth  - (this.foldSize / this.rect.scaleX),
        this.rect.path[1][2]= this.rect.path[0][2]
        this.rect.path[2][1]=  this.rect.path[0][1] + this.rectWidth 
        this.rect.path[2][2]= this.rect.path[0][2] + (this.foldSize / this.rect.scaleY)

        canvas.renderAll();
    }

    addObjectsToCanvas(canvas) {
        canvas.add(this.rect, this.foldedCorner, this.text);
    }
}
class Note {
    constructor(canvas, position) {
        this.canvas = canvas;
        this.position = position;

        this.createObjects();
        this.addEvents();
        this.addObjectsToCanvas();
    }

    

    createObjects() {

         // Define rectangle and folded corner dimensions
        this.rectWidth = 150;
        this.rectHeight = 100;
        this.foldSize = 20;


        // Draw the rectangle
        this.rect= new fabric.Path(
        `M ${this.position.x} ${this.position.y} 
        L ${this.position.x + this.rectWidth - this.foldSize} ${this.position.y} 
        L ${this.position.x + this.rectWidth} ${this.position.y + this.foldSize} 
        L ${this.position.x + this.rectWidth} ${this.position.y + this.rectHeight} 
        L ${this.position.x} ${this.position.y + this.rectHeight} Z`,

        {
            fill: 'lightblue',
            stroke: 'black',
            strokeUniform: true,
        });

         // Draw the folded corner
        this.foldedCorner = new fabric.Path(
            `M ${this.position.x + this.rectWidth - this.foldSize} ${this.position.y}
            L ${this.position.x + this.rectWidth - this.foldSize} ${this.position.y + this.foldSize} 
            L ${this.position.x + this.rectWidth} ${this.position.y + this.foldSize} 
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

        console.log(this.rect.path.toString())

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
        console.log(this.rect.path.toString())

       
        
        
        this.rect.path[1][1]= this.position.x + this.rectWidth  - (this.foldSize / this.rect.scaleX),
        this.rect.path[1][2]= this.position.y
        this.rect.path[2][1]=  this.position.x + this.rectWidth 
        this.rect.path[2][2]= this.position.y + (this.foldSize / this.rect.scaleY)
        canvas.renderAll();
        console.log(this.rect.path.toString())
        

        /*
        let scaleY = this.line.scaleY
        let scaleX = this.line.scaleX

        this.line.set({
        strokeDashArray: [5/scale, 5/scale],// overcome stretching of line stripes
        }); 
         */
    
    }

    addObjectsToCanvas() {
        this.canvas.add(this.rect, this.foldedCorner, this.text);
    }
}
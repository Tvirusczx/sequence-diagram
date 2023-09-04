class Note extends DiagramElement{
    // Define rectangle and folded corner dimensions
    static rectWidth = 150;
    static rectHeight = 100;
    static foldSize = 20;

    constructor(canvas, position , rect = null, foldedCorner = null, text = null) {
        super();
        this.rect = rect;
        this.foldedCorner = foldedCorner;
        this.text = text;
        if (this.rect == null && this.foldedCorner == null && this.text== null) {
            this.createObjects(position);
            this.addObjectsToCanvas(canvas);
        }
        this.setControls();
        this.addEvents();
        this.addIdentificationToCanvasElements()

    }

    createObjects(position) {
        // Draw the rectangle
        this.rect= new fabric.Path(
        `M ${position.x} ${position.y} 
        L ${position.x + Note.rectWidth - Note.foldSize} ${position.y} 
        L ${position.x + Note.rectWidth} ${position.y + Note.foldSize} 
        L ${position.x + Note.rectWidth} ${position.y + Note.rectHeight} 
        L ${position.x} ${position.y + Note.rectHeight} Z`,

        {
            fill: 'lightblue',
            stroke: 'black',
            strokeUniform: true,
        });

         // Draw the folded corner
        this.foldedCorner = new fabric.Path(
            `M ${position.x + Note.rectWidth - Note.foldSize} ${position.y}
            L ${position.x + Note.rectWidth - Note.foldSize} ${position.y + Note.foldSize} 
            L ${position.x + Note.rectWidth} ${position.y + Note.foldSize} 
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
            width: Note.rectWidth - 30,
            lockMovementX: true,
            lockMovementY: true,
            hasControls: false
        });
    }

    setControls(){
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
        left: this.rect.left + (Note.rectWidth *this.rect.scaleX)  - Note.foldSize,
        top: this.rect.top
        });
        this.text.setCoords();
     

        this.rect.path[1][1]= this.rect.path[0][1] + Note.rectWidth  - (Note.foldSize / this.rect.scaleX),
        this.rect.path[1][2]= this.rect.path[0][2]
        this.rect.path[2][1]=  this.rect.path[0][1] + Note.rectWidth 
        this.rect.path[2][2]= this.rect.path[0][2] + (Note.foldSize / this.rect.scaleY)

        canvas.renderAll();
    }

    addObjectsToCanvas(canvas) {
        canvas.add(this.rect, this.foldedCorner, this.text);
    }

    addIdentificationToCanvasElements() {
        const className = this.constructor.name;
    
        for (let key of ['text', 'rect', 'foldedCorner']) {
            if (this[key]) {
                this[key].id = this.elementId;
                this[key].diagramElement = className;
                this[key].elementPart = key;
            }
        }
    }
    


    
}
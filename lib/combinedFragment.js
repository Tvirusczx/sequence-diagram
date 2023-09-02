class CombinedFragment extends DiagramElement {
    constructor(canvas,fragmentName,position) {
        super();
        this.canvas = canvas;
        this.position = position;
        this.fragmentName = fragmentName;

        this.createObjects();
        this.addEvents();
        this.addObjectsToCanvas();
        this.addObjectsToCanvas();
    }

    

    createObjects() {
        this.fragmentRect = new fabric.Rect({
            left: this.position.x,
            top: this.position.y,
            fill: 'transparent',
            stroke: 'black',
            strokeWidth: 1,
            width: 300,
            height: 200,
            strokeUniform: true,
            mtr: false
        });
        this.fragmentRect.setControlsVisibility({
            mtr: false
        });

        let rectLeft = this.fragmentRect.left + 0.5;
        let rectTop = this.fragmentRect.top + 0.5;
        let rectWidth = 60;
        let rectHeight = 20;
        let chamferSize = rectHeight / 2;

        this.operatorRect = new fabric.Path(
            `M ${rectLeft} ${rectTop} 
             L ${rectLeft + rectWidth} ${rectTop} 
             L ${rectLeft + rectWidth} ${rectTop + chamferSize} 
             L ${rectLeft + rectWidth - chamferSize} ${rectTop + rectHeight} 
             L ${rectLeft} ${rectTop + rectHeight} 
             Z`, 
            {
                fill: 'transparent',
                stroke: 'black',
                strokeWidth: 1,
                hasControls: false,
                lockMovementX: true,
                lockMovementY: true,
                selectable: false,
                evented: false
            }
        );

        this.operatorText = new fabric.Textbox(this.fragmentName, {
            left: rectLeft + 5,
            top: rectTop + 2,
            fontSize: 15,
            width: 60,
            lockMovementX: true,
            lockMovementY: true,
            hasControls: false
        });
    }
    
    addEvents() {
        this.fragmentRect.on('moving', () => this.updatePositions());
        this.fragmentRect.on('scaling', () => this.updatePositions());
        this.operatorText.on('moving', () => this.updatePositions());

        this.operatorText.on('changed', () => {
            let currentText = this.operatorText.text;
            let newText = currentText.replace(/\n/g, ' ');  // Replace newlines with spaces
            this.operatorText.set('text', newText);

            // Adjust the width of the Textbox
            let textWidth = this.operatorText.calcTextWidth();
            this.operatorText.set('width', textWidth + 15);

            // Adjust the width of the operatorRect according to the new width of operatorText
            let newRectWidth = textWidth + 25;  // 10 pixels extra on each side
            let rectLeft = this.operatorRect.left + 0.5;
            let rectTop = this.operatorRect.top + 0.5;
            let rectHeight = this.operatorRect.height;
            let chamferSize = rectHeight / 2; 

            // Remove the old operatorRect from the canvas
            this.canvas.remove(this.operatorRect);

            // Create a new operatorRect
            this.operatorRect = new fabric.Path(
                `M ${rectLeft} ${rectTop} 
                L ${rectLeft + newRectWidth} ${rectTop} 
                L ${rectLeft + newRectWidth} ${rectTop + chamferSize} 
                L ${rectLeft + newRectWidth - chamferSize} ${rectTop + rectHeight} 
                L ${rectLeft} ${rectTop + rectHeight} 
                Z`, 
                {
                    fill: 'transparent',
                    stroke: 'black',
                    strokeWidth: 1,
                    hasControls: false,
                    lockMovementX: true,
                    lockMovementY: true,
                    selectable: false,
                    evented: false
                }
            );

            // Add the new operatorRect to the canvas
            this.canvas.add(this.operatorRect);

            // Ensure that the operatorRect is positioned behind the operatorText
            this.operatorRect.moveTo(1);
            this.operatorText.moveTo(2);

            this.canvas.renderAll();
        });
    }

    updatePositions() {
        let rectLeft = this.fragmentRect.left + 0.5;
        let rectTop = this.fragmentRect.top + 0.5;

        this.operatorRect.set({
            left: rectLeft,
            top: rectTop
        });

        this.operatorText.set({
            left: rectLeft + 5,
            top: rectTop + 2
        });

        this.operatorRect.setCoords();
        this.operatorText.setCoords();
        this.canvas.renderAll();
    }

    addObjectsToCanvas() {
        this.canvas.add(this.fragmentRect, this.operatorRect, this.operatorText);
    }
}


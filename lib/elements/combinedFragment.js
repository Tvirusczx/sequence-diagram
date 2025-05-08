import DiagramElement from './diagramElement.js';
/**
 * Represents a `CombinedFragment` diagram element, derived from the `DiagramElement` class.
 * This class is responsible for creating and managing the graphical representation of a combined fragment
 * which includes a main rectangle (`fragmentRect`), an operator rectangle (`operatorRect`), and an operator text (`operatorText`).
 */
export default class CombinedFragment extends DiagramElement {

    /**
     * Constructs a new `CombinedFragment` object.
     * 
     * @param {Object} canvas - The fabric canvas object where the fragment will be drawn.
     * @param {Object} position - The position where the fragment will be drawn {x: number, y: number}.
     * @param {Object} [fragmentRect=null] - The fabric rectangle object for the fragment.
     * @param {Object} [operatorRect=null] - The fabric rectangle object for the operator.
     * @param {Object} [operatorText=null] - The fabric textbox object for the operator text.
     * @param {string} [fragmentName=null] - The name/text for the fragment.
     */
    constructor(canvas, position, fragmentRect = null, operatorRect = null, operatorText = null, fragmentName = null ) {
        super();
        this.componentsList = ['fragmentRect', 'operatorRect', 'operatorText'];
        this.canvas = canvas;
        this.position = position;
        this.fragmentName = fragmentName;
        this.fragmentRect = fragmentRect;
        this.operatorRect = operatorRect;
        this.operatorText = operatorText;
        if (this.fragmentRect == null && this.operatorRect == null && this.operatorText == null) {
            this.createObjects();
            this.addObjectsToCanvas();
        }
        this.addEvents();
        this.addIdentificationToCanvasElements();
        this.setControls();
    }

    /**
     * Creates the visual objects for the fragment. It includes:
     * 1. The main rectangle for the fragment (`fragmentRect`).
     * 2. A chamfered rectangle for the operator (`operatorRect`).
     * 3. The operator's name/text (`operatorText`).
     */
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
            mtr: false,
            padding: 5,
            perPixelTargetFind: true  // Enables per-pixel hit detection
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

    setControls(){
        this.fragmentRect.setControlsVisibility({
            mtr: false
        });
    }
    
     /**
     * Attaches necessary events to the visual objects.
     * Currently, it handles:
     * 1. Moving events for the `fragmentRect` and `operatorText`.
     * 2. Scaling event for the `fragmentRect`.
     * 3. Text change event for the `operatorText`.
     */
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
            //this.operatorRect.moveTo(1);
            //this.operatorText.moveTo(2);

            var indexOfOperatorRect = this.canvas.getObjects().indexOf(this.operatorRect)
            this.operatorText.moveTo(indexOfOperatorRect + 1);
            this.canvas.renderAll();
        });
    }

    /**
     * Updates positions of the `operatorRect` and `operatorText` based on the current position of the `fragmentRect`.
     */
    updatePositions() {
        let rectLeft = this.fragmentRect.left ;
        let rectTop = this.fragmentRect.top ;

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

    /**
     * Adds the visual objects (`fragmentRect`, `operatorRect`, `operatorText`) to the fabric canvas.
     */
    addObjectsToCanvas() {
        this.canvas.add(this.fragmentRect, this.operatorRect, this.operatorText);
    } 
}



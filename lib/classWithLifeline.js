/**
 * Represents a `ClassWithLifeline` diagram element, derived from the `ElementWithLifeline` class.
 * This class is responsible for creating and managing the graphical representation of a class object 
 * along with a lifeline.
 */
class ClassWithLifeline extends ElementWithLifeline {

    /**
     * Constructs a new `ClassWithLifeline` object.
     * 
     * @param {Object} canvas - The fabric canvas object where the class will be drawn.
     * @param {Object} position - The position where the class will be drawn {x: number, y: number}.
     * @param {Object} shape - The main shape (rectangle) representing the class.
     * @param {Object} text - The text to be placed inside the class representation.
     * @param {Object} line - The lifeline (dashed line) representation.
     * @param {string} label - The label for the class (e.g., class name).
     */
    constructor(canvas, position, shape , text , line, label) {
        super(canvas, position, shape , text , line, label);
    }

     /**
     * Creates the main shape (rectangle) for the class representation.
     * The rectangle is styled with a light blue fill, black borders, and has certain dimension constraints.
     */
    createShape(){
        this.shape = new fabric.Rect({
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

    }

     /**
     * Creates the lifeline representation for the class.
     * The lifeline is a dashed line extending downwards from the center-bottom of the class rectangle.
     */
    createLifeline(){
        this.line = new fabric.Line([this.shape.left + this.shape.width / 2, this.shape.top + this.shape.height, this.shape.left + this.shape.width / 2, this.canvas.height], {
            strokeDashArray: [5, 5],
            stroke: 'black',
            strokeWidth: 2,
            lockMovementX: true,
            lockMovementY: true,
            padding: 10
        });
        this.setupLineControls();
    }
  
    /**
     * Centers the text (the class name) inside the class rectangle.
     */
    centerText() {
        this.text.set({
            left: this.shape.left + this.shape.width / 2 - this.text.width / 2,
            top: this.shape.top + 2
        });
    }

    /**
     * Updates the positions of the class rectangle, the lifeline, and the class text.
     * This update can be triggered by the movement of the class rectangle or the class text.
     * 
     * @param {string} from - Indicates the source of the update. Possible values are 'text' or 'rect'.
     */
    updatePositions(from) {
        
        if (from === 'text') {
            this.shape.set({
                left: this.text.left,
                top: this.text.top - 2
            });
            this.shape.setCoords(); // Update shape's coordinates after changing its position
        } else {
            this.centerText();
            this.text.setCoords(); // Update text's coordinates after changing its position
        }

        // Update the line position
        this.line.set({
            x1: this.shape.left + this.shape.width / 2,
            y1: this.shape.top + this.shape.height,
            x2: this.shape.left + this.shape.width / 2,
            y2: this.shape.top + this.shape.height + this.lineHeight
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

     /**
     * Attaches necessary events to the class rectangle, the class text, and the lifeline.
     * These events handle elements' movements and interactions.
     */
    attachEvents() {
        this.shape.on('moving', () => this.updatePositions('rect'));
        this.text.on('moving', () => this.updatePositions('text'));
        this.line.on('scaling', () => this.updateLine());

        this.line.on('mouseover',() => this.lineHoverEffect('blue'));
        this.line.on('mouseout',() => this.lineHoverEffect('black'));

        this.line.on('mousedown',(options) => this.createActivBox(options.pointer.y));
    }
}
import ElementWithLifeline from './elementWithLifeline.js';
/**
 * Represents an `ActorWithLifeline` diagram element, derived from the `ElementWithLifeline` class.
 * This class is responsible for creating and managing the graphical representation of an actor 
 * (depicted as a stick figure) along with a lifeline.
 */
export default class ActorWithLifeline extends ElementWithLifeline{

    /**
     * Constructs a new `ActorWithLifeline` object.
     * 
     * @param {Object} canvas - The fabric canvas object where the actor will be drawn.
     * @param {Object} position - The position where the actor will be drawn {x: number, y: number}.
     * @param {Object} shape - The main shape (stick figure) representing the actor.
     * @param {Object} text - The text to be placed below the actor representation.
     * @param {Object} line - The lifeline (dashed line) representation.
     * @param {string} label - The label for the actor.
     */
    constructor(canvas, position, shape , text , line , label) {
        super(canvas, position, shape , text , line , label);
    }

    /**
     * Creates the main shape (stick figure) for the actor representation.
     * The actor is represented as a simple stick figure consisting of a head (circle) and lines 
     * for the body, arms, and legs.
     */
    createShape(){
        const scaleFactor = 0.7; // Factor for 70% reduction

        const head = new fabric.Circle({
            radius: 20 * scaleFactor, 
            stroke: 'black',
            strokeWidth: 2.5,
            fill: 'lightblue',
            left: this.position.x - (20 * scaleFactor),
            top: this.position.y
        });

        // Adjust body's
        const body = new fabric.Line([this.position.x, this.position.y + (40 * scaleFactor), this.position.x, this.position.y + (102.5 * scaleFactor)], {
            stroke: 'black',
            strokeWidth: 3.5
        });

        // Adjust legs 
        const leftLeg = new fabric.Line([this.position.x, this.position.y + (100 * scaleFactor), this.position.x - (25 * scaleFactor), this.position.y + (150 * scaleFactor)], {
            stroke: 'black',
            strokeWidth: 3.5
        });

        const rightLeg = new fabric.Line([this.position.x, this.position.y + (100 * scaleFactor), this.position.x + (25 * scaleFactor), this.position.y + (150 * scaleFactor)], {
            stroke: 'black',
            strokeWidth: 3.5
        });

        // Adjust arms
        const leftArm = new fabric.Line([this.position.x, this.position.y + (50 * scaleFactor), this.position.x - (25 * scaleFactor), this.position.y + (75 * scaleFactor)], {
            stroke: 'black',
            strokeWidth: 3.5
        });

        const rightArm = new fabric.Line([this.position.x, this.position.y + (50 * scaleFactor), this.position.x + (25 * scaleFactor), this.position.y + (75 * scaleFactor)], {
            stroke: 'black',
            strokeWidth: 3.5
        });

        this.shape = new fabric.Group([head, body, leftLeg, rightLeg, leftArm, rightArm], {
            left: this.position.x,
            top: this.position.y,
            lockScalingX: true,
            lockScalingY: true,
            hasControls: false
        });

    }

     /**
     * Creates the lifeline representation for the actor.
     * The lifeline is a dashed line extending downwards from the bottom of the actor representation.
     */
    createLifeline(){
        this.line = new fabric.Line([this.shape.left + this.shape.width / 2, this.text.top + this.text.height + 10, this.shape.left + this.shape.width / 2, this.canvas.height], {
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
     * Centers the text (typically the actor name or role) below the actor representation.
     */
    centerText() {
        this.text.set({
            left: this.shape.left + this.shape.width / 2 - this.text.width / 2
        });
    }

    /**
     * Updates the positions of the actor stick figure, the lifeline, and the actor text.
     * This update can be triggered by the movement of the actor stick figure or the actor text.
     * 
     * @param {string} from - Indicates the source of the update. Possible values are 'text' or 'shape'.
     */
    updatePositions(from) {
        if (from === 'text') {
            // Move shape to follow text
            this.shape.set({
                top: this.text.top - this.shape.height - 5,
                left: this.text.left + this.text.width / 2 - this.shape.width / 2
            });
            this.shape.setCoords();
        } else {
            // Move text to follow shape
            this.text.set({
                top: this.shape.top + this.shape.height + 5,
                left: this.shape.left + this.shape.width / 2 - this.text.width / 2
            });
            this.text.setCoords();
        }

        // Update the lifeline position
        this.line.set({
            x1: this.shape.left + this.shape.width / 2,
            y1: this.text.top + this.text.height + 10,
            x2: this.shape.left + this.shape.width / 2,
            y2: this.text.top + this.text.height + this.lineHeight + 10
        });
        this.line.setCoords();

        // Update active boxes
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
     * Attaches necessary events to the actor stick figure, the actor text, and the lifeline.
     * These events handle elements' movements and interactions.
     */
    attachEvents() {
        this.shape.on('moving', () => this.updatePositions('shape'));
        this.text.on('moving', () => this.updatePositions('text'));
    
        this.line.on('scaling', () => this.updateLine());
    
        this.line.on('mouseover', () => this.lineHoverEffect('blue'));
        this.line.on('mouseout', () => this.lineHoverEffect('black'));
    
        this.line.on('mousedown', (options) => this.createActivBox(options.pointer.y));
    }
    
}
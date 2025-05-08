import ElementWithLifeline from './elementWithLifeline.js';

/**
 * Represents an Actor element in a sequence diagram, with a lifeline and stick-figure drawing.
 * Inherits shared logic from ElementWithLifeline.
 */
export default class ActorWithLifeline extends ElementWithLifeline {

    /**
     * Constructs an Actor element with optional pre-existing components.
     * 
     * @param {Object} canvas - The Fabric.js canvas instance.
     * @param {Object} position - {x, y} coordinates for placement.
     * @param {fabric.Object|null} shape - Optional stick-figure group.
     * @param {fabric.Textbox|null} text - Optional label.
     * @param {fabric.Line|null} line - Optional lifeline.
     * @param {string|null} label - Text content of the actor label.
     */
    constructor(canvas, position, shape, text, line, label) {
        super(canvas, position, shape, text, line, label);
    }

    /**
     * Creates the stick-figure representation of the actor using grouped Fabric shapes.
     */
    createShape() {
        const scale = 0.7;
        const x = this.position.x;
        const y = this.position.y;

        const head = new fabric.Circle({
            radius: 20 * scale,
            stroke: 'black',
            strokeWidth: 2.5,
            fill: 'lightblue',
            left: x - (20 * scale),
            top: y
        });

        const body = new fabric.Line([x, y + 40 * scale, x, y + 102.5 * scale], {
            stroke: 'black', strokeWidth: 3.5
        });

        const leftLeg = new fabric.Line([x, y + 100 * scale, x - 25 * scale, y + 150 * scale], {
            stroke: 'black', strokeWidth: 3.5
        });

        const rightLeg = new fabric.Line([x, y + 100 * scale, x + 25 * scale, y + 150 * scale], {
            stroke: 'black', strokeWidth: 3.5
        });

        const leftArm = new fabric.Line([x, y + 50 * scale, x - 25 * scale, y + 75 * scale], {
            stroke: 'black', strokeWidth: 3.5
        });

        const rightArm = new fabric.Line([x, y + 50 * scale, x + 25 * scale, y + 75 * scale], {
            stroke: 'black', strokeWidth: 3.5
        });

        this.shape = new fabric.Group([head, body, leftLeg, rightLeg, leftArm, rightArm], {
            left: x,
            top: y,
            lockScalingX: true,
            lockScalingY: true,
            hasControls: false
        });
    }

    /**
     * Creates a vertical lifeline below the text box.
     */
    createLifeline() {
        const centerX = this.shape.left + this.shape.width / 2;
        const startY = this.text.top + this.text.height + 10;

        this.line = new fabric.Line(
            [centerX, startY, centerX, this.canvas.height],
            {
                strokeDashArray: [5, 5],
                stroke: 'black',
                strokeWidth: 2,
                lockMovementX: true,
                lockMovementY: true,
                padding: 10
            }
        );
        this.setupLineControls();
    }

    /**
     * Aligns the label text horizontally centered below the actor figure.
     */
    centerText() {
        this.text.set({
            left: this.shape.left + this.shape.width / 2 - this.text.width / 2
        });
    }

    /**
     * Updates positions of all actor components when shape or text is moved.
     *
     * @param {string} from - 'shape' or 'text' indicating which was moved.
     */
    updatePositions(from) {
        super.updatePositions(from);

        if (from === 'text') {
            this.shape.set({
                top: this.text.top - this.shape.height - 5,
                left: this.text.left + this.text.width / 2 - this.shape.width / 2
            });
            this.shape.setCoords();
        } else {
            this.text.set({
                top: this.shape.top + this.shape.height + 5,
                left: this.shape.left + this.shape.width / 2 - this.text.width / 2
            });
            this.text.setCoords();
        }

        const centerX = this.shape.left + this.shape.width / 2;
        const startY = this.text.top + this.text.height + 10;

        this.line.set({
            x1: centerX,
            y1: startY,
            x2: centerX,
            y2: startY + this.lineHeight
        });
        this.line.setCoords();

        this.activeBoxes.forEach(box => {
            box.set({
                left: centerX - 9,
                top: this.line.y1 + box.lineStartDistance
            });
            box.setCoords();
        });

        this.canvas.renderAll();
    }

    /**
     * Registers Fabric.js event handlers for movement, hover, and box creation.
     */
    attachEvents() {
        this.shape.on('moving', () => this.updatePositions('shape'));
        this.text.on('moving', () => this.updatePositions('text'));
        this.line.on('scaling', () => this.updateLine());

        this.line.on('mouseover', () => this.lineHoverEffect('blue'));
        this.line.on('mouseout', () => this.lineHoverEffect('black'));
        this.line.on('mousedown', e => this.createActivBox(e.pointer.y));
    }

    /**
     * Retrieves editable properties for the actor, including label, fill color, and destroy flag.
     * @returns {Array<Object>}
     */
    getEditableProperties() {
        return [
            { key: 'text', label: 'Actor Label', type: 'text', value: this.text.text },
            { key: 'fill', label: 'Fill Color', type: 'color', value: this.getHeadFill() },
            { key: 'destroy', label: 'Destroy Marker', type: 'boolean', value: this.destroy }
        ];
    }

    /**
     * Applies changes to editable properties (called by property panel).
     *
     * @param {string} key - Property name.
     * @param {any} value - New value to apply.
     */
    updateProperty(key, value) {
        super.updateProperty(key, value);

        switch (key) {
            case 'text':
                this.text.set({ text: value });
                break;
            case 'fill':
                this.setHeadFill(value);
                this.updateActiveBoxesColor();
                break;
        }

        this.canvas.requestRenderAll();
    }

    /**
     * Gets the fill color of the actor’s head (circle in group).
     * @returns {string}
     */
    getHeadFill() {
        const head = this.shape._objects?.find(obj => obj.type === 'circle');
        return head?.fill || 'lightblue';
    }

    /**
     * Sets the fill color of the actor’s head (circle).
     * @param {string} color
     */
    setHeadFill(color) {
        const head = this.shape._objects?.find(obj => obj.type === 'circle');
        if (head) head.set({ fill: color });
    }

    /**
     * Overrides the fill color used for activation boxes.
     */
    getBoxFill() {
        return this.getHeadFill();
    }
}

import ElementWithLifeline from './elementWithLifeline.js';

/**
 * Represents a Class element in a sequence diagram, with a rectangular visual and lifeline.
 * Inherits shared behavior from ElementWithLifeline.
 */
export default class ClassWithLifeline extends ElementWithLifeline {

    /**
     * Constructs a ClassWithLifeline element with optional pre-existing components.
     * 
     * @param {Object} canvas - The Fabric.js canvas instance.
     * @param {Object} position - {x, y} coordinates where the class will be placed.
     * @param {fabric.Object|null} shape - Optional rectangular shape for the class.
     * @param {fabric.Textbox|null} text - Optional text label.
     * @param {fabric.Line|null} line - Optional lifeline line.
     * @param {string|null} label - Initial text label for the class.
     */
    constructor(canvas, position, shape, text, line, label) {
        super(canvas, position, shape, text, line, label);
    }

    /**
     * Creates a rectangular shape to visually represent the class.
     */
    createShape() {
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
     * Creates a vertical lifeline starting from the bottom center of the rectangle.
     */
    createLifeline() {
        const centerX = this.shape.left + this.shape.width / 2;
        const startY = this.shape.top + this.shape.height;

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
     * Centers the text horizontally inside the rectangle.
     */
    centerText() {
        this.text.set({
            left: this.shape.left + this.shape.width / 2 - this.text.width / 2,
            top: this.shape.top + 2
        });
    }

    /**
     * Updates positions of shape, text, lifeline and activation boxes on movement.
     * 
     * @param {string} from - Indicates what moved ('text' or 'rect').
     */
    updatePositions(from) {
        super.updatePositions(from);

        if (from === 'text') {
            this.shape.set({
                left: this.text.left,
                top: this.text.top - 2
            });
            this.shape.setCoords();
        } else {
            this.centerText();
            this.text.setCoords();
        }

        const centerX = this.shape.left + this.shape.width / 2;
        const startY = this.shape.top + this.shape.height;

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
     * Registers Fabric.js event handlers for rectangle, text, and lifeline.
     */
    attachEvents() {
        this.shape.on('moving', () => this.updatePositions('rect'));
        this.text.on('moving', () => this.updatePositions('text'));
        this.line.on('scaling', () => this.updateLine());

        this.line.on('mouseover', () => this.lineHoverEffect('blue'));
        this.line.on('mouseout', () => this.lineHoverEffect('black'));
        this.line.on('mousedown', (e) => this.createActivBox(e.pointer.y));
    }

    /**
     * Updates class-specific and shared properties.
     *
     * @param {string} key - Property name (e.g., 'text', 'fill', 'destroy').
     * @param {any} value - New value to apply.
     */
    updateProperty(key, value) {
        super.updateProperty(key, value);

        if (key === 'fill') {
            this.shape.set({ fill: value });
            this.updateActiveBoxesColor();
        }

        this.canvas.requestRenderAll();
    }

    /**
     * Returns editable properties specific to a class, along with shared properties.
     * 
     * @returns {Array<Object>} Properties for the properties panel.
     */
    getEditableProperties() {
        return [
            { key: 'text', label: 'Class Label', type: 'text', value: this.text.text },
            { key: 'fill', label: 'Fill Color', type: 'color', value: this.shape.fill },
            { key: 'destroy', label: 'Destroy Marker', type: 'boolean', value: this.destroy }
        ];
    }
}

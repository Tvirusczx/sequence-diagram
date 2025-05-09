import DiagramElement from './diagramElement.js';

/**
 * Abstract base class for elements that include a lifeline (e.g., Actor, Class).
 * Handles shared behavior like activation boxes, lifeline, destroy marker, and text alignment.
 * 
 * @extends DiagramElement
 */
export default class ElementWithLifeline extends DiagramElement {
    /**
     * Constructs a new lifeline element with optional shape, text, and line.
     * If they are not passed, the component will be fully created.
     *
     * @param {object} canvas - The Fabric canvas instance.
     * @param {object} position - {x, y} coordinates for initial placement.
     * @param {fabric.Object|null} shape - Visual body of the element.
     * @param {fabric.Textbox|null} text - Optional label textbox.
     * @param {fabric.Line|null} line - Optional lifeline.
     * @param {string|null} label - Text content for the label.
     */
    constructor(canvas, position, shape = null, text = null, line = null, label = null) {
        super();
        this.canvas = canvas;
        this.position = position;
        this.shape = shape;
        this.text = text;
        this.line = line;
        this.label = label;
        this.destroy = false;
        this.destroyMarker = null;
        this.activeBoxes = [];

        this.componentsList = ['shape', 'line', 'text'];

        if (!this.shape && !this.text && !this.line) {
            this.createObjects();
            this.addObjectsToCanvas();
        }

        this.attachEvents();
        this.addLineHeight();
        this.addIdentificationToCanvasElements();
    }

    /**
     * Template method to create visual components.
     * Subclasses must override `createShape()` and `createLifeline()`.
     */
    createObjects() {
        this.createShape();
        this.createLabel();
        this.createLifeline();
    }

    /**
     * Placeholder for shape creation. Must be implemented by subclasses.
     */
    createShape() {}

    /**
     * Creates a text label under the shape.
     */
    createLabel() {
        this.text = new fabric.Textbox(this.label || '', {
            left: this.position.x,
            top: this.shape.top + this.shape.height + 5,
            width: this.shape.width,
            fontSize: 15,
            underline: true,
            textAlign: 'center',
            lockScalingX: true,
            lockScalingY: true,
            hasControls: false,
            hasBorders: false
        });
        this.centerText();
    }

    /**
     * Placeholder for lifeline creation. Must be implemented by subclasses.
     */
    createLifeline() {}

    /**
     * Adds all created components to the canvas.
     */
    addObjectsToCanvas() {
        this.canvas.add(this.shape, this.text, this.line);
    }

    /**
     * Abstract text-centering logic to be implemented by subclasses.
     */
    centerText() {}

    /**
     * Measures the lifeline height and stores it.
     */
    addLineHeight() {
        this.lineHeight = this.line.y2 - this.line.y1;
    }

    /**
     * Applies a hover color effect to the lifeline.
     * @param {string} colour 
     */
    lineHoverEffect(colour) {
        this.line.set({ stroke: colour });
        this.canvas.renderAll();
    }

    /**
     * Sets lifeline control handles (bottom only).
     */
    setupLineControls() {
        this.line.setControlsVisibility({
            mt: false, mb: true,
            ml: false, mr: false,
            bl: false, br: false,
            tl: false, tr: false,
            mtr: false
        });
    }

    /**
     * Updates dashed line pattern according to current scaling.
     */
    updateLine() {
        const scale = this.line.scaleY;
        this.line.set({
            strokeDashArray: [5 / scale, 5 / scale]
        });
        if (this.destroy) {
            this.updateDestroyMarker();
        }

    }

    /**
     * Creates an activation box on the lifeline at a specific Y coordinate.
     * Prevents placement in the last 30px of the lifeline.
     * @param {number} y 
     */
    createActivBox(y) {
        const lineEndY = this.line.top + this.line.height * this.line.scaleY;
        const forbiddenZoneStart = lineEndY - 30;

        if (y >= forbiddenZoneStart) {
            console.warn('Cannot create activation box in the last 30px of the lifeline.');
            return;
        }

        const canvasY = fabric.util.transformPoint({ x: 0, y }, fabric.util.invertTransform(this.canvas.viewportTransform)).y;
        const lineCenterX = this.line.left + this.line.width / 2;

        const box = new fabric.Rect({
            left: lineCenterX - 9,
            top: canvasY,
            fill: this.getBoxFill(),
            stroke: 'black',
            strokeWidth: 1.5,
            strokeUniform: true,
            width: 18,
            height: 25,
            lockScalingY: false,
            lockMovementX: true,
            lineStartDistance: canvasY - this.line.top
        });

        box.setControlsVisibility({
            mt: true, mb: true,
            ml: false, mr: false,
            bl: false, br: false,
            tl: false, tr: false,
            mtr: false
        });

        box.on('modified', () => box.lineStartDistance = box.top - this.line.top);
        box.on('moving', () => box.lineStartDistance = box.top - this.line.top);

        this.canvas.add(box);
        this.activeBoxes.push(box);
        this.canvas.renderAll();
    }

    /**
     * Updates color of activation boxes to match the shape.
     */
    updateActiveBoxesColor() {
        const fillColor = this.getBoxFill();
        this.activeBoxes.forEach(box => box.set({ fill: fillColor }));
        this.canvas.requestRenderAll();
    }

    /**
     * Re-attaches active boxes from reconstruction and restores their behavior.
     * @param {fabric.Rect[]} boxes 
     */
    addActiveBoxes(boxes) {
        this.activeBoxes = boxes;

        boxes.forEach(box => {
            box.on('modified', () => box.lineStartDistance = box.top - this.line.top);
            box.on('moving', () => box.lineStartDistance = box.top - this.line.top);
        });

        this.addIdentificationToActiveBoxes();
        this.updateActiveBoxesColor();
        this.updatePositions();
    }


    /**
     * Returns the appropriate fill color for activation boxes.
     */
    getBoxFill() {
        return this.shape?.fill || 'lightblue';
    }

    /**
     * Adds identifiers to all activation boxes.
     */
    addIdentificationToActiveBoxes() {
        const className = this.constructor.name;
        for (let box of this.activeBoxes) {
            box.id = this.elementId;
            box.diagramElement = className;
            box.elementPart = 'activeBox';
        }
    }

    /**
     * Attach logic hooks for updates — subclasses are expected to implement this.
     */
    attachEvents() {}

    /**
     * Adds element identifiers to all visual parts.
     */
    addIdentificationToCanvasElements() {
        super.addIdentificationToCanvasElements();
        this.addIdentificationToActiveBoxes();
    }

    /**
     * Updates positions of destroy marker if enabled.
     * Subclasses should call this via `super.updatePositions(from)`
     */
    updatePositions(from) {
        if (this.destroy) this.updateDestroyMarker();
    
        // Aktualizuj pozici všech aktivních boxů
        for (const box of this.activeBoxes) {
            box.set({
                top: this.line.y1 + box.lineStartDistance,
                left: this.line.x1 - 9
            });
            box.setCoords();
        }
    }

    /**
     * Creates the red 'X' marker to indicate destruction at the end of lifeline.
     */
    createDestroyMarker() {
        const x = this.line.x2;
        const y = this.line.y2 + 5;
        const size = 10;

        const line1 = new fabric.Line([x - size / 2, y - size / 2, x + size / 2, y + size / 2], {
            stroke: 'red', strokeWidth: 2, selectable: false, evented: false
        });
        const line2 = new fabric.Line([x - size / 2, y + size / 2, x + size / 2, y - size / 2], {
            stroke: 'red', strokeWidth: 2, selectable: false, evented: false
        });

        this.destroyMarker = new fabric.Group([line1, line2], {
            left: x, top: y,
            selectable: false, evented: false
        });

        this.canvas.add(this.destroyMarker);
        this.destroyMarker.sendToBack();
    }

    /**
     * Moves or removes destroy marker when toggled.
     */
    updateDestroyMarker() {
        if (this.destroy) {
            const x = this.line.x2;
            const y = this.line.y2 + 5; // <- bottom edge + offset
            if (!this.destroyMarker) {
                this.createDestroyMarker();
            } else {
                this.destroyMarker.set({ left: x, top: y });
                this.destroyMarker.setCoords();
            }
        } else if (this.destroyMarker) {
            this.canvas.remove(this.destroyMarker);
            this.destroyMarker = null;
        }
        this.canvas.renderAll();
    }

    /**
     * Applies editable property changes. Extendable by subclasses.
     */
    updateProperty(key, value) {
        if (key === 'destroy') {
            this.destroy = value === true || value === 'true';
            this.updateDestroyMarker();
        }
        this.canvas.requestRenderAll();
    }

    /**
     * Provides editable props for UI property panel.
     */
    getEditableProperties() {
        return [
            {
                key: 'destroy',
                label: 'Destroy Marker',
                type: 'boolean',
                value: this.destroy
            }
        ];
    }

    /**
     * Removes all visual parts from the canvas and cleans up destroy marker.
     */
    delete() {
        this.activeBoxes.forEach(box => this.canvas.remove(box));
        if (this.destroyMarker) this.canvas.remove(this.destroyMarker);
        super.delete();
    }
}

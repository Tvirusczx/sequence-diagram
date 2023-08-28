class ActorWithLifeline {
    constructor(canvas, actorName, position) {
        this.canvas = canvas;
        this.actorName = actorName;
        this.position = position;

        this.createObjects();
        this.lineHeight = this.line.y2 - this.line.y1;
        this.attachEvents();
        this.addObjectsToCanvas();
    }

    createObjects() {
        const scaleFactor = 0.7; // Factor for 70% reduction

        // Adjust head's radius by scaleFactor
        const head = new fabric.Circle({
            radius: 20 * scaleFactor, 
            stroke: 'black',
            strokeWidth: 2.5,
            fill: 'lightblue',
            left: this.position.x - (20 * scaleFactor),
            top: this.position.y
        });

        // Adjust body's length by scaleFactor
        const body = new fabric.Line([this.position.x, this.position.y + (40 * scaleFactor), this.position.x, this.position.y + (102.5 * scaleFactor)], {
            stroke: 'black',
            strokeWidth: 3.5
        });

        // Adjust legs by scaleFactor
        const leftLeg = new fabric.Line([this.position.x, this.position.y + (100 * scaleFactor), this.position.x - (25 * scaleFactor), this.position.y + (150 * scaleFactor)], {
            stroke: 'black',
            strokeWidth: 3.5
        });

        const rightLeg = new fabric.Line([this.position.x, this.position.y + (100 * scaleFactor), this.position.x + (25 * scaleFactor), this.position.y + (150 * scaleFactor)], {
            stroke: 'black',
            strokeWidth: 3.5
        });

        // Adjust arms by scaleFactor
        const leftArm = new fabric.Line([this.position.x, this.position.y + (50 * scaleFactor), this.position.x - (25 * scaleFactor), this.position.y + (75 * scaleFactor)], {
            stroke: 'black',
            strokeWidth: 3.5
        });

        const rightArm = new fabric.Line([this.position.x, this.position.y + (50 * scaleFactor), this.position.x + (25 * scaleFactor), this.position.y + (75 * scaleFactor)], {
            stroke: 'black',
            strokeWidth: 3.5
        });

        this.actor = new fabric.Group([head, body, leftLeg, rightLeg, leftArm, rightArm], {
            left: this.position.x,
            top: this.position.y,
            lockScalingX: true,
            lockScalingY: true,
            hasControls: false
        });

        this.text = new fabric.Textbox(this.actorName, {
            left: this.position.x,
            top: this.actor.top + this.actor.height + 5,
            width: 2 * head.radius,
            fontSize: 15,
            textAlign: 'center',
            lockScalingX: true,
            lockScalingY: true,
            hasControls: false,
            hasBorders: false
        });
        this.centerText();

        this.line = new fabric.Line([this.actor.left + this.actor.width / 2, this.text.top + this.text.height + 10, this.actor.left + this.actor.width / 2, this.canvas.height], {
            strokeDashArray: [5, 5],
            stroke: 'black',
            strokeWidth: 2,
            lockMovementX: true,
            lockMovementY: true
        });
        this.setupLineControls();
    }

    centerText() {
        this.text.set({
            left: this.actor.left + this.actor.width / 2 - this.text.width / 2
        });
    }

    setupLineControls() {
        this.line.setControlsVisibility({
            mt: false, mb: true, ml: false, mr: false, bl: false, br: false, tl: false, tr: false, mtr: false
        });
    }

    updateLine(){
        let scale = this.line.scaleY
        this.line.set({
        strokeDashArray: [5/scale, 5/scale],// overcome stretching of line stripes
        }); 
    }

    updatePositions() {
        this.text.set({ top: this.actor.top + this.actor.height + 5 });
        this.centerText();
        this.text.setCoords();

        this.line.set({
            x1: this.actor.left + this.actor.width / 2,
            y1: this.text.top + this.text.height + 10,
            x2: this.actor.left + this.actor.width / 2,
            y2: this.text.top + this.text.height + this.lineHeight + 10
        });
        this.line.setCoords();

        this.canvas.renderAll();
    }

    attachEvents() {
        this.actor.on('moving', () => this.updatePositions());
        this.line.on('scaling', () => this.updateLine());
        this.text.on('moving', () => this.updatePositions());
    }

    addObjectsToCanvas() {
        this.canvas.add(this.actor, this.text, this.line);
    }
}

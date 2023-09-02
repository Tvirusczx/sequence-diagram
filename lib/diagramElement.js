class DiagramElement {
    static lastID = 0; // Static property to keep track of the last used ID

    constructor() {
        this.elementId = ++DiagramElement.lastID; // Increment the ID for each new instance
    }
}
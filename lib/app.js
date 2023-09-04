/**
 * Override fabric's default toObject method to add custom properties.
 */
const originalToObject = fabric.Object.prototype.toObject;
fabric.Object.prototype.toObject = function (additionalProperties = []) {
    const additionalValues = ['id', 'diagramElement', 'elementPart','lockMovementX','lockMovementY','hasControls','selectable','padding','lineStartDistance'].concat(additionalProperties);
    return originalToObject.call(this, additionalValues);
}

/** 
 * Canvas initialization with default settings.
 */
let canvas = new fabric.Canvas('myCanvas', { preserveObjectStacking: true, selection: false,backgroundColor:'white' });
        canvas.setHeight(document.getElementById("canvas_container").clientHeight);
        canvas.setWidth(document.getElementById("canvas_container").clientWidth);

        var canvasJsonLastExported;

        let snapshots = []; // Global array to store snapshots
        let currentSnapshotIndex = -1; // Current index in the snapshot array
        let isLiseningToCreatingClass = true;

        enableSnapshotHandlers()

        /**
         * Saves JSON content to a file.
         * @param {string} json - JSON data to save.
         * @param {string} [defaultFileName='sequential_diagram.json'] - Default name for the file.
         */
        async function saveJsonToFile(json,defaultFileName = 'sequential_diagram.json') {
            const jsonString = json;
        
            // Options for the save picker
            const options = {
                suggestedName: defaultFileName,  // <-- Default file name here
                types: [
                    {
                        description: "JSON Files",
                        accept: {
                            "application/json": [".json"]
                        }
                    }
                ]
            };
        
            // Show the save file picker
            const fileHandle = await window.showSaveFilePicker(options);
        
            // Create a writable stream
            const writable = await fileHandle.createWritable();
            
            // Write data to the stream
            await writable.write(jsonString);
            
            // Close the stream
            await writable.close();
        }
        /**
         * Loads JSON content from a file.
         * @returns {Object} The parsed JSON content from the file.
         */
        async function loadJsonFromFile() {
            // Options for the open file picker
            const options = {
                types: [
                    {
                        description: "JSON Files",
                        accept: {
                            "application/json": [".json"]
                        }
                    }
                ],
                multiple: false // Allows single file selection
            };
        
            // Show the open file picker and get file handle
            const [fileHandle] = await window.showOpenFilePicker(options);
        
            // Get the File object
            const file = await fileHandle.getFile();
        
            // Read and parse the content of the file
            const content = await file.text();
            const jsonData = JSON.parse(content);
        
            return jsonData;
        }
        
        
        
        /* DEMO
        new CombinedFragment(canvas,'otp', { x: 50, y: 50 });
        new ActorWithLifeline(canvas, 'User', { x: 300, y: 50 });
        new ClassWithLifeline(canvas, 'System', { x: 400, y: 50 });
        new Note(canvas, { x: 300, y: 200 });
        
        let startPosition = { x: 300, y: 100 };
        let endPosition = { x: 500, y: 100 };

        let newMessage = new Message(canvas, startPosition, endPosition);
        */

        /**
         * Clears all objects from the canvas.
         */
        function clearCanvas()
        {
            canvas.clear();
            canvas.renderAll();
        }
        
        /**
         * Converts the canvas to a PNG image and initiates a download.
         */
        function saveCanvasAsImage() {
            let dataURL = canvas.toDataURL({
                format: 'png',
                enableRetinaScaling: true
  
            });
            
            downloadImage(dataURL, 'canvas_image.png');
        }

        /**
         * Exports canvas elements with added identifications to a JSON file.
         */
        async function exportCanvasFile(){
            DiagramElement.allElements.forEach(object => {
                object.addIdentificationToCanvasElements();
            });
            //await saveJsonToFile(JSON.stringify(canvas));
            //console.log(canvas.toObject());
        }

        /**
         * Exports canvas elements with added identifications to a global variable.
         */
        function exportCanvas(){
            DiagramElement.allElements.forEach(object => {
                object.addIdentificationToCanvasElements();
              });
            var json = JSON.stringify(canvas);
            canvasJsonLastExported = json;
            //console.log(canvas.toObject());
            return json;
        }

        /**
         * Groups an array of items by their id property.
         * @param {Array} array - The array to group.
         * @returns {Array} An array of grouped items.
         */
        function groupById(array) {
            const map = new Map();
          
            array.forEach(item => {
              const key = item.id;
              const collection = map.get(key);
              if (!collection) {
                map.set(key, [item]);
              } else {
                collection.push(item);
              }
            });
          
            return [...map.values()];
          }

        /**
         * Reconstructs the canvas structure based on fabric objects.
         * @param {Array} fabricObjects - The array of fabric objects to reconstruct from.
         */
        function reconstructStructure(fabricObjects) {
            const groupedElements = groupById(fabricObjects);
    
            //fabricObjects.forEach(item => item.set({fill:'red'}))
        
            groupedElements.forEach(subArray => {
                var params = '';
                const activeBox = 'activeBox';
                activeBoxesArray = subArray.filter(item => item.elementPart === activeBox);
                subArray = subArray.filter(item => item.elementPart !== activeBox);
                if (subArray.length > 0) {
                    
                    console.log('groupedElements.length:' + groupedElements.length)
                    subArray.forEach(function(item, index) {
                       params +=(`${item.elementPart} = subArray[${index}],`);
                    });
                    params = 'canvas = canvas, position = subArray[0].getCoords()[0], ' + params.slice(0, -1);
                    const instantiationString = `new ${subArray[0].diagramElement}(${params})`;
                    console.log(instantiationString)
                    console.log(subArray[0].getCoords()[0])
                    // Use eval to dynamically evaluate the instantiation string
                    const diagramElement = eval(instantiationString);
                    console.log(diagramElement)
                    if (activeBoxesArray.length > 0){
                        diagramElement.addActiveBoxes(activeBoxesArray)
                    }
                }
            });
        }

        /**
         * Imports canvas structure from a selected JSON file.
         */
        async function importCanvasFile(){
            const jsonData = await loadJsonFromFile();
            canvas.loadFromJSON(jsonData);
            reconstructStructure(canvas.getObjects());
        }

        /**
         * Imports canvas structure from the last exported global variable.
         */
        function importCanvas(json){
            canvas.loadFromJSON(json)
            reconstructStructure(canvas.getObjects())
        }

        /**
         * Initiates a download of an image.
         * @param {string} dataURL - The base64 encoded URL of the image.
         * @param {string} filename - The filename for the downloaded image.
         */
        function downloadImage(dataURL, filename) {
            let a = document.createElement('a');
            a.href = dataURL;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }

        // Add event listener for the keydown event
        window.addEventListener('keydown', function (e) {
            // Check if the pressed key is 'Delete'
            if (e.keyCode === 46) {
            // Get the currently active object
            var activeObject = canvas.getActiveObject();
            // If there's an active object, remove it
            if (activeObject) {
                DiagramElement.allElements.forEach(object => {
                    object.addIdentificationToCanvasElements();
                  });
                idParent = activeObject.id;
                var foundObject = DiagramElement.allElements.find(obj => obj.elementId == idParent);
                if (activeObject.elementPart === "activeBox"){
                    //delete just active box
                    if (foundObject && activeObject.elementPart === "activeBox"){
                        foundObject.activeBoxes = foundObject.activeBoxes.filter(item => item !== activeObject);
                        canvas.remove(activeObject);
                    }
                }
                else{
                    foundObject.delete();  
                }
               
            }
        }});

        // Method to create a snapshot:
        function createSnapshot() {
            const snapshot = exportCanvas();

            if (currentSnapshotIndex !== snapshots.length - 1) {
                // Trim the snapshots after the current index
                snapshots = snapshots.slice(0, currentSnapshotIndex + 1);
            }

            snapshots.push(snapshot);
            currentSnapshotIndex++;
        }

        // Undo method:
        function undo() {
            if (currentSnapshotIndex > 0) {
                console.log('undo')
                currentSnapshotIndex--;
                const snapshot = snapshots[currentSnapshotIndex];
                disableSnapshotHandlers();
                importCanvas(snapshot);
                enableSnapshotHandlers();
            } else {
                console.log("Cannot undo further.");
            }
        }

        // Redo method:
        function redo() {
            if (currentSnapshotIndex < snapshots.length - 1) {
                console.log('redo')
                currentSnapshotIndex++;
                const snapshot = snapshots[currentSnapshotIndex];
                disableSnapshotHandlers();
                importCanvas(snapshot);
                enableSnapshotHandlers();
            } else {
                console.log("Cannot redo further.");
            }
        }

        //snapshot handlers
        function enableSnapshotHandlers(){
            canvas.on('object:modified', function() {
                createSnapshot();
              });
            isLiseningToCreatingClass = true;
        }

        function disableSnapshotHandlers(){
            canvas.off('object:modified', function() {
                createSnapshot();
              });
            isLiseningToCreatingClass = false;
        }

        /**
         * Handles drag and drop events and creates appropriate diagram elements on canvas based on the dropped object.
         * @param {Event} event - The drag end event object.
         * @param {string} object - The type of diagram element to create (e.g., 'class', 'actor').
         */
         function handleDragEnd(event,object) {
            const cElement = document.getElementById('myCanvas');
            const rect = cElement.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
                
                switch(object) {
                    case 'class':
                        new ClassWithLifeline(canvas, position = { x: x, y: y }, null, null, null, 'Class');
                        break;
                    case 'actor':
                        new ActorWithLifeline(canvas, position = { x: x, y: y }, null, null, null, 'User');
                        break;
                    case 'opt':
                        new CombinedFragment(canvas, { x: x, y: y }, null, null, null, 'otp');
                        break;
                    case 'alt':
                        new CombinedFragment(canvas, { x: x, y: y }, null, null, null, 'alt');
                        break;
                    case 'sd':
                        new CombinedFragment(canvas, { x: x, y: y }, null, null, null, 'sd');
                        break;
                    case 'neg':
                        new CombinedFragment(canvas, { x: x, y: y }, null, null, null, 'neg');
                        break;
                    case 'par':
                        new CombinedFragment(canvas, { x: x, y: y }, null, null, null, 'par');
                        break;
                    case 'loop':
                        new CombinedFragment(canvas, { x: x, y: y }, null, null, null, 'loop');
                        break;
                    case 'critical':
                        new CombinedFragment(canvas, { x: x, y: y }, null, null, null, 'critical');
                        break;
                    case 'ref':
                        new CombinedFragment(canvas, { x: x, y: y }, null, null, null, 'ref');
                        break;
                    case 'note':
                        new Note(canvas, { x: x, y: y });
                        break;
                    case 'message':
                        new Message(canvas, { x: x, y: y });
                        break;
                    default:
                        // code block
                }

            }
        }
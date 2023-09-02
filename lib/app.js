const originalToObject = fabric.Object.prototype.toObject;
fabric.Object.prototype.toObject = function (additionalProperties = []) {
    const additionalValues = ['id', 'diagramElement', 'elementPart','lockMovementX','lockMovementY','hasControls'].concat(additionalProperties);
    return originalToObject.call(this, additionalValues);
}


let canvas = new fabric.Canvas('myCanvas', { preserveObjectStacking: true, selection: false,backgroundColor:'white' });
        canvas.setHeight(document.getElementById("canvas_container").clientHeight);
        canvas.setWidth(document.getElementById("canvas_container").clientWidth);

        var canvasJsonLastExported;
        
        /* DEMO
        new CombinedFragment(canvas,'otp', { x: 50, y: 50 });
        new ActorWithLifeline(canvas, 'User', { x: 300, y: 50 });
        new ClassWithLifeline(canvas, 'System', { x: 400, y: 50 });
        new Note(canvas, { x: 300, y: 200 });
        
        let startPosition = { x: 300, y: 100 };
        let endPosition = { x: 500, y: 100 };

        let newMessage = new Message(canvas, startPosition, endPosition);
        */
        function clearCanvas()
        {
            canvas.clear();
            canvas.renderAll();
        }
        
        function saveCanvasAsImage() {
            let dataURL = canvas.toDataURL({
                format: 'png',
                enableRetinaScaling: true
  
            });
            
            downloadImage(dataURL, 'canvas_image.png');
        }

        function exportCanvas(){
            canvasJsonLastExported = JSON.stringify(canvas);
            console.log(canvas.toObject())
        }

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

        function processFirstElement(item) {
            // This is an example function. Replace with your desired logic.
            
        }

        function reconstructStructure(fabricObjects) {
            const groupedElements = groupById(fabricObjects);
    
            //fabricObjects.forEach(item => item.set({fill:'red'}))
        
            groupedElements.forEach(subArray => {
                var params = '';
                if (subArray.length > 0) {
                    
                    console.log('groupedElements.length:' + groupedElements.length)
                    subArray.forEach(function(item, index) {
                       params +=(`${item.elementPart} = subArray[${index}],`);
                    });
                    params = 'canvas = canvas, subArray[0].getCoords()[0], ' + params.slice(0, -1); // zbavení čarky
                    const instantiationString = `new ${subArray[0].diagramElement}(${params})`;
                    console.log(instantiationString)
                    console.log(subArray[0].getCoords()[0])
                    // Use eval to dynamically evaluate the instantiation string
                    const diagramElement = eval(instantiationString);
                }
            });
        }


        

        function importCanvas(){
            canvas.loadFromJSON(canvasJsonLastExported)
            reconstructStructure(canvas.getObjects())
        }

        function downloadImage(dataURL, filename) {
            let a = document.createElement('a');
            a.href = dataURL;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }

        

         function handleDragEnd(event,object) {
            const cElement = document.getElementById('myCanvas');
            const rect = cElement.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
                
                switch(object) {
                    case 'class':
                        new ClassWithLifeline(canvas, 'Class', { x: x, y: y });
                        break;
                    case 'actor':
                        new ActorWithLifeline(canvas, 'User', { x: x, y: y });
                        break;
                    case 'opt':
                        new CombinedFragment(canvas,'otp' ,{ x: x, y: y });
                        break;
                    case 'alt':
                        new CombinedFragment(canvas,'alt' ,{ x: x, y: y });
                        break;
                    case 'sd':
                        new CombinedFragment(canvas,'sd' ,{ x: x, y: y });
                        break;
                    case 'neg':
                        new CombinedFragment(canvas,'neg' ,{ x: x, y: y });
                        break;
                    case 'par':
                        new CombinedFragment(canvas,'par' ,{ x: x, y: y });
                        break;
                    case 'loop':
                        new CombinedFragment(canvas,'loop' ,{ x: x, y: y });
                        break;
                    case 'critical':
                        new CombinedFragment(canvas,'critical' ,{ x: x, y: y });
                        break;
                    case 'ref':
                        new CombinedFragment(canvas,'ref' ,{ x: x, y: y });
                        break;
                    case 'note':
                        new Note(canvas, { x: x, y: y });
                        break;
                    case 'message':
                        new Message(canvas, { x: x, y: y }, { x: x + 200, y: y });
                        break;
                    default:
                        // code block
                }

            }
        }
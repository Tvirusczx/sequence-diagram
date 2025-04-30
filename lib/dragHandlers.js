import ClassWithLifeline from './classWithLifeline.js';
import ActorWithLifeline from './actorWithLifeline.js';
import CombinedFragment from './combinedFragment.js';
import Note from './note.js';
import Message from './message.js';

/**
 * Handles drag and drop events and creates appropriate diagram elements on canvas based on the dropped object.
 */
export function handleDragEnd(event, object, canvas) {
    const cElement = document.getElementById('myCanvas');
    const rect = cElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
  
    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
      const position = { x, y };
  
      const type = object.toLowerCase();
  
      switch (type) {
        case 'class':
          new ClassWithLifeline(canvas, position, null, null, null, 'Class');
          break;
        case 'actor':
          new ActorWithLifeline(canvas, position, null, null, null, 'User');
          break;
        case 'opt':
        case 'alt':
        case 'sd':
        case 'neg':
        case 'par':
        case 'loop':
        case 'critical':
        case 'ref':
          new CombinedFragment(canvas, position, null, null, null, type);
          break;
        case 'note':
          new Note(canvas, position);
          break;
        case 'message':
          new Message(canvas, position);
          break;
        default:
          console.warn(`Unknown diagram type: ${object}`);
      }
    } else {
      console.log('Dropped outside canvas.');
    }
  }
  
  
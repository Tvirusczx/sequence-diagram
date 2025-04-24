# Sequence Diagram Editor

A browser-based graphical editor for creating and exporting UML sequence diagrams. Built with HTML5 canvas and powered by [fabric.js](http://fabricjs.com/), it offers a visual and interactive way to construct sequence diagrams.

---

## 🚀 Alpha Release: v0.1.0

The first alpha version is now available. While early in development, it includes essential features for diagram creation and export.

### ✅ Features

- Insert and arrange sequence diagram elements (lifelines, messages, notes)
- Undo/Redo support
- Save/load diagrams from `.json` project files
- Export diagram to PNG image
- Delete elements from canvas

### 🔧 Planned

- Prevent side stretching of lifelines
- Auto-resize notes
- Element snapping and alignment tools
- Customizable colors and styles
- Expandable canvas

---

## 🛠 Getting Started

### Option 1: Run Locally with Live Server (VS Code)

1. Open this project folder in VS Code.
2. Install the **Live Server** extension.
3. Right-click `index.html` → **"Open with Live Server"**
4. The app opens at `http://127.0.0.1:5500/` (or similar).

### Option 2: Run Locally with Docker

Run an NGINX container to serve the files:
```bash
docker run --rm -p 8080:80 -v "$PWD":/usr/share/nginx/html nginx
```
Then open [http://localhost:8080](http://localhost:8080) in your browser.

---

## 🧱 Project Architecture

- **index.html**: Entry point for the application
- **styles.css**: Styles for UI layout and element appearance
- **lib/**: Contains all custom JavaScript logic
  - Handles user interaction, undo/redo stack, save/load functionality
  - Integrates with `fabric.js` for drawing and manipulating canvas elements

The application uses **[fabric.js](http://fabricjs.com/)**, a powerful HTML5 canvas library, to render and manage graphical elements such as lifelines, arrows, and notes.

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "Add feature"`
4. Push to GitHub: `git push origin feature/my-feature`
5. Open a pull request 🎉

---

## 📄 License

MIT License — see the [LICENSE](LICENSE) file.

---

📦 Check out the latest release: [v0.1.0-alpha](https://github.com/Tvirusczx/sequence-diagram/releases/tag/v0.1.0-alpha)  
👁️ View on GitHub: [Tvirusczx/sequence-diagram](https://github.com/Tvirusczx/sequence-diagram)

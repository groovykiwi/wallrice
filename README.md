# 🎨 WallRice

**Colorize your images with diverse palettes in a macOS-inspired interface.**

![WallRice Preview](./docs/screenshot.png)
_Screenshot placeholder - Add your screenshot here_

---

## ✨ Features

- 🖼️ **Image Upload & Processing**: Upload or drag-and-drop images for colorization.
- 🎨 **12 Built-in Color Palettes**: Choose from themes like Catppuccin, Gruvbox, Dracula, and more.
- 🎯 **Custom Color Selection**: Select specific colors from palettes or add your own.
- 💻 **MacBook Preview**: Visualize your colorized wallpaper in a realistic macOS environment.
- 🖥️ **Terminal Simulation**: Interactive terminal window with syntax highlighting.
- 👁️ **UI Toggle**: Hide or show interface elements for clean previews.
- 📱 **Responsive Design**: Optimized for desktop and mobile devices.
- ⬇️ **Download Results**: Export colorized images as PNG files.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/yourusername/wallrice.git
    cd wallrice
    ```

2.  **Install dependencies**

    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Start the development server**

    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```

4.  **Open your browser**
    Navigate to [http://localhost:3000](http://localhost:3000) to see WallRice in action.

## 🎯 How to Use

1.  **Upload an Image**: Click the upload area or drag and drop an image file.
2.  **Choose a Color Palette**: Select from pre-built themes or define custom colors.
3.  **Select Colors**: Pick specific colors from the palette (up to 8 colors).
4.  **Process Image**: Click "Colorize Image" to apply the selected colors.
5.  **Preview**: View your colorized wallpaper in the MacBook preview.
6.  **Download**: Save your creation as a PNG file.

### Available Color Palettes

- **Catppuccin**
- **Gruvbox**
- **Dracula**
- **One Dark Pro**
- **GitHub Dark**
- **Tokyo Night**
- **Night Owl**
- **Material Theme**
- **Monokai Pro**
- **Nord**
- **Rosé Pine**
- **Horizon**

## 🛠️ Built With

- **[Next.js 15](https://nextjs.org/)**: React framework with App Router.
- **[React 19](https://react.dev/)**: UI library.
- **[TypeScript](https://www.typescriptlang.org/)**: Type safety.
- **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first CSS framework.
- **[Lucide React](https://lucide.dev/)**: Icon library.
- **Canvas API**: Image processing and colorization.

## 📁 Project Structure

```
wallrice/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main application page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── MacBookPreview.tsx # MacBook mockup component
│   └── LiquidGlass.tsx    # Glass effect components
├── lib/                   # Utilities and core logic
│   ├── colorPalettes.ts   # Color palette definitions
│   └── imageColorizer.ts  # Image processing logic
├── public/                # Static assets
│   ├── wallpaper.png      # Default wallpaper
│   └── *.png              # App icons for dock
└── README.md              # You are here!
```

## 🎨 Color Palette Structure

Each palette includes six carefully chosen colors:

```typescript
interface ColorPalette {
  name: string;
  colors: {
    bg: string; // Background color
    fg: string; // Foreground/text color
    primary: string; // Primary accent
    secondary: string; // Secondary accent
    accent: string; // Highlight color
    muted: string; // Muted/comment color
  };
}
```

## 🚀 Building for Production

```bash
npm run build
npm start
```

The application will be optimized and ready for deployment.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Color palettes inspired by popular terminal and editor themes.
- macOS design inspiration from Apple Inc.
- Community feedback and contributions.

---

**Made with ❤️ and lots of ☕**

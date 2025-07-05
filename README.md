# WallRice

**A small web utility to colorize your wallpapers with your own color palettes.**

Visit the live site: [wallrice.xyz](https://wallrice.xyz)

![WallRice Preview](/public/preview.png)

---

## Features

- **Built-in Color Palettes**: Choose from themes like Catppuccin, Gruvbox, Dracula, and more.
- **Custom Color Selection**: Select specific colors from palettes or add your own.
- **Advanced Colorization Settings**: Fine-tune saturation, contrast, brightness, and edge preservation for precise results.
- **Preview**: Visualize your colorized wallpaper in realistic device environments, including macOS and Linux styles.
- **Terminal Simulation**: Interactive terminal window with syntax highlighting.
- **UI Toggle**: Hide or show interface elements for clean previews.

## How It Works

WallRice uses a locally-executed image processing engine powered by the browser's Canvas API. The `imageColorizer.ts` utility handles all the heavy lifting, converting image colors using perceptually uniform Lab color space calculations. This ensures high-quality, accurate colorization without any cloud processing.

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

1.  **Clone the repository**

    ```bash
    git clone git@github.com:groovykiwi/wallrice.git
    cd wallrice
    ```

2.  **Install dependencies**

    ```bash
    pnpm install
    ```

3.  **Start the development server**

    ```bash
    pnpm dev
    ```

4.  **Open your browser**
    Navigate to [http://localhost:3000](http://localhost:3000) to see WallRice in action.

## How to Use

1.  **Upload an Image**: Click the upload area or drag and drop an image file.
2.  **Choose a Color Palette**: Select from pre-built themes or define custom colors.
3.  **Select Colors**: Pick specific colors from the palette (up to 8 colors).
4.  **Adjust Colorization**: Use the strength slider and advanced settings to fine-tune your image.
5.  **Process Image**: Click "Colorize" to apply the selected colors.
6.  **Preview**: View your colorized wallpaper in the preview.
7.  **Download**: Save your creation as a PNG file.

### Available Color Palettes

- **Catppuccin**
- **Gruvbox**
- **Dracula**
- **Everforest**
- **Tokyo Night**
- **Night Owl**
- **Nord**
- **Rosé Pine**
- **Ayu Dark**
- **Gruvbox Material**
- **Solarized Dark**
- **One Dark**

## Built With

- **[Next.js 15](https://nextjs.org/)**: React framework with App Router.
- **[React 19](https://react.dev/)**: UI library.
- **[TypeScript](https://www.typescriptlang.org/)**: Type safety.
- **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first CSS framework.
- **[Lucide React](https://lucide.dev/)**: Icon library.
- **Canvas API**: Image processing and colorization.

## Building for Production

```bash
pnpm run build
pnpm start
```

The application will be optimized and ready for deployment.

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Color palettes inspired by popular terminal and editor themes.
- The Arch Linux ricing community.
- macOS design inspiration from Apple Inc.

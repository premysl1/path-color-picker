# Path Color Picker

A client-side web application for sampling and extracting continuous color palettes along custom drawn paths across images. Built with vanilla JavaScript and the HTML5 Canvas API with zero dependencies.

## Features

- **Path Sampling**: Hold left-click and drag across any image region to continuously sample colors along the cursor path.
- **Pixel Scope**: Real-time magnified pixel grid centered on the cursor for precise pixel inspection.
- **Canvas Navigation**: Smooth zoom and right-click panning to navigate high-resolution images.
- **Adjustable Frequency**: Configurable sampling interval to control palette density.
- **Color Formats**: Real-time conversion across every web color format:
  - HEX / HEXA
  - RGB / sRGB
  - HSL / HSLA
  - HWB
  - OKLCH / OKLAB
  - LCH / LAB
  - XYZ D65 / XYZ D50
- **Palette Management & Export**: Interactive color swatch list, batch clipboard copy, and `.txt` file export.
- **Custom Background**: Single color or gradient canvas background for contrast checking.
- **Client-Side Processing**: All image processing and pixel manipulation run locally in the browser with no server requests.

## Technical Details

- **HTML5 Canvas & ImageData**: Direct pixel buffer reading via `getImageData` with coordinate mapping that accounts for dynamic canvas scaling, aspect ratio fitting, and pan offsets.
- Native state manipulation
- **Responsive Layout**: `ResizeObserver` integration for synchronized canvas dimensions and viewport scaling.
- **Zero Dependencies**: Pure HTML5, CSS3 (Grid, Flexbox, SVG masks), and modern JavaScript (ES6+).

## Controls

| Action | Input |
| :--- | :--- |
| Sample Colors | `Left-click + Drag` |
| Pan Canvas | `Right-click + Drag` |
| Load Image | Drag and drop, file selector, or example image button |
| Change Color Format | Format dropdown |
| Adjust Frequency | Sampling frequency number input |
| Export | Copy button or Download `.txt` button |

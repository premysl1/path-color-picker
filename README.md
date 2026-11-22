# Path Color Picker

A client-side web application for sampling and extracting color palettes along custom-drawn paths across images. Built with Next.js and React, using the HTML5 Canvas API for image display and pixel sampling.

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
- **Client-Side Processing**: Image loading and pixel sampling run locally in the browser; sampled colors are not sent to a server.

## Technical Details

- **HTML5 Canvas & ImageData**: Direct pixel buffer reading via `getImageData` with coordinate mapping that accounts for dynamic canvas scaling, aspect ratio fitting, and pan offsets.
- **React State and Refs**: React manages the sampled palette and image state, while refs hold canvas and pointer-interaction state.
- **Responsive Layout**: `ResizeObserver` integration keeps the canvas dimensions and viewport layout synchronized.
- **Styling**: CSS Grid, Flexbox, and SVG icons.

## Controls

| Action | Input |
| :--- | :--- |
| Sample Colors | `Left-click + Drag` |
| Pan Canvas | `Right-click + Drag` |
| Load Image | Drag and drop or file selector |
| Change Color Format | Format dropdown |
| Adjust Frequency | Sampling frequency number input |
| Export | Copy button or Download `.txt` button |

# Roadmap: move the picker from an iframe to a native Next.js app

## Where the project is now

The Next.js App Router page in `app/page.tsx` currently renders an `<iframe>` pointed at `/picker/index.html`. That means Next.js owns the outer page, while the actual picker is still a separate static HTML/CSS/JavaScript app under `public/picker`. Files in `public` are served as-is; Next.js does not turn them into React components or bundle their scripts as part of the page.

The typed `public/picker/main.ts` is a useful inventory of the existing behavior, but it is still imperative browser code: it finds elements with `document.querySelector`, creates DOM nodes, changes styles, and attaches event listeners. In React, the page’s markup is described by components and the changing UI is usually described by state. The canvas drawing and pixel-reading work can remain browser-side code and does not need to become React itself.

## Destination

Render the picker directly from the Next.js route, with no iframe and no second `index.html` app. Keep the App Router (`app/`) and make the interactive picker a **Client Component** because it needs browser APIs such as canvas, pointer events, file objects, clipboard access, and `ResizeObserver`. Keep image processing local to the browser. Use React for the interface and state, and ordinary canvas APIs for drawing and sampling.

## Suggested learning order

Before each stage, read the short documentation pages linked below. The goal is to learn just enough of each concept to complete that stage, rather than learning all of React or Next.js up front.

- [React: Quick Start](https://react.dev/learn): components, JSX, props, state, and event handlers.
- [React: Managing State](https://react.dev/learn/managing-state): choosing where state belongs and updating lists.
- [Next.js: Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components): why the interactive picker needs a client boundary.
- [React: Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects): setting up and cleaning up browser APIs that React does not manage.
- [React: Referencing Values with Refs](https://react.dev/learn/referencing-values-with-refs): reaching a canvas element and keeping mutable drawing data without rerendering for every pointer movement.

## Roadmap

### 1. Establish the app boundary and keep a working reference

**Learn:** what a React component returns, what JSX is, and what `"use client"` means in the App Router.

**Do:** Treat `app/page.tsx` as the route entry point. Plan a client-side picker component (for example, `app/components/Picker.tsx`) and have the route render it. Keep the existing iframe/static version available temporarily as a behavioral reference while implementing the native version. Do not put browser-only work at the top level of a Server Component or module; browser objects such as `window`, `document`, `Image`, and canvas contexts only exist in the browser.

**Done when:** the route renders a React-owned picker shell, and you can explain which component is the client boundary and why.

### 2. Move the static interface into JSX

**Learn:** JSX syntax and the difference between HTML attributes and JSX props (`className`, `htmlFor`, camel-cased event names, and closing tags).

**Do:** Use `public/picker/index.html` as the source of truth for the existing controls and layout. Move its interface into semantic JSX inside React components. A useful first split is `Picker` for the whole experience, `ImageWorkspace` for the canvas and pixel scope, and `Palette` for sampled colors and export controls. Keep the visual structure and labels familiar before changing behavior. Move the relevant rules from `public/picker/style.css` and `public/picker/base.css` into app-owned CSS (global styles for resets/shared rules and a CSS Module for picker-specific styles). Adjust asset URLs for files that remain under `public`.

**Done when:** the native route contains the complete picker markup and styles, with no iframe dependency. It is fine if some controls are not wired up yet.

### 3. Make canvas setup lifecycle-safe

**Learn:** `useRef` for DOM elements and `useEffect` for setup/cleanup.

**Do:** Give the canvas a ref and initialize its 2D context after the component mounts. Move the current `ResizeObserver` setup into an effect; disconnect it when the component is removed. Keep mutable drawing machinery such as `ImageData`, scale, translation, active pointer mode, and accumulated path length in refs or in a small canvas-focused module. Refs are suitable here because changing `tx` or drawing each pointer move should not rerender the entire React interface. Repaint after the canvas size changes, since assigning canvas width or height clears it.

**Done when:** the canvas sizes to its container, draws the example image, resizes cleanly, and no event observer remains attached after the component is removed.

### 4. Port image loading and canvas navigation

**Learn:** React event handlers, browser `File` objects, and effect cleanup.

**Do:** Port file selection, example-image loading, and drag-and-drop so each gives an image to one shared load function. Support both a URL string (the bundled example) and a `File` (user-selected image). For a `File`, create an object URL and revoke it when it is no longer needed. Then port fit-to-view, right-button panning, wheel zoom, pointer capture, and context-menu suppression. Keep coordinate conversion and canvas drawing together so there is one clear path from pointer coordinates to image coordinates.

**Done when:** example, file-picker, and dropped images load; panning and zooming work; repeated image replacement does not leak object URLs or leave stale pointer handlers.

### 5. Port sampling and the pixel scope

**Learn:** event handlers and what should (and should not) be React state.

**Do:** Move the existing pixel lookup, path interpolation/frequency logic, and color conversion into focused functions. Keep the canvas hot path imperative: pointer movement can draw the canvas and magnifier directly, while user-visible sampled colors are recorded as React state. Render the 9×9 scope from pixel values or update its small set of DOM nodes through a clearly isolated canvas/view helper. Preserve the distinction between an empty/transparent pixel and a sampled color. Check image bounds before reading pixels.

**Done when:** click-and-drag sampling works at both configured frequency modes, the magnifier follows the pointer, transparent pixels behave as intended, and every existing color format remains available.

### 6. Let React own the palette and controls

**Learn:** `useState`, rendering arrays with stable `key` values, controlled inputs, and lifting state to a shared parent.

**Do:** Store sampled color entries in state and render the clipboard/list from that state instead of manually calling `createElement`, `prepend`, or `replaceChildren`. Keep the count derived from the array length. Store the selected color format, sampling frequency, and background colors in React state and connect controls with `value`/`onChange`. Implement clear-canvas and delete-samples as explicit state transitions. Keep “most recent first” for the UI and reverse only when producing the newline-separated export, matching the current behavior.

**Done when:** there is one source of truth for each visible control/list, and React updates the visible count, swatches, and active/empty states after sampling or clearing.

### 7. Port clipboard, download, and interaction polish

**Learn:** calling browser APIs from client-side event handlers and handling rejected promises.

**Do:** Reconnect copy and `.txt` download to the React-rendered palette. Preserve the temporary copy confirmation and animation behavior, using component state/timers with cleanup where needed. Keep custom background colors and existing responsive styling. Check keyboard focus and button semantics while moving the old markup; use actual buttons and labels for interactive controls.

**Done when:** copy, download, clear actions, background controls, and responsive behavior work from the native page.

### 8. Remove the iframe app and finish the handoff

**Learn:** how Next.js serves files from `public` and how the route is assembled from `app`.

**Do:** Once the native implementation matches the reference, remove the iframe from `app/page.tsx`, then remove the duplicate static app under `public/picker` and any obsolete wrapper CSS. Keep only assets still used by the native route (for example, the example photo, license/attribution, and color-conversion module if it remains a separate module). Update the root README to describe the Next.js/React architecture and how to run it. Review the existing in-progress TypeScript conversion files before deleting or replacing them so useful work is not lost.

**Done when:** `/` is served entirely by the Next.js app, there is no iframe/static-app script entry point, and the README describes the app that is actually shipped.

## Practical checkpoints

After each stage, start the development server and manually compare the new route with the static reference using the same image and actions. Keep a short checklist of behaviors: load example, load local image, drop image, resize, pan, zoom, hover scope, sample at both frequency modes, switch each format, delete samples, clear image, copy, and download. Run the project’s existing `npm run lint` and `npm run build` before considering the migration complete.

## A few React/Next.js rules of thumb for this project

- A **component** is a function that returns a piece of UI. Components can be composed to split a large page into understandable parts.
- **JSX** looks like HTML but is JavaScript syntax, so attributes and expressions follow React rules.
- **State** is for values whose changes should update the UI. **Refs** are for mutable values the UI does not need to redraw around, such as a canvas context or current pan offset.
- An **effect** is for connecting a component to an outside system (observer, timer, or event listener); return cleanup so the connection is removed.
- A **Client Component** is required for interaction and browser APIs. It can still live inside the App Router; using one does not mean the whole app needs a custom server or a different framework.
- Do not try to make React redraw the canvas on every pointer event. React should own the controls and palette; the canvas API should own its high-frequency drawing.

# Pattern Generator

A TypeScript library for generating tiling patterns and Islamic tessellations, optimized for SvelteKit 5 with reactive geometry classes.

## Features

- **Reactive Geometry Classes**: Built with Svelte 5 runes (`$state`, `$derived`) for automatic reactivity
- **Simple Polygon Creation**: Easy constructors for regular polygons
- **Canvas Rendering**: High-DPI canvas rendering with automatic redraw
- **Interactive Controls**: Real-time polygon manipulation
- **Computed Properties**: Automatic area, perimeter, and center calculations

## Core Classes

### Point
```ts
// Create reactive points
const point = new Point(x, y);
point.x = 100; // Automatically reactive
```

### Polygon
```ts
// Create from vertices
const triangle = new Polygon([
  new Point(0, 0),
  new Point(100, 0), 
  new Point(50, 87)
]);

// Create regular polygons with config objects
const pentagon = new Polygon({ 
  sides: 5, 
  radius: 80, 
  centerX: 200, 
  centerY: 150 
});

// Or use static helpers
const hexagon = Polygon.hexagon(100, 250, 200);

// Reactive properties
console.log(pentagon.area);      // Auto-calculated
console.log(pentagon.perimeter); // Auto-calculated
console.log(pentagon.center);    // Auto-calculated
```

### Canvas Rendering

The library includes a powerful reactive canvas system that handles high-DPI rendering and automatic redrawing:

```ts
import { createCanvas } from './render/canvas.svelte';

const canvas = createCanvas({ width: 700, height: 600 });

// Add shapes - they auto-redraw when changed!
canvas.add(polygon);
```

### Features
- **High-DPI Support**: Automatic device pixel ratio detection
- **Reactive Rendering**: Auto-redraw when geometry changes
- **Simple API**: Just add shapes and forget about manual drawing
- **Style Management**: Built-in context save/restore

## Usage

```svelte
<script>
  import { Polygon } from './core/geometry';
  import { createCanvas } from './render/canvas.svelte';
  
  const canvas = createCanvas({ width: 700, height: 600 });
  let polygon = $state(new Polygon({ sides: 6, radius: 100 }));
  
  function changeShape() {
    canvas.clearRenderables();
    polygon = new Polygon({ sides: 8, radius: 120 });
    canvas.add(polygon);
  }
  
  onMount(() => {
    canvas.setup(canvas.canvas);
    canvas.add(polygon);
  });
</script>

<canvas bind:this={canvas.canvas}></canvas>
<button onclick={changeShape}>Octagon</button>
```

## Project Structure

```
src/
├── core/geometry/
│   ├── point.svelte.ts    # Reactive Point class
│   ├── polygon.svelte.ts  # Reactive Polygon class  
│   ├── vector.ts          # Vector2D class
│   └── index.ts           # Exports
├── render/
│   └── canvas.svelte.ts   # Reactive canvas utilities
├── lib/components/
│   └── CanvasRenderer.svelte # Interactive canvas demo
└── routes/
    └── +page.svelte       # Demo page
```

## Canvas API Reference

### createCanvas(config?)
Creates a new reactive canvas instance.

```ts
interface CanvasConfig {
  width?: number;
  height?: number;  
  pixelRatio?: number;
}

const canvas = createCanvas({ width: 800, height: 600 });
```

### Canvas Methods
- `setup(canvasElement)` - Initialize with HTML canvas element
- `add(renderable)` - Add shape with `.draw(ctx)` method
- `clearRenderables()` - Remove all added shapes
- `clearCanvas()` - Clear canvas content
- `withStyle(style, drawFn)` - Draw with temporary styles


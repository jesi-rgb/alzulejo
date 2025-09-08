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
```typescript
// Create reactive points
const point = new Point(x, y);
point.x = 100; // Automatically reactive
```

### Polygon
```typescript
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
```typescript
// Simple drawing
polygon.draw(ctx);

// Built-in high-DPI support
// Automatic reactivity with $effect()
```

## Usage

```svelte
<script>
  import { Polygon } from './core/geometry';
  
  let polygon = $state(new Polygon({ sides: 6, radius: 100 }));
  
  // Polygon automatically redraws when changed
  function changeShape() {
    polygon = new Polygon({ sides: 8, radius: 120 });
  }
</script>

<canvas bind:this={canvas}></canvas>
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
├── lib/components/
│   └── CanvasRenderer.svelte # Interactive canvas component
└── routes/
    └── +page.svelte       # Demo page
```

## Development

Built with:
- **SvelteKit 5**: Latest reactive framework
- **TypeScript**: Full type safety
- **Canvas 2D**: High-performance rendering
- **Runes**: `$state`, `$derived`, `$effect` for reactivity

Perfect foundation for building tessellation and tiling pattern generators!
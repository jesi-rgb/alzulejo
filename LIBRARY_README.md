# pattern-gen

Islamic geometric pattern and tessellation generator for Svelte 5 with reactive geometry and canvas rendering.

## Installation

```bash
npm install pattern-gen
# or
pnpm add pattern-gen
# or
bun add pattern-gen
```

## Quick Start

### Simple Usage with PatternCanvas Component

The easiest way to get started is using the `PatternCanvas` component:

```svelte
<script>
  import { PatternCanvas } from 'pattern-gen';
</script>

<PatternCanvas 
  type="hexagon" 
  size={100} 
  contactAngle={22.5}
  backgroundColor="#f5f5dc"
  showMotifFilled={true}
/>

<style>
  :global(canvas) {
    width: 100%;
    height: 600px;
  }
</style>
```

### Advanced Usage with Canvas and Tessellation Classes

For more control, use the core classes directly:

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { Canvas, Tessellation } from 'pattern-gen';
  
  let canvasElement: HTMLCanvasElement;
  let canvas: Canvas;
  
  const tessellation = new Tessellation({
    type: 'rhombitrihexagonal',
    size: 90,
    width: 800,
    height: 600,
    contactAngle: 22.5,
    backgroundColor: '#f5f5dc',
    style: {
      fill: '#2c3e50',
      fillOpacity: 1,
      stroke: '#1a252f',
      strokeWidth: 1.5
    }
  });
  
  onMount(() => {
    canvas = new Canvas();
    canvas.setup(canvasElement);
    
    // Render tessellation with options
    canvas.add(
      tessellation,
      false,  // showPolygons
      false,  // showMidpoints
      false,  // showRays
      false,  // showMotif
      true,   // showMotifFilled
      false   // showIntersectionPoints
    );
  });
</script>

<canvas bind:this={canvasElement} style="width: 100%; height: 600px;"></canvas>
```

## API Reference

### PatternCanvas Component

A simple wrapper component for easy usage.

**Props:**
- `type`: Tessellation type - `'triangle' | 'square' | 'hexagon' | 'octagon-square' | 'rhombitrihexagonal' | 'snub-square'` (default: `'hexagon'`)
- `size`: Pattern size in pixels (default: `100`)
- `width`: Canvas width (default: `800`)
- `height`: Canvas height (default: `600`)
- `contactAngle`: Motif generation angle in degrees (default: `22.5`)
- `backgroundColor`: Canvas background color (default: `'#f5f5dc'`)
- `showPolygons`: Display polygon outlines (default: `false`)
- `showMidpoints`: Show edge midpoints (default: `false`)
- `showRays`: Show generated rays (default: `false`)
- `showMotif`: Show motif outlines (default: `false`)
- `showMotifFilled`: Show filled motifs (default: `true`)
- `showIntersectionPoints`: Show ray intersections (default: `false`)
- `style`, `style1`, `style2`, `style3`: Style objects for different polygon types
- `class`: Additional CSS class for the canvas element

### Tessellation Class

**Constructor Options:**
```ts
interface TessellationConfig {
  type: 'triangle' | 'square' | 'hexagon' | 'octagon-square' | 'rhombitrihexagonal' | 'snub-square';
  size: number;
  width: number;
  height: number;
  offset?: number;
  contactAngle?: number;
  style?: Style;
  style1?: Style;
  style2?: Style;
  style3?: Style;
  motifColor?: string;
  backgroundColor?: string;
}
```

**Reactive Properties (using Svelte 5 runes):**
- All config properties are reactive - changes automatically trigger re-renders
- `polygons`: Computed array of generated polygons
- `num_elements`: Total number of polygons

### Canvas Class

**Methods:**
- `setup(canvasElement: HTMLCanvasElement)`: Initialize canvas
- `add(renderable, ...drawArgs)`: Add a renderable object (like Tessellation)
- `clearRenderables()`: Clear all renderables
- `updateSize()`: Update canvas size (useful for responsive layouts)

**Properties:**
- `animationDuration`: Animation duration in ms (default: `400`)
- `staggerDelay`: Stagger delay between shapes in ms (default: `400`)

### Style Interface

```ts
interface Style {
  fill?: string;
  fillOpacity?: number;
  stroke?: string;
  strokeWidth?: number;
  strokeOpacity?: number;
  motifColor?: string;
}
```

## Tessellation Types

- **Triangle** (3.3.3.3.3.3): Triangular tiling with alternating orientations
- **Square** (4.4.4.4): Regular square grid
- **Hexagon** (6.6.6): Honeycomb pattern
- **Octagon-Square** (4.8.8): Mixed octagon and square tiling
- **Rhombitrihexagonal** (3.4.6.4): Complex pattern combining triangles, squares, and hexagons
- **Snub Square** (3.3.4.3.4): Chiral tessellation with dynamic movement

## Reactive Updates Example

Thanks to Svelte 5 runes, all properties are reactive:

```svelte
<script>
  import { Tessellation, Canvas } from 'pattern-gen';
  
  const tessellation = new Tessellation({
    type: 'hexagon',
    size: 100,
    width: 800,
    height: 600
  });
  
  // Later, just update the property - canvas updates automatically!
  function changePattern() {
    tessellation.type = 'triangle';
    tessellation.size = 150;
  }
</script>
```

## TypeScript Support

This library is written in TypeScript and includes full type definitions. All types are exported from the main entry point.

```ts
import type { 
  CanvasConfig, 
  Style, 
  TilePosition 
} from 'pattern-gen';
```

## License

MIT

## Author

Jesús Rascón

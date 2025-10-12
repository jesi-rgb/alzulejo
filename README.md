# Alzulejo

Alzulejo (al-azulejo, andalusian tiles) is an islamic geometric pattern and tessellation generator for Svelte 5. A powerful library for creating beautiful tessellations with reactive geometry and high-performance canvas rendering.

**[npm package](https://www.npmjs.com/package/alzulejo)** • This repo includes both the library (in `src/lib/`) and an interactive demo application.

## Installation

```bash
npm install pattern-gen
# or
pnpm add pattern-gen
# or
bun add pattern-gen
```

## Quick Start

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

## Features

- **6 Tessellation Types**: Triangle, square, hexagon, octagon-square, rhombitrihexagonal, and snub-square tilings
- **Islamic Motif Generation**: Ray-based intersection algorithms for traditional Islamic patterns
- **Fully Reactive**: Built with Svelte 5 runes (`$state`, `$derived`) - all properties automatically update the canvas
- **High-Performance Rendering**: Optimized canvas rendering with batch processing and animations
- **TypeScript**: Full type definitions included
- **Zero Configuration**: Simple API that gets out of your way

## Library Usage

### Simple Component API

The easiest way to use the library:

```svelte
<script>
  import { PatternCanvas } from 'pattern-gen';
</script>

<PatternCanvas 
  type="rhombitrihexagonal" 
  size={90}
  contactAngle={22.5}
  backgroundColor="#f5f5dc"
  showMotifFilled={true}
  style={{
    fill: '#2c3e50',
    fillOpacity: 1,
    stroke: '#1a252f',
    strokeWidth: 1.5
  }}
/>
```

### Advanced: Using Core Classes

For more control, use the `Canvas` and `Tessellation` classes directly:

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { Canvas, Tessellation } from 'pattern-gen';
  
  let canvasElement: HTMLCanvasElement;
  let canvas: Canvas;
  
  const tessellation = new Tessellation({
    type: 'hexagon',
    size: 100,
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

### Reactive Updates

All properties are reactive thanks to Svelte 5 runes:

```svelte
<script>
  import { Tessellation } from 'pattern-gen';
  
  const tessellation = new Tessellation({
    type: 'hexagon',
    size: 100,
    width: 800,
    height: 600
  });
  
  // Just change the property - canvas updates automatically!
  function changePattern() {
    tessellation.type = 'triangle';
    tessellation.size = 150;
    tessellation.contactAngle = 45;
  }
</script>
```

## API Reference

### PatternCanvas Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'triangle' \| 'square' \| 'hexagon' \| 'octagon-square' \| 'rhombitrihexagonal' \| 'snub-square'` | `'hexagon'` | Tessellation pattern type |
| `size` | `number` | `100` | Pattern size in pixels |
| `width` | `number` | `800` | Canvas width |
| `height` | `number` | `600` | Canvas height |
| `contactAngle` | `number` | `22.5` | Motif generation angle (0-90°) |
| `backgroundColor` | `string` | `'#f5f5dc'` | Canvas background color |
| `showPolygons` | `boolean` | `false` | Display polygon outlines |
| `showMidpoints` | `boolean` | `false` | Show edge midpoints |
| `showRays` | `boolean` | `false` | Show generated rays |
| `showMotif` | `boolean` | `false` | Show motif outlines |
| `showMotifFilled` | `boolean` | `true` | Show filled motifs |
| `showIntersectionPoints` | `boolean` | `false` | Show ray intersections |
| `style`, `style1`, `style2`, `style3` | `Style` | - | Style objects for polygon types |
| `class` | `string` | `''` | Additional CSS class |

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

| Type | Notation | Description |
|------|----------|-------------|
| **Triangle** | (3.3.3.3.3.3) | Triangular tiling with alternating orientations |
| **Square** | (4.4.4.4) | Regular square grid |
| **Hexagon** | (6.6.6) | Honeycomb pattern |
| **Octagon-Square** | (4.8.8) | Mixed octagon and square tiling |
| **Rhombitrihexagonal** | (3.4.6.4) | Complex pattern with triangles, squares, and hexagons |
| **Snub Square** | (3.3.4.3.4) | Chiral tessellation with dynamic movement |

## How It Works

The library uses sophisticated geometric algorithms:

1. **Tessellation Generation**: Generates polygon positions based on mathematical tiling patterns
2. **Ray-Based Motifs**: Creates rays from polygon edge midpoints at the specified contact angle
3. **Intersection Calculation**: Finds optimal ray intersections to create Islamic motif patterns
4. **Batch Rendering**: Groups polygons by style for optimal canvas performance
5. **Animation System**: Staggered animations with configurable duration and delay

### Performance Features

- **High-DPI Support**: Automatic device pixel ratio handling
- **Reactive Updates**: Only redraws when geometry actually changes (thanks to Svelte 5 runes)
- **Batch Processing**: Minimizes canvas context switches
- **Memory Efficient**: Optimized polygon and ray generation algorithms

## Development & Demo

This repository contains both the library and an interactive demo app.

### Running the Demo

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build the demo
bun run build

# Preview demo build
bun run preview
```

### Building the Library

```bash
# Build library package
bun run package

# Type checking
bun run check
```

### Publishing to npm

```bash
# Build and publish
bun run package
npm publish
```

## Project Structure

```
src/
├── lib/                      # 📦 Library code (gets published)
│   ├── PatternCanvas.svelte  # Simple wrapper component
│   ├── core/geometry/        # Tessellation & geometry classes
│   ├── render/               # Canvas rendering system
│   └── index.ts              # Public API exports
└── routes/                   # 🎨 Demo application (not published)
    └── +page.svelte          # Interactive demo with controls
```

## Tech Stack

- **Svelte 5** with runes for reactivity
- **TypeScript** with full type definitions
- **SvelteKit** for demo and library packaging
- **Canvas API** for high-performance rendering

## License

MIT

## Author

Jesús Rascón


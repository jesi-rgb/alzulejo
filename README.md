# Islamic Tessellation & Motif Generator

An interactive SvelteKit application for generating Islamic geometric patterns and tessellations. Built with Svelte 5 runes and TypeScript, featuring advanced ray-casting algorithms for authentic Islamic motif generation and a real-time interactive demo.

## Features

- **Islamic Tessellations**: Triangle, square, hexagon, octagon-square, rhombitrihexagonal, and snub-square tilings
- **Geometric Motif Generation**: Ray-based intersection algorithms for traditional Islamic patterns
- **Reactive Geometry**: Built with Svelte 5 runes (`$state`, `$derived`) for automatic reactivity
- **High-Performance Rendering**: Optimized canvas rendering with batch processing
- **Interactive Demo**: Full-featured web application with real-time parameter controls and local storage persistence
- **Advanced Geometry Classes**: Point, Edge, Ray, and Polygon with complex intersection calculations
- **Responsive Design**: Mobile-friendly interface with adaptive layout

## Core Classes

### Point & Edge
```ts
import { Point, Edge } from '@lib/core/geometry';

const point = new Point(100, 50);
const edge = new Edge(new Point(0, 0), new Point(100, 100));

// Reactive properties
console.log(edge.midpoint);  // Automatically calculated
console.log(edge.angle);     // Edge angle in radians
console.log(edge.magnitude); // Edge length
```

### Polygon with Islamic Motifs
```ts
import { Polygon } from '@lib/core/geometry';

// Create regular polygons
const hexagon = Polygon.hexagon(100, 250, 200);
const octagon = Polygon.octagon(80, 400, 300);

// Configure for Islamic motif generation
hexagon.contactAngle = 22.5; // Contact angle for ray generation

// Access computed Islamic geometry
console.log(hexagon.rays);      // Generated rays from edge midpoints
console.log(hexagon.rayPairs);  // Optimized ray pairs for motifs
console.log(hexagon.apothem);   // Distance from center to edge
```

### Tessellation System
```ts
import { Tessellation } from '@lib/core/geometry';

const tessellation = new Tessellation({
  type: 'hexagon',
  size: 100,
  width: 800,
  height: 600,
  spacing: 5,
  contactAngle: 22.5,
  style: {
    fill: 'var(--accent)',
    fillOpacity: 0.9,
    stroke: 'black',
    strokeWidth: 1
  }
});

// Available tessellation types
// - 'triangle': Triangular tiling with alternating orientations
// - 'square': Square grid tessellation
// - 'hexagon': Honeycomb hexagonal tiling
// - 'octagon-square': Mixed octagon and square (4.8.8) tiling
```

### Canvas System
```ts
import { Canvas } from '@lib/render/canvas.svelte';

const canvas = new Canvas();
canvas.setup(canvasElement);

// Render tessellation with Islamic motifs
canvas.add(
  tessellation,
  true,   // showPolygons
  false,  // showMidpoints  
  false,  // showRays
  true,   // showMotif (Islamic patterns)
  false   // showIntersectionPoints
);
```

## Interactive Demo Usage

```svelte
<script>
  import { onMount } from 'svelte';
  import { Tessellation } from '@lib/core/geometry';
  import { Canvas } from '@lib/render/canvas.svelte';
  
  let canvas = new Canvas();
  let canvasElement: HTMLCanvasElement;
  
  const tessellation = new Tessellation({
    type: 'triangle',
    size: 150,
    width: 800,
    height: 600,
    contactAngle: 22.5,
    style: {
      fill: '#2563eb',
      fillOpacity: 0.8,
      stroke: '#1e40af',
      strokeWidth: 2
    }
  });
  
  onMount(() => {
    canvas.setup(canvasElement);
    canvas.add(tessellation, true, false, false, true, false);
  });
</script>

 <canvas bind:this={canvasElement}></canvas>
```

## Interactive Demo Features

The live demo provides comprehensive controls for exploring Islamic geometric patterns:

### Tessellation Controls
- **Type Selection**: Choose from 6 different tessellation patterns
- **Size Adjustment**: Real-time size control (5-280 units)
- **Contact Angle**: Adjust motif generation angle (0-90°)

### Visualization Options
- **Show Polygons**: Display the underlying tessellation structure
- **Show Midpoints**: Highlight polygon edge centers
- **Show Rays**: Display ray generation from midpoints
- **Show Motif**: Render the Islamic geometric patterns
- **Show Filled Motif**: Fill the motif shapes with color
- **Show Intersection Points**: Display ray intersection calculations

### Additional Features
- **Responsive Design**: Adapts to mobile and desktop screens
- **Local Storage**: Persists your settings between sessions
- **Real-time Updates**: Instant visual feedback for all parameter changes
- **Performance Stats**: Live display of polygon count and canvas dimensions

## Islamic Motif Generation

The library uses sophisticated geometric algorithms to generate authentic Islamic motifs:

1. **Ray Generation**: Creates rays from polygon edge midpoints at specified contact angles
2. **Intersection Calculation**: Finds optimal ray intersections using distance minimization
3. **Motif Optimization**: Pairs rays to create balanced, symmetrical patterns
4. **Batch Rendering**: Groups polygons by style for optimal performance

### Ray System
```ts
// Each polygon generates rays for Islamic motif creation
const polygon = Polygon.hexagon(100);
polygon.contactAngle = 30; // Angle in degrees

// Access generated rays and intersections
console.log(polygon.rays.length);     // Number of rays generated
console.log(polygon.rayPairs.length); // Optimized ray pairs for motifs
```

## Project Structure

```
src/
├── lib/
│   ├── core/geometry/
│   │   ├── patterns/
│   │   │   ├── index.ts            # Pattern exports
│   │   │   ├── types.ts            # Pattern type definitions
│   │   │   ├── TessellationPattern.ts # Base pattern class
│   │   │   ├── PolygonFactory.ts   # Polygon creation utilities
│   │   │   ├── TrianglePattern.ts  # Triangle tessellation
│   │   │   ├── SquarePattern.ts    # Square tessellation
│   │   │   ├── HexagonPattern.ts   # Hexagon tessellation
│   │   │   ├── OctagonSquarePattern.ts # Octagon-square tessellation
│   │   │   ├── RhombitrihexagonalPattern.ts # Rhombitrihexagonal tessellation
│   │   │   ├── SnubSquarePattern.ts # Snub square tessellation
│   │   │   ├── archimedean.tl      # Archimedean tiling data
│   │   │   └── hanbury.tl          # Hanbury pattern data
│   │   ├── geometry.ts             # Vector2D utilities
│   │   ├── point.svelte.ts         # Point, Edge, Ray classes
│   │   ├── polygon.svelte.ts       # Polygon with Islamic motif generation
│   │   ├── tessellation.svelte.ts  # Tessellation system
│   │   ├── style.svelte.ts         # Styling interface
│   │   └── index.ts                # Main exports
│   ├── render/
│   │   └── canvas.svelte.ts        # High-performance canvas system
│   └── components/
│       └── CanvasRenderer.svelte   # Interactive demo component
├── routes/
│   ├── +layout.svelte              # App layout
│   └── +page.svelte                # Interactive demo page
├── app.css                         # Global styles
├── app.d.ts                        # TypeScript declarations
├── app.html                        # HTML template
└── index.ts                        # Main entry point
```

## Tessellation Types

### Triangle (3.3.3.3.3.3)
Triangular tiling with alternating upward and downward orientations, creating a pattern where six triangles meet at each vertex.

### Square (4.4.4.4) 
Regular square grid tessellation where four squares meet at each vertex.

### Hexagon (6.6.6)
Honeycomb pattern where three regular hexagons meet at each vertex.

### Octagon-Square (4.8.8)
Complex tiling where each vertex is surrounded by one square and two octagons, creating the classic Islamic geometric pattern.

### Rhombitrihexagonal (3.4.6.4)
Semi-regular tessellation combining triangles, squares, and hexagons in a complex pattern where each vertex has three different polygon types.

### Snub Square (3.3.4.3.4)
Chiral tessellation featuring squares and triangles arranged in a twisted, asymmetric pattern that creates dynamic visual movement.

## Advanced Features

### Style System
```ts
interface Style {
  fill?: string;
  fillOpacity?: number;
  stroke?: string;
  strokeWidth?: number;
  strokeOpacity?: number;
}
```

### Performance Optimizations
- **Batch Rendering**: Groups shapes by style to minimize context switches
- **High-DPI Support**: Automatic device pixel ratio handling
- **Reactive Updates**: Only redraws when geometry actually changes
- **Memory Management**: Efficient polygon and ray generation algorithms

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run check

# Type checking with watch mode
npm run check:watch
```

### Tech Stack

- **Framework**: SvelteKit 2.22.0
- **Language**: TypeScript 5.0.0
- **UI Framework**: Svelte 5.0.0
- **Build Tool**: Vite 7.0.4
- **Styling**: Custom CSS with CSS variables


import type { Style } from './core/geometry/style.svelte';
interface PatternCanvasProps {
    type?: 'triangle' | 'square' | 'hexagon' | 'octagon-square' | 'rhombitrihexagonal' | 'snub-square';
    size?: number;
    width?: number;
    height?: number;
    contactAngle?: number;
    backgroundColor?: string;
    showPolygons?: boolean;
    showMidpoints?: boolean;
    showRays?: boolean;
    showMotif?: boolean;
    showMotifFilled?: boolean;
    showIntersectionPoints?: boolean;
    style?: Style;
    style1?: Style;
    style2?: Style;
    style3?: Style;
    animationDuration?: number;
    staggerDelay?: number;
    class?: string;
}
declare const PatternCanvas: import("svelte").Component<PatternCanvasProps, {}, "">;
type PatternCanvas = ReturnType<typeof PatternCanvas>;
export default PatternCanvas;

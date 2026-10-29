export interface CameraTrajectoryState {
  posX: number;
  posY: number;
  posZ: number;
  targetX: number;
  targetY: number;
  targetZ: number;
  fov: number;
  scrollProgress: number; // 0.0 to 1.0
}

export interface MouseParallaxState {
  normalizedX: number; // -1 to 1
  normalizedY: number; // -1 to 1
}

export interface StoryCardData {
  id: string;
  jpTitle: string;
  enTitle: string;
  quote: string;
  narrative: string;
  timeCode: string;
  accentColor: string; // e.g. "sakura", "twilight", "amber"
}

export interface AnimeSkyDomeProps {
  radius?: number;
  zenithColor?: string;
  upperSkyColor?: string;
  midSkyColor?: string;
  twilightColor?: string;
  horizonColor?: string;
  cityGlowColor?: string;
  nebulaColorA?: string;
  nebulaColorB?: string;
  starDensity?: number;
  nebulaIntensity?: number;
}

export interface AnimeMoonProps {
  position?: [number, number, number];
  radius?: number;
  haloScale?: number;
}

export interface DistantSkylineProps {
  buildingCount?: number;
  seed?: number;
}

export interface RooftopRailingProps {
  deckWidth?: number;
  deckDepth?: number;
  deckHeight?: number;
  railingHeight?: number;
  stanchionCount?: number;
}

export interface CoupleSilhouetteProps {
  position?: [number, number, number];
  scale?: number;
}

export interface SakuraTreesProps {
  windIntensity?: number;
}

export interface SceneLightingProps {
  moonlightIntensity?: number;
  moonlightColor?: string;
  moonlightPosition?: [number, number, number];
  moonlightTarget?: [number, number, number];

  cityBounceIntensity?: number;
  cityBounceColor?: string;
  cityBouncePosition?: [number, number, number];
  cityBounceTarget?: [number, number, number];

  ambientTwilightIntensity?: number;
  ambientSkyColor?: string;
  ambientGroundColor?: string;

  sakuraRimIntensity?: number;
  sakuraRimColor?: string;
  sakuraRimPosition?: [number, number, number];
  theme?: 'sakura' | 'rain' | 'dawn';
}

export interface RainParticlesProps {
  count?: number; // default: 750
  speed?: number; // default: 24.0
  windX?: number; // default: -1.2
  yMin?: number; // default: -22.0
  yMax?: number; // default: 14.0
}

export interface DawnMotesProps {
  count?: number; // default: 220
  driftSpeed?: number; // default: 0.25
  yMin?: number; // default: -2.0
  yMax?: number; // default: 9.0
}

export interface RooftopCanvasProps {
  className?: string;
  theme?: 'sakura' | 'rain' | 'dawn';
  children?: React.ReactNode;
}

export interface RooftopCanvasInnerProps {
  theme?: 'sakura' | 'rain' | 'dawn';
  children?: React.ReactNode;
}

export interface SakuraPetalsProps {
  count?: number; // default: 350 (clamped: 50 to 1000)
  windIntensity?: number; // default: 1.0
  fallSpeed?: number; // default: 1.0
  terminalVelocity?: number;
  baseWind?: number;
  turbStrength?: number;
  yMin?: number;
  yMax?: number;
  spawnBounds?: {
    xMin: number;
    xMax: number;
    zMin: number;
    zMax: number;
  };
}

export interface CameraControllerProps {
  trajectoryRef?: React.RefObject<CameraTrajectoryState | null> | React.MutableRefObject<CameraTrajectoryState>;
  enableParallax?: boolean;
  parallaxLambda?: number;
  maxShiftX?: number; // default: 0.8
  maxShiftY?: number; // default: 0.5
  lookAtFactor?: number; // default: 0.3
  fovLimits?: [number, number]; // default: [40, 65]
  basePosition?: [number, number, number]; // default: [0, 2.4, 9.0]
  baseLookAt?: [number, number, number]; // default: [0, 1.9, 0]
}

export interface Scene1HeroProps {
  children?: React.ReactNode;
  theme?: 'sakura' | 'rain' | 'dawn';
  showPetals?: boolean;
  petalsProps?: SakuraPetalsProps;
  showCameraController?: boolean;
  cameraControllerProps?: CameraControllerProps;
  lanternsTrigger?: number;
}


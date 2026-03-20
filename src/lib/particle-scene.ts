import {
  BufferAttribute,
  BufferGeometry,
  ClampToEdgeWrapping,
  DataTexture,
  FloatType,
  Mesh,
  MeshBasicMaterial,
  NearestFilter,
  OrthographicCamera,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  RGBAFormat,
  Raycaster,
  Scene,
  ShaderMaterial,
  Color,
  Vector2,
  Vector3,
  WebGLRenderer,
  WebGLRenderTarget
} from 'three';
import PoissonDiskSampling from 'poisson-disk-sampling';

const GLSL_NOISE = `
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
  float permute(float x){return floor(mod(((x*34.0)+1.0)*x, 289.0));}

  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
  float taylorInvSqrt(float r){return 1.79284291400159 - 0.85373472095314 * r;}

  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
            -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
      dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  float snoise(vec3 v){
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 =   v - i + dot(i, C.xxx) ;
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );
    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1. + 3.0 * C.xxx;
    i = mod(i, 289.0 );
    vec4 p = permute( permute( permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
    float n_ = 1.0/7.0;
    vec3  ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                  dot(p2,x2), dot(p3,x3) ) );
  }
`;

class Noise1D {
  private readonly maxVertices = 256;
  private readonly maxMask = this.maxVertices - 1;
  private readonly r: number[] = [];
  amplitude = 1;
  scale = 1;

  constructor() {
    for (let i = 0; i < this.maxVertices; i += 1) {
      this.r.push(Math.random());
    }
  }

  getVal(x: number): number {
    const scaled = x * this.scale;
    const xi = Math.floor(scaled);
    const t = scaled - xi;
    const smooth = t * t * (3 - 2 * t);
    const xMin = xi & this.maxMask;
    const xMax = (xMin + 1) & this.maxMask;
    return this.lerp(this.r[xMin], this.r[xMax], smooth) * this.amplitude;
  }

  private lerp(a: number, b: number, t: number): number {
    return a * (1 - t) + b * t;
  }
}

export type ParticleSceneOptions = {
  container: HTMLElement;
  canvas: HTMLCanvasElement;
  theme: 'light' | 'dark';
  particlesScale: number;
  density: number;
  ringWidth: number;
  ringWidth2: number;
  ringDisplacement: number;
  interactive: boolean;
};

function mapRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

class ParticleSimulation {
  private readonly scene: ParticleScene;
  private readonly renderer: WebGLRenderer;

  private simScene!: Scene;
  private simCamera!: OrthographicCamera;
  private simMaterial!: ShaderMaterial;
  private renderMaterial!: ShaderMaterial;
  private mesh!: Points;

  private rt1!: WebGLRenderTarget;
  private rt2!: WebGLRenderTarget;
  private posTex!: DataTexture;

  private noise = new Noise1D();
  private ringPos = new Vector2(0, 0);
  private cursorPos = new Vector2(0, 0);

  private size = 256;
  private length = this.size * this.size;
  private count = 0;
  private pointsData: number[] = [];

  private lastTime = 0;
  private everRendered = false;
  private particleScale = 1;

  constructor(scene: ParticleScene) {
    this.scene = scene;
    this.renderer = scene.renderer;
    this.particleScale = this.computeParticleScale();

    this.createPoints();
    this.init();
  }

  resize(): void {
    this.renderMaterial.uniforms['uRez'].value = new Vector2(
      this.scene.renderer.domElement.width,
      this.scene.renderer.domElement.height
    );
    this.renderMaterial.uniforms['uPixelRatio'].value = this.scene.pixelRatio;
    this.renderMaterial.needsUpdate = true;
  }

  update(): void {
    const now = this.scene.clockTime;
    const dt = now - this.lastTime;
    this.lastTime = now;

    const nx = (this.noise.getVal(this.scene.time * 0.66 + 94.234) - 0.5) * 2;
    const ny = (this.noise.getVal(this.scene.time * 0.75 + 21.028) - 0.5) * 2;

    this.cursorPos.set(nx * 0.2, ny * 0.1);

    if (this.scene.isIntersecting) {
      // Convert world-space raycast hit to particle local space.
      const planeHalf = this.scene.raycastPlaneSize * 0.5;
      this.cursorPos.set(this.scene.intersectionPoint.x / planeHalf, this.scene.intersectionPoint.y / planeHalf);
      // Cursor is the interaction center (no lag drift).
      this.ringPos.copy(this.cursorPos);
    } else {
      this.ringPos.set(
        this.ringPos.x + (this.cursorPos.x - this.ringPos.x) * 0.01,
        this.ringPos.y + (this.cursorPos.y - this.ringPos.y) * 0.01
      );
    }

    this.particleScale = this.computeParticleScale();

    this.simMaterial.uniforms['uPosition'].value = this.everRendered ? this.rt1.texture : this.posTex;
    this.simMaterial.uniforms['uTime'].value = now;
    this.simMaterial.uniforms['uDeltaTime'].value = dt;
    this.simMaterial.uniforms['uRingRadius'].value = 0.175 + Math.sin(this.scene.time * 1) * 0.03 + Math.cos(this.scene.time * 3) * 0.02;
    this.simMaterial.uniforms['uRingPos'].value = this.ringPos;
    this.simMaterial.uniforms['uRingWidth'].value = this.scene.ringWidth;
    this.simMaterial.uniforms['uRingWidth2'].value = this.scene.ringWidth2;
    this.simMaterial.uniforms['uRingDisplacement'].value = this.scene.ringDisplacement;

    this.renderer.setRenderTarget(this.rt2);
    this.renderer.render(this.simScene, this.simCamera);
    this.renderer.setRenderTarget(null);

    this.renderMaterial.uniforms['uPosition'].value = this.everRendered ? this.rt2.texture : this.posTex;
    this.renderMaterial.uniforms['uTime'].value = now;
    this.renderMaterial.uniforms['uRingPos'].value = this.ringPos;
    this.renderMaterial.uniforms['uParticleScale'].value = this.particleScale;
  }

  postRender(): void {
    const tmp = this.rt1;
    this.rt1 = this.rt2;
    this.rt2 = tmp;
    this.everRendered = true;
  }

  kill(): void {
    this.mesh.geometry.dispose();
    if (Array.isArray(this.mesh.material)) {
      for (const material of this.mesh.material) {
        material.dispose();
      }
    } else {
      this.mesh.material.dispose();
    }
    this.rt1.dispose();
    this.rt2.dispose();
    this.posTex.dispose();
    this.simMaterial.dispose();
    this.renderMaterial.dispose();
  }

  private computeParticleScale(): number {
    return (this.scene.renderer.domElement.width / this.scene.pixelRatio / 2000) * this.scene.particlesScale;
  }

  private createPoints(): void {
    const pds = new PoissonDiskSampling({
      shape: [500, 500],
      minDistance: mapRange(this.scene.density, 0, 300, 10, 2),
      maxDistance: mapRange(this.scene.density, 0, 300, 11, 3),
      tries: 20
    });

    const pts = pds.fill() as number[][];
    this.pointsData = [];
    for (let i = 0; i < pts.length; i += 1) {
      this.pointsData.push(pts[i][0] - 250, pts[i][1] - 250);
    }
    this.count = this.pointsData.length / 2;
  }

  private createDataTexturePosition(): DataTexture {
    const data = new Float32Array(this.length * 4);
    for (let i = 0; i < this.count; i += 1) {
      const idx = i * 4;
      data[idx] = this.pointsData[i * 2] * (1 / 250);
      data[idx + 1] = this.pointsData[i * 2 + 1] * (1 / 250);
      data[idx + 2] = 0;
      data[idx + 3] = 0;
    }

    const tex = new DataTexture(data, this.size, this.size, RGBAFormat, FloatType);
    tex.needsUpdate = true;
    return tex;
  }

  private createRenderTarget(): WebGLRenderTarget {
    return new WebGLRenderTarget(this.size, this.size, {
      wrapS: ClampToEdgeWrapping,
      wrapT: ClampToEdgeWrapping,
      minFilter: NearestFilter,
      magFilter: NearestFilter,
      format: RGBAFormat,
      type: FloatType,
      depthBuffer: false,
      stencilBuffer: false
    });
  }

  private init(): void {
    this.posTex = this.createDataTexturePosition();
    this.rt1 = this.createRenderTarget();
    this.rt2 = this.createRenderTarget();

    this.renderer.setRenderTarget(this.rt1);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.clear();
    this.renderer.setRenderTarget(this.rt2);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.clear();
    this.renderer.setRenderTarget(null);

    this.simScene = new Scene();
    this.simCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this.simMaterial = new ShaderMaterial({
      uniforms: {
        uPosition: { value: this.posTex },
        uPosRefs: { value: this.posTex },
        uRingPos: { value: new Vector2(0, 0) },
        uRingRadius: { value: 0.2 },
        uDeltaTime: { value: 0 },
        uRingWidth: { value: 0.05 },
        uRingWidth2: { value: 0.015 },
        uRingDisplacement: { value: this.scene.ringDisplacement },
        uTime: { value: 0 }
      },
      vertexShader: `
        void main() {
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;
        uniform sampler2D uPosition;
        uniform sampler2D uPosRefs;
        uniform vec2 uRingPos;
        uniform float uTime;
        uniform float uDeltaTime;
        uniform float uRingRadius;
        uniform float uRingWidth;
        uniform float uRingWidth2;
        uniform float uRingDisplacement;

        ${GLSL_NOISE}

        void main() {
          vec2 simTexCoords = gl_FragCoord.xy / vec2(${this.size.toFixed(1)}, ${this.size.toFixed(1)});
          vec4 pFrame = texture2D(uPosition, simTexCoords);

          float scale = pFrame.z;
          float velocity = pFrame.w;
          vec2 refPos = texture2D(uPosRefs, simTexCoords).xy;

          float time = uTime * .5;
          vec2 currentPos = refPos;

          vec2 pos = pFrame.xy;
          pos *= .8;

          float dist = distance(currentPos.xy, uRingPos);
          float noise0 = snoise(vec3(currentPos.xy * .2 + vec2(18.4924, 72.9744), time * 0.5));
          float dist1 = distance(currentPos.xy + (noise0 * .005), uRingPos);

          float t = smoothstep(uRingRadius - (uRingWidth * 2.), uRingRadius, dist) - smoothstep(uRingRadius, uRingRadius + uRingWidth, dist1);
          float t2 = smoothstep(uRingRadius - (uRingWidth2 * 2.), uRingRadius, dist) - smoothstep(uRingRadius, uRingRadius + uRingWidth2, dist1);
          float t3 = smoothstep(uRingRadius + uRingWidth2, uRingRadius, dist);

          t = pow(t, 2.);
          t2 = pow(t2, 3.);

          t += t2 * 3.;
          t += t3 * .4;
          t += snoise(vec3(currentPos.xy * 30. + vec2(11.4924, 12.9744), time * 0.5)) * t3 * .5;

          float nS = snoise(vec3(currentPos.xy * 2. + vec2(18.4924, 72.9744), time * 0.5));
          t += pow((nS + 1.5) * .5, 2.) * .6;

          float noise1 = snoise(vec3(currentPos.xy * 4. + vec2(88.494, 32.4397), time * 0.35));
          float noise2 = snoise(vec3(currentPos.xy * 4. + vec2(50.904, 120.947), time * 0.35));
          float noise3 = snoise(vec3(currentPos.xy * 20. + vec2(18.4924, 72.9744), time * .5));
          float noise4 = snoise(vec3(currentPos.xy * 20. + vec2(50.904, 120.947), time * .5));

          vec2 disp = vec2(noise1, noise2) * .03;
          disp += vec2(noise3, noise4) * .005;

          disp.x += sin((refPos.x * 20.) + (time * 4.)) * .02 * clamp(dist, 0., 1.);
          disp.y += cos((refPos.y * 20.) + (time * 3.)) * .02 * clamp(dist, 0., 1.);

          pos -= (uRingPos - (currentPos + disp)) * pow(t2, .75) * uRingDisplacement;

          float scaleDiff = t - scale;
          scaleDiff *= .2;
          scale += scaleDiff;

          vec2 finalPos = currentPos + disp + (pos * .25);

          velocity *= .5;
          velocity += scale * .25;

          gl_FragColor = vec4(finalPos, scale, velocity);
        }
      `
    });

    const simPlane = new Mesh(new PlaneGeometry(2, 2), this.simMaterial);
    this.simScene.add(simPlane);

    const geometry = new BufferGeometry();
    const uvs = new Float32Array(this.count * 2);
    const positions = new Float32Array(this.count * 3);
    const seeds = new Float32Array(this.count * 4);

    for (let i = 0; i < this.count; i += 1) {
      const x = i % this.size;
      const y = Math.floor(i / this.size);
      uvs[i * 2] = x / this.size;
      uvs[i * 2 + 1] = y / this.size;

      seeds[i * 4] = Math.random();
      seeds[i * 4 + 1] = Math.random();
      seeds[i * 4 + 2] = Math.random();
      seeds[i * 4 + 3] = Math.random();
    }

    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new BufferAttribute(uvs, 2));
    geometry.setAttribute('seeds', new BufferAttribute(seeds, 4));

    this.renderMaterial = new ShaderMaterial({
      uniforms: {
        uPosition: { value: this.posTex },
        uTime: { value: 0 },
        uColor1: { value: new Color(this.scene.theme === 'dark' ? '#7189ff' : '#2c64ed') },
        uColor2: { value: new Color(this.scene.theme === 'dark' ? '#3074f9' : '#f84242') },
        uColor3: { value: new Color(this.scene.theme === 'dark' ? '#000000' : '#ffcf03') },
        uAlpha: { value: 1 },
        uRingPos: { value: new Vector2(0, 0) },
        uRez: { value: new Vector2(this.scene.renderer.domElement.width, this.scene.renderer.domElement.height) },
        uParticleScale: { value: this.particleScale },
        uPixelRatio: { value: this.scene.pixelRatio },
        uColorScheme: { value: this.scene.theme === 'dark' ? 0 : 1 }
      },
      vertexShader: `
        precision highp float;
        attribute vec4 seeds;

        uniform sampler2D uPosition;
        uniform float uTime;
        uniform float uParticleScale;
        uniform float uPixelRatio;
        uniform int uColorScheme;

        varying vec4 vSeeds;
        varying float vVelocity;
        varying vec2 vLocalPos;
        varying vec2 vScreenPos;
        varying float vScale;
        varying float vDepth;

        void main() {
          vec4 pos = texture2D(uPosition, uv);
          vSeeds = seeds;

          vVelocity = pos.w;
          vScale = pos.z;

          float depthBase = (seeds.z - 0.5) * 0.62;
          float depthPulse = sin((uTime * 0.8) + (seeds.w * 6.2831853)) * 0.05;
          float depth = depthBase + depthPulse;

          vec2 layeredPos = pos.xy * (1.0 + depth * 0.12);
          vLocalPos = layeredPos;
          vDepth = depth;

          vec4 viewSpace  = modelViewMatrix * vec4(vec3(layeredPos, depth), 1.0);
          gl_Position = projectionMatrix * viewSpace;
          vScreenPos = gl_Position.xy;

          float depthScale = clamp(1.0 + depth * 0.6, 0.74, 1.5);
          gl_PointSize = ((vScale * 5.2) * (uPixelRatio * 0.5) * uParticleScale) * depthScale;
        }
      `,
      fragmentShader: `
        precision highp float;

        varying vec4 vSeeds;
        varying vec2 vScreenPos;
        varying vec2 vLocalPos;
        varying float vScale;
        varying float vVelocity;
        varying float vDepth;

        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform vec3 uColor3;

        uniform vec2 uRingPos;
        uniform vec2 uRez;

        uniform float uAlpha;
        uniform float uTime;
        uniform int uColorScheme;

        ${GLSL_NOISE}

        float sdRoundBox(in vec2 p, in vec2 b, in vec4 r) {
          r.xy = (p.x > 0.0) ? r.xy : r.zw;
          r.x  = (p.y > 0.0) ? r.x  : r.y;
          vec2 q = abs(p) - b + r.x;
          return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r.x;
        }

        vec2 rotate(vec2 v, float a) {
          float s = sin(a);
          float c = cos(a);
          mat2 m = mat2(c, s, -s, c);
          return m * v;
        }

        void main() {
          float ratio = uRez.x / uRez.y;
          float noiseAngle = snoise(vec3(vLocalPos * 10.0 + vec2(18.4924, 72.9744), uTime * .85));
          float noiseColor = snoise(vec3(vLocalPos * 2.0 + vec2(74.664, 91.556), uTime * .5));
          noiseColor = (noiseColor + 1.0) * .5;

          float angle = atan(vLocalPos.y - uRingPos.y, vLocalPos.x - uRingPos.x);

          vec2 uv = gl_PointCoord.xy;
          uv -= vec2(0.5);
          uv.y *= -1.0;
          uv = rotate(uv, -angle + (noiseAngle * .5));

          vec2 tuv = vScreenPos;
          tuv = rotate(tuv, uTime * 1.0);
          tuv.y *= 1.0 / ratio;
          tuv += .5;

          float h = 0.8;
          float progress = smoothstep(0.0, .75, pow(noiseColor, 2.0));
          vec3 col = mix(mix(uColor1, uColor2, progress / h), mix(uColor2, uColor3, (progress - h) / (1.0 - h)), step(h, progress));
          vec3 color = clamp(col, 0.0, 1.0);

          float rounded = sdRoundBox(uv, vec2(0.5, 0.2), vec4(.25));
          rounded = smoothstep(.1, 0.0, rounded);

          float depthOpacity = smoothstep(-0.35, 0.42, vDepth);
          float a = uAlpha * rounded * smoothstep(0.08, 0.2, vScale) * mix(0.72, 1.24, depthOpacity);

          if (a < 0.01) {
            discard;
          }

          float depthLight = smoothstep(-0.25, 0.5, vDepth);
          color = mix(color * 0.9, color * 1.12, depthLight);
          color = mix(color, color * clamp(vVelocity, 0.0, 1.0), float(uColorScheme));
          gl_FragColor = vec4(color, clamp(a, 0.0, 1.0));
        }
      `,
      transparent: true,
      depthTest: false,
      depthWrite: false
    });

    this.mesh = new Points(geometry, this.renderMaterial);
    this.mesh.position.set(0, 0, 0);
    // Compact, but still wide enough to cover the hero viewport.
    this.mesh.scale.set(5.6, 5.6, 5.6);
    this.scene.scene.add(this.mesh);
  }
}

export class ParticleScene {
  readonly renderer: WebGLRenderer;
  readonly scene: Scene;
  readonly camera: PerspectiveCamera;

  readonly pixelRatio: number;
  readonly particlesScale: number;
  readonly density: number;
  readonly ringWidth: number;
  readonly ringWidth2: number;
  readonly ringDisplacement: number;
  readonly interactive: boolean;
  readonly theme: 'light' | 'dark';
  readonly raycastPlaneSize = 12.5;

  readonly raycaster = new Raycaster();
  readonly mouse = new Vector2(0, 0);
  readonly intersectionPoint = new Vector3();

  isIntersecting = false;
  mouseIsOver = false;

  time = 0;
  dt = 0;
  clockTime = 0;

  private readonly container: HTMLElement;
  private readonly canvas: HTMLCanvasElement;
  private readonly raycastPlane: Mesh;
  private particles: ParticleSimulation | null = null;

  private isPaused = false;
  private skipFrame = false;
  private pointer = { x: 0, y: 0, active: false };

  constructor(options: ParticleSceneOptions) {
    this.container = options.container;
    this.canvas = options.canvas;
    this.theme = options.theme;

    this.pixelRatio = window.devicePixelRatio || 1;
    this.particlesScale = options.particlesScale;
    this.density = options.density;
    this.ringWidth = options.ringWidth;
    this.ringWidth2 = options.ringWidth2;
    this.ringDisplacement = options.ringDisplacement;
    this.interactive = options.interactive;

    this.scene = new Scene();
    this.renderer = new WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
      stencil: false,
      precision: 'highp'
    });

    this.renderer.setPixelRatio(this.pixelRatio);
    this.renderer.getContext().getExtension('EXT_color_buffer_float');
    this.canvas.width = Math.max(1, Math.floor(this.canvas.clientWidth || this.container.offsetWidth));
    this.canvas.height = Math.max(1, Math.floor(this.canvas.clientHeight || this.container.offsetHeight));
    this.renderer.setSize(this.canvas.width, this.canvas.height, false);

    this.camera = new PerspectiveCamera(40, this.canvas.width / this.canvas.height, 0.1, 1000);
    this.camera.position.z = 3.1;

    this.raycastPlane = new Mesh(
      new PlaneGeometry(this.raycastPlaneSize, this.raycastPlaneSize),
      new MeshBasicMaterial({ visible: false, color: 0xff0000 })
    );
    this.scene.add(this.raycastPlane);

    this.particles = new ParticleSimulation(this);
  }

  setPointer(clientX: number, clientY: number, active: boolean): void {
    this.pointer.x = clientX;
    this.pointer.y = clientY;
    this.pointer.active = active;
  }

  resize(): void {
    this.canvas.width = Math.max(1, Math.floor(this.canvas.clientWidth || this.container.offsetWidth));
    this.canvas.height = Math.max(1, Math.floor(this.canvas.clientHeight || this.container.offsetHeight));
    this.renderer.setSize(this.canvas.width, this.canvas.height, false);
    if (this.camera) {
      this.camera.aspect = this.canvas.width / this.canvas.height;
      this.camera.updateProjectionMatrix();
    }
    this.particles?.resize();
  }

  stop(): void {
    this.isPaused = true;
  }

  resume(): void {
    this.isPaused = false;
  }

  render(): void {
    if (this.isPaused) {
      return;
    }

    this.preRender();
    if (this.skipFrame) {
      return;
    }

    this.renderer.setRenderTarget(null);
    this.renderer.autoClear = false;
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);
    this.particles?.postRender();
  }

  kill(): void {
    this.particles?.kill();
    this.particles = null;
    this.scene.remove(this.raycastPlane);
    this.raycastPlane.geometry.dispose();
    (this.raycastPlane.material as MeshBasicMaterial).dispose();
    this.renderer.dispose();
  }

  private preRender(): void {
    const now = performance.now() / 1000;
    this.dt = now - this.clockTime;
    this.clockTime = now;
    this.time += this.dt;

    this.particles?.update();

    if (this.interactive && this.pointer.active) {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = ((this.pointer.x - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((this.pointer.y - rect.top) / rect.height) * 2 + 1;
      this.mouseIsOver = this.mouse.x >= -1 && this.mouse.x <= 1 && this.mouse.y >= -1 && this.mouse.y <= 1;
    } else {
      this.mouseIsOver = false;
    }

    this.skipFrame = !this.skipFrame;
    if (this.skipFrame) {
      return;
    }

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersections = this.raycaster.intersectObject(this.raycastPlane);

    if (intersections.length > 0 && this.mouseIsOver) {
      this.intersectionPoint.copy(intersections[0].point);
      this.isIntersecting = true;
    } else {
      this.isIntersecting = false;
    }
  }
}

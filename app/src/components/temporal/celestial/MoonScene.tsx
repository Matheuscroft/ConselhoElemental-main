import { useEffect, useRef, useState } from 'react';
import { AmbientLight, DirectionalLight, Group, Mesh, MeshStandardMaterial, OrthographicCamera, Scene, SphereGeometry, SRGBColorSpace, Texture, TextureLoader, WebGLRenderer } from 'three';
import { lunarLightDirection, type LunarSnapshot } from './lunar-presentation';
import { MoonDisc } from './MoonDisc';

/** Static 3D scene: redraw only on time/orientation/size changes, never an animation loop. */
export default function MoonScene({ moon, south }: { moon: LunarSnapshot; south: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controller = useRef<{ update: (moon: LunarSnapshot, south: boolean) => void } | null>(null);
  const [mode, setMode] = useState<'3d' | 'simple'>('simple');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
    } catch { return; }
    let disposed = false;
    let ready = false;
    let lost = false;
    const textures: Texture[] = [];
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    const scene = new Scene();
    const camera = new OrthographicCamera(-1.25, 1.25, 1.25, -1.25, .1, 20);
    camera.position.z = 5;
    const group = new Group();
    const geometry = new SphereGeometry(1, 96, 64);
    const material = new MeshStandardMaterial({ roughness: 1, metalness: 0, bumpScale: .009 });
    const sphere = new Mesh(geometry, material);
    // NASA map is centered on longitude 0 at u=.5; bring that meridian toward the camera.
    sphere.rotation.y = -Math.PI / 2;
    const sunlight = new DirectionalLight(0xffffff, 2.6);
    group.add(sphere, sunlight);
    scene.add(group, new AmbientLight(0xffffff, .018));
    const render = () => { if (!disposed && ready && !lost) renderer.render(scene, camera); };
    const resize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (!width || !height || disposed) return;
      const aspect = width / height;
      camera.left = -1.25 * Math.max(1, aspect);
      camera.right = -camera.left;
      camera.top = 1.25 * Math.max(1, 1 / aspect);
      camera.bottom = -camera.top;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      render();
    };
    controller.current = {
      update: (snapshot, southern) => {
        const light = lunarLightDirection(snapshot.phaseAngle, snapshot.waxing);
        sunlight.position.set(light[0] * 5, light[1] * 5, light[2] * 5);
        group.rotation.z = southern ? Math.PI : 0;
        render();
      },
    };
    const onContextLost = (event: Event) => { event.preventDefault(); lost = true; setMode('simple'); };
    canvas.addEventListener('webglcontextlost', onContextLost);
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    const loader = new TextureLoader();
    const load = async (url: string) => {
      const texture = await loader.loadAsync(url);
      if (disposed) texture.dispose();
      else textures.push(texture);
      return texture;
    };
    Promise.all([load('/temporal/moon/lroc-color-2k.jpg'), load('/temporal/moon/ldem-height-1k.jpg')]).then(([color, height]) => {
      if (disposed || lost) return;
      color.colorSpace = SRGBColorSpace;
      material.map = color;
      material.bumpMap = height;
      material.needsUpdate = true;
      ready = true;
      resize();
      setMode('3d');
    }).catch(() => { if (!disposed) setMode('simple'); });
    return () => {
      disposed = true;
      controller.current = null;
      observer.disconnect();
      canvas.removeEventListener('webglcontextlost', onContextLost);
      geometry.dispose();
      material.dispose();
      textures.forEach((texture) => texture.dispose());
      renderer.dispose();
    };
  }, []);

  useEffect(() => { controller.current?.update(moon, south); }, [moon, south]);
  return <div className="celestial-moon-render" data-mode={mode}>
    <canvas ref={canvasRef} aria-hidden="true" />
    {mode !== '3d' && <div className="celestial-moon-fallback"><MoonDisc phaseAngle={moon.phaseAngle} waxing={moon.waxing} south={south} /></div>}
    <span className="celestial-render-status" role="status">{mode === 'simple' ? 'Visualização simplificada · dados atualizados' : 'Superfície lunar em 3D'}</span>
  </div>;
}

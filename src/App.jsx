import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

const initialColors = {
  mind: '#ffd54a',
  money: '#4caf50',
  health: '#9c27b0',
  personal: '#f44336',
  social: '#2196f3',
  spirit: '#ff9800'
};

const events = [
  { title: 'Mind Game Workshop', date: '12 Jul 2026', loc: 'Delhi', cat: 'Mind', color: '#ffd54a', bg: 'linear-gradient(135deg, #ffd54a, #ffb300)' },
  { title: 'Money Game Blueprint', date: '21 Aug 2026', loc: 'Mumbai', cat: 'Money', color: '#4caf50', bg: 'linear-gradient(135deg, #4caf50, #2e7d32)' },
  { title: 'Health Game Challenge', date: '05 Sep 2026', loc: 'Bengaluru', cat: 'Health', color: '#9c27b0', bg: 'linear-gradient(135deg, #9c27b0, #6a1b9a)' },
  { title: 'Personal Growth Bootcamp', date: '11 Oct 2026', loc: 'Pune', cat: 'Personal', color: '#f44336', bg: 'linear-gradient(135deg, #f44336, #c62828)' },
  { title: 'Social Leadership Program', date: '20 Nov 2026', loc: 'Hyderabad', cat: 'Social', color: '#2196f3', bg: 'linear-gradient(135deg, #2196f3, #1565c0)' },
  { title: 'Spiritual Reflection Retreat', date: '02 Dec 2026', loc: 'Rishikesh', cat: 'Spiritual', color: '#ff9800', bg: 'linear-gradient(135deg, #ff9800, #e65100)' }
];

const stats = [
  { value: '50,000+', label: 'Students Impacted' },
  { value: '300+', label: 'Schools Reached' },
  { value: '100+', label: 'Workshops Conducted' },
  { value: '4.8/5', label: 'Student Rating' },
  { value: '25+', label: 'Cities Covered' }
];

const gameDefinitions = [
  { id: 'mind', label: 'Mind Game', color: initialColors.mind },
  { id: 'money', label: 'Money Game', color: initialColors.money },
  { id: 'health', label: 'Health Game', color: initialColors.health },
  { id: 'personal', label: 'Personal Game', color: initialColors.personal },
  { id: 'social', label: 'Social Game', color: initialColors.social },
  { id: 'spirit', label: 'Spiritual Game', color: initialColors.spirit }
];

function createPlanetTexture(color) {
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 256, 256);
  const noise = ctx.createImageData(256, 256);
  const data = noise.data;
  for (let i = 0; i < data.length; i += 4) {
    const val = Math.random() * 40;
    data[i] += val; data[i + 1] += val; data[i + 2] += val;
  }
  ctx.putImageData(noise, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function App() {
  const canvasRef = useRef(null);
  const sceneRef = useRef({});
  const [colors, setColors] = useState(initialColors);
  const [depth, setDepth] = useState(1);
  const [wave, setWave] = useState(1);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [statColors, setStatColors] = useState(stats.map(() => ({ r: 255, g: 255, b: 255 })));

  const gameControls = useMemo(
    () => [
      { id: 'mind', label: 'Mind', value: colors.mind },
      { id: 'money', label: 'Money', value: colors.money },
      { id: 'health', label: 'Health', value: colors.health },
      { id: 'personal', label: 'Personal', value: colors.personal },
      { id: 'social', label: 'Social', value: colors.social },
      { id: 'spirit', label: 'Spiritual', value: colors.spirit }
    ],
    [colors]
  );

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      setMousePos({ x, y });
      setStatColors(stats.map((stat, i) => {
        const hueShift = (x * 360 + i * 60) % 360;
        const saturation = 50 + y * 30;
        const lightness = 50 + (1 - y) * 20;
        return `hsl(${hueShift}, ${saturation}%, ${lightness}%)`;
      }));
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const container = canvasRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#050710');

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    camera.position.set(0, 0, 420);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    container.appendChild(renderer.domElement);

    const composer = new EffectComposer(renderer);
    composer.setSize(width, height);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(width, height), 1.2, 0.6, 0.9);
    bloom.threshold = 0.15;
    bloom.strength = 1.2;
    bloom.radius = 1;
    composer.addPass(bloom);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controls.enableZoom = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.minPolarAngle = Math.PI / 3.9;
    controls.maxPolarAngle = Math.PI / 1.75;

    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);
    const point = new THREE.PointLight(0xffffff, 0.7, 1000, 2);
    point.position.set(0, 200, 300);
    scene.add(point);

    const stars = new THREE.BufferGeometry();
    const starCount = 1600;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 2400;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 1400;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2200;
    }
    stars.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    scene.add(new THREE.Points(stars, new THREE.PointsMaterial({ color: '#ffffff', size: 1.8, opacity: 0.4, transparent: true })));

    const glitterGeo = new THREE.BufferGeometry();
    const glitterCount = 300;
    const glitterPos = new Float32Array(glitterCount * 3);
    for (let i = 0; i < glitterCount; i++) {
      glitterPos[i * 3] = (Math.random() - 0.5) * 500;
      glitterPos[i * 3 + 1] = (Math.random() - 0.5) * 500;
      glitterPos[i * 3 + 2] = (Math.random() - 0.5) * 500;
    }
    glitterGeo.setAttribute('position', new THREE.BufferAttribute(glitterPos, 3));
    const glitterMat = new THREE.PointsMaterial({ color: '#ffff88', size: 2.5, opacity: 0.6, transparent: true, sizeAttenuation: true });
    const glitterPoints = new THREE.Points(glitterGeo, glitterMat);
    scene.add(glitterPoints);

    const ringGroup = new THREE.Group();
    scene.add(ringGroup);

    const centerDisk = new THREE.Mesh(
      new THREE.SphereGeometry(40, 48, 48),
      new THREE.MeshStandardMaterial({ color: '#0f2034', emissive: '#051015', emissiveIntensity: 0.2, metalness: 0.3, roughness: 0.4 })
    );
    ringGroup.add(centerDisk);

    const segmentRefs = [];
    gameDefinitions.forEach(({ id, color, label }, index) => {
      const angle = index * (Math.PI / 3);
      const planetTexture = createPlanetTexture(color);
      const planet = new THREE.Mesh(
        new THREE.SphereGeometry(28, 48, 48),
        new THREE.MeshStandardMaterial({ map: planetTexture, emissive: color, emissiveIntensity: 0.25, metalness: 0.15, roughness: 0.65 })
      );
      planet.position.set(Math.cos(angle) * 130, Math.sin(angle) * 130, 0);
      planet.userData = { id, label };
      planet.castShadow = true;

      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ color, opacity: 0.15, transparent: true }));
      glow.scale.set(80, 80, 1);
      glow.position.copy(planet.position).multiplyScalar(0.9);
      glow.userData = { id };

      const orbitRing = new THREE.Mesh(
        new THREE.RingGeometry(128, 135, 120),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.08, side: THREE.DoubleSide })
      );
      orbitRing.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.3;
      orbitRing.position.copy(planet.position);

      const group = new THREE.Group();
      group.add(planet, glow, orbitRing);
      group.position.z = (Math.random() - 0.5) * 20;
      ringGroup.add(group);
      segmentRefs.push({ id, group, planet, glow, orbitRing });
    });

    const ringOutline = new THREE.Mesh(
      new THREE.RingGeometry(112, 130, 140),
      new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.04, side: THREE.DoubleSide })
    );
    ringOutline.rotation.x = Math.PI / 2;
    scene.add(ringOutline);

    const outerAura = new THREE.Mesh(
      new THREE.RingGeometry(160, 180, 140),
      new THREE.MeshBasicMaterial({ color: '#74c6ff', transparent: true, opacity: 0.05, side: THREE.DoubleSide })
    );
    outerAura.rotation.x = Math.PI / 2;
    scene.add(outerAura);

    let frameId = null;
    const clock = new THREE.Clock();

    const update = () => {
      const elapsed = clock.getElapsedTime();
      ringGroup.rotation.z = Math.sin(elapsed * 0.08) * 0.1;
      ringGroup.rotation.y = Math.sin(elapsed * 0.03) * 0.12;
      segmentRefs.forEach((ref, index) => {
        ref.group.position.z = Math.sin(elapsed * 0.6 + index * 0.95) * 12 * wave * 0.5;
        ref.planet.rotation.x += 0.0015;
        ref.planet.rotation.y += 0.002;
        if (ref.glow.material) ref.glow.material.opacity = 0.12 + Math.sin(elapsed * 1.5 + index) * 0.04;
      });
      const glitterPositions = glitterGeo.attributes.position.array;
      for (let i = 0; i < glitterCount; i++) {
        glitterPositions[i * 3 + 1] += Math.sin(elapsed * 0.5 + i) * 0.08;
        glitterPositions[i * 3 + 2] += Math.cos(elapsed * 0.3 + i) * 0.06;
      }
      glitterGeo.attributes.position.needsUpdate = true;
      controls.update();
      composer.render();
      frameId = requestAnimationFrame(update);
    };

    update();

    sceneRef.current = { scene, camera, renderer, composer, segmentRefs, ringGroup, glitterGeo, glitterCount };

    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
      composer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      composer.dispose();
      renderer.dispose();
      controls.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [wave]);

  useEffect(() => {
    if (!sceneRef.current.segmentRefs) return;
    sceneRef.current.segmentRefs.forEach((ref) => {
      const color = new THREE.Color(colors[ref.id]);
      ref.planet.material.emissive = color;
      ref.glow.material.color = color;
      ref.orbitRing.material.color = color;
    });
  }, [colors]);

  useEffect(() => {
    if (!sceneRef.current.segmentRefs) return;
    sceneRef.current.segmentRefs.forEach((ref) => {
      ref.group.position.z = ref.group.position.z * depth;
    });
  }, [depth]);

  const handleColorChange = (id, value) => setColors((prev) => ({ ...prev, [id]: value }));

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="brand-block">
          <div className="brand-mark">MT</div>
          <div>
            <div className="brand-title">Mission Tatva</div>
            <div className="brand-note">LifeOS</div>
          </div>
        </div>
        <nav className="nav-links">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#lifeos">LifeOS</a>
          <a href="#games">The 6 Games</a>
          <a href="#programs">Programs</a>
          <a href="#events">Events</a>
          <a href="#trust">Trust</a>
          <a href="#contact">Contact</a>
        </nav>
        <div className="header-actions">
          <button className="icon-btn">🔍</button>
          <button className="ghost-btn">Login</button>
          <button className="primary-btn">Get Started</button>
        </div>
      </header>

      <main>
        <section className="hero-panel" id="home">
          <div className="hero-copy">
            <span className="eyebrow">Premium Indian EdTech LifeOS</span>
            <h1>School teaches subjects. We teach life.</h1>
            <p>Mission Tatva is a 3D LifeOS of 6 infinite gem planets. Understand the rules. Play consciously. Level up in life.</p>
            <div className="hero-actions">
              <button className="primary-btn">Explore LifeOS</button>
              <button className="secondary-btn">Watch Intro</button>
            </div>
            <div className="hero-values">
              <div><strong>Life is a game.</strong><span>Play it consciously.</span></div>
              <div><strong>Understand the rules.</strong><span>Make better decisions.</span></div>
              <div><strong>Win in all areas.</strong><span>Live a balanced life.</span></div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-visual-frame">
              <div ref={canvasRef} className="canvas-view" />
              <div className="visual-overlay">
                <div className="visual-label">🌍 6 Infinity Stone Planets</div>
                <div className="visual-pill">Move cursor & scroll to explore</div>
              </div>
            </div>
            <div className="control-grid">
              {gameControls.map((item) => (
                <label key={item.id} className="color-control">
                  <span>{item.label}</span>
                  <input
                    type="color"
                    value={colors[item.id]}
                    onChange={(e) => handleColorChange(item.id, e.target.value)}
                  />
                </label>
              ))}
              <label className="range-control">
                <span>Depth</span>
                <input type="range" min="0.4" max="1.8" step="0.05" value={depth} onChange={(e) => setDepth(Number(e.target.value))} />
              </label>
              <label className="range-control">
                <span>Wave</span>
                <input type="range" min="0.4" max="1.8" step="0.05" value={wave} onChange={(e) => setWave(Number(e.target.value))} />
              </label>
            </div>
          </div>
        </section>

        <section className="section-block" id="events">
          <div className="section-head">
            <h2>Recent Events</h2>
            <p>Immersive workshops and bootcamps for each LifeOS game discipline.</p>
          </div>
          <div className="event-carousel">
            {events.map((event) => (
              <article className="event-card" key={event.title} style={{ borderColor: event.color }}>
                <div className="event-hero" style={{ background: event.bg, animation: 'shimmer 3s ease-in-out infinite' }} />
                <span className="event-pill" style={{ background: event.color }}>{event.cat}</span>
                <h3>{event.title}</h3>
                <p>{event.date} • {event.loc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section-block trust-block" id="trust">
          <div className="section-head">
            <h2>Trusted by students and parents</h2>
            <p>Real impact across India through LifeOS learning.</p>
          </div>
          <div className="stat-grid">
            {stats.map((item, idx) => (
              <div className="stat-card" key={item.label} style={{ background: `linear-gradient(135deg, ${statColors[idx]}, ${statColors[(idx+1)%5]})` }}>
                <span>{item.value}</span>
                <p>{item.label}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="site-footer" id="contact">
        <div>© Mission Tatva • A premium LifeOS platform</div>
        <div>Privacy • Terms • Contact</div>
      </footer>
    </div>
  );
}

export default App;

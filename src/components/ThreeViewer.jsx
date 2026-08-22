import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

function ThreeViewer() {
  const containerRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    // -----------------------------
    // 1. Create the 3D scene
    // -----------------------------

    const scene = new THREE.Scene();

    scene.background = new THREE.Color(0xf2f2f2);

    // -----------------------------
    // 2. Create camera
    // -----------------------------

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      10000
    );

    camera.position.set(0, 2, 6);

    // -----------------------------
    // 3. Create renderer
    // -----------------------------

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
    });

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.8;

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    renderer.setSize(
      container.clientWidth,
      container.clientHeight
    );

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2)
    );

    container.appendChild(renderer.domElement);

    // -----------------------------
    // 4. Orbit controls
    // -----------------------------

    const controls = new OrbitControls(
      camera,
      renderer.domElement
    );

    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Interaction settings

    // Rotation
    controls.enableRotate = true;
    controls.minPolarAngle = THREE.MathUtils.degToRad(15);
    controls.maxPolarAngle = THREE.MathUtils.degToRad(165);

    // Zoom
    controls.enableZoom = true;

    // Pan
    controls.enablePan = true;

    // Keep interactions consistent
    controls.screenSpacePanning = false;

    // -----------------------------
    // 5. Lighting
    // -----------------------------

    const ambientLight = new THREE.AmbientLight(
      0xffffff,
      1.2
    );

    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(
      0xffffff,
      2.5
    );

    keyLight.position.set(5, 10, 8);
    keyLight.castShadow = true;

    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(
      0xffffff,
      1.2
    );

    fillLight.position.set(-5, 5, 5);

    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(
      0xffffff,
      1
    );

    rimLight.position.set(0, 6, -8);

    scene.add(rimLight);

    // -----------------------------
    // 6. Ground plane
    // -----------------------------

    const groundGeometry = new THREE.PlaneGeometry(
      1000,
      1000
    );

    const groundMaterial = new THREE.ShadowMaterial({
      opacity: 0.15,
    });

    const ground = new THREE.Mesh(
      groundGeometry,
      groundMaterial
    );

    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;

    scene.add(ground);

    // -----------------------------
    // 7. Load GLB model
    // -----------------------------

    const loader = new GLTFLoader();

    let model = null;

    // -----------------------------
    // Camera framing function
    // -----------------------------

    const frameModel = () => {
      if (!model) return;

      const box = new THREE.Box3().setFromObject(model);

      const size = box.getSize(
        new THREE.Vector3()
      );

      const center = box.getCenter(
        new THREE.Vector3()
      );

      const sphere = box.getBoundingSphere(
        new THREE.Sphere()
      );

      const radius = sphere.radius;

      // Calculate both vertical and horizontal FOV.
      // This is especially important on narrow mobile screens.

      const verticalFov = THREE.MathUtils.degToRad(
        camera.fov
      );

      const horizontalFov =
        2 *
        Math.atan(
          Math.tan(verticalFov / 2) *
            camera.aspect
        );

      const limitingFov = Math.min(
        verticalFov,
        horizontalFov
      );

      let distance =
        radius /
        Math.tan(limitingFov / 2);

      // Control how far the user can zoom
      controls.minDistance = distance * 0.65;
      controls.maxDistance = distance * 2.5;

      // Extra breathing room
      const isMobile = window.innerWidth <= 700;

      distance *= 1.15;

      // Slightly raise the camera on mobile so the
      // model sits comfortably above the information card.

      const verticalOffset = isMobile
        ? size.y * 0.16
        : size.y * 0.15;

      camera.position.set(
        center.x,
        center.y + verticalOffset,
        center.z + distance
      );

      camera.lookAt(
        center.x,
        center.y + (isMobile ? size.y * 0.08 : 0),
        center.z
      );

      controls.target.set(
        center.x,
        center.y + (isMobile ? size.y * 0.08 : 0),
        center.z
      );

      controls.update();

      camera.near = Math.max(
        0.01,
        distance / 100
      );

      camera.far = Math.max(
        1000,
        distance * 10
      );

      camera.updateProjectionMatrix();
    };

    loader.load(
      '/models/donut-shop.glb',

      (gltf) => {
        model = gltf.scene;

        scene.add(model);

        // Enable shadows
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        frameModel();

        setLoading(false);
        setLoadError(false);

        console.log(
          'Donut shop loaded successfully!'
        );
      },

      undefined,

      (error) => {
        setLoading(false);
        setLoadError(true);

        console.error(
          'Error loading donut shop:',
          error
        );
      }
    );

    // -----------------------------
    // 8. Reset camera
    // -----------------------------

    const resetCamera = () => {
      frameModel();
    };

    window.addEventListener(
      'reset-camera',
      resetCamera
    );

    // -----------------------------
    // 9. Animation loop
    // -----------------------------

    let animationFrameId;

    const animate = () => {
      animationFrameId =
        requestAnimationFrame(animate);

      controls.update();

      renderer.render(scene, camera);
    };

    animate();

    // -----------------------------
    // 10. Responsive resize
    // -----------------------------

    const handleResize = () => {
      if (!container) return;

      const width = container.clientWidth;
      const height = container.clientHeight;

      camera.aspect = width / height;

      camera.updateProjectionMatrix();

      renderer.setSize(
        width,
        height
      );

      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
      );

      // Re-frame the model whenever the viewport changes.
      if (model) {
        frameModel();
      }
    };

    window.addEventListener(
      'resize',
      handleResize
    );

    // -----------------------------
    // 11. Cleanup
    // -----------------------------

    return () => {
      cancelAnimationFrame(animationFrameId);

      window.removeEventListener(
        'resize',
        handleResize
      );

      window.removeEventListener(
        'reset-camera',
        resetCamera
      );

      controls.dispose();

      groundGeometry.dispose();
      groundMaterial.dispose();

      renderer.dispose();

      if (
        renderer.domElement.parentNode === container
      ) {
        container.removeChild(
          renderer.domElement
        );
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="three-viewer"
    >
      {loading && (
        <div className="viewer-status">
          <span className="status-spinner"></span>
          <span>Loading 3D Asset...</span>
        </div>
      )}

      {loadError && (
        <div className="viewer-status viewer-error">
          <span>Unable to load 3D asset.</span>
          <small>Please refresh and try again.</small>
        </div>
      )}
    </div>
  );
}

export default ThreeViewer;
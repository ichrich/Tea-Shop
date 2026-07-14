import React, { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sparkles, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const MODEL_URL = '/models/tea-leaf/list.glb';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const lerp = (start, end, amount) => start + (end - start) * amount;
const lerp3 = (from, to, amount) => [
  lerp(from[0], to[0], amount),
  lerp(from[1], to[1], amount),
  lerp(from[2], to[2], amount),
];

const LEAF_BASE_ROTATION = [-0.64, 0.12, 0.32];
const LEAF_OFFSET = [0, -0.02, 0.07];
const LEAF_EMISSIVE = new THREE.Color('#10271f');

const PRESETS = {
  hero: {
    startPosition: [0, -1.7, 0],
    midPosition: [0, -0.42, 0],
    endPosition: [-5.8, 0.82, 0],
    startRotation: [-0.74, -0.08, 0.34],
    midRotation: [-0.4, 0.18, 0.16],
    endRotation: [-0.12, 0.72, -0.08],
    startScale: 18.2,
    midScale: 16.2,
    endScale: 14.4,
    cameraStart: [0, -0.08, 15.2],
    cameraMid: [0, -0.12, 13.8],
    cameraEnd: [0, -0.14, 13.4],
    bob: 0.16,
    spin: 0.12,
    sway: 0.12,
    emissive: [0.2, 0.34],
    sparkles: 40,
  },
  story: {
    startPosition: [0, -4.8, 0],
    midPosition: [0, -0.35, 0],
    endPosition: [-5.1, 0.68, 0],
    startRotation: [-0.84, -0.14, 0.34],
    midRotation: [-0.42, 0.16, 0.12],
    endRotation: [-0.08, 0.58, -0.05],
    startScale: 19,
    midScale: 15.4,
    endScale: 12.9,
    cameraStart: [0, -0.16, 17],
    cameraMid: [0, -0.12, 14.8],
    cameraEnd: [0, -0.08, 13.8],
    bob: 0.14,
    spin: 0.1,
    sway: 0.1,
    emissive: [0.1, 0.22],
    sparkles: 24,
  },
  product: {
    startPosition: [0, -0.68, 0],
    midPosition: [0, -0.44, 0],
    endPosition: [0.18, -0.3, 0],
    startRotation: [-0.58, 0.1, 0.22],
    midRotation: [-0.4, 0.26, 0.1],
    endRotation: [-0.2, 0.36, -0.04],
    startScale: 13.4,
    midScale: 12.1,
    endScale: 11.3,
    cameraStart: [0, 0, 12.4],
    cameraMid: [0, 0, 11.2],
    cameraEnd: [0, 0.12, 10.6],
    bob: 0.11,
    spin: 0.08,
    sway: 0.06,
    emissive: [0.08, 0.18],
    sparkles: 0,
  },
  shared: {
    startPosition: [0, -1.0, 0],
    midPosition: [0, -0.54, 0],
    endPosition: [0.28, -0.24, 0],
    startRotation: [-0.66, 0.04, 0.22],
    midRotation: [-0.34, 0.22, 0.08],
    endRotation: [-0.12, 0.42, -0.06],
    startScale: 12.6,
    midScale: 10.8,
    endScale: 11.5,
    cameraStart: [0, 0, 12.8],
    cameraMid: [0, 0, 11.6],
    cameraEnd: [0, 0.12, 10.8],
    bob: 0.1,
    spin: 0.08,
    sway: 0.08,
    emissive: [0.08, 0.2],
    sparkles: 0,
  },
};

function TeaLeafModel({ variant = 'hero', progress = 0, accent = 0 }) {
  const groupRef = useRef(null);
  const { scene } = useGLTF(MODEL_URL);

  const clonedScene = useMemo(() => {
    const root = scene.clone(true);

    root.traverse((node) => {
      if (!node.isMesh) return;
      node.castShadow = false;
      node.receiveShadow = false;
      node.material = node.material.clone();
      node.material.side = THREE.DoubleSide;
      node.material.transparent = true;
      node.material.needsUpdate = true;
    });

    return root;
  }, [scene]);

  const materials = useMemo(() => {
    const result = [];

    clonedScene.traverse((node) => {
      if (node.isMesh && node.material) {
        result.push(node.material);
      }
    });

    return result;
  }, [clonedScene]);

  useFrame((state) => {
    if (!groupRef.current) return;

    const preset = PRESETS[variant] || PRESETS.hero;
    const stageOne = clamp(progress / 0.46, 0, 1);
    const stageTwo = clamp((progress - 0.68) / 0.32, 0, 1);
    const accentMix = clamp(accent, 0, 1);
    const motionTime = state.clock.elapsedTime;

    const betweenStartAndMid = lerp3(preset.startPosition, preset.midPosition, stageOne);
    const betweenMidAndEnd = lerp3(betweenStartAndMid, preset.endPosition, stageTwo);
    const startRotation = lerp3(preset.startRotation, preset.midRotation, stageOne);
    const endRotation = lerp3(startRotation, preset.endRotation, stageTwo);
    const bob = Math.sin(motionTime * 1.2) * preset.bob;
    const sway = Math.sin(motionTime * 0.8) * preset.sway;

    groupRef.current.position.set(
      betweenMidAndEnd[0],
      betweenMidAndEnd[1] + bob,
      betweenMidAndEnd[2],
    );
    groupRef.current.rotation.set(
      endRotation[0],
      endRotation[1] + motionTime * preset.spin + sway,
      endRotation[2],
    );

    const scaleFromStart = lerp(preset.startScale, preset.midScale, stageOne);
    const scaleToEnd = lerp(scaleFromStart, preset.endScale, stageTwo);
    const finalScale = lerp(scaleToEnd, scaleToEnd * 1.04, accentMix);
    groupRef.current.scale.setScalar(finalScale);

    materials.forEach((material) => {
      material.emissive = LEAF_EMISSIVE;
      material.emissiveIntensity = lerp(preset.emissive[0], preset.emissive[1], accentMix);
      material.opacity = lerp(0.94, 1, accentMix);
    });
  });

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} position={LEAF_OFFSET} rotation={LEAF_BASE_ROTATION} />
    </group>
  );
}

function TeaLeafLights({ variant = 'hero', progress = 0, accent = 0 }) {
  const keyLightRef = useRef(null);
  const fillLightRef = useRef(null);
  const rimLightRef = useRef(null);

  useFrame(({ camera }) => {
    const stageOne = clamp(progress / 0.46, 0, 1);
    const stageTwo = clamp((progress - 0.68) / 0.32, 0, 1);
    const accentMix = clamp(accent, 0, 1);

    if (keyLightRef.current) {
      keyLightRef.current.position.set(
        camera.position.x + lerp(6.4, -3.2, stageTwo),
        camera.position.y + lerp(6.8, 3.8, stageOne),
        camera.position.z + 8,
      );
      keyLightRef.current.intensity = lerp(1.6, 2.4, accentMix);
    }

    if (fillLightRef.current) {
      fillLightRef.current.position.set(-7, lerp(-2.2, 1.6, stageOne), 5);
      fillLightRef.current.intensity = lerp(0.48, 0.88, stageOne);
    }

    if (rimLightRef.current) {
      rimLightRef.current.position.set(0, 8, -4);
      rimLightRef.current.intensity = lerp(1.2, 0.64, stageTwo);
    }
  });

  return (
    <>
      <ambientLight intensity={0.48} color="#e5dcc8" />
      <directionalLight ref={keyLightRef} color="#f5efe1" />
      <pointLight ref={fillLightRef} color="#83a48b" distance={40} decay={2} />
      <pointLight ref={rimLightRef} color="#d5ead2" distance={32} decay={2} />
    </>
  );
}

export default function TeaLeafCanvas({
  variant = 'hero',
  progress = 0,
  accent = 0,
  className = '',
}) {
  const preset = PRESETS[variant] || PRESETS.hero;
  const stageOne = clamp(progress / 0.46, 0, 1);
  const stageTwo = clamp((progress - 0.68) / 0.32, 0, 1);
  const cameraBetweenStartAndMid = lerp3(preset.cameraStart, preset.cameraMid, stageOne);
  const cameraPosition = lerp3(cameraBetweenStartAndMid, preset.cameraEnd, stageTwo);

  return (
    <div className={className}>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: cameraPosition, fov: 28 }}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl, scene }) => {
          gl.physicallyCorrectLights = true;
          gl.outputColorSpace = THREE.SRGBColorSpace;
          scene.background = null;
          scene.fog = new THREE.Fog('#07110d', 14, 34);
        }}
      >
        <Suspense fallback={null}>
          <TeaLeafLights variant={variant} progress={progress} accent={accent} />
          <TeaLeafModel variant={variant} progress={progress} accent={accent} />
          {preset.sparkles > 0 && (
            <Sparkles
              count={preset.sparkles}
              scale={[12, 10, 10]}
              size={2.4}
              speed={0.22}
              color="#dce6d6"
              opacity={0.36}
            />
          )}
          <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload(MODEL_URL);

"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import fontData from "@/lib/helvetiker-bold.json";
import { sampleCamera, smoothstep } from "@/lib/journey.mjs";
import { createScreenTexture } from "@/lib/screen-textures";

type V3 = [number, number, number];
type WorldProps = {
  motion: MutableRefObject<{ progress: number }>;
  invalidateRef: MutableRefObject<(() => void) | null>;
  onReady: () => void;
  onError: () => void;
};
const font = new FontLoader().parse(fontData);

function Box({
  size,
  position,
  rotation,
  color = "#f4f5f5",
  metalness = 0.1,
  roughness = 0.4,
  radius = 0.06,
}: {
  size: V3;
  position?: V3;
  rotation?: V3;
  color?: string;
  metalness?: number;
  roughness?: number;
  radius?: number;
}) {
  const geometry = useMemo(
    () => new RoundedBoxGeometry(...size, 2, radius),
    [size[0], size[1], size[2], radius],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh
      geometry={geometry}
      position={position}
      rotation={rotation}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial
        color={color}
        metalness={metalness}
        roughness={roughness}
      />
    </mesh>
  );
}

function Anchor({
  word,
  position,
  size = 2.6,
  color = "#e6e6e8",
  rotation = [0, 0, 0],
  depth = 0.24,
}: {
  word: string;
  position: V3;
  size?: number;
  color?: string;
  rotation?: V3;
  depth?: number;
}) {
  const geometry = useMemo(() => {
    const geometry = new TextGeometry(word, {
      font,
      size,
      depth,
      curveSegments: 5,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.012,
      bevelThickness: 0.015,
    });
    geometry.center();
    return geometry;
  }, [word, size, depth]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh
      position={position}
      rotation={rotation}
      geometry={geometry}
      castShadow
    >
      <meshStandardMaterial color={color} roughness={0.33} metalness={0.2} />
    </mesh>
  );
}

function Screen({
  kind,
  position,
  rotation = [0, 0, 0],
  width = 5.6,
}: {
  kind: string;
  position: V3;
  rotation?: V3;
  width?: number;
}) {
  const texture = useMemo(() => createScreenTexture(kind), [kind]);
  useEffect(() => () => texture.dispose(), [texture]);
  const height = (width * 2) / 3;
  return (
    <group position={position} rotation={rotation}>
      <Box
        size={[width + 0.14, height + 0.14, 0.13]}
        color="#7b7c7f"
        radius={0.07}
        roughness={0.28}
        metalness={0.65}
      />
      <mesh position={[0, 0, 0.073]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <Box
        size={[width * 0.65, 0.055, 0.1]}
        position={[0, -height / 2 - 0.35, -0.05]}
        color="#aeb0b4"
        metalness={0.6}
      />
    </group>
  );
}

function Studio({ motion }: { motion: WorldProps["motion"] }) {
  const lid = useRef<THREE.Group>(null);
  const texture = useMemo(() => createScreenTexture("studio"), []);
  const shadow = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext("2d")!;
    const gradient = ctx.createRadialGradient(128, 128, 20, 128, 128, 125);
    gradient.addColorStop(0, "rgba(43,49,33,0.27)");
    gradient.addColorStop(1, "rgba(43,49,33,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }, []);
  useEffect(
    () => () => {
      texture.dispose();
      shadow.dispose();
    },
    [texture, shadow],
  );
  useFrame(() => {
    if (lid.current)
      lid.current.rotation.x =
        -1.15 + smoothstep(0, 0.14, motion.current.progress) * 1.24;
  });
  return (
    <group>
      <mesh position={[1.6, -0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[11, 8]} />
        <meshBasicMaterial map={shadow} transparent depthWrite={false} />
      </mesh>
      <group position={[1.6, 0, 0]}>
        <Box
          size={[5.2, 0.23, 2.35]}
          position={[0, 1.13, 0]}
          color="#ededee"
          radius={0.1}
          roughness={0.3}
        />
        <Box
          size={[0.66, 1.1, 1.75]}
          position={[-1.58, 0.54, 0]}
          color="#e0e0e2"
          radius={0.09}
        />
        <Box
          size={[0.66, 1.1, 1.75]}
          position={[1.58, 0.54, 0]}
          color="#e3e4e5"
          radius={0.09}
        />
        <group position={[0, 1.285, -0.08]}>
          <Box
            size={[2.3, 0.085, 1.48]}
            color="#a7a7a9"
            metalness={0.78}
            roughness={0.27}
            radius={0.05}
          />
          <Box
            size={[1.97, 0.012, 0.65]}
            position={[0, 0.048, -0.21]}
            color="#474749"
            radius={0.02}
          />
          <Keyboard />
          <Box
            size={[0.67, 0.008, 0.34]}
            position={[0, 0.049, 0.44]}
            color="#949597"
            metalness={0.55}
            radius={0.02}
          />
          <group ref={lid} position={[0, 0.015, -0.69]}>
            <Box
              size={[2.3, 1.5, 0.09]}
              position={[0, 0.75, 0]}
              color="#929395"
              metalness={0.75}
              roughness={0.28}
              radius={0.055}
            />
            <Box
              size={[2.19, 1.38, 0.015]}
              position={[0, 0.75, 0.052]}
              color="#28292a"
              radius={0.03}
            />
            <mesh position={[0, 0.76, 0.062]}>
              <planeGeometry args={[2.11, 1.28]} />
              <meshBasicMaterial map={texture} toneMapped={false} />
            </mesh>
            <mesh position={[0, 1.457, 0.054]}>
              <circleGeometry args={[0.015, 12]} />
              <meshBasicMaterial color="#2b2c2e" />
            </mesh>
          </group>
        </group>
      </group>
      <mesh position={[2.2, 3.7, -5.8]}>
        <torusGeometry args={[3.3, 0.016, 8, 100]} />
        <meshStandardMaterial color="#c5c6c8" metalness={0.4} roughness={0.6} />
      </mesh>
      <mesh position={[2.2, 3.7, -5.85]}>
        <torusGeometry args={[3.42, 0.009, 6, 100]} />
        <meshStandardMaterial color="#d4d5d7" />
      </mesh>
      <Box
        size={[0.8, 0.8, 0.8]}
        position={[5.1, 0.41, -2.6]}
        rotation={[0, 0.2, 0]}
        color="#d9dbdd"
        radius={0.04}
        roughness={0.3}
      />
    </group>
  );
}

function Keyboard() {
  const ref = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    const m = new THREE.Object3D();
    for (let i = 0; i < 52; i++) {
      m.position.set(
        ((i % 13) - 6) * 0.143,
        0.061,
        Math.floor(i / 13) * 0.143 - 0.435,
      );
      m.updateMatrix();
      ref.current?.setMatrixAt(i, m.matrix);
    }
    if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, 52]}>
      <boxGeometry args={[0.117, 0.012, 0.106]} />
      <meshStandardMaterial color="#6d6f71" roughness={0.8} />
    </instancedMesh>
  );
}

function ExperienceWorld({
  mobile,
}: {
  motion: WorldProps["motion"];
  mobile: boolean;
}) {
  return (
    <group>
      <Anchor
        word="EXPERIENCE"
        position={mobile ? [0, 1.9, -24] : [1.8, 4.8, -23]}
        size={mobile ? 0.46 : 1.3}
        color="#c5cbd6"
      />
      <Screen
        kind="cloud"
        position={mobile ? [0.2, 0.75, -23] : [3.1, 1.9, -19.5]}
        rotation={[0, -0.15, -0.015]}
        width={mobile ? 2.8 : 4.3}
      />
      {!mobile && (
        <>
          <WireGrid position={[5.3, 1.5, -25]} />
          <Anchor
            word="DATA"
            position={[3.8, 3.9, -28]}
            size={0.8}
            color="#748aaa"
          />
        </>
      )}
      <mesh position={[1.8, 1.8, -28]} rotation={[0, 0, 0.2]}>
        <torusGeometry args={[2.5, 0.045, 12, 70]} />
        <meshStandardMaterial
          color="#aab8cd"
          metalness={0.45}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
}

function WireGrid({ position }: { position: V3 }) {
  const lines = useMemo(() => {
    const points = [];
    for (let i = -3; i <= 3; i++) {
      points.push(
        i * 0.36,
        -1.1,
        0,
        i * 0.36,
        1.1,
        0,
        -1.1,
        i * 0.36,
        0,
        1.1,
        i * 0.36,
        0,
      );
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
    return g;
  }, []);
  useEffect(() => () => lines.dispose(), [lines]);
  return (
    <group position={position} rotation={[0.12, 0.3, 0.1]}>
      <lineSegments geometry={lines}>
        <lineBasicMaterial color="#afb1b4" transparent opacity={0.6} />
      </lineSegments>
      <mesh>
        <sphereGeometry args={[0.7, 12, 8]} />
        <meshStandardMaterial wireframe color="#a4a6aa" />
      </mesh>
    </group>
  );
}

function ProjectsWorld({
  mobile,
  motion,
}: {
  mobile: boolean;
  motion: WorldProps["motion"];
}) {
  const screens = useRef<(THREE.Group | null)[]>([]);
  useFrame(() => {
    const p = motion.current.progress;
    screens.current.forEach((screen, i) => {
      if (screen)
        screen.visible =
          !mobile ||
          (i === 0 ? p < 0.54 : i === 1 ? p > 0.5 && p < 0.63 : p > 0.6);
    });
  });
  return (
    <group>
      <Anchor
        word="PROJECTS"
        position={mobile ? [0, 2.9, -41] : [1.6, 5.1, -41]}
        size={mobile ? 0.72 : 1.75}
        color="#87888c"
      />
      <group
        ref={(el) => {
          screens.current[0] = el;
        }}
      >
        <Screen
          kind="resume"
          position={mobile ? [0, 1.5, -37] : [2.8, 2.65, -36.5]}
          rotation={mobile ? [0.05, -0.12, 0] : [0, -0.16, -0.035]}
          width={mobile ? 3.5 : 4.8}
        />
      </group>
      <group
        ref={(el) => {
          screens.current[1] = el;
        }}
      >
        <Screen
          kind="linkedout"
          position={mobile ? [0, 1.6, -46] : [3, 2.7, -46]}
          rotation={[0.015, -0.14, 0.015]}
          width={mobile ? 3.5 : 4.8}
        />
      </group>
      <group
        ref={(el) => {
          screens.current[2] = el;
        }}
      >
        <Screen
          kind="wealth"
          position={mobile ? [0, 1.8, -56] : [3.5, 2.8, -56]}
          rotation={[0.02, -0.13, -0.035]}
          width={mobile ? 3.5 : 4.9}
        />
      </group>
      {!mobile && (
        <>
          <Screen
            kind="linkedout"
            position={[-6, 3.8, -40]}
            rotation={[0, 0.4, -0.04]}
            width={3}
          />
          <Screen
            kind="resume"
            position={[7.6, 1.8, -49]}
            rotation={[0, -0.6, 0.02]}
            width={2.9}
          />
        </>
      )}
      {[-33, -43, -53].map((z, i) => (
        <group key={z} position={[0, -0.5, z]}>
          <Box
            size={[0.045, 7, 0.045]}
            position={[6.7, 3.4, 0]}
            color="#82858a"
            metalness={0.6}
          />
          <Box
            size={[0.045, 7, 0.045]}
            position={[-6.7, 3.4, 0]}
            color="#82858a"
            metalness={0.6}
          />
          <Box
            size={[13.4, 0.045, 0.045]}
            position={[0, 6.9, 0]}
            color="#82858a"
            metalness={0.6}
          />
          {!mobile && (
            <Anchor
              word={`0${i + 1}`}
              position={[-5, 1.7, -0.4]}
              size={1.3}
              color="#7e8186"
              depth={0.1}
            />
          )}
        </group>
      ))}
      <mesh position={[1.2, 1, -60]} rotation={[0, 0, Math.PI / 4]}>
        <torusGeometry args={[3.2, 0.12, 8, 4]} />
        <meshStandardMaterial
          color="#acb0b8"
          roughness={0.25}
          metalness={0.6}
        />
      </mesh>
    </group>
  );
}

function AboutWorld({
  motion,
  mobile,
}: {
  motion: WorldProps["motion"];
  mobile: boolean;
}) {
  const sculpture = useRef<THREE.Group>(null);
  useFrame(() => {
    if (sculpture.current)
      sculpture.current.rotation.y = (motion.current.progress - 0.78) * 2.2;
  });
  return (
    <group>
      <Anchor
        word="ABOUT"
        position={mobile ? [0, 2.7, -84] : [1.1, 5.6, -84]}
        size={mobile ? 1.2 : 2.4}
        color="#b8c2d1"
      />
      <group
        ref={sculpture}
        position={mobile ? [1, 1.4, -78] : [3.6, 2.4, -77]}
        scale={mobile ? 0.52 : 0.85}
      >
        <mesh rotation={[0.25, 0.4, -0.2]}>
          <torusGeometry args={[1.85, 0.19, 16, 72]} />
          <meshStandardMaterial
            color="#8d9db5"
            metalness={0.65}
            roughness={0.3}
          />
        </mesh>
        <mesh rotation={[0.6, -0.4, 0.5]}>
          <icosahedronGeometry args={[1.3, 0]} />
          <meshStandardMaterial wireframe color="#366bd6" />
        </mesh>
        <Anchor
          word="CS"
          position={[0, 0.04, 0.1]}
          size={0.9}
          color="#e1e7f1"
          depth={0.16}
        />
      </group>
      {!mobile && (
        <Anchor word="3.8" position={[-5, 2, -81]} size={1.4} color="#b5c2d8" />
      )}
      <Convergence motion={motion} count={mobile ? 18 : 42} />
    </group>
  );
}

function Convergence({
  motion,
  count,
}: {
  motion: WorldProps["motion"];
  count: number;
}) {
  const cubes = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useFrame(() => {
    const p = motion.current.progress;
    const converge = smoothstep(0.79, 0.98, p);
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const radius = THREE.MathUtils.lerp(10 + (i % 5), 5.8, converge);
      dummy.position.set(
        Math.cos(a) * radius,
        3 + Math.sin(a) * radius * 0.75,
        THREE.MathUtils.lerp(-76 - (i % 7) * 3.8, -99, converge),
      );
      dummy.rotation.set(a * 0.8 + p, a * 0.4 + p * 1.4, a * 0.4);
      const size = 0.12 + (i % 4) * 0.055;
      dummy.scale.setScalar(size);
      dummy.updateMatrix();
      cubes.current?.setMatrixAt(i, dummy.matrix);
    }
    if (cubes.current) cubes.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh
      ref={cubes}
      args={[undefined, undefined, count]}
      frustumCulled={false}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#8f9297" metalness={0.45} roughness={0.35} />
    </instancedMesh>
  );
}

function Scene({
  motion,
  invalidateRef,
  onReady,
  onError,
  mobile,
}: WorldProps & { mobile: boolean }) {
  const { camera, scene, invalidate, gl } = useThree();
  const studio = useRef<THREE.Group>(null),
    idea = useRef<THREE.Group>(null),
    build = useRef<THREE.Group>(null),
    launch = useRef<THREE.Group>(null);
  const floor = useRef<THREE.MeshStandardMaterial>(null);
  const color = useMemo(() => new THREE.Color("#f7f8fa"), []);
  const light = useMemo(() => new THREE.Color("#f7f8fa"), []);
  const dark = useMemo(() => new THREE.Color("#151a23"), []);
  const endColor = useMemo(() => new THREE.Color("#f0f3f8"), []);
  const target = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    invalidateRef.current = invalidate;
    const canvas = gl.domElement;
    const lost = (event: Event) => {
      event.preventDefault();
      onError();
    };
    canvas.addEventListener("webglcontextlost", lost);
    onReady();
    invalidate();
    return () => {
      invalidateRef.current = null;
      canvas.removeEventListener("webglcontextlost", lost);
    };
  }, [invalidate, invalidateRef, onReady, onError, gl]);

  useFrame(() => {
    const p = motion.current.progress;
    const frame = sampleCamera(p, mobile);
    camera.position.set(frame.eye[0], frame.eye[1], frame.eye[2]);
    target.set(frame.target[0], frame.target[1], frame.target[2]);
    camera.lookAt(target);
    const darkFactor =
      smoothstep(0.34, 0.415, p) * (1 - smoothstep(0.69, 0.755, p));
    color
      .copy(light)
      .lerp(endColor, smoothstep(0.68, 0.85, p))
      .lerp(dark, darkFactor);
    (scene.background as THREE.Color).copy(color);
    if (scene.fog instanceof THREE.Fog) scene.fog.color.copy(color);
    floor.current?.color.copy(color);
    if (studio.current) studio.current.visible = p < 0.23;
    if (idea.current) idea.current.visible = p > 0.14 && p < 0.44;
    if (build.current) build.current.visible = p > 0.3 && p < 0.76;
    if (launch.current) launch.current.visible = p > 0.64;
  });

  return (
    <>
      <color attach="background" args={["#eff0f0"]} />
      <fog attach="fog" args={["#eff0f0", 16, mobile ? 40 : 48]} />
      <ambientLight intensity={1.35} />
      <hemisphereLight args={["#fdfefe", "#a2a4a8", 1.55]} />
      <directionalLight
        position={[2, 10, 7]}
        intensity={3.2}
        color="#fcfcfc"
        castShadow={!mobile}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-normalBias={0.04}
      />
      <directionalLight
        position={[-8, 5, -30]}
        intensity={1.5}
        color="#e4e5e9"
      />
      <directionalLight
        position={[5, 8, -65]}
        intensity={1.4}
        color="#edeef0"
      />
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.035, -47]}
        receiveShadow
      >
        <planeGeometry args={[220, 240]} />
        <meshStandardMaterial
          ref={floor}
          color="#eff0f0"
          roughness={0.7}
          metalness={0.05}
        />
      </mesh>
      <group ref={studio}>
        <Studio motion={motion} />
      </group>
      <group ref={idea}>
        <ExperienceWorld motion={motion} mobile={mobile} />
      </group>
      <group ref={build}>
        <ProjectsWorld mobile={mobile} motion={motion} />
      </group>
      <group ref={launch}>
        <AboutWorld motion={motion} mobile={mobile} />
      </group>
      <Anchor word="KK" position={[0, 3.5, -108]} size={4.4} color="#d9dadd" />
    </>
  );
}

export default function World(props: WorldProps) {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 760px)");
    const update = () => setMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return (
    <Canvas
      camera={{
        fov: mobile ? 48 : 40,
        position: [7.8, 5.2, 12.4],
        near: 0.04,
        far: 180,
      }}
      dpr={mobile ? [1, 1.25] : [1, 1.65]}
      shadows={mobile ? false : { type: THREE.PCFShadowMap }}
      frameloop="demand"
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
        stencil: false,
      }}
      fallback={
        <span>Use the simple portfolio view to explore this work.</span>
      }
    >
      <Scene {...props} mobile={mobile} />
    </Canvas>
  );
}

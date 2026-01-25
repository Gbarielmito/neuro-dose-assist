import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Line } from '@react-three/drei';
import * as THREE from 'three';

function Neurons() {
    const ref = useRef<THREE.Points>(null);

    // Generate random points for neurons
    const count = 50;
    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            // Random positions in a sphere
            const r = 4 * Math.cbrt(Math.random());
            const theta = Math.random() * 2 * Math.PI;
            const phi = Math.acos(2 * Math.random() - 1);

            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);

            pos[i * 3] = x;
            pos[i * 3 + 1] = y;
            pos[i * 3 + 2] = z;
        }
        return pos;
    }, []);

    // Generate lines connecting close points
    const linesGeometry = useMemo(() => {
        const points: THREE.Vector3[] = [];
        const geometry = new THREE.BufferGeometry();

        // Naively connect points that are somewhat close
        for (let i = 0; i < count; i++) {
            for (let j = i + 1; j < count; j++) {
                const p1 = new THREE.Vector3(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
                const p2 = new THREE.Vector3(positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]);
                if (p1.distanceTo(p2) < 2.5) {
                    points.push(p1);
                    points.push(p2);
                }
            }
        }
        return new THREE.BufferGeometry().setFromPoints(points);
    }, [positions]);

    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.rotation.x -= delta / 10;
            ref.current.rotation.y -= delta / 15;
        }
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
                <PointMaterial
                    transparent
                    color="#4299E1"
                    size={0.15}
                    sizeAttenuation={true}
                    depthWrite={false}
                />
            </Points>
            {/* Lines are static relative to points for simplicity here, creating a separate rotating group for them or just letting them be background chaos */}
            <primitive object={new THREE.LineSegments(linesGeometry, new THREE.LineBasicMaterial({ color: '#4299E1', opacity: 0.2, transparent: true }))} />
        </group>
    );
}

function Rig() {
    return useFrame((state) => {
        state.camera.position.lerp({ x: 0, y: 0, z: 10 }, 0.05)
        state.camera.lookAt(0, 0, 0)
    })
}

export default function NeuroScene() {
    return (
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
            <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
                {/* <Rig /> */}
                <ambientLight intensity={0.5} />
                <Neurons />
            </Canvas>
        </div>
    );
}

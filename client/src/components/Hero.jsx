import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { motion } from "framer-motion";
import "../styles/hero.css";
 
// --- Shader Code ---
const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
 
const fragmentShader = `
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColor1;
uniform vec3 uColor2;
varying vec2 vUv;
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
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
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
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
float bayerDither4x4(vec2 uv) {
    int x = int(mod(uv.x, 4.0));
    int y = int(mod(uv.y, 4.0));
    int matrix[16];
    matrix[0] = 0; matrix[1] = 8; matrix[2] = 2; matrix[3] = 10;
    matrix[4] = 12; matrix[5] = 4; matrix[6] = 14; matrix[7] = 6;
    matrix[8] = 3; matrix[9] = 11; matrix[10] = 1; matrix[11] = 9;
    matrix[12] = 15; matrix[13] = 7; matrix[14] = 13; matrix[15] = 5;
    return float(matrix[y * 4 + x]) / 16.0;
}
void main() {
    vec2 uv = vUv;
    vec2 coord = gl_FragCoord.xy;
    float noise = snoise(uv * 1.5 + vec2(uTime * 0.05, uTime * 0.03)) * 0.25;
    float diagonal = (uv.x + uv.y) * 0.5;
    float gradient = diagonal * 1.2 + noise;
    vec3 deepBlue = uColor1;
    vec3 paleBlue = uColor2;
    vec3 softBlue = mix(deepBlue, paleBlue, 0.33);
    vec3 lightBlue = mix(deepBlue, paleBlue, 0.66);
    vec3 color;
    if (gradient < 0.3) {
        color = deepBlue;
    } else if (gradient < 0.55) {
        color = softBlue;
    } else if (gradient < 0.8) {
        color = lightBlue;
    } else {
        color = paleBlue;
    }
    float dither = bayerDither4x4(coord);
    float threshold = fract(gradient * 4.0);
    if (gradient < 0.3 && threshold > dither * 0.5) {
        color = softBlue;
    } else if (gradient >= 0.3 && gradient < 0.55 && threshold > dither * 0.5) {
        color = lightBlue;
    } else if (gradient >= 0.55 && gradient < 0.8 && threshold > dither * 0.5) {
        color = paleBlue;
    }
    vec2 cornerDist = vec2(uv.x, uv.y);
    float fadeMask = smoothstep(0.0, 0.25, length(cornerDist));
    color = mix(vec3(1.0), color, fadeMask);
    float vignette = smoothstep(1.2, 0.3, length(uv - 0.5));
    color = mix(color, color * 0.95, (1.0 - vignette) * 0.3);
    gl_FragColor = vec4(color, 1.0);
}
`;
 
// --- GradientPlane (internal) ---
const GradientPlane = ({ color1, color2, speed = 1 }) => {
    const materialRef = useRef(null);

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uResolution: { value: new THREE.Vector2(1000, 1000) },
            uColor1: { value: new THREE.Color(color1) },
            uColor2: { value: new THREE.Color(color2) },
        }),
        [] // create once, update via ref
    );

    useFrame(({ clock, size }) => {
        if (!materialRef.current) return;
        materialRef.current.uniforms.uTime.value = clock.getElapsedTime() * speed;
        materialRef.current.uniforms.uResolution.value.set(size.width, size.height);
        materialRef.current.uniforms.uColor1.value.set(color1);
        materialRef.current.uniforms.uColor2.value.set(color2);
    });

    return (
        <mesh scale={[2, 2, 1]}>
            <planeGeometry args={[2, 2]} />
            <shaderMaterial
                ref={materialRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent={true}
                depthWrite={false}
                depthTest={false}
            />
        </mesh>
    );
};
 
// --- Main Component ---
export default function HeroGeometric({
    title1,
    title2,
    description,
    color1 = "#3B82F6",
    color2 = "#F0F9FF",
    speed = 1,
    className = "",
}) {
    return (
        <div className={`hero-geometric ${className}`}>
            {/* Background Shader */}
            <div className="hero-geometric__bg">
                <Canvas
                    camera={{ position: [0, 0, 1] }}
                    dpr={[1, 1]}
                    frameloop="always"
                    gl={{ antialias: false, alpha: true }}
                >
                    <GradientPlane color1={color1} color2={color2} speed={speed} />
                </Canvas>
            </div>
 
            {/* Content */}
            {(title1 || title2 || description) && (
                <div className="hero-geometric__content">
                    <div className="hero-geometric__inner">
                        {/* Headline */}
                        <div className="hero-geometric__headline">
                            {title1 && (
                                <div className="hero-geometric__title-wrap">
                                    <motion.h1
                                        className="main-title"
                                        initial={{ y: "100%", opacity: 0 }}
                                        animate={{ y: "0%", opacity: 1 }}
                                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                                    >
                                        <span className="hero-geometric__title--bold">{title1}</span>
                                    </motion.h1>
                                </div>
                            )}
                            {title2 && (
                                <div className="hero-geometric__title-wrap" id="title2">
                                    <motion.h1
                                        className="main-title hero-geometric__title--bold"
                                        initial={{ y: "100%", opacity: 0 }}
                                        animate={{ y: "0%", opacity: 1 }}
                                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
                                    >
                                        {title2}
                                    </motion.h1>
                                </div>
                            )}
                        </div>
 
                        {/* Description */}
                        {description && (
                            <div className="hero-geometric__description-wrap">
                                <motion.p
                                    className="hero-geometric__description"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                                >
                                    {description}
                                </motion.p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
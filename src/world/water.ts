import * as THREE from "three";
import { heightfields, TERRAIN_SEGMENTS } from "./surface";
/** Depth colour and foam sample the same finite authored coasts, not circular decals. */
export function addWater(group: THREE.Group) {
  const n = TERRAIN_SEGMENTS + 1,
    data = new Uint8Array(n * n * 2 * 4);
  for (let i = 0; i < 2; i++)
    for (let k = 0; k < n * n; k++) {
      const at = (i * n * n + k) * 4;
      const value = Math.round(
        Math.max(0, Math.min(1, (heightfields[i]![k]! + 12) / 28)) * 255,
      );
      data[at] = value;
      data[at + 1] = value;
      data[at + 2] = value;
      data[at + 3] = 255;
    }
  const depth = new THREE.DataTexture(data, n, n * 2, THREE.RGBAFormat);
  depth.minFilter = THREE.LinearFilter;
  depth.magFilter = THREE.LinearFilter;
  depth.needsUpdate = true;
  const material = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uDepth: { value: depth } },
    vertexShader: `uniform float uTime;varying vec3 vWorld;void main(){vec3 p=position;p.y=sin(p.x*.15+p.z*.08+uTime*.8)*.045+sin(p.z*.23-uTime*.65)*.025;vWorld=p;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
    fragmentShader: `uniform float uTime;uniform sampler2D uDepth;varying vec3 vWorld;
 float islandBed(vec2 p,float slot){if(abs(p.x)>=60.||abs(p.y)>=60.)return -12.;float h=texture2D(uDepth,vec2((p.x+60.)/120.,slot+(p.y+60.)/240.)).r*28.-12.;float edge=length(p);float noise=sin(p.x*.29+p.y*.37)*.7+sin(p.y*.43-p.x*.21)*.5;float margin=smoothstep(48.,59.,edge+noise);float deep=1.-smoothstep(-5.,-.1,h);return mix(h,-12.,margin*deep);} float bed(vec2 p){return max(islandBed(p,0.),islandBed(p+vec2(0.,220.),.5));}
 void main(){float height=bed(vWorld.xz);float d=max(0.,-height);vec3 deep=vec3(.035,.19,.245),shallow=vec3(.16,.49,.46);vec3 color=mix(shallow,deep,smoothstep(.15,6.5,d));float w=sin(vWorld.x*.7+vWorld.z*.53+sin(vWorld.x*.13-vWorld.z*.21)*1.4+uTime)*sin(vWorld.z*.61-vWorld.x*.37+cos(vWorld.z*.19)*.8-uTime*.6);float glint=pow(max(0.,w),16.)*.045;color+=glint;float shore=(1.-smoothstep(.12,1.5,d))*smoothstep(-.2,.05,d);float streak=.5+.5*sin(vWorld.x*2.1+vWorld.z*1.4+uTime*1.7);float foam=shore*pow(streak,7.)*.45;color=mix(color,vec3(.73,.83,.72),foam);gl_FragColor=vec4(color,1.);}`,
  });
  const geometry = new THREE.PlaneGeometry(1100, 1100, 150, 150);
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, 0, -100);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = "depth-aware-sea";
  mesh.frustumCulled = false;
  group.add(mesh);
  return {
    update(time: number) {
      material.uniforms.uTime!.value = time;
    },
    dispose() {
      depth.dispose();
    },
  };
}

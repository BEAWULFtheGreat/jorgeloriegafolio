import './style.scss';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const canvas = document.querySelector('#experience-canvas');
const sizes ={
    width: window.innerWidth,
    height: window.innerHeight,
};

// Loaders
const textureLoader = new THREE.TextureLoader();

// Model Loaders
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( "/draco/" );

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

const environmentMap = new THREE.CubeTextureLoader()
.setPath( 'textures/skybox/' )
.load (["px.webp","nx.webp","py.webp","ny.webp","pz.webp","nz.webp"] );

const textureMap = {
    First: {
        day:"/textures/room/day/TextureSetOne.webp",
    },
    Second: {
        day:"/textures/room/day/TextureSetTwo.webp",
    },
    Third: {
        day:"/textures/room/day/TextureSetThree.webp",
    },
    Fourth: {
        day:"/textures/room/day/TextureSetFour.webp",
    },
};

const loadedTextures = {
    day: {},
};

Object.entries(textureMap).forEach(([key, paths])=> {
    const dayTexture = textureLoader.load(paths.day);
    dayTexture.flipY = false;
    dayTexture.colorSpace = THREE.SRGBColorSpace;
    loadedTextures.day[key] = dayTexture;
});

const glassMaterial = new THREE.MeshPhysicalMaterial({
    transmission: 1,
    opacity: 1,
    metalness: 0,
    roughness: 0,
    ior: 1.5,
    thickness: 0.01,
    specularIntensity: 1,
    envMap: environmentMap,
    envMapIntensity: 1,
    lightMapIntensity: 1,
    depthWrite: false,
});

const whiteMaterial = new THREE.MeshBasicMaterial({
    color: 0x5ffffff,
});

const videoElement = document.createElement("video");
videoElement.src = "/textures/video/Screen.mp4";
videoElement.loop = true;
videoElement.muted = true;
videoElement.playsInline = true;
videoElement.autoplay = true;
videoElement.play()

const videoTexture = new THREE.VideoTexture(videoElement)
videoTexture.colorSpace = THREE.SRGBColorSpace;
videoTexture.flipY = false;

loader.load("/models/Room_Portfolio_V2.glb", (glb)=> {
    glb.scene.traverse((child) =>{
        if(child.isMesh){
            if (child.name.includes("Water")) {
                child.material = new THREE.MeshBasicMaterial({
                    color: 0x558bc8,
                    transparent: true,
                    opacity: 0.66,
                    depthWrite: false,
                });
            }else if(child.name.includes("Glass")){
                child.material = glassMaterial;
            }else if(child.name.includes("Bubble")){
                child.material = whiteMaterial;
            } else if(child.name.includes("Screen")){
                child.material = new THREE.MeshBasicMaterial({
                    map: videoTexture,
                });
            } else{
                Object.keys(textureMap).forEach((key) =>{
                    if(child.name.includes(key)){
                        const material = new THREE.MeshBasicMaterial({
                            map: loadedTextures.day[key],
                        });
    
                        child.material = material;
    
                        if(child.material.map){
                            child.material.map.minFilter = THREE.LinearFilter;
                        }
                    }
                });

            }
        }
    });
     scene.add(glb.scene);
});

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    45,
    sizes.width / sizes.height, 
    0.1,
    1000
);

camera.position.set(12.30774247827041, 7.419743603414397, 10.697734203778111);

const renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true });
renderer.setSize( sizes.width, sizes.height ); 
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// const geometry = new THREE.BoxGeometry( 1, 1, 1 );
// const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
// const cube = new THREE.Mesh( geometry, material );
// scene.add( cube );

const controls = new OrbitControls( camera, renderer.domElement );
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.update();
controls.target.set(-0.03904778248296841,
    1.165211486894046,
    0.6147474323320418);

//  Event Listeners
window.addEventListener("resize", ()=>{
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update Camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize( sizes.width, sizes.height ); 
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const render = () =>{
    controls.update();
    
    // console.log(camera.position);
    // console.log("000000000");
    // console.log(controls.target);

  renderer.render( scene, camera );

  window.requestAnimationFrame(render);
};

render();
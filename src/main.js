import './style.scss';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import gsap from "gsap"

const canvas = document.querySelector('#experience-canvas');
const sizes ={
    width: window.innerWidth,
    height: window.innerHeight,
};

const modals = {
    work: document.querySelector(".modal.work"),
    about: document.querySelector(".modal.about"),
    contact: document.querySelector(".modal.contact"),
};

document.querySelectorAll(".modal-exit-button").forEach((button) =>{
    button.addEventListener("click", (e) =>{
        const modal = e.target.closest(".modal");
        hideModal(modal);
    });
});

const showModal = (modal) => {
    modal.style.display = "block"

    gsap.set(modal, {opacity: 0 });

    gsap.to(modal, {
        opacity:1,
        duration:0.5,
    });
};

const hideModal = (modal) => {
    gsap.to(modal, {
        opacity: 0,
        duration: 0.5,
        onComplete: () =>{
            modal.style.display = "none";
        }
    });
};

const raycasterObjects = [];
let currentIntersects = [];

const socialLinks = {
    Instagram: "https://www.instagram.com/",
    Facebook: "https://www.facebook.com/",
    Youtube: "https://www.youtube.com/",
};

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

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
videoElement.play();

const videoTexture = new THREE.VideoTexture(videoElement);
videoTexture.colorSpace = THREE.SRGBColorSpace;
videoTexture.flipY = false;

window.addEventListener("mousemove", (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
});
window.addEventListener("click", (e) => {
    if (currentIntersects.length> 0) {
        const object = currentIntersects[0].object;

        Object.entries(socialLinks). forEach(([key, url]) => {
            if (object.name.includes(key)) {
                const newWindow = window.open();
                newWindow.opener = null;
                newWindow.location = url;
                newWindow.target = "_blank";
                newWindow.rel = "noopener noreferrer";

            }
        });

        if (object.name.includes("Work_Button")) {
            showModal(modals.work)
        } else if (object.name.includes("About_Button")){
            showModal(modals.about)
            
        }else if (object.name.includes("Contact_Button")){
            showModal(modals.contact)
            
        }

    }
});

loader.load("/models/Room_Portfolio_V3.glb", (glb)=> {
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
            //  ✅ Add all meshes ending with "_Raycaster" to raycasterObjects
             if (child.name.includes("Raycaster")) {
                raycasterObjects.push(child);

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

    // Raycaster
    raycaster.setFromCamera(pointer, camera);

    // calculate objects intersecting the picking ray
    currentIntersects = raycaster.intersectObjects(raycasterObjects);

    for(let  i = 0 ; i < currentIntersects.length; i++) {
    }

    if(currentIntersects.length>0){
        const currentIntersectsObject = currentIntersects[0].object

        if(currentIntersectsObject.name.includes("Pointer")){
            document.body.style.cursor = "pointer";
        } else {
            document.body.style.cursor = "default";
        }
    } else {
        document.body.style.cursor = "default";
    }

  renderer.render( scene, camera );

  window.requestAnimationFrame(render);
};

render();
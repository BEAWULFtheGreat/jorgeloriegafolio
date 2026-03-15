import './style.scss';
import * as THREE from 'three';
import { OrbitControls } from './utils/OrbitControls.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import gsap from "gsap";

const canvas = document.querySelector('#experience-canvas');
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};

const modals = {
    work: document.querySelector(".modal.work"),
    about: document.querySelector(".modal.about"),
    contact: document.querySelector(".modal.contact"),
};

let touchHappened = false;
document.querySelectorAll(".modal-exit-button").forEach((button) => {
    button.addEventListener(
        "touchend",
        (e) => {
            touchHappened = true;
            e.preventDefault();
            const modal = e.target.closest(".modal");
            hideModal(modal);
        },
        { passive: false }
    );
    button.addEventListener(
        "click",
        (e) => {
            if (touchHappened) return;
            e.preventDefault();
            const modal = e.target.closest(".modal");
            hideModal(modal);
        },
        { passive: false }
    );
});

let isModalOpen = false;

const showModal = (modal) => {
    modal.style.display = "block";
    isModalOpen = true;
    controls.enabled = false;

    if (currentHoveredObject) {
        playHoverAnimation(currentHoveredObject, false);
        currentHoveredObject = null;
    }
    document.body.style.cursor = "default";
    currentIntersects = [];

    gsap.set(modal, { opacity: 0 });

    gsap.to(modal, {
        opacity: 1,
        duration: 0.5,
    });
};

const hideModal = (modal) => {
    isModalOpen = false;
    controls.enabled = true;

    gsap.to(modal, {
        opacity: 0,
        duration: 0.5,
        onComplete: () => {
            modal.style.display = "none";
        }
    });
};

const raycasterObjects = [];
let currentIntersects = [];
let currentHoveredObject = null;

const socialLinks = {
    Instagram: "https://www.instagram.com/",
    Facebook: "https://www.facebook.com/",
    Youtube: "https://www.youtube.com/",
};

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

// --- LOADING MANAGER SETUP ---
const loadingScreen = document.querySelector('#loading-screen');
const progressBar = document.querySelector('#progress-bar');
const progressText = document.querySelector('#progress-text');

const loadingManager = new THREE.LoadingManager(
    // Success: Hide screen and play animation
    () => {
        gsap.to(loadingScreen, {
            opacity: 0,
            duration: 1,
            onComplete: () => {
                loadingScreen.style.display = "none";
                playIntroAnimation(); // Now it triggers here!
            }
        });
    },
    // Progress: Update the bar
    (itemUrl, itemsLoaded, itemsTotal) => {
        const progress = (itemsLoaded / itemsTotal) * 100;
        progressBar.style.width = progress + "%";
        progressText.innerText = Math.round(progress) + "%";
    }
);

// Loaders
const textureLoader = new THREE.TextureLoader(loadingManager);

// Model Loaders
const dracoLoader = new DRACOLoader(loadingManager);
dracoLoader.setDecoderPath("/draco/");

const loader = new GLTFLoader(loadingManager);
loader.setDRACOLoader(dracoLoader);

const environmentMap = new THREE.CubeTextureLoader()
    .setPath('textures/skybox/')
    .load(["px.webp", "nx.webp", "py.webp", "ny.webp", "pz.webp", "nz.webp"]);

const textureMap = {
    First: {
        day: "/textures/room/day/TextureSetOne.webp",
    },
    Second: {
        day: "/textures/room/day/TextureSetTwo.webp",
    },
    Third: {
        day: "/textures/room/day/TextureSetThree.webp",
    },
    Fourth: {
        day: "/textures/room/day/TextureSetFour.webp",
    },
};

const loadedTextures = {
    day: {},
};

Object.entries(textureMap).forEach(([key, paths]) => {
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
    touchHappened = false;
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener(
    "touchstart",
    (e) => {
        if (isModalOpen) return;
        e.preventDefault();
        pointer.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
    },
    { passive: false }
);
window.addEventListener(
    "touchend",
    (e) => {
        if (isModalOpen) return;
        e.preventDefault();
        handleRaycasterInteraction();
    },
    { passive: false }
);

function handleRaycasterInteraction() {
    if (currentIntersects.length > 0) {
        const object = currentIntersects[0].object;

        Object.entries(socialLinks).forEach(([key, url]) => {
            if (object.name.includes(key)) {
                const newWindow = window.open();
                newWindow.opener = null;
                newWindow.location = url;
                newWindow.target = "_blank";
                newWindow.rel = "noopener noreferrer";

            }
        });

        if (object.name.includes("Work_Button")) {
            showModal(modals.work);
        } else if (object.name.includes("About_Button")) {
            showModal(modals.about);

        } else if (object.name.includes("Contact_Button")) {
            showModal(modals.contact);

        }

    }
}

let plank1,
    plank2,
    workBtn,
    aboutBtn,
    contactBtn,
    instagram,
    youtube,
    facebook;


window.addEventListener("click", handleRaycasterInteraction);

loader.load("/models/Room_Portfolio_V4.glb", (glb) => {
    glb.scene.traverse((child) => {
        if (child.isMesh) {
            //  ✅ Add all meshes ending with "_Raycaster" to raycasterObjects
            if (child.name.includes("Raycaster")) {
                raycasterObjects.push(child);
            }
            if (child.name.includes("Hover") || child.name.includes("Key")) {
                child.userData.initialScale = new THREE.Vector3().copy(child.scale);
                child.userData.initialPosition = new THREE.Vector3().copy(
                    child.position
                );
                child.userData.initialRotation = new THREE.Euler().copy(child.rotation);
            }
            if (child.name.includes("Hanging_Plank_1")) {
                plank1 = child;
                child.scale.set(0, 1, 0,);
            } else if (child.name.includes("Hanging_Plank_2")) {
                plank2 = child;
                child.scale.set(0, 0, 0,);
            } else if (child.name.includes("My_Work_Button")) {
                workBtn = child;
                child.scale.set(0, 0, 0,);
            } else if (child.name.includes("About_Button")) {
                aboutBtn = child;
                child.scale.set(0, 0, 0,);
            } else if (child.name.includes("Contact_Button")) {
                contactBtn = child;
                child.scale.set(0, 0, 0,);
            } else if (child.name.includes("Instagram")) {
                instagram = child;
                child.scale.set(0, 0, 0,);
            } else if (child.name.includes("Youtube")) {
                youtube = child;
                child.scale.set(0, 0, 0,);
            } else if (child.name.includes("Facebook")) {
                facebook = child;
                child.scale.set(0, 0, 0,);
            }

            if (child.name.includes("Water")) {
                child.material = new THREE.MeshBasicMaterial({
                    color: 0x558bc8,
                    transparent: true,
                    opacity: 0.66,
                    depthWrite: false,
                });
            } else if (child.name.includes("Glass")) {
                child.material = glassMaterial;
            } else if (child.name.includes("Bubble")) {
                child.material = whiteMaterial;
            } else if (child.name.includes("Screen")) {
                child.material = new THREE.MeshBasicMaterial({
                    map: videoTexture,
                    transparent: true,
                    opacity: 0.9,
                });
            } else {
                Object.keys(textureMap).forEach((key) => {
                    if (child.name.includes(key)) {
                        const material = new THREE.MeshBasicMaterial({
                            map: loadedTextures.day[key],
                        });

                        child.material = material;

                        if (child.material.map) {
                            child.material.map.minFilter = THREE.LinearFilter;
                        }
                    }
                });


            }

        }
    });

    scene.add(glb.scene);
    // playIntroAnimation();
});

function playIntroAnimation() {
    const t1 = gsap.timeline({
        defaults: {
            duration: 0.8,
            ease: "back.out(1.8)",
        }
    });
    t1.to(plank1.scale, {
        z: 1,
        x: 1,
    })
        .to(plank2.scale, {
            x: 1,
            y: 1,
            z: 1,
        },
            "-=0.5"
        )
        .to(
            workBtn.scale, {
            x: 1,
            y: 1,
            z: 1,
        },
            "-=0.6"
        )
        .to(
            aboutBtn.scale, {
            x: 1,
            y: 1,
            z: 1,
        },
            "-=0.6"
        )
        .to(
            contactBtn.scale, {
            x: 1,
            y: 1,
            z: 1,
        },
            "-=0.6"
        );

    const t2 = gsap.timeline({
        defaults: {
            duration: 0.8,
            ease: "back.out(1.8)",
        }
    });
    t2.timeScale(0.8);

    t2.to(instagram.scale, {
        z: 1,
        y: 1,
        x: 1,
    })
        .to(
            facebook.scale, {
            x: 1,
            y: 1,
            z: 1,
        },
            "-=0.6"
        )
        .to(
            youtube.scale, {
            x: 1,
            y: 1,
            z: 1,
        },
            "-=0.6"
        );
}

const scene = new THREE.Scene();
scene.background = new THREE.Color("#bfbdc1");


const isMobile = sizes.width < 768;

const camera = new THREE.PerspectiveCamera(
    isMobile ? 55 : 45,
    sizes.width / sizes.height,
    0.1,
    1000
);

if (isMobile) {
    camera.position.set(18, 10, 16);

} else {
    camera.position.set(12.30774247827041, 7.419743603414397, 10.697734203778111);
}

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// const geometry = new THREE.BoxGeometry( 1, 1, 1 );
// const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
// const cube = new THREE.Mesh( geometry, material );
// scene.add( cube );

const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 5;
controls.maxDistance = 50;
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI / 2;
controls.minAzimuthAngle = 0;
controls.maxAzimuthAngle = Math.PI / 2;


controls.enableDamping = true;
controls.dampingFactor = 0.05;

controls.update();

controls.target.set(-0.03904778248296841,
    1.165211486894046,
    0.6147474323320418);

//  Event Listeners
window.addEventListener("resize", () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update Camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

function playHoverAnimation(object, isHovering) {
    gsap.killTweensOf(object.scale);
    gsap.killTweensOf(object.rotation);
    gsap.killTweensOf(object.position);

    if (isHovering) {
        gsap.to(object.scale, {
            x: object.userData.initialScale.x * 1.2,
            y: object.userData.initialScale.y * 1.2,
            z: object.userData.initialScale.z * 1.2,
            duration: 0.5,
            ease: "bounce.out(1.8)",
        });
        gsap.to(object.rotation, {
            x: object.userData.initialRotation.x + Math.PI / 8,
            duration: 0.5,
            ease: "bounce.out(1.8)",
        });
    } else {
        gsap.to(object.scale, {
            x: object.userData.initialScale.x,
            y: object.userData.initialScale.y,
            z: object.userData.initialScale.z,
            duration: 0.3,
            ease: "bounce.out(1.8)",
        });
        gsap.to(object.rotation, {
            x: object.userData.initialRotation.x,
            duration: 0.3,
            ease: "bounce.out(1.8)",
        });
    }
}

const render = () => {
    controls.update();

    // console.log(camera.position);
    // console.log("000000000");
    // console.log(controls.target);

    // Raycaster
    if (!isModalOpen) {

        raycaster.setFromCamera(pointer, camera);

        // calculate objects intersecting the picking ray
        currentIntersects = raycaster.intersectObjects(raycasterObjects);

        for (let i = 0; i < currentIntersects.length; i++) {
        }

        if (currentIntersects.length > 0) {
            const currentIntersectObject = currentIntersects[0].object;

            if (currentIntersectObject.name.includes("Hover")) {
                if (currentIntersectObject !== currentHoveredObject) {
                    if (currentHoveredObject) {
                        playHoverAnimation(currentHoveredObject, false);
                    }


                    playHoverAnimation(currentIntersectObject, true);
                    currentHoveredObject = currentIntersectObject;
                }
            }

            if (currentIntersectObject.name.includes("Pointer")) {
                document.body.style.cursor = "pointer";
            } else {
                document.body.style.cursor = "default";
            }
        } else {
            if (currentHoveredObject) {
                playHoverAnimation(currentHoveredObject, false);
                currentHoveredObject = null;
            }
            document.body.style.cursor = "default";
        }
    }

    renderer.render(scene, camera);

    window.requestAnimationFrame(render);
};

render();
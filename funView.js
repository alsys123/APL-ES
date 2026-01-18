


import * as THREE from 'https://esm.sh/three@0.164.0';
import { OrbitControls } from 'https://esm.sh/three@0.164.0/examples/jsm/controls/OrbitControls.js';

//console.log("Module mode:", import.meta.url);

/*
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Stacked 3D Lego Bricks</title>
    <style>
        body { margin: 0; background: #1a1a1a; overflow: hidden; font-family: sans-serif; }
        #info { position: absolute; top: 10px; width: 100%; text-align: center; color: white; }
    </style>
</head>
<body>
    <div id="info">Use Mouse to Rotate & Zoom</div>

    <script type="importmap">
        {
            "imports": {
                "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
                "three/addons/": "https://unpkg.com/three@0.160.0/examples/jsm/"
            }
        }
    </script>

    <script type="module">
*/

//        import * as THREE from 'three';
//        import { OrbitControls } from 'three/addons/controls/OrbitControls.js';



// your scene code here


        // --- Basic Setup ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

//  document.getElementById('resultsContent').innerHTML = summaryHtml + detailsHtml;
//  document.getElementById('resultsModal').classList.add('active');


//renderer.setSize(window.innerWidth, window.innerHeight);
//document.body.appendChild(renderer.domElement);


  
        // --- Lights ---
        const ambient = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambient);
        const sun = new THREE.DirectionalLight(0xffffff, 1.5);
        sun.position.set(5, 10, 5);
        scene.add(sun);

        // --- Brick Creation Logic ---
        const BRICK_HEIGHT = 1.2;


function createBrick(color) {
    const group = new THREE.Group();
    const material = new THREE.MeshPhongMaterial({ color: color, shininess: 90 });
    
    // 1. The Body 
    // We move the geometry so the "origin" is at the bottom of the brick
    const bodyGeom = new THREE.BoxGeometry(2, BRICK_HEIGHT, 2);
    bodyGeom.translate(0, BRICK_HEIGHT / 2, 0); // Move center up so bottom is at Y=0
    const body = new THREE.Mesh(bodyGeom, material);
    group.add(body);
    
    // 2. The Studs
    const studGeom = new THREE.CylinderGeometry(0.35, 0.35, 0.3, 32);
    studGeom.translate(0, 0.15, 0); // Move center up so bottom of stud is at Y=0
    
    const positions = [
        [-0.5, BRICK_HEIGHT, -0.5], [0.5, BRICK_HEIGHT, -0.5],
        [-0.5, BRICK_HEIGHT, 0.5], [0.5, BRICK_HEIGHT, 0.5]
    ];
    
    positions.forEach(pos => {
                const stud = new THREE.Mesh(studGeom, material);
        stud.position.set(pos[0], pos[1], pos[2]);
        group.add(stud);
            });
    
    return group;
} // createBrick

/*
// --- Adding the Bricks ---

// Brick 1: Red (at the bottom)
const brick1 = createBrick(0xee0000);
scene.add(brick1);

// Brick 2: Blue (stacked on top)
const brick2 = createBrick(0x0055ff);
brick2.position.y = BRICK_HEIGHT; // Move it up by exactly one brick height
brick2.position.x = 1;             // Offset it slightly to see the connection
scene.add(brick2);

// Brick 3: Blue (stacked on top)
        const brick3 = createBrick(0x0055ff);
brick3.position.y = BRICK_HEIGHT*2;
brick3.position.x = 1;             // Offset it slightly to see the connection
scene.add(brick3);

// Brick 4: Blue (stacked on top)
const brick4 = createBrick(0x0055ff);
brick4.position.y = BRICK_HEIGHT*3;
brick4.position.x = 2;             // Offset it slightly to see the connection
scene.add(brick4);

// Brick 5: Blue (stacked on top)
const brick5 = createBrick(0x0055ff);
brick5.position.y = BRICK_HEIGHT*4; 
brick5.position.x = 1;             // Offset it slightly to see the connection
scene.add(brick5);

// --- Camera & Interaction ---
camera.position.set(5, 5, 5);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

//__ animate
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
} // animate

animate();

*/

//</script>
//</body>
//</html>



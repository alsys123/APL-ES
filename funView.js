
import * as THREE from 'https://esm.sh/three@0.164.0';
import { OrbitControls } from 'https://esm.sh/three@0.164.0/examples/jsm/controls/OrbitControls.js';

let renderer, camera, scene, controls;
let legoInitialized = false;

function initLegoScene(progress) {
    if (legoInitialized) return;
    legoInitialized = true;

    console.log("init Lego");
    
    const container = document.getElementById("legoContainer");
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(5, 5, 5);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffffff, 1.5);
    sun.position.set(5, 10, 5);
    scene.add(sun);

    // Brick creation
    const BRICK_HEIGHT = 1.2;

    function createBrick(color) {
        const group = new THREE.Group();
        const material = new THREE.MeshPhongMaterial({ color, shininess: 90 });

        const bodyGeom = new THREE.BoxGeometry(2, BRICK_HEIGHT, 2);
        bodyGeom.translate(0, BRICK_HEIGHT / 2, 0);
        const body = new THREE.Mesh(bodyGeom, material);
        group.add(body);

        const studGeom = new THREE.CylinderGeometry(0.35, 0.35, 0.3, 32);
        studGeom.translate(0, 0.15, 0);

        const positions = [
            [-0.5, BRICK_HEIGHT, -0.5], [0.5, BRICK_HEIGHT, -0.5],
            [-0.5, BRICK_HEIGHT, 0.5],  [0.5, BRICK_HEIGHT, 0.5]
        ];

        positions.forEach(pos => {
            const stud = new THREE.Mesh(studGeom, material);
            stud.position.set(pos[0], pos[1], pos[2]);
            group.add(stud);
        });

        return group;
    }

    // bricks are added using json
    /*
    // Add bricks
    const brick1 = createBrick(0xee0000);
    scene.add(brick1);
    */
    
    const brick2 = createBrick(0x0055ff);
    brick2.position.y = BRICK_HEIGHT;
    brick2.position.x = 1;
    scene.add(brick2);
/*
    const brick3 = createBrick(0x0055ff);
    brick3.position.y = BRICK_HEIGHT * 2;
    brick3.position.x = 1;
    scene.add(brick3);

    const brick4 = createBrick(0x0055ff);
    brick4.position.y = BRICK_HEIGHT * 3;
    brick4.position.x = 2;
    scene.add(brick4);

    const brick5 = createBrick(0x0055ff);
    brick5.position.y = BRICK_HEIGHT * 4;
    brick5.position.x = 1;
    scene.add(brick5);
*/
    /*
    // ... fun status
    const bricksToShow = Math.round(progress.percent / 10); // 10% per brick
    for (let i = 0; i < bricksToShow; i++) {
	const brick = createBrick(0x0055ff);
	brick.position.y = i * BRICK_HEIGHT;
		 brick.position.x = 4;
	scene.add(brick);
    }
    */
    
    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Resize handling
    window.addEventListener("resize", () => {
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    });

    animate();
}

let animateFrame;

function animate() {
    animateFrame = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

/*
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
    }
*/


function openLegoModal(progress) {
    console.log("openning Lego Modal");
    document.getElementById("legoModal").classList.add("active");
    if (!legoInitialized) {
	initLegoScene(progress);
	// load your file here
//	loadLegoJson(progress,"dataSets/legoCastle-1.json"); 
	const select = document.getElementById("legoSceneSelect");
	const url = select.value;
	loadLegoJson(progress, url);
	
//	legoInitialized = true; -- fix for loading new scenes
    }
}

/*
function closeLegoModal() {
    document.getElementById("legoModal").classList.remove("active");
    }
*/

function closeLegoModal() {
    document.getElementById("legoModal").classList.remove("active");
    cleanupLegoScene();
}

const gridSize = 40;
const gridDivisions = 40;
const cellSize = gridSize / gridDivisions;
let nextBrickId = 1;


function showLego() {
    const progress = getProgressSummary();
    openLegoModal(progress);          // open the modal
}

//__ createBrickFromJson
/*  from ... builder
function createBrickFromJson(w, l, flat = false, pos = null) {
  const isSteeple = (w === 9 && l === 1);
//    const isSlope = (w === 9 && l === 2);

    // for orientation
    const isSlopeNorth = (w === 9 && l === 2);
    const isSlopeEast  = (w === 9 && l === 3);
    const isSlopeSouth = (w === 9 && l === 4);
    const isSlopeWest  = (w === 9 && l === 5);
    
    const isSlope = isSlopeNorth || isSlopeEast || isSlopeSouth || isSlopeWest;
    
  // ───────────────────────────────────────────────
  //  Dimensions
  // ───────────────────────────────────────────────
  let brickWidth  = isSteeple ? cellSize * 1 : cellSize * w;
  let brickDepth  = isSteeple ? cellSize * 1 : cellSize * l;
  let brickHeight = isSteeple ? cellSize * 6
                              : flat ? cellSize/4 
                                     : cellSize/2;

  const position = pos ? pos.clone() : new THREE.Vector3(0, 0, 0);

  // ───────────────────────────────────────────────
  //  Base mesh (invisible for steeple)
  // ───────────────────────────────────────────────
  const geo = new THREE.BoxGeometry(brickWidth, brickHeight, brickDepth);
  const baseMat = new THREE.MeshStandardMaterial({ 
    color: isSteeple ? 0x8888ff : 0xff3333,
    visible: !isSteeple
  });
  const materials = Array(6).fill(baseMat.clone());

  const mesh = new THREE.Mesh(geo, materials);
  mesh.position.copy(position);
  mesh.position.y = brickHeight / 2;
  scene.add(mesh);
    
    if (isSteeple) {
	const coneHeight = cellSize * 2.5;   // adjust height here
	const coneRadius = cellSize * 0.55;
	
	const coneGeo = new THREE.ConeGeometry(coneRadius, coneHeight, 24);
	const coneMat = new THREE.MeshStandardMaterial({ color: 0xff3333 });
	
	const cone = new THREE.Mesh(coneGeo, coneMat);
	
	// Make the cone the actual brick mesh
	mesh.geometry = coneGeo;
	mesh.material = coneMat;
	
	// Reposition mesh so the cone sits on the ground
	mesh.position.y = coneHeight / 2;
    } //isSteeple
    
    // creating a slope tile
    if (isSlope) {
	const W = cellSize;
	const D = cellSize;
	//    const H = cellSize / 2;
	//const H = cellSize * 0.75;
	const H = cellSize * 0.6;
	
	const geom = new THREE.BufferGeometry();
	
	const vertices = new Float32Array([
	    -W/2, 0, -D/2,
	    W/2, 0, -D/2,
	    W/2, 0,  D/2,
	    -W/2, 0,  D/2,
	    -W/2, H, -D/2,
	    W/2, H, -D/2
	]);
	
	const indices = [
	    0,1,2, 0,2,3,
	    3,2,5, 3,5,4,
	    0,3,4,
	    1,5,2,
	    4,5,1, 4,1,0
	];
	
	geom.setIndex(indices);
	geom.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
	geom.computeVertexNormals();
	
	// ⭐ CRITICAL FIX: recenter geometry like a brick
	if (isSlopeNorth || isSlopeSouth) {
	    geom.translate(0, -H/2, 0);
	    geom.translate(0, 0, -cellSize * 0.5);
	}
	if (isSlopeEast || isSlopeWest) {
	    geom.translate(0, -H/2, 0);
	}
	
	//  const mat = new THREE.MeshStandardMaterial({ color: 0xff3333 });
	const mat = new THREE.MeshStandardMaterial({color: 0xff3333,flatShading: true });
	
	mesh.geometry = geom;
	mesh.material = mat;
	
	//    if (isSlope) {
	// rotate the slope
	if (isSlopeNorth) mesh.rotation.y = 0;
	if (isSlopeEast)  mesh.rotation.y = Math.PI / 2;
	if (isSlopeSouth) mesh.rotation.y = Math.PI;
	if (isSlopeWest)  mesh.rotation.y = -Math.PI / 2;
	//}
	
	// Now this is correct
	mesh.position.y = H / 2;

    } // slope
    
    
  // ───────────────────────────────────────────────
  //  Studs (normal bricks only)
  // ───────────────────────────────────────────────
  const studs = [];
  if (!flat && !isSteeple && !isSlope) {
    const studGeo = new THREE.CylinderGeometry(cellSize*0.18, cellSize*0.18, brickHeight*0.4, 16);
    const studMat = new THREE.MeshStandardMaterial({ color: 0xff6666 });

    for (let i = 0; i < w; i++) {
      for (let j = 0; j < l; j++) {
        const stud = new THREE.Mesh(studGeo, studMat);
        stud.position.set(
          mesh.position.x + (i - (w-1)/2) * cellSize,
          mesh.position.y + brickHeight/2 + (brickHeight*0.4)/2,
          mesh.position.z + (j - (l-1)/2) * cellSize
        );
        scene.add(stud);
        studs.push(stud);
      }
    }
  }

  // ───────────────────────────────────────────────
  //  Helpers
  // ───────────────────────────────────────────────
//  const helperSelected   = new THREE.BoxHelper(mesh, 0xffff00);
//  const helperUnselected = new THREE.BoxHelper(mesh, 0x555555);
//  helperSelected.visible   = false;
//  helperUnselected.visible = document.getElementById('showBorders').checked;

//  scene.add(helperSelected);
//  scene.add(helperUnselected);

  // ───────────────────────────────────────────────
  //  Brick object
  // ───────────────────────────────────────────────
  const brick = { 
    id: nextBrickId++,
    mesh, 
    studs, 
    helperSelected, 
    helperUnselected,
    w,
    l,
    flat
  };

   
  bricks.push(brick);

  // ───────────────────────────────────────────────
  //  Snapping & updates
  // ───────────────────────────────────────────────
  snapBrickToStudGrid(brick);
  if (!isSteeple && !isSlope) updateStuds(brick);

//  helperSelected.update();
//  helperUnselected.update();

//  selectBrick(brick, false);
  return brick;
  }
  */

function createBrickFromJson(block) {
    const { w, l, flat, pos } = block;

//    console.log("are we flat:",flat);
    
    const group = new THREE.Group();
    const color = 0xff0000;
    const material = new THREE.MeshPhongMaterial({ color, shininess: 90 });

    const BRICK_HEIGHT = flat ? 0.48 : 1.2;

    // Body
    const bodyGeom = new THREE.BoxGeometry(w, BRICK_HEIGHT, l);
    bodyGeom.translate(0, BRICK_HEIGHT / 2, 0);
    const body = new THREE.Mesh(bodyGeom, material);
    group.add(body);

    // Studs
    if (!flat) {
        const studGeom = new THREE.CylinderGeometry(0.35, 0.35, 0.3, 32);
        studGeom.translate(0, 0.15, 0);

        for (let ix = 0; ix < w; ix++) {
            for (let iz = 0; iz < l; iz++) {
                const stud = new THREE.Mesh(studGeom, material);
                stud.position.set(
                    -((w - 1) / 2) + ix,
                    BRICK_HEIGHT,
                    -((l - 1) / 2) + iz
                );
                group.add(stud);
            }
        }
    }

    // Border
    {
        const edgeGeom = new THREE.EdgesGeometry(bodyGeom);
        const edgeMat = new THREE.LineBasicMaterial({ color: 0x000000 });
        const border = new THREE.LineSegments(edgeGeom, edgeMat);
        border.position.copy(body.position);
        border.scale.set(1.002, 1.002, 1.002);  // ⭐ prevents z-fighting
        group.add(border);
    }

    group.position.set(pos.x, pos.y, pos.z);
    return group;
}


/*
function createBrickFromJson(block) {
    const { w, l, flat, pos } = block;

    const group = new THREE.Group();
//    const color = flat ? 0xffcc00 : 0x0055ff; // example colors
    const color = 0xff0000;   // red
    const material = new THREE.MeshPhongMaterial({ color, shininess: 90 });

    // Brick height: flat tiles are thinner
//    const BRICK_HEIGHT = flat ? 0.4 : 1.2;
    const BRICK_HEIGHT = flat ? 0.48 : 1.2;

    // Body
    const bodyGeom = new THREE.BoxGeometry(w * 1, BRICK_HEIGHT, l * 1);
    bodyGeom.translate(0, BRICK_HEIGHT / 2, 0);
    const body = new THREE.Mesh(bodyGeom, material);
    group.add(body);

    // Studs (only if not flat)
    if (!flat) {
        const studGeom = new THREE.CylinderGeometry(0.35, 0.35, 0.3, 32);
        studGeom.translate(0, 0.15, 0);

        for (let ix = 0; ix < w; ix++) {
            for (let iz = 0; iz < l; iz++) {
                const stud = new THREE.Mesh(studGeom, material);
                stud.position.set(
                    -((w - 1) / 2) + ix,
                    BRICK_HEIGHT,
                    -((l - 1) / 2) + iz
                );
                group.add(stud);
            }
        }
    }

    // --- Thin black border around the brick body ---
    { const edgeGeom = new THREE.EdgesGeometry(bodyGeom);
      const edgeMat = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 1 });
      const border = new THREE.LineSegments(edgeGeom, edgeMat);
      border.position.copy(body.position); group.add(border);
    }
    
    // Position in world
    group.position.set(pos.x, pos.y, pos.z);

    return group;
} // createBrickFromJson
*/

async function loadLegoJson(progress,url) {
    //    const response = await fetch(url);
    // Do not cache
    const response = await fetch(`${url}?v=${Date.now()}`);
    const data = await response.json();

    data.forEach(block => {
	// if answered only .. show the brick
	if (progress.answers[block.id] !== undefined) {
            const brick = createBrickFromJson(block);
	    scene.add(brick);
	}
    });
    
    console.log("Loaded Lego: ",url);

}

window.loadLegoJson = loadLegoJson;

//__ cleanupLegoScene
function cleanupLegoScene() {
    console.log("Cleaning up LEGO scene…");

    // Stop animation loop
    cancelAnimationFrame(animateFrame);

    // Dispose renderer
    if (renderer) {
        renderer.dispose();
    }

    // Dispose scene objects
    if (scene) {
        scene.traverse(obj => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(m => m.dispose());
                } else {
                    obj.material.dispose();
                }
            }
        });
    }

    // Remove canvas from DOM
    const container = document.getElementById("legoContainer");
    if (container && renderer && renderer.domElement) {
        container.removeChild(renderer.domElement);
    }

// clear Three cache
    THREE.Cache.clear();
    
    // Reset all globals
    renderer = null;
    camera = null;
    scene = null;
    controls = null;
    legoInitialized = false;
    
    setTimeout(() => {
	if (window.gc) window.gc();
    }, 0);

    console.log("LEGO scene reset complete.");
} // cleanupLegoScene

function changeLegoScene() {
    const select = document.getElementById("legoSceneSelect");
    const url = select.value;

    // Reset everything
    cleanupLegoScene();

    // Rebuild fresh
    const progress = getProgressSummary();
    initLegoScene(progress);
    loadLegoJson(progress, url);
}

// expose functions globally
window.openLegoModal = openLegoModal;
window.closeLegoModal = closeLegoModal;
window.initLegoScene = initLegoScene;
window.showLego = showLego;
window.changeLegoScene = changeLegoScene;

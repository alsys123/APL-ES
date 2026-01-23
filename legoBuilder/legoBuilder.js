
import * as THREE from 'https://esm.sh/three@0.164.0';
import { OrbitControls } from 'https://esm.sh/three@0.164.0/examples/jsm/controls/OrbitControls.js';

let scene, camera, renderer, controls;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

const gridSize = 40;
const gridDivisions = 40;
const cellSize = gridSize / gridDivisions;

let rayPlane;
let bricks = [];
let selectedBricks = new Set();
let dragging = false;
let nextBrickId = 1;

init();
animate();

// ---------- Init ----------
function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x202020);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(25, 25, 25);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.7);
  hemi.position.set(0, 50, 0);
  scene.add(hemi);

  const dir = new THREE.DirectionalLight(0xffffff, 0.8);
  dir.position.set(20, 40, 20);
  scene.add(dir);

  const grid = new THREE.GridHelper(gridSize, gridDivisions, 0x666666, 0x333333);
  scene.add(grid);

  rayPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(5000, 5000),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  rayPlane.rotation.x = -Math.PI / 2;
  scene.add(rayPlane);

  window.addEventListener('resize', onResize);
  renderer.domElement.addEventListener('pointerdown', onPointerDown);
  renderer.domElement.addEventListener('pointermove', onPointerMove);
  renderer.domElement.addEventListener('pointerup', onPointerUp);

  document.getElementById('add1x1').onclick = () => addBrick(1,1,false);
  document.getElementById('add2x2').onclick = () => addBrick(2,2,false);
  document.getElementById('add2x4').onclick = () => addBrick(2,4,false);
  document.getElementById('add4x2').onclick = () => addBrick(4,2,false);
  document.getElementById('add4x4').onclick = () => addBrick(4,4,false);
  document.getElementById('add8x8').onclick = () => addBrick(8,8,false);

    document.getElementById('add1x1flat').onclick = () => addBrick(1,1,true);
    document.getElementById('add2x2flat').onclick = () => addBrick(2,2,true);

    document.getElementById('steeple').onclick = () => addBrick(9,1,true);

    document.getElementById('slopeNorth').onclick = () => addBrick(9,2,true);
    document.getElementById('slopeEast').onclick = () => addBrick(9,3,true);
    document.getElementById('slopeSouth').onclick = () => addBrick(9,4,true);
    document.getElementById('slopeWest').onclick = () => addBrick(9,5,true);

  document.getElementById('moveXm').onclick = () => moveSelected(-1,0,0);
  document.getElementById('moveXp').onclick = () => moveSelected(1,0,0);
  document.getElementById('moveYm').onclick = () => moveSelected(0,-1,0);
  document.getElementById('moveYp').onclick = () => moveSelected(0,1,0);
  document.getElementById('moveZm').onclick = () => moveSelected(0,0,-1);
  document.getElementById('moveZp').onclick = () => moveSelected(0,0,1);

  document.getElementById('saveBtn').onclick = saveScene;
  document.getElementById('loadBtn').onclick = () => document.getElementById('fileInput').click();
  document.getElementById('fileInput').addEventListener('change', onFileChosen);

  document.getElementById('showBorders').onchange = () => {
    const visible = document.getElementById('showBorders').checked;
    bricks.forEach(b => {
      b.helperSelected.visible = visible && selectedBricks.has(b);
      b.helperUnselected.visible = visible && !selectedBricks.has(b);
    });
  };

  document.getElementById('deleteBrick').onclick = deleteSelectedBrick;

  addBrick(2,4,false,new THREE.Vector3(0,0,0));
  addBrick(2,2,false,new THREE.Vector3(cellSize*3,0,0));
    addBrick(1,1,false,new THREE.Vector3(-cellSize*3,0,0));

    const ui = document.getElementById('ui');
    const toggleMenuBtn = document.getElementById('toggleMenuBtn');
    
    toggleMenuBtn.onclick = () => {
	const hidden = ui.classList.toggle('hiddenMenu');
	toggleMenuBtn.textContent = hidden ? "Show Controls" : "Hide Controls";
	
    };

} // init

// ---------- Loop ----------
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

// ---------- Resize ----------
function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// ---------- Ray helpers ----------
function screenToNDC(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function intersectGrid(event) {
  screenToNDC(event);
  raycaster.setFromCamera(mouse, camera);
  const hit = raycaster.intersectObject(rayPlane, false);
  return hit.length ? hit[0].point : null;
}

function pickBrick(event) {
  screenToNDC(event);
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(bricks.map(b => b.mesh), false);
  return hits.length ? hits[0].object : null;
}

// ---------- Stud-grid snapping (parity-aware) ----------
function snapBrickToStudGrid(brick) {
  const { mesh, w, l } = brick;

  let sx = mesh.position.x / cellSize;
  if (w % 2 === 0) sx = Math.round(sx - 0.5) + 0.5;
  else sx = Math.round(sx);
  mesh.position.x = sx * cellSize;

  let sz = mesh.position.z / cellSize;
  if (l % 2 === 0) sz = Math.round(sz - 0.5) + 0.5;
  else sz = Math.round(sz);
  mesh.position.z = sz * cellSize;
} //snapBrickToStudGrid

//__ addBrick - steeple is really cone and slope
function addBrick(w, l, flat = false, pos = null) {
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
  const helperSelected   = new THREE.BoxHelper(mesh, 0xffff00);
  const helperUnselected = new THREE.BoxHelper(mesh, 0x555555);
  helperSelected.visible   = false;
  helperUnselected.visible = document.getElementById('showBorders').checked;

  scene.add(helperSelected);
  scene.add(helperUnselected);

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

  helperSelected.update();
  helperUnselected.update();

  selectBrick(brick, false);
  return brick;
}


// ---------- Selection (single + multi) ----------
function selectBrick(brick, additive=false) {
  const showBorders = document.getElementById('showBorders').checked;

  if (!additive) {
    selectedBricks.forEach(b => {
      b.helperSelected.visible = false;
      b.helperUnselected.visible = showBorders;
    });
    selectedBricks.clear();
  }

  if (selectedBricks.has(brick)) {
    if (additive) {
      brick.helperSelected.visible = false;
      brick.helperUnselected.visible = showBorders;
      selectedBricks.delete(brick);
      return;
    }
  } else {
    selectedBricks.add(brick);
    brick.helperSelected.visible = showBorders;
    brick.helperUnselected.visible = false;
  }
}

// ---------- Movement (buttons) ----------
function moveSelected(dx,dy,dz) {
  if (selectedBricks.size === 0) return;

  selectedBricks.forEach(brick => {
    brick.mesh.position.x += dx*cellSize;
    brick.mesh.position.y += dy*(cellSize/2);
    brick.mesh.position.z += dz*cellSize;

    snapBrickToStudGrid(brick);
    updateStuds(brick);
    brick.helperSelected.update();
    brick.helperUnselected.update();
  });
}

// ---------- Stud updates ----------
function updateStuds(brick) {
  const { mesh, studs, w, l, flat } = brick;
  if (flat) return;

  const brickHeight = cellSize/2;
  const studHeight = brickHeight*0.4;

  let idx=0;
  for (let i=0;i<w;i++) {
    for (let j=0;j<l;j++) {
      const stud = studs[idx++];
      stud.position.set(
        mesh.position.x + (i-(w-1)/2)*cellSize,
        mesh.position.y + brickHeight/2 + studHeight/2,
        mesh.position.z + (j-(l-1)/2)*cellSize
      );
    }
  }
}

// ---------- Pointer events ----------
function onPointerDown(event) {
  const obj = pickBrick(event);
  const additive = event.shiftKey;

  if (obj) {
    const brick = bricks.find(b => b.mesh === obj);
    selectBrick(brick, additive);

    dragging = true;
    controls.enabled = false;

    const p = intersectGrid(event);
    if (p) {
      selectedBricks.forEach(b => {
        b.dragOffset = new THREE.Vector3().copy(p).sub(b.mesh.position);
      });
    }
  } else {
    if (!event.shiftKey) {
      const showBorders = document.getElementById('showBorders').checked;
      selectedBricks.forEach(b => {
        b.helperSelected.visible = false;
        b.helperUnselected.visible = showBorders;
      });
      selectedBricks.clear();
    }
  }
}

function onPointerMove(event) {
  if (!dragging || selectedBricks.size === 0) return;

  const p = intersectGrid(event);
  if (!p) return;

  selectedBricks.forEach(brick => {
    const target = new THREE.Vector3().copy(p).sub(brick.dragOffset);

    brick.mesh.position.x = target.x;
    brick.mesh.position.z = target.z;

    snapBrickToStudGrid(brick);
    updateStuds(brick);
    brick.helperSelected.update();
    brick.helperUnselected.update();
  });
}

function onPointerUp() {
  dragging = false;
  controls.enabled = true;
}

// ---------- Delete ----------
function deleteSelectedBrick() {
  selectedBricks.forEach(brick => {
    scene.remove(brick.mesh);
    brick.studs.forEach(s => scene.remove(s));
    scene.remove(brick.helperSelected);
    scene.remove(brick.helperUnselected);
  });

  bricks = bricks.filter(b => !selectedBricks.has(b));
  selectedBricks.clear();
}

// ---------- JSON with comments ----------
function parseJsonWithComments(text) {
  const cleaned = text
    .replace(/\/\/.*$/gm, '')
    .replace(/^\s*$/gm, '');
  return JSON.parse(cleaned);
}

// ---------- Save / Load ----------
function saveScene() {
  let saveId = 1;

  const data = bricks.map(b => ({
    id: saveId++,   // Always starts at 1
    w: b.w,
    l: b.l,
      flat: b.flat,
    pos: {
      x: b.mesh.position.x,
      y: b.mesh.position.y,
      z: b.mesh.position.z
    }
  }));

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'lego-scene.json';
  a.click();
  URL.revokeObjectURL(url);
}


function onFileChosen(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = parseJsonWithComments(reader.result);
      loadScene(data);
    } catch (err) {
      console.error('Invalid JSON', err);
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

function loadScene(data) {
  bricks.forEach(b => {
    scene.remove(b.mesh);
    b.studs.forEach(s => scene.remove(s));
    scene.remove(b.helperSelected);
    scene.remove(b.helperUnselected);
  });
  bricks = [];
  selectedBricks.clear();
  nextBrickId = 1;

  data.forEach(item => {
      const pos = new THREE.Vector3(item.pos.x,item.pos.y,item.pos.z);
     
      // normal brick
    const brick = addBrick(item.w, item.l, item.flat, pos);
    brick.id = item.id;
    brick.mesh.position.y = item.pos.y;
    snapBrickToStudGrid(brick);
    updateStuds(brick);
    brick.helperSelected.update();
    brick.helperUnselected.update();
      nextBrickId = Math.max(nextBrickId, item.id + 1);
  });

  const visible = document.getElementById('showBorders').checked;
  bricks.forEach(b => {
    b.helperSelected.visible = false;
    b.helperUnselected.visible = visible;
  });
}


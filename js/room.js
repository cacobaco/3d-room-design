import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

// Criar cena, câmera e renderizador
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 800 / 800, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("gl-canvas"),
});
renderer.setSize(800, 800);

// Configurar cor de fundo do renderizador
renderer.setClearColor(0x87ceeb);

// Material para paredes e chão
const wallTexture = new THREE.TextureLoader().load("../textures/wall.jpg");
const wallMaterial = new THREE.MeshPhongMaterial({
  map: wallTexture,
});
const floorTexture = new THREE.TextureLoader().load("../textures/floor.jpg");
const floorMaterial = new THREE.MeshPhongMaterial({
  map: floorTexture,
});

// Criar paredes
const wallGeometry = new THREE.PlaneGeometry(10, 10);
const wall1 = new THREE.Mesh(wallGeometry, wallMaterial);
wall1.position.set(0, 5, -5);
scene.add(wall1);
const wall2 = new THREE.Mesh(wallGeometry, wallMaterial);
wall2.position.set(-5, 5, 0);
wall2.rotation.y = Math.PI / 2;
scene.add(wall2);

// Criar chão
const floorGeometry = new THREE.PlaneGeometry(10, 10);
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.set(0, 0, 0);
scene.add(floor);

// Configurar a posição inicial da câmera
camera.position.set(5, 5, 15);
camera.lookAt(0, 5, 0);

// Variáveis para controle de movimento
let moveSpeed = 0.1;
const keysPressed = {};

// Event listeners para teclas
window.addEventListener("keydown", (event) => {
  keysPressed[event.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (event) => {
  keysPressed[event.key.toLowerCase()] = false;

  if (event.key === "CapsLock" && selectedPrimitive) {
    primitiveCollisionsEnabled = !primitiveCollisionsEnabled;
  }
});

// Controle de movimento WASD
function updateCamera() {
  if (keysPressed[" "]) {
    moveSpeed = 0.5;
  } else {
    moveSpeed = 0.1;
  }

  if (keysPressed["w"]) {
    controls.moveForward(moveSpeed);
  }
  if (keysPressed["s"]) {
    controls.moveForward(-moveSpeed);
  }
  if (keysPressed["a"]) {
    controls.moveRight(-moveSpeed);
  }
  if (keysPressed["d"]) {
    controls.moveRight(moveSpeed);
  }
  if (keysPressed["q"]) {
    camera.position.y += moveSpeed;
  }
  if (keysPressed["e"]) {
    camera.position.y -= moveSpeed;
  }

  requestAnimationFrame(updateCamera);
}
updateCamera();

// Usar PointerLockControls para navegação estilo FPS
const controls = new PointerLockControls(camera, document.body);

// Event listeners para controle de rotação com o mouse
document.addEventListener("pointerlockchange", () => {
  if (document.pointerLockElement === document.body) {
    controls.enabled = true;
  } else {
    controls.enabled = false;
  }
});

document.getElementById("gl-canvas").addEventListener("click", () => {
  document.body.requestPointerLock();
});

// ***********************
// * PRIMITIVES CREATION *
// ***********************
/**
 * @typedef {Object} Primitive
 *
 * @property {string} id - The unique identifier of the primitive.
 * @property {string} type - The type of primitive.
 * @property {number} height - The height of the primitive.
 * @property {number} width - The width of the primitive.
 * @property {number} depth - The depth of the primitive.
 * @property {number} x - The x-coordinate of the primitive.
 * @property {number} y - The y-coordinate of the primitive.
 * @property {number} z - The z-coordinate of the primitive.
 * @property {number} rotationX - The x-axis rotation of the primitive.
 * @property {number} rotationY - The y-axis rotation of the primitive.
 * @property {number} rotationZ - The z-axis rotation of the primitive.
 * @property {string} attribute - The attribute of the primitive.
 * @property {string} attributeValue - The value of the attribute.
 * @property {THREE.Mesh | undefined} mesh - The mesh object of the primitive.
 */

const maxPrimitives = 10;
const primitives = {};

document
  .getElementById("addPrimitiveForm")
  .addEventListener("submit", (event) => {
    event.preventDefault();

    const count = Object.keys(primitives).length;

    if (count >= maxPrimitives) {
      showErrorModal(
        "Erro",
        `O número máximo de primitivas foi atingido (${count}/${maxPrimitives}).`
      );
      return;
    }

    try {
      const primitive = getFormPrimitive();
      createPrimitive(primitive);
    } catch (error) {
      showErrorModal("Erro", error.message);
    }
  });

/**
 * Retrieves form inputs and returns a primitive object based on the input values.
 *
 * @returns {Primitive} The primitive object.
 *
 * @throws If a primitive with the same id already exists. Thrown by {@link parsePrimitive}.
 */
function getFormPrimitive() {
  const id = document.getElementById("primitiveId").value;
  const type = document.getElementById("primitiveType").value;

  // Get the primitive dimensions
  const height = document.getElementById("primitiveHeight").value;
  const width = document.getElementById("primitiveWidth").value;
  const depth = document.getElementById("primitiveDepth").value;

  // Get the primitive position
  const x = document.getElementById("primitiveX").value;
  const y = document.getElementById("primitiveY").value;
  const z = document.getElementById("primitiveZ").value;

  // Get the primitive rotation
  const rotationX = document.getElementById("primitiveRotationX").value;
  const rotationY = document.getElementById("primitiveRotationY").value;
  const rotationZ = document.getElementById("primitiveRotationZ").value;

  // Get the primitive attribute and value
  const attribute = document.getElementById("primitiveAttribute").value;
  const attributeValue =
    attribute === "texture"
      ? document.getElementById("primitiveTexture").value
      : document.getElementById("primitiveColor").value;

  return parsePrimitive({
    id,
    type,
    height,
    width,
    depth,
    x,
    y,
    z,
    rotationX,
    rotationY,
    rotationZ,
    attribute,
    attributeValue,
  });
}

/**
 * Parses a primitive object and returns a standardized representation.
 *
 * @param {Object} primitive - The primitive object.
 * @param {string} primitive.id - The unique identifier of the primitive.
 * @param {string} primitive.type - The type of primitive.
 * @param {string} primitive.height - The height of the primitive.
 * @param {string} primitive.width - The width of the primitive.
 * @param {string} primitive.depth - The depth of the primitive.
 * @param {string} primitive.x - The x-coordinate of the primitive.
 * @param {string} primitive.y - The y-coordinate of the primitive.
 * @param {string} primitive.z - The z-coordinate of the primitive.
 * @param {string} primitive.rotationX - The x-axis rotation of the primitive.
 * @param {string} primitive.rotationY - The y-axis rotation of the primitive.
 * @param {string} primitive.rotationZ - The z-axis rotation of the primitive.
 * @param {string} primitive.attribute - The attribute of the primitive.
 * @param {string} primitive.attributeValue - The value of the attribute.
 *
 * @returns {Primitive} The parsed primitive object.
 *
 * @throws If the id field is empty.
 * @throws If a primitive with the same id already exists.
 */
function parsePrimitive({
  id,
  type,
  height,
  width,
  depth,
  x,
  y,
  z,
  rotationX,
  rotationY,
  rotationZ,
  attribute,
  attributeValue,
}) {
  const parsedId = id.trim();

  if (!parsedId) {
    throw new Error("O campo 'ID' é obrigatório.");
  }

  if (primitives[parsedId]) {
    throw new Error(`Já existe uma primitiva com o id "${parsedId}".`);
  }

  const parsedType = type === "pyramid" ? "pyramid" : "box";

  return {
    id: parsedId,
    type: parsedType,
    height: parseFloat(height) || 1,
    width: parseFloat(width) || 1,
    depth: parseFloat(depth) || 1,
    x: parseFloat(x) || 0,
    y: parseFloat(y) || height / 2,
    z: parseFloat(z) || 0,
    rotationX: parseFloat(rotationX) || 0,
    rotationY: parseFloat(rotationY) || 0,
    rotationZ: parseFloat(rotationZ) || 0,
    attribute,
    attributeValue,
  };
}

/**
 * Creates a primitive and adds it to the scene.
 * If a primitive with the same id already exists, it is replaced.
 *
 * @param {Primitive} primitive - The primitive object.
 */
function createPrimitive(primitive) {
  if (primitives[primitive.id]) {
    removeManipulableObjectOption(primitives[primitive.id].id);
    scene.remove(primitives[primitive.id]);
    delete primitives[primitive.id];
  }

  const geometry = getPrimitiveGeometry(primitive);
  const material = getPrimitiveMaterial(primitive);
  const mesh = new THREE.Mesh(geometry, material);

  mesh.position.set(primitive.x, primitive.y, primitive.z);

  mesh.rotation.set(
    THREE.MathUtils.degToRad(primitive.rotationX),
    THREE.MathUtils.degToRad(primitive.rotationY),
    THREE.MathUtils.degToRad(primitive.rotationZ)
  );

  primitive.mesh = mesh;
  primitives[primitive.id] = primitive;

  if (!isPrimitiveInsideRoom(primitive)) {
    delete primitives[primitive.id];
    showErrorModal("Erro", "A primitiva não pode ser criada fora da sala.");
    return;
  }

  scene.add(mesh);
  addManipulableObjectOption(primitive.id);
}

/**
 * Returns a primitive geometry based on the provided parameters.
 *
 * @param {Object} params - The parameters for creating the geometry.
 * @param {string} params.type - The type of geometry ("pyramid" or any other value for a box).
 * @param {number} params.height - The height of the geometry.
 * @param {number} params.width - The width of the geometry.
 * @param {number} params.depth - The depth of the geometry (only applicable for box type).
 *
 * @returns {THREE.Geometry} - The primitive geometry.
 */
function getPrimitiveGeometry({ type, height, width, depth }) {
  if (type === "pyramid") {
    return new THREE.ConeGeometry(width, height, 4);
  }

  return new THREE.BoxGeometry(width, height, depth);
}

/**
 * Returns a primitive material based on the provided attribute and attribute value.
 *
 * @param {Object} params - The parameters for creating the material.
 * @param {string} params.attribute - The attribute of the primitive.
 * @param {string} params.attributeValue - The value of the attribute.
 *
 * @returns {THREE.MeshPhongMaterial} - The primitive material.
 */
function getPrimitiveMaterial({ attribute, attributeValue }) {
  if (attribute === "texture") {
    const texture = new THREE.TextureLoader().load(
      `../textures/${attributeValue}`
    );
    return new THREE.MeshPhongMaterial({ map: texture });
  }

  return new THREE.MeshPhongMaterial({ color: attributeValue });
}

function isPrimitiveInsideRoom(primitive) {
  const box = new THREE.Box3().setFromObject(primitive.mesh);

  if (box.min.x < -5 || box.max.x > 5) {
    return false;
  }

  if (box.min.y < 0 || box.max.y > 10) {
    return false;
  }

  if (box.min.z < -5 || box.max.z > 5) {
    return false;
  }

  return true;
}

// ***************************
// * PRIMITIVES MANIPULATION *
// ***************************
let selectedPrimitive = null;
let primitiveCollisionsEnabled = false;

document
  .getElementById("manipulateObjectForm")
  .addEventListener("submit", (event) => {
    event.preventDefault();

    const id = document.getElementById("manipulableObjectId").value;

    if (!id) {
      return;
    }

    if (!primitives[id]) {
      showErrorModal("Erro", `Não existe uma primitiva com o id "${id}".`);
      return;
    }

    selectObject(id);
  });

function updateSelectedObject() {
  if (!selectedPrimitive) {
    return;
  }

  if (keysPressed["enter"]) {
    deselectObject();
    return;
  }

  const translation = new THREE.Vector3();

  if (keysPressed["arrowup"]) {
    translation.z -= 0.05;
  }
  if (keysPressed["arrowdown"]) {
    translation.z += 0.05;
  }
  if (keysPressed["arrowleft"]) {
    translation.x -= 0.05;
  }
  if (keysPressed["arrowright"]) {
    translation.x += 0.05;
  }
  if (keysPressed["pageup"]) {
    translation.y += 0.05;
  }
  if (keysPressed["pagedown"]) {
    translation.y -= 0.05;
  }

  const box = new THREE.Box3().setFromObject(selectedPrimitive.mesh);
  const newBox = box.clone().translate(translation);

  if (newBox.min.x < -5 || newBox.max.x > 5) {
    translation.x = 0;
  }

  if (newBox.min.y < 0 || newBox.max.y > 10) {
    translation.y = 0;
  }

  if (newBox.min.z < -5 || newBox.max.z > 5) {
    translation.z = 0;
  }

  if (primitiveCollisionsEnabled) {
    for (const id in primitives) {
      if (id === selectedPrimitive.id) {
        continue;
      }

      const primitive = primitives[id];
      const otherBox = new THREE.Box3().setFromObject(primitive.mesh);

      if (newBox.intersectsBox(otherBox)) {
        translation.set(0, 0, 0);
        break;
      }
    }
  }

  if (translation.length() === 0) {
    requestAnimationFrame(updateSelectedObject);
    return;
  }

  selectedPrimitive.mesh.position.add(translation);
  requestAnimationFrame(updateSelectedObject);
}

function selectObject(id) {
  if (!primitives[id]) {
    throw new Error(`Não existe uma primitiva com o id "${id}".`);
  }

  if (selectedPrimitive) {
    deselectObject();
  }

  selectedPrimitive = primitives[id];
  addBorder(selectedPrimitive.mesh);

  updateSelectedObject(selectedPrimitive.id);
}

function deselectObject() {
  if (!selectedPrimitive) {
    return;
  }

  removeBorder(selectedPrimitive.mesh);
  selectedPrimitive = null;
}

function addBorder(mesh) {
  const border = new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry),
    new THREE.LineBasicMaterial({ color: "white" })
  );
  mesh.add(border);
}

function removeBorder(mesh) {
  mesh.remove(mesh.children.find((child) => child.isLineSegments));
}

// **********
// * LIGHTS *
// **********

let currentLight = null;

document.getElementById("addLightForm").addEventListener("submit", (event) => {
  event.preventDefault();
  scene.remove(currentLight);
  const light = getFormLight();
  createLight(light);
});

document
  .getElementById("resetLightForm")
  .addEventListener("submit", (event) => {
    event.preventDefault();
    scene.remove(currentLight);
  });

function getFormLight() {
  const posX = document.getElementById("lightPosX").value;
  const posY = document.getElementById("lightPosY").value;
  const posZ = document.getElementById("lightPosZ").value;
  const dirX = document.getElementById("lightDirX").value;
  const dirY = document.getElementById("lightDirY").value;
  const dirZ = document.getElementById("lightDirZ").value;
  const R = document.getElementById("lightColorR").value;
  const G = document.getElementById("lightColorG").value;
  const B = document.getElementById("lightColorB").value;

  return {
    posX,
    posY,
    posZ,
    dirX,
    dirY,
    dirZ,
    R,
    G,
    B,
  };
}

function parseLight({ posX, posY, posZ, dirX, dirY, dirZ, R, G, B }) {
  return {
    posX: parseFloat(posX) || 1,
    posY: parseFloat(posY) || 1,
    posZ: parseFloat(posZ) || 1,
    dirX: parseFloat(dirX) || 1,
    dirY: parseFloat(dirY) || 1,
    dirZ: parseFloat(dirZ) || 1,
    R: parseFloat(R) || 1,
    G: parseFloat(G) || 1,
    B: parseFloat(B) || 1,
  };
}

function createLight({ posX, posY, posZ, dirX, dirY, dirZ, R, G, B }) {
  const color = rgbToHex(R, G, B);
  const directionalLight = new THREE.DirectionalLight(color, 1.4);
  directionalLight.position.set(posX, posY, posZ).normalize();
  directionalLight.lookAt(dirX, dirY, dirZ);
  scene.add(directionalLight);
  currentLight = directionalLight;
}

// Função de animação
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

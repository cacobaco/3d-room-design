import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import {
  addManipulableObjectOption,
  removeManipulableObjectOption,
  updateSelectedManipulableObject,
} from "./form.js";
import {
  addBorderToMesh,
  addBorderToObject3D,
  removeBorderFromMesh,
  removeBorderFromObject3D,
  rgbToHex,
  showErrorModal,
} from "./utils.js";

// Criar cena, câmera e renderizador
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 800 / 800, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("gl-canvas"),
});
renderer.setSize(800, 800);

// Configurar cor de fundo do renderizador
renderer.setClearColor(0x87ceeb);

renderer.shadowMap.enabled = true; // Habilitar sombras
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Tipo de sombra (suavização)

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
wall1.receiveShadow = true;
scene.add(wall1);
const wall2 = new THREE.Mesh(wallGeometry, wallMaterial);
wall2.position.set(-5, 5, 0);
wall2.rotation.y = Math.PI / 2;
wall2.receiveShadow = true;
scene.add(wall2);

// Criar chão
const floorGeometry = new THREE.PlaneGeometry(10, 10);
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.set(0, 0, 0);
floor.receiveShadow = true;
scene.add(floor);

// Configurar a posição inicial da câmera
camera.position.set(5, 5, 15);
camera.lookAt(0, 5, 0);

// Variáveis para controle de movimento
let moveSpeed = 0.1;
const keysPressed = {};

// Event listeners para teclas
window.addEventListener("keydown", (event) => {
  if (!controls.enabled) {
    return;
  }

  keysPressed[event.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (event) => {
  keysPressed[event.key.toLowerCase()] = false;

  if (!controls.enabled) {
    return;
  }

  if (event.key === "CapsLock" && selectedObject) {
    collisionsEnabled = !collisionsEnabled;
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
 * @property {number} initialX - The x-coordinate of the primitive.
 * @property {number} initialY - The y-coordinate of the primitive.
 * @property {number} initialZ - The z-coordinate of the primitive.
 * @property {number} rotationX - The x-axis rotation of the primitive.
 * @property {number} rotationY - The y-axis rotation of the primitive.
 * @property {number} rotationZ - The z-axis rotation of the primitive.
 * @property {string} attribute - The attribute of the primitive.
 * @property {string} attributeValue - The value of the attribute.
 * @property {THREE.Mesh | undefined} mesh - The mesh object of the primitive.
 */

const maxPrimitives = 10;
const primitives = {};

document.getElementById("primitiveForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const count = Object.keys(primitives).length;

  if (count >= maxPrimitives) {
    showErrorModal(
      "Erro",
      `O número máximo de primitivas foi atingido (${count}/${maxPrimitives}).`
    );
    return;
  }

  const isUpdate =
    document.getElementById("createPrimitiveButton").textContent ===
    "Atualizar Primitiva";

  try {
    const primitiveData = getFormPrimitiveData();
    const primitive = parsePrimitive(primitiveData, !isUpdate);
    createPrimitive(primitive);
  } catch (error) {
    showErrorModal("Erro", error.message);
  }
});

/**
 * Retrieves the form data for a primitive object.
 *
 * @returns {Object} The primitive data object.
 */
function getFormPrimitiveData() {
  const id = document.getElementById("primitiveId").value;
  const type = document.getElementById("primitiveType").value;

  // Get the primitive dimensions
  const height = document.getElementById("primitiveHeight").value;
  const width = document.getElementById("primitiveWidth").value;
  const depth = document.getElementById("primitiveDepth").value;

  // Get the primitive position
  const initialX = document.getElementById("primitiveX").value;
  const initialY = document.getElementById("primitiveY").value;
  const initialZ = document.getElementById("primitiveZ").value;

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

  return {
    id,
    type,
    height,
    width,
    depth,
    initialX,
    initialY,
    initialZ,
    rotationX,
    rotationY,
    rotationZ,
    attribute,
    attributeValue,
  };
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
 * @param {string} primitive.initialX - The initial x-coordinate of the primitive.
 * @param {string} primitive.initialY - The initial y-coordinate of the primitive.
 * @param {string} primitive.initialZ - The initial z-coordinate of the primitive.
 * @param {string} primitive.rotationX - The x-axis rotation of the primitive.
 * @param {string} primitive.rotationY - The y-axis rotation of the primitive.
 * @param {string} primitive.rotationZ - The z-axis rotation of the primitive.
 * @param {string} primitive.attribute - The attribute of the primitive.
 * @param {string} primitive.attributeValue - The value of the attribute.
 * @param {boolean} [checkExistingId=true] - Whether to check if an object with the same id already exists.
 *
 * @returns {Primitive} The parsed primitive object.
 *
 * @throws If the id field is empty.
 * @throws If an object with the same id already exists.
 */
function parsePrimitive(
  {
    id,
    type,
    height,
    width,
    depth,
    initialX,
    initialY,
    initialZ,
    rotationX,
    rotationY,
    rotationZ,
    attribute,
    attributeValue,
  },
  checkExistingId = true
) {
  const parsedId = id.trim();

  if (!parsedId) {
    throw new Error("O campo 'ID' é obrigatório.");
  }

  if (checkExistingId && (primitives[parsedId] || models[parsedId])) {
    throw new Error(`Já existe um objeto com o id "${parsedId}".`);
  }

  return {
    id: parsedId,
    type,
    height: parseFloat(height) || 1,
    width: parseFloat(width) || 1,
    depth: parseFloat(depth) || 1,
    initialX: parseFloat(initialX) || 0,
    initialY: parseFloat(initialY) || height / 2,
    initialZ: parseFloat(initialZ) || 0,
    rotationX: parseFloat(rotationX) || 0,
    rotationY: parseFloat(rotationY) || 0,
    rotationZ: parseFloat(rotationZ) || 0,
    attribute,
    attributeValue,
  };
}

/**
 * Creates a primitive and adds it to the scene.
 * If an object with the same id already exists, it is replaced.
 *
 * @param {Primitive} primitive - The primitive object.
 */
function createPrimitive(primitive) {
  if (primitives[primitive.id]) {
    deletePrimitive(primitive.id);
  }

  if (models[primitive.id]) {
    deleteModel(primitive.id);
  }

  const geometry = getPrimitiveGeometry(primitive);
  const material = getPrimitiveMaterial(primitive);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  mesh.position.set(primitive.initialX, primitive.initialY, primitive.initialZ);

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

function deletePrimitive(id) {
  if (!primitives[id]) {
    showErrorModal("Erro", `Não existe uma primitiva com o id "${id}".`);
    return;
  }

  removeManipulableObjectOption(id);
  deselectObject();
  scene.remove(primitives[id].mesh);
  delete primitives[id];
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

/**
 * Checks if a primitive is completely inside the room boundaries.
 *
 * @param {Primitive} primitive - The primitive object.
 * @param {THREE.Mesh} primitive.mesh - The mesh to check.
 *
 * @returns {boolean} Returns true if the primitive is inside the room, false otherwise.
 */
function isPrimitiveInsideRoom({ mesh }) {
  const box = new THREE.Box3().setFromObject(mesh);

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

// *******************
// * MODELS CREATION *
// *******************
/**
 * @typedef {Object} Model
 *
 * @property {string} id - The unique identifier of the model.
 * @property {number} height - The height of the model.
 * @property {number} width - The width of the model.
 * @property {number} depth - The depth of the model.
 * @property {number} initialX - The x-coordinate of the model.
 * @property {number} initialY - The y-coordinate of the model.
 * @property {number} initialZ - The z-coordinate of the model.
 * @property {number} rotationX - The x-axis rotation of the model.
 * @property {number} rotationY - The y-axis rotation of the model.
 * @property {number} rotationZ - The z-axis rotation of the model.
 * @property {File | undefined} file - The file of the model. // name
 * @property {string | undefined} fileName - The name of the file of the model.
 * @property {THREE.Texture | undefined} texture - The texture of the model.
 * @property {THREE.Object3D | undefined} object - The object of the model.
 */

const models = {};

document
  .getElementById("modelForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const isUpdate =
      document.getElementById("createModelButton").textContent ===
      "Atualizar Modelo";

    try {
      const modelData = getFormModelData();
      const model = parseModel(modelData, !isUpdate);
      createModel(model);
    } catch (error) {
      showErrorModal("Erro", error.message);
    }
  });

/**
 * Retrieves the form data for a model object.
 *
 * @returns {Object} The model data object.
 *
 * @throws If the file field is empty.
 */
function getFormModelData() {
  const id = document.getElementById("primitiveId").value;
  const type = document.getElementById("primitiveType").value;

  // Get the model dimensions
  const height = document.getElementById("primitiveHeight").value;
  const width = document.getElementById("primitiveWidth").value;
  const depth = document.getElementById("primitiveDepth").value;

  // Get the model position
  const initialX = document.getElementById("primitiveX").value;
  const initialY = document.getElementById("primitiveY").value;
  const initialZ = document.getElementById("primitiveZ").value;

  // Get the model rotation
  const rotationX = document.getElementById("primitiveRotationX").value;
  const rotationY = document.getElementById("primitiveRotationY").value;
  const rotationZ = document.getElementById("primitiveRotationZ").value;

  // Get the model file
  const fileInput = document.getElementById("file");
  const file = fileInput.files[0];

  if (!file) {
    throw new Error("O ficheiro é obrigatório.");
  }

  return {
    id,
    type,
    height,
    width,
    depth,
    initialX,
    initialY,
    initialZ,
    rotationX,
    rotationY,
    rotationZ,
    file,
  };
}

/**
 * Parses a model object and returns a standardized representation.
 * The texture of the model is loaded from a file with the same name as the model file.
 *
 * @param {Object} model - The model object.
 * @param {string} model.id - The unique identifier of the model.
 * @param {string} model.height - The height of the model.
 * @param {string} model.width - The width of the model.
 * @param {string} model.depth - The depth of the model.
 * @param {string} model.initialX - The initial x-coordinate of the model.
 * @param {string} model.initialY - The initial y-coordinate of the model.
 * @param {string} model.initialZ - The initial z-coordinate of the model.
 * @param {string} model.rotationX - The x-axis rotation of the model.
 * @param {string} model.rotationY - The y-axis rotation of the model.
 * @param {string} model.rotationZ - The z-axis rotation of the model.
 * @param {File} model.file - The file of the model.
 * @param {boolean} [checkExistingId=true] - Whether to check if an object with the same id already exists.
 *
 * @returns {Model} The parsed model object.
 *
 * @throws If the id field is empty.
 * @throws If an object with the same id already exists.
 */
function parseModel(
  {
    id,
    height,
    width,
    depth,
    initialX,
    initialY,
    initialZ,
    rotationX,
    rotationY,
    rotationZ,
    file,
  },
  checkExistingId = true
) {
  const parsedId = id.trim();

  if (!parsedId) {
    throw new Error("O campo 'ID' é obrigatório.");
  }

  if (checkExistingId && (primitives[parsedId] || models[parsedId])) {
    throw new Error(`Já existe um objeto com o id "${parsedId}".`);
  }

  const fileName = file.name.split(".").slice(0, -1).join(".");

  const texture = new THREE.TextureLoader().load(
    `../modelos/${fileName}_texture.png`
  );

  return {
    id: parsedId,
    height: parseFloat(height) || 1,
    width: parseFloat(width) || 1,
    depth: parseFloat(depth) || 1,
    initialX: parseFloat(initialX) || 0,
    initialY: parseFloat(initialY) || height / 2,
    initialZ: parseFloat(initialZ) || 0,
    rotationX: parseFloat(rotationX) || 0,
    rotationY: parseFloat(rotationY) || 0,
    rotationZ: parseFloat(rotationZ) || 0,
    file,
    fileName,
    texture,
  };
}

/**
 * Creates a model and adds it to the scene.
 * If an object with the same id already exists, it is replaced.
 *
 * @param {Model} model - The model object.
 */
function createModel(model) {
  if (models[model.id]) {
    deleteModel(model.id);
  }

  if (primitives[model.id]) {
    deletePrimitive(model.id);
  }

  const reader = new FileReader();
  reader.addEventListener("load", function (event) {
    const contents = event.target.result;

    const loader = new OBJLoader();
    const object = loader.parse(contents);

    object.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        child.material.map = model.texture;
        child.material.needsUpdate = true;
      }
    });

    object.position.set(model.initialX, model.initialY, model.initialZ);

    object.rotation.set(model.rotationX, model.rotationY, model.rotationZ);

    const height = model.height / 10;
    const width = model.width / 10;
    const depth = model.depth / 10;

    const boundingBox = new THREE.Box3().setFromObject(object);
    const modelSize = boundingBox.getSize(new THREE.Vector3());
    const roomSize = new THREE.Vector3(10, 10, 10);

    const scaleFactorX = roomSize.x / modelSize.x;
    const scaleFactorY = roomSize.y / modelSize.y;
    const scaleFactorZ = roomSize.z / modelSize.z;

    object.scale.set(
      scaleFactorX * height,
      scaleFactorY * width,
      scaleFactorZ * depth
    );

    model.object = object;
    models[model.id] = model;

    if (!isModelInsideRoom(model)) {
      delete models[model.id];
      showErrorModal("Erro", "O modelo não pode ser criado fora da sala.");
      return;
    }

    scene.add(object);
    addManipulableObjectOption(model.id);
  });

  reader.readAsText(model.file);
}

function deleteModel(id) {
  if (!models[id]) {
    showErrorModal("Erro", `Não existe um modelo com o id "${id}".`);
    return;
  }

  removeManipulableObjectOption(id);
  deselectObject();
  scene.remove(models[id].object);
  delete models[id];
}

/**
 * Checks if a model is completely inside the room boundaries.
 *
 * @param {Model} model - The model object.
 * @param {THREE.Object3D} model.object - The object to check.
 *
 * @returns {boolean} Returns true if the model is inside the room, false otherwise.
 */
function isModelInsideRoom({ object }) {
  const box = new THREE.Box3().setFromObject(object);

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

// ************************
// * OBJECTS MANIPULATION *
// ************************
let selectedObject = null;
let collisionsEnabled = false;

export function handleManipulateObjectButtonClick() {
  const id = document.getElementById("manipulableObjectId").value;

  if (!id) {
    return;
  }

  if (!primitives[id] && !models[id]) {
    showErrorModal("Erro", `Não existe um objeto com o id "${id}".`);
    return;
  }

  selectObject(id);
}

export function handleDeleteObjectButtonClick() {
  const id = document.getElementById("manipulableObjectId").value;

  if (!id) {
    return;
  }

  if (primitives[id]) {
    deletePrimitive(id);
  }

  if (models[id]) {
    deleteModel(id);
  }
}

function updateSelectedObject() {
  if (!selectedObject) {
    return;
  }

  if (keysPressed["enter"]) {
    deselectObject();
    return;
  }

  if (keysPressed["delete"] || keysPressed["backspace"]) {
    if (primitives[selectedObject.id]) {
      deletePrimitive(selectedObject.id);
    }
    if (models[selectedObject.id]) {
      deleteModel(selectedObject.id);
    }
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

  const box = new THREE.Box3().setFromObject(
    selectedObject.mesh ?? selectedObject.object
  );
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

  if (
    collisionsEnabled &&
    isCollidingWithOtherObjects(selectedObject.id, newBox)
  ) {
    translation.set(0, 0, 0);
  }

  if (translation.length() > 0) {
    selectedObject.mesh?.position.add(translation);
    selectedObject.object?.position.add(translation);
  }

  requestAnimationFrame(updateSelectedObject);
}

/**
 * Checks if the given object is colliding with other objects in the scene.
 *
 * @param {string} objectId - The ID of the object to check for collisions.
 * @param {THREE.Box3} box - The bounding box of the object.
 *
 * @returns {boolean} - True if the object is colliding with other objects, false otherwise.
 */
function isCollidingWithOtherObjects(objectId, box) {
  for (const id in primitives) {
    if (id === objectId) {
      continue;
    }

    const primitive = primitives[id];
    const otherBox = new THREE.Box3().setFromObject(primitive.mesh);

    if (box.intersectsBox(otherBox)) {
      return true;
    }
  }

  for (const id in models) {
    if (id === objectId) {
      continue;
    }

    const model = models[id];
    const otherBox = new THREE.Box3().setFromObject(model.object);

    if (box.intersectsBox(otherBox)) {
      return true;
    }
  }

  return false;
}

function selectObject(id) {
  if (selectedObject) {
    deselectObject();
  }

  if (primitives[id]) {
    selectedObject = primitives[id];
    addBorderToMesh(selectedObject.mesh);
  }

  if (models[id]) {
    selectedObject = models[id];
    addBorderToObject3D(selectedObject.object);
  }

  updateSelectedObject(selectedObject.id);
  updateSelectedManipulableObject(selectedObject);
}

function deselectObject() {
  if (selectedObject) {
    if (selectedObject.mesh) {
      removeBorderFromMesh(selectedObject.mesh);
    }
    if (selectedObject.object) {
      removeBorderFromObject3D(selectedObject.object);
    }
    selectedObject = null;
  }

  updateSelectedManipulableObject();
}

// **********
// * LIGHTS *
// **********
let ambientLight = null;
let directionalLight = null;
let pointLight = null;
let spotLight = null;

let sphere = null;
let arrowHelper = null;
let lightCone = null;

let directionalTarget = null;
let spotTarget = null;

function createLightSphere(position, color) {
  scene.remove(sphere);
  const sphereGeometry = new THREE.SphereGeometry(0.5, 16, 16);
  const sphereMaterial = new THREE.MeshBasicMaterial({ color: color });
  sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.position.copy(position);
  scene.add(sphere);
}

function createArrowHelper(newDirectionalLight, color) {
  scene.remove(arrowHelper);
  const dirVector = new THREE.Vector3()
    .subVectors(directionalTarget.position, newDirectionalLight.position)
    .normalize();
  arrowHelper = new THREE.ArrowHelper(
    dirVector,
    newDirectionalLight.position,
    3,
    color
  );
  scene.add(arrowHelper);
}

function createSpotLightCone(spotLight, color) {
  scene.remove(lightCone);
  const coneGeometry = new THREE.ConeGeometry(0.5, 1, 32);
  const coneMaterial = new THREE.MeshBasicMaterial({ color: color });
  const cone = new THREE.Mesh(coneGeometry, coneMaterial);
  cone.position.copy(spotLight.position);

  const dirVector = new THREE.Vector3()
    .subVectors(spotTarget.position, spotLight.position)
    .normalize();
  cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), dirVector);

  scene.add(cone);
  lightCone = cone;
}

// ***************
// * DIRECTIONAL *
// ***************
document
  .getElementById("addDirectionalLightForm")
  .addEventListener("submit", (event) => {
    event.preventDefault();
    scene.remove(directionalLight);
    const light = getFormLight();
    createLight(light);
  });

document
  .getElementById("resetDirectionalLightForm")
  .addEventListener("submit", (event) => {
    event.preventDefault();
    scene.remove(directionalLight);
    scene.remove(arrowHelper);
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
  scene.remove(directionalTarget);
  const color = rgbToHex(R, G, B);
  const newDirectionalLight = new THREE.DirectionalLight(color, 1.4);
  newDirectionalLight.position.set(posX, posY, posZ);
  directionalTarget = new THREE.Object3D();
  directionalTarget.position.set(dirX, dirY, dirZ);
  scene.add(directionalTarget);
  newDirectionalLight.target = directionalTarget;
  newDirectionalLight.castShadow = true;
  newDirectionalLight.shadow.mapSize.width = 2048;
  newDirectionalLight.shadow.mapSize.height = 2048;
  newDirectionalLight.shadow.camera.near = 0.5;
  newDirectionalLight.shadow.camera.far = 500;
  scene.add(newDirectionalLight);
  createArrowHelper(newDirectionalLight, color);
  directionalLight = newDirectionalLight;
}

// *************
// * AMBIENTAL *
// *************
document
  .getElementById("addAmbientLightForm")
  .addEventListener("submit", (event) => {
    event.preventDefault();
    scene.remove(ambientLight);
    const light = getFormAmbientLight();
    createAmbientLight(light);
  });

document
  .getElementById("resetAmbientLightForm")
  .addEventListener("submit", (event) => {
    event.preventDefault();
    scene.remove(ambientLight);
  });

function getFormAmbientLight() {
  const intensity = document.getElementById("ambientLightIntensity").value;
  const R = document.getElementById("ambientLightR").value;
  const G = document.getElementById("ambientLightG").value;
  const B = document.getElementById("ambientLightB").value;

  return {
    intensity,
    R,
    G,
    B,
  };
}

function createAmbientLight({ intensity, R, G, B }) {
  const color = rgbToHex(R, G, B);
  const newAmbientLight = new THREE.AmbientLight(color, intensity);
  scene.add(newAmbientLight);
  ambientLight = newAmbientLight;
}

// *************
// *** POINT ***
// *************
document
  .getElementById("addPointLightForm")
  .addEventListener("submit", (event) => {
    event.preventDefault();
    scene.remove(pointLight);
    const light = getFormPointLight();
    createPointLight(light);
  });

document
  .getElementById("resetPointLightForm")
  .addEventListener("submit", (event) => {
    event.preventDefault();
    scene.remove(pointLight);
    scene.remove(sphere);
  });

function getFormPointLight() {
  const intensity = document.getElementById("pointLightIntensity").value;
  const posX = document.getElementById("pointLightPosX").value;
  const posY = document.getElementById("pointLightPosY").value;
  const posZ = document.getElementById("pointLightPosZ").value;
  const R = document.getElementById("pointLightR").value;
  const G = document.getElementById("pointLightG").value;
  const B = document.getElementById("pointLightB").value;
  const decay = document.getElementById("pointLightDecay").value;

  return {
    intensity,
    decay,
    posX,
    posY,
    posZ,
    R,
    G,
    B,
  };
}

function createPointLight({ intensity, decay, posX, posY, posZ, R, G, B }) {
  const color = rgbToHex(R, G, B);
  const newPointLight = new THREE.PointLight(color);
  newPointLight.intensity = intensity;
  newPointLight.decay = decay;
  newPointLight.position.set(posX, posY, posZ);
  newPointLight.castShadow = true;
  newPointLight.shadow.mapSize.width = 2048;
  newPointLight.shadow.mapSize.height = 2048;
  newPointLight.shadow.camera.near = 0.5;
  newPointLight.shadow.camera.far = 500;
  scene.add(newPointLight);
  pointLight = newPointLight;
  createLightSphere(newPointLight.position, color);
}

// *************
// *** SPOT ****
// *************
document
  .getElementById("addSpotLightForm")
  .addEventListener("submit", (event) => {
    event.preventDefault();
    scene.remove(spotLight);
    const light = getFormSpotLight();
    createSpotLight(light);
  });

document
  .getElementById("resetSpotLightForm")
  .addEventListener("submit", (event) => {
    event.preventDefault();
    scene.remove(spotLight);
    scene.remove(lightCone);
  });

function getFormSpotLight() {
  const intensity = document.getElementById("spotLightIntensity").value;
  const posX = document.getElementById("spotLightPosX").value;
  const posY = document.getElementById("spotLightPosY").value;
  const posZ = document.getElementById("spotLightPosZ").value;
  const R = document.getElementById("spotLightR").value;
  const G = document.getElementById("spotLightG").value;
  const B = document.getElementById("spotLightB").value;
  const decay = document.getElementById("spotLightDecay").value;
  const angle = document.getElementById("spotLightAngle").value;
  const penumbra = document.getElementById("spotLightPenumbra").value;
  const dirX = document.getElementById("spotLightDirX").value;
  const dirY = document.getElementById("spotLightDirY").value;
  const dirZ = document.getElementById("spotLightDirZ").value;

  return {
    intensity,
    angle,
    penumbra,
    decay,
    posX,
    posY,
    posZ,
    R,
    G,
    B,
    dirX,
    dirY,
    dirZ,
  };
}

function createSpotLight({
  intensity,
  angle,
  penumbra,
  decay,
  dirX,
  dirY,
  dirZ,
  posX,
  posY,
  posZ,
  R,
  G,
  B,
}) {
  scene.remove(spotTarget);
  const color = rgbToHex(R, G, B);
  const newSpotLight = new THREE.SpotLight(color);
  newSpotLight.angle = angle;
  newSpotLight.penumbra = penumbra;
  newSpotLight.intensity = intensity;
  newSpotLight.decay = decay;
  newSpotLight.position.set(posX, posY, posZ);
  spotTarget = new THREE.Object3D();
  spotTarget.position.set(dirX, dirY, dirZ);
  scene.add(spotTarget);
  newSpotLight.target = spotTarget;
  newSpotLight.castShadow = true;
  newSpotLight.shadow.mapSize.width = 2048;
  newSpotLight.shadow.mapSize.height = 2048;
  newSpotLight.shadow.camera.near = 0.5;
  newSpotLight.shadow.camera.far = 500;
  scene.add(newSpotLight);
  spotLight = newSpotLight;
  createSpotLightCone(newSpotLight, color);
}

// Função de animação
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

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

// ***************
// * SCENE SETUP *
// ***************
// Create scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 800 / 800, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("gl-canvas"),
});
renderer.setSize(800, 800);

// Set renderer background color
renderer.setClearColor(0x87ceeb);

// Enable shadows
renderer.shadowMap.enabled = true;
// Set shadow map type for soft shadows
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Material for walls and floor
const wallTexture = new THREE.TextureLoader().load("../textures/wall.jpg");
const wallMaterial = new THREE.MeshPhongMaterial({
  map: wallTexture,
});
const floorTexture = new THREE.TextureLoader().load("../textures/floor.jpg");
const floorMaterial = new THREE.MeshPhongMaterial({
  map: floorTexture,
});

// Create walls
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

// Create floor
const floorGeometry = new THREE.PlaneGeometry(10, 10);
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.set(0, 0, 0);
floor.receiveShadow = true;
scene.add(floor);

// Set the initial position of the camera
camera.position.set(5, 5, 15);
camera.lookAt(0, 5, 0);

// Variables for movement control
let moveSpeed = 0.1;
const keysPressed = {};

// Event listeners for keys
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

/**
 * Updates the camera position based on the keys pressed.
 *
 * The camera can be moved using the following keys:
 * - W: Move forward
 * - S: Move backward
 * - A: Move left
 * - D: Move right
 * - Q: Move up
 * - E: Move down
 * - Space: Increase movement speed
 */
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

// Use PointerLockControls for FPS-style navigation
const controls = new PointerLockControls(camera, document.body);

// Event listeners for mouse movement
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

  if (!isPrimitiveInsideRoom(primitive)) {
    showErrorModal("Erro", "A primitiva não pode ser criada fora da sala.");
    return;
  }

  if (primitives[primitive.id]) {
    deletePrimitive(primitive.id);
  }

  if (models[primitive.id]) {
    deleteModel(primitive.id);
  }

  primitives[primitive.id] = primitive;
  scene.add(mesh);
  addManipulableObjectOption(primitive.id);
}

/**
 * Deletes a primitive from the scene.
 *
 * @param {string} id - The ID of the primitive to delete.
 */
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

    object.rotation.set(
      THREE.MathUtils.degToRad(model.rotationX),
      THREE.MathUtils.degToRad(model.rotationY),
      THREE.MathUtils.degToRad(model.rotationZ)
    );

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

    if (!isModelInsideRoom(model)) {
      showErrorModal("Erro", "O modelo não pode ser criado fora da sala.");
      return;
    }

    if (models[model.id]) {
      deleteModel(model.id);
    }

    if (primitives[model.id]) {
      deletePrimitive(model.id);
    }

    models[model.id] = model;
    scene.add(object);
    addManipulableObjectOption(model.id);
  });

  reader.readAsText(model.file);
}

/**
 * Deletes a model from the scene.
 *
 * @param {string} id - The ID of the model to be deleted.
 */
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

/**
 * Handles the click event of the manipulate object button.
 * Retrieves the id of the manipulable object from the input field,
 * checks if the object exists, and selects the object.
 */
export function handleManipulateObjectButtonClick() {
  const id = document.getElementById("manipulableObjectId").value;

  if (!id) {
    return;
  }

  if (!primitives[id] && !models[id]) {
    showErrorModal("Erro", `Não existe um objeto com o id "${id}".`);
    return;
  }

  if (selectedObject && selectedObject.id === id) {
    deselectObject();
    return;
  }

  selectObject(id);
}

/**
 * Handles the click event of the delete object button.
 * Deletes the primitive or model with the specified ID.
 */
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

/**
 * Updates the position of the selected object based on the keys pressed.
 * If the selected object is null, the function returns early.
 * If the "enter" key is pressed, the selected object is deselected.
 * If the "delete" or "backspace" key is pressed, the selected object is deleted.
 * The position of the selected object is updated based on the arrow keys and page up/down keys.
 * The position is constrained within certain bounds.
 * If collisions are enabled, the position is adjusted to avoid collisions with other objects.
 * The function is called recursively using requestAnimationFrame.
 */
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

/**
 * Selects an object based on its ID and updates the selected object.
 * If the object is a primitive, it adds a border to its mesh.
 * If the object is a model, it adds a border to its Object3D.
 *
 * @param {string} id - The ID of the object to be selected.
 */
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

/**
 * Deselects the currently selected object.
 */
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

/**
 * Creates a light sphere at the specified position with the given color.
 *
 * @param {THREE.Vector3} position - The position of the light sphere.
 * @param {number} color - The color of the light sphere.
 */
function createLightSphere(position, color) {
  scene.remove(sphere);
  const sphereGeometry = new THREE.SphereGeometry(0.5, 16, 16);
  const sphereMaterial = new THREE.MeshBasicMaterial({ color: color });
  sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.position.copy(position);
  scene.add(sphere);
}

/**
 * Creates an arrow helper to visualize the direction of a new directional light.
 *
 * @param {THREE.Light} newDirectionalLight - The new directional light.
 * @param {THREE.Color} color - The color of the arrow helper.
 */
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

/**
 * Creates a spotlight cone and adds it to the scene.
 *
 * @param {THREE.SpotLight} spotLight - The spotlight to create the cone for.
 * @param {number} color - The color of the cone.
 */
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

// **********************
// * DIRECTIONAL LIGHTS *
// **********************
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

/**
 * Retrieves the form values for light position, direction, and color.
 *
 * @returns {Object} An object containing the form values for light position, direction, and color.
 */
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

/**
 * Creates a new directional light with the specified parameters and adds it to the scene.
 *
 * @param {Object} light - The light object for creating the light.
 * @param {number} light.posX - The x-coordinate of the light's position.
 * @param {number} light.posY - The y-coordinate of the light's position.
 * @param {number} light.posZ - The z-coordinate of the light's position.
 * @param {number} light.dirX - The x-coordinate of the light's target position.
 * @param {number} light.dirY - The y-coordinate of the light's target position.
 * @param {number} light.dirZ - The z-coordinate of the light's target position.
 * @param {number} light.R - The red component of the light's color (0-255).
 * @param {number} light.G - The green component of the light's color (0-255).
 * @param {number} light.B - The blue component of the light's color (0-255).
 */
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

// ******************
// * AMBIENT LIGHTS *
// ******************
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

/**
 * Retrieves the values of the ambient light form inputs.
 *
 * @returns {Object} An object containing the intensity, R, G, and B values.
 */
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

/**
 * Creates an ambient light and adds it to the scene.
 *
 * @param {Object} light - The light object for creating the ambient light.
 * @param {number} light.intensity - The intensity of the ambient light.
 * @param {number} light.R - The red component of the ambient light color.
 * @param {number} light.G - The green component of the ambient light color.
 * @param {number} light.B - The blue component of the ambient light color.
 */
function createAmbientLight({ intensity, R, G, B }) {
  const color = rgbToHex(R, G, B);
  const newAmbientLight = new THREE.AmbientLight(color, intensity);
  scene.add(newAmbientLight);
  ambientLight = newAmbientLight;
}

// ****************
// * POINT LIGHTS *
// ****************
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

/**
 * Retrieves the values from the form inputs and returns an object containing the point light properties.
 *
 * @returns {Object} An object containing the point light properties.
 */
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

/**
 * Creates a point light with the specified parameters.
 *
 * @param {Object} light - The light object for creating the point light.
 * @param {number} light.intensity - The intensity of the light.
 * @param {number} light.decay - The decay of the light.
 * @param {number} light.posX - The X position of the light.
 * @param {number} light.posY - The Y position of the light.
 * @param {number} light.posZ - The Z position of the light.
 * @param {number} light.R - The red component of the light's color.
 * @param {number} light.G - The green component of the light's color.
 * @param {number} light.B - The blue component of the light's color.
 */
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

// ***************
// * SPOT LIGHTS *
// ***************
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

/**
 * Retrieves the values from the form inputs related to the spot light and returns them as an object.
 *
 * @returns {Object} An object containing the spot light properties.
 */
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

/**
 * Creates a spot light with the specified parameters.
 *
 * @param {Object} light - The light object for creating the spot light.
 * @param {number} light.intensity - The intensity of the spot light.
 * @param {number} light.angle - The angle of the spot light.
 * @param {number} light.penumbra - The penumbra of the spot light.
 * @param {number} light.decay - The decay of the spot light.
 * @param {number} light.dirX - The X direction of the spot light.
 * @param {number} light.dirY - The Y direction of the spot light.
 * @param {number} light.dirZ - The Z direction of the spot light.
 * @param {number} light.posX - The X position of the spot light.
 * @param {number} light.posY - The Y position of the spot light.
 * @param {number} light.posZ - The Z position of the spot light.
 * @param {number} light.R - The red component of the spot light color.
 * @param {number} light.G - The green component of the spot light color.
 * @param {number} light.B - The blue component of the spot light color.
 */
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

// **************************
// * MAIN PROGRAM (KIND OF) *
// **************************
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// Criar cena, câmera e renderizador
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 800 / 800, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("gl-canvas"),
});
renderer.setSize(800, 800);

// Configurar cor de fundo do renderizador
renderer.setClearColor(0x87ceeb); // Azul céu

// Adicionar luz ambiente e direcional
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5).normalize();
scene.add(directionalLight);

// Material para paredes e chão
const wallTexture = new THREE.TextureLoader().load("../textures/wall.jpg");
const wallMaterial = new THREE.MeshBasicMaterial({
  map: wallTexture,
});
const floorTexture = new THREE.TextureLoader().load("../textures/floor.jpg");
const floorMaterial = new THREE.MeshBasicMaterial({
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

// Adicionar arestas pretas às paredes
const wall1Edges = new THREE.EdgesGeometry(wallGeometry);
const wall1Line = new THREE.LineSegments(
  wall1Edges,
  new THREE.LineBasicMaterial({ color: 0x000000 })
);
wall1.add(wall1Line);

const wall2Edges = new THREE.EdgesGeometry(wallGeometry);
const wall2Line = new THREE.LineSegments(
  wall2Edges,
  new THREE.LineBasicMaterial({ color: 0x000000 })
);
wall2.add(wall2Line);

// Criar chão
const floorGeometry = new THREE.PlaneGeometry(10, 10);
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.set(0, 0, 0);
scene.add(floor);

// Adicionar arestas pretas ao chão
const floorEdges = new THREE.EdgesGeometry(floorGeometry);
const floorLine = new THREE.LineSegments(
  floorEdges,
  new THREE.LineBasicMaterial({ color: 0x000000 })
);
floor.add(floorLine);

// Carregar e adicionar modelo OBJ
async function addModel(location) {
  const loader = new THREE.OBJLoader();
  loader.load(location, function (object) {
    scene.add(object);
  });
}

// Carregar um modelo de exemplo
addModel("path/to/your/model.obj");

// Configurar a posição inicial da câmera
camera.position.set(5, 5, 15);
camera.lookAt(0, 5, 0);

// Variáveis para controle de movimento
let moveSpeed = 0.1;
const keysPressed = {};

// Event listeners para teclas
window.addEventListener("keydown", (event) => {
  keysPressed[event.key] = true;
});

window.addEventListener("keyup", (event) => {
  keysPressed[event.key] = false;
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
const controls = new THREE.PointerLockControls(camera, document.body);

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

// **************
// * PRIMITIVES *
// **************
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
 */

const meshes = {};

document
  .getElementById("addPrimitiveForm")
  .addEventListener("submit", (event) => {
    event.preventDefault();

    try {
      const primitive = getFormPrimitive();
      createPrimitive(primitive);
    } catch (error) {
      document.getElementById("errorModalMessage").textContent = error.message;
      $("#errorModal").modal("show");
    }
  });

/**
 * Retrieves form inputs and returns a primitive object based on the input values.
 *
 * @returns {Primitive} The primitive object.
 *
 * @throws If a primitive with the same id already exists. Thrown by parsePrimitive.
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

  const primitive = parsePrimitive({
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

  return primitive;
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
  if (meshes[id]) {
    throw new Error(`Já existe uma primitiva com o id "${id}".`);
  }

  let primitiveType = type === "pyramid" ? "pyramid" : "box";

  return {
    id,
    type: primitiveType,
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
  if (meshes[primitive.id]) {
    scene.remove(meshes[primitive.id]);
    delete meshes[primitive.id];
  }

  const geometry = getPrimitiveGeometry(primitive);
  const material = getPrimitiveMaterial(primitive);
  const mesh = new THREE.Mesh(geometry, material);

  mesh.position.set(primitive.x, primitive.y, primitive.z);

  mesh.rotation.set(
    THREE.Math.degToRad(primitive.rotationX),
    THREE.Math.degToRad(primitive.rotationY),
    THREE.Math.degToRad(primitive.rotationZ)
  );

  scene.add(mesh);
  meshes[primitive.id] = mesh;
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
 * @returns {THREE.MeshBasicMaterial} - The primitive material.
 */
function getPrimitiveMaterial({ attribute, attributeValue }) {
  if (attribute === "texture") {
    const texture = new THREE.TextureLoader().load(
      `../textures/${attributeValue}`
    );
    return new THREE.MeshBasicMaterial({ map: texture });
  }

  return new THREE.MeshBasicMaterial({ color: attributeValue });
}

// Função de animação
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

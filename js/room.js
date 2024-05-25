// Criar cena, câmera e renderizador
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    800 / 800,
    0.1,
    1000
);
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
const wallTexture = new THREE.TextureLoader().load('../textures/wall.jpg');
const wallMaterial = new THREE.MeshBasicMaterial({
    map: wallTexture,
});
const floorTexture = new THREE.TextureLoader().load('../textures/floor.jpg');
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
const moveSpeed = 0.1;
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
const controls = new THREE.PointerLockControls(
    camera,
    document.body
);

// Event listeners para controle de rotação com o mouse
document.addEventListener("pointerlockchange", () => {
    if (document.pointerLockElement === document.body) {
        controls.enabled = true;
    } else {
        controls.enabled = false;
    }
});

document
    .getElementById("gl-canvas")
    .addEventListener("click", () => {
        document.body.requestPointerLock();
    });

// Função de animação
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

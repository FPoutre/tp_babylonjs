import Dude from "./Dude.js";
import Tank from "./Tank.js";

let canvas;
let engine;
let scene;
let followCameraCreated;
// vars for handling inputs
let inputStates = {};
let tank;

let mouseX = 800;
let mouseY = 600;

window.onload = startGame;

function startGame() {
    canvas = document.querySelector("#myCanvas");
    engine = new BABYLON.Engine(canvas, true);
    followCameraCreated = false;
    scene = createScene();

    // modify some default settings (i.e pointer events to prevent cursor to go 
    // out of the game window)
    modifySettings();

    engine.runRenderLoop(() => {
        let deltaTime = engine.getDeltaTime(); // remind you something ?

        if (tank) {
            if (!followCameraCreated && tank.turret) {
                // second parameter is the target to follow
                let followCamera = createFollowCamera(scene, tank.turret);
                scene.activeCamera = followCamera;
                followCameraCreated = true;
                console.log('finished loading !');
            }
            tank.move(inputStates);
            tank.traverse(inputStates);
        }

        let heroDude = scene.getMeshByName("heroDude");
        if (heroDude && tank.hull) heroDude.Dude.move(scene);

        if (scene.dudes && tank.hull) {
            for(var i = 0 ; i < scene.dudes.length ; i++) {
                scene.dudes[i].Dude.move(scene);
            }
        }

        scene.render();
    });
}

function createScene() {
    let scene = new BABYLON.Scene(engine);
    let ground = createGround(scene);
    let freeCamera = createFreeCamera(scene);
    scene.activeCamera = freeCamera;

    createLights(scene);

    tank = new Tank(window.prompt('Enter your name, tanker !'), scene);

    //createHeroDude(scene);

    return scene;
}

function createGround(scene) {
    const groundOptions = { width:2000, height:2000, subdivisions:20, minHeight:0, maxHeight:100, onReady: onGroundCreated};
    //scene is optional and defaults to the current scene
    const ground = BABYLON.MeshBuilder.CreateGroundFromHeightMap("gdhm", 'images/hmap1.png', groundOptions, scene); 

    function onGroundCreated() {
        const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
        groundMaterial.diffuseTexture = new BABYLON.Texture("images/Sand_007_basecolor.jpg");
        groundMaterial.bumpTexture = new BABYLON.Texture("images/Sand_007_normal.jpg", scene);
        ground.material = groundMaterial;
        // to be taken into account by collision detection
        ground.checkCollisions = true;
        //groundMaterial.wireframe=true;
    }
    return ground;
}

function createLights(scene) {
    // i.e sun light with all light rays parallels, the vector is the direction.
    let light0 = new BABYLON.DirectionalLight("dir0", new BABYLON.Vector3(-1, -1, 0), scene);

}

function createFreeCamera(scene) {
    let camera = new BABYLON.FreeCamera("freeCamera", new BABYLON.Vector3(0, 50, 0), scene);
    camera.attachControl(canvas);
    // prevent camera to cross ground
    camera.checkCollisions = true; 
    // avoid flying with the camera
    camera.applyGravity = true;

    // Add extra keys for camera movements
    // Need the ascii code of the extra key(s). We use a string method here to get the ascii code
    camera.keysUp.push('z'.charCodeAt(0));
    camera.keysDown.push('s'.charCodeAt(0));
    camera.keysLeft.push('q'.charCodeAt(0));
    camera.keysRight.push('d'.charCodeAt(0));
    camera.keysUp.push('Z'.charCodeAt(0));
    camera.keysDown.push('S'.charCodeAt(0));
    camera.keysLeft.push('Q'.charCodeAt(0));
    camera.keysRight.push('D'.charCodeAt(0));

    return camera;
}

function createFollowCamera(scene, target) {
    let camera = new BABYLON.FollowCamera("tankFollowCamera", target.position, scene, target);

    camera.radius = 100; // how far from the object to follow
	camera.heightOffset = 40; // how high above the object to place the camera
	camera.rotationOffset = 180; // the viewing angle
	camera.cameraAcceleration = .1; // how fast to move
	camera.maxCameraSpeed = 5; // speed limit

    return camera;
}

window.addEventListener("resize", () => {
    engine.resize()
});

function modifySettings() {
    // as soon as we click on the game window, the mouse pointer is "locked"
    // you will have to press ESC to unlock it
    scene.onPointerDown = () => {
        if(!scene.alreadyLocked) {
            console.log("requesting pointer lock");
            canvas.requestPointerLock();
        } else {
            console.log("Pointer already locked");
        }
    }

    document.addEventListener("pointerlockchange", () => {
        let element = document.pointerLockElement || null;
        if (element) {
            // lets create a custom attribute
            scene.alreadyLocked = true;
        } else {
            scene.alreadyLocked = false;
        }
    })

    // key listeners for the tank
    inputStates.left = false;
    inputStates.right = false;
    inputStates.up = false;
    inputStates.down = false;
    inputStates.space = false;
    inputStates.traverseLeft = false;
    inputStates.traverseRight = false;
    
    //add the listener to the main, window object, and update the states
    window.addEventListener('keydown', (event) => {
        if ((event.key === "ArrowLeft") || (event.key === "q")|| (event.key === "Q")) {
            inputStates.left = true;
        } else if ((event.key === "ArrowUp") || (event.key === "z")|| (event.key === "Z")){
            inputStates.up = true;
        } else if ((event.key === "ArrowRight") || (event.key === "d")|| (event.key === "D")){
            inputStates.right = true;
        } else if ((event.key === "ArrowDown") || (event.key === "s")|| (event.key === "S")) {
            inputStates.down = true;
        } else if ((event.key === "a") || (event.key === "A")) {
            inputStates.traverseLeft = true;
        } else if ((event.key === "e") || (event.key === "E")) {
            inputStates.traverseRight = true;
        } else if (event.key === " ") {
            inputStates.space = true;
        }
    }, false);

    //if the key will be released, change the states object 
    window.addEventListener('keyup', (event) => {
        if ((event.key === "ArrowLeft") || (event.key === "q")|| (event.key === "Q")) {
            inputStates.left = false;
        } else if ((event.key === "ArrowUp") || (event.key === "z")|| (event.key === "Z")){
            inputStates.up = false;
        } else if ((event.key === "ArrowRight") || (event.key === "d")|| (event.key === "D")){
            inputStates.right = false;
        } else if ((event.key === "ArrowDown")|| (event.key === "s")|| (event.key === "S")) {
            inputStates.down = false;
        } else if (event.key === " ") {
            inputStates.space = false;
        }
    }, false);

    window.addEventListener('mousemove', (event) => {
        if (document.pointerLockElement) {
            if (event.movementX < -1) {
                inputStates.traverseLeft = true;
                inputStates.traverseRight = false;
            } else if (event.movementX > 1) {
                inputStates.traverseLeft = false;
                inputStates.traverseRight = true;
            } else {
                inputStates.traverseLeft = false;
                inputStates.traverseRight = false;
            }
            mouseX = event.offsetX;
            mouseY = event.offsetY;
        }
    }, false);

    window.addEventListener('click', (event) => {
        if (document.pointerLockElement) tank.shootMainGun();
    }, false);
}
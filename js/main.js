import SoundManager from "./SoundManager.js";
import T70 from "./T70.js";
import M4 from "./M4.js";
import Tiger from "./Tiger.js";
import WSData from "./WSData.js";

let canvas;
let engine;
let scene;
let soundManager;
let followCameraCreated;
// vars for handling inputs
let inputStates = {};
let tank;
let ennemyTanks = [];
let pause = false;

let mouseX = 800;
let mouseY = 600;

let socket = io.connect();

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
        processInputs(inputStates);

        if (tank.hull && tank.turret) {
            if (!followCameraCreated) {
                // second parameter is the target to follow
                let followCamera = createFollowCamera(scene, tank.turret);
                scene.activeCamera = followCamera;
                followCameraCreated = true;

                console.log('finished loading !');
            }
            tank.move(inputStates);
            tank.traverse(inputStates);
            tank.shells.forEach(shell => {
                shell.move(scene);
            });
            scene.gui = createGUI(scene);
        }

        scene.render();
    });
}

function createScene() {
    let scene = new BABYLON.Scene(engine);
    //scene.enablePhysics(new BABYLON.Vector3(0, -10*9.81, 0), new BABYLON.CannonJSPlugin());
    let ground = createGround(scene);
    let freeCamera = createFreeCamera(scene);
    soundManager = new SoundManager(scene);
    
    scene.tanks = ennemyTanks;
    scene.activeCamera = freeCamera;
    scene.collisionsEnabled = true;

    createLights(scene);

    let pos = new BABYLON.Vector3(
        Math.floor(Math.random() * 1000) - 500,
        0,
        Math.floor(Math.random() * 1000) - 500
    );

    tank = new M4(window.prompt('Enter your name, tanker !'), pos, new BABYLON.Vector3(0, 0, 0), new BABYLON.Vector3(0, 0, 0), 100, scene, soundManager);
    socket.emit('logIn', tank);
    //ennemyTanks.push(new M4('pedo bob', new BABYLON.Vector3(0, 0, 500), new BABYLON.Vector3(0, -1, 0), new BABYLON.Vector3(0, 0, 0), 100, scene, soundManager));

    return scene;
}

function createGround(scene) {
    //scene is optional and defaults to the current scene
    const ground = BABYLON.MeshBuilder.CreateGroundFromHeightMap("gdhm", 'images/hmap1.png', { width:5000, height:5000, subdivisions:100, minHeight:0, maxHeight:100, onReady: onGroundCreated}, scene); 

    function onGroundCreated() {
        const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
        groundMaterial.diffuseTexture = new BABYLON.Texture("images/Sand_007_basecolor.jpg");
        groundMaterial.bumpTexture = new BABYLON.Texture("images/Sand_007_normal.jpg", scene);
        ground.material = groundMaterial;
        // to be taken into account by collision detection
        ground.checkCollisions = true;
        //groundMaterial.wireframe=true;
        //ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.HeightmapImpostor, { mass: 0, restitution: 0 }, scene);
        scene.ground = ground;
    }
    return ground;
}

export function createGUI(scene) {
    // GUI
    let gui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    /*let button1 = BABYLON.GUI.Button.CreateSimpleButton("but1", "Click Me");
    button1.width = "150px"
    button1.height = "40px";
    button1.color = "white";
    button1.cornerRadius = 20;
    button1.background = "green";
    button1.onPointerUpObservable.add(function() {
        alert("you did it!");
    });*/
    let hpBG = new BABYLON.GUI.Rectangle();
    hpBG.width = 0.1;
    hpBG.height = 0.05;
    hpBG.cornerRadius = 5;
    hpBG.color = "black";
    hpBG.thickness = 1;
    hpBG.alpha = 0.75;
    hpBG.background = "red";
    hpBG.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    hpBG.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    hpBG.top = 0.01;
    hpBG.left = 0.01;
    let hpText = new BABYLON.GUI.TextBlock();
    hpText.text = tank.hp.toString() + '/100';
    hpText.color = "white";
    hpText.fontSize = 24;
    let infoBG = new BABYLON.GUI.Rectangle();
    infoBG.width = 0.05;
    infoBG.height = 0.25;
    infoBG.cornerRadius = 5;
    infoBG.alpha = 0.75;
    infoBG.background = "black";
    infoBG.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    infoBG.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    infoBG.bottom = 0.01;
    infoBG.left = 0.01;

    //gui.addControl(button1);
    hpBG.addControl(hpText);
    gui.addControl(infoBG);
    gui.addControl(hpBG);

    return gui;
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

    camera.radius = 150; // how far from the object to follow
	camera.heightOffset = 45; // how high above the object to place the camera
	camera.rotationOffset = 180; // the viewing angle
	camera.cameraAcceleration = .1; // how fast to move
	camera.maxCameraSpeed = 5; // speed limit

    return camera;
}

function processInputs(inputStates) {
    if (inputStates.pause) {
        pause = !pause;
        if (pause) {
            soundManager.theme.pause();
        } else {
            soundManager.theme.play();
        }
    }
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
    inputStates.pause = false;
    
    //add the listener to the main, window object, and update the states
    window.addEventListener('keydown', (event) => {
        if (tank.hp > 0) {
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
            } else if ((event.key === "p") || (event.key === "P")) {
                inputStates.pause = true;
            } else if (event.key === " ") {
                inputStates.space = true;
            }
        }
    }, false);

    //if the key will be released, change the states object 
    window.addEventListener('keyup', (event) => {
        if (tank.hp > 0) {
            if ((event.key === "ArrowLeft") || (event.key === "q")|| (event.key === "Q")) {
                inputStates.left = false;
            } else if ((event.key === "ArrowUp") || (event.key === "z")|| (event.key === "Z")){
                inputStates.up = false;
            } else if ((event.key === "ArrowRight") || (event.key === "d")|| (event.key === "D")){
                inputStates.right = false;
            } else if ((event.key === "ArrowDown")|| (event.key === "s")|| (event.key === "S")) {
                inputStates.down = false;
            } else if ((event.key === "p") || (event.key === "P")) {
                inputStates.pause = false;
            } else if (event.key === " ") {
                inputStates.space = false;
            }
        }
    }, false);

    window.addEventListener('mousemove', (event) => {
        if (document.pointerLockElement && tank.hp > 0) {
            if (event.movementX < -2.5) {
                inputStates.traverseLeft = true;
                inputStates.traverseRight = false;
            } else if (event.movementX > 2.5) {
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
        if (document.pointerLockElement && tank.hp > 0) tank.shootMainGun();
    }, false);
}

if (socket && tank) {
    // This is used when the client asks the server for who has already connected
    socket.on('players', players => {
        players.forEach(player => {
            ennemyTanks.push(new M4(player.user, player.position, player.hullRotation, player.turretRotation, player.hp, scene, soundManager));
        });
    });

    // Pretty straightforward : when a new tank has connected, we add it
    socket.on('newPlayer', player => {
        ennemyTanks.push(new M4(player.user, player.position, player.hullRotation, player.turretRotation, player.hp, scene, soundManager));
    });

    // Every server tick, we receive the new data of the ennemy tanks
    socket.on('playersUpdate', players => {
        players.forEach(player => {
            if (player.name !== tank.userName) {
                ennemyTanks.forEach(eTank => {
                    if (player.name === eTank.userName) {
                        eTank.hull.position = new BABYLON.Vector3(player.pos.x, player.pos.y, player.pos.z);
                        eTank.turret.position = new BABYLON.Vector3(player.pos.x, player.pos.y, player.pos.z);
                        eTank.hitbox.position = new BABYLON.Vector3(player.pos.x, player.pos.y, player.pos.z);
                        eTank.frontVector = player.hullRotation;
                        eTank.hull.rotation = player.hullRotation;
                        eTank.hitbox.rotation = player.hullRotation;
                        eTank.cannonDirection = player.turretRotation;
                        eTank.turret.rotation = player.turretRotation;
                        eTank.hp = player.hp;
                    }
                });
            }
        });
    });

    // If someone disconnects, we need to remove its tank from the scene
    socket.on('logOut', player => {
        for (let i = 0; i < ennemyTanks.length; i++) {
            if (ennemyTanks[i].userName === player.name) {
                scene.removeMesh(ennemyTanks[i].hull);
                scene.removeMesh(ennemyTanks[i].turret);
                scene.removeMesh(ennemyTanks[i].hitbox);
                ennemyTanks.splice(i, 1);
            }
        }
    });

    // Let's update the tank's data every 500 ms to the server
    window.setInterval(() => {
        socket.emit('update', new WSData(tank));
    }, 500);
}
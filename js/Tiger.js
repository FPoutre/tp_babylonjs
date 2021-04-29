import Shell from "./Shell.js";

export default class Tiger {

    constructor(userName, scene, soundManager) {

        this.scene = scene;
        this.soundManager = soundManager;
        this.userName = userName;
        this.hp = 150;
        this.class = 'heavy';

        this.speed = 0.3;
        this.idleTraverseSpeed = 0.005;
        this.turretTraverseSpeed = 0.003; 

        let scaling = 0.25;

        this.cannonDirection = new BABYLON.Vector3(0, 0, 0);

        BABYLON.SceneLoader.ImportMesh(null, "models/Tank/", "tigerHull.glb", scene, (newMeshes, particleSystems, skeletons) => {
            this.hull = newMeshes[0];
    
            this.hull.name = this.userName + "_hull";

            this.hull.position.y = 100;
            this.hull.scaling = new BABYLON.Vector3(scaling, scaling, scaling);
            // If I don't use this, no imported mesh will rotate :/
            this.hull.rotationQuaternion = null;
        });
    
        BABYLON.SceneLoader.ImportMesh(null, "models/Tank/", "tigerTurret.glb", scene, (newMeshes, particleSystems, skeletons) => {
            this.turret = newMeshes[0];
    
            this.turret.name = this.userName + "_turret";
    
            this.turret.position.y = 100;
            this.turret.scaling = new BABYLON.Vector3(scaling, scaling, scaling);
            // If I don't use this, no imported mesh will rotate :/
            this.turret.rotationQuaternion = null;
        });

        let nametagMaterial = new BABYLON.StandardMaterial(this.userName + '_nametagMaterial', scene);
        let nametagTexture = new BABYLON.DynamicTexture(this.userName + '_nametagTexture', {width:60*10, height:60*4}, scene);

        var ctx = nametagTexture.getContext();
        let size = 12; //any value will work
        ctx.font = size + 'px monospace';
        let textWidth = ctx.measureText(this.userName).width;
        let ratio = textWidth/size;
        let fontSize = Math.floor(60*10/ratio);

        nametagTexture.drawText(this.userName, 0, 200, fontSize + 'px monospace', 'red', 'white', true, true);
        nametagMaterial.diffuseTexture = nametagTexture;
        nametagMaterial.alpha = 0.6;
        this.nametag = BABYLON.MeshBuilder.CreatePlane(this.userName + '_nametagMesh', {width:10, height:2}, scene);
        this.nametag.position = new BABYLON.Vector3(0, 35, 0);
        this.nametag.material = nametagMaterial;

        // Physics
        this.hitbox = BABYLON.MeshBuilder.CreateBox(this.userName + '_hitbox', {width:30, height:27.5, size:60}, scene);
        this.hitbox.position = new BABYLON.Vector3(0, 27.5/2, 1);
        this.hitbox.rotationQuaternion = null;
        this.hitbox.isVisible = false;
        
        this.physicsRoot = new BABYLON.Mesh('', scene);
        this.physicsRoot.rotationQuaternion = null;
        if (this.hull) this.physicsRoot.addChild(this.hull);
        if (this.turret) this.physicsRoot.addChild(this.turret);
        this.physicsRoot.addChild(this.nametag);
        this.physicsRoot.addChild(this.hitbox);
        this.physicsRoot.position.y = 100;

        // Enable physics on colliders first then physics root of the mesh
        this.hitbox.physicsImpostor = new BABYLON.PhysicsImpostor(this.hitbox, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0 }, scene);
        this.physicsRoot.physicsImpostor = new BABYLON.PhysicsImpostor(this.physicsRoot, BABYLON.PhysicsImpostor.NoImpostor, { mass: 1000 }, scene);
    }

    move(inputStates) {
        if (this.hull) {
            //tank.position.z += -1; // speed should be in unit/s, and depends on
            // deltaTime !

            // if we want to move while taking into account collision detections
            // collision uses by default "ellipsoids"

            let yMovement = 0;
            let zMovement = 5;

            if (inputStates.up) {
                this.physicsRoot.moveWithCollisions(this.physicsRoot.frontVector.multiplyByFloats(this.speed, this.speed, this.speed));
            }    
            if (inputStates.down) {
                this.physicsRoot.moveWithCollisions(this.physicsRoot.frontVector.multiplyByFloats(-this.speed, -this.speed, -this.speed));
            }    
            if (inputStates.left) {
                this.hull.rotation.y -= this.idleTraverseSpeed;
                if (this.turret) this.turret.rotation.y -= this.idleTraverseSpeed;
                this.physicsRoot.rotation.y -= this.idleTraverseSpeed;
                this.hitbox.rotation.y -= this.idleTraverseSpeed;
                this.nametag.rotation.y -= this.idleTraverseSpeed;
            }    
            if (inputStates.right) {
                this.hull.rotation.y += this.idleTraverseSpeed;
                if (this.turret) this.turret.rotation.y += this.idleTraverseSpeed;
                this.physicsRoot.rotation.y += this.idleTraverseSpeed;
                this.hitbox.rotation.y += this.idleTraverseSpeed;
                this.nametag.rotation.y += this.idleTraverseSpeed;
            }
            this.nametag.position = new BABYLON.Vector3(this.hull.position.x, this.hull.position.y + 35, this.hull.position.z);
            this.physicsRoot.frontVector = new BABYLON.Vector3(Math.sin(this.hull.rotation.y), 0, Math.cos(this.hull.rotation.y));
            this.cannonDirection = new BABYLON.Vector3(Math.sin(this.turret.rotation.y) - 0.5, 1.5, Math.cos(this.turret.rotation.y) + 0.5);
        }
    }

    traverse(inputStates) {
        if (this.turret) {
            if (inputStates.traverseLeft) {
                this.turret.rotation.y -= this.turretTraverseSpeed;
                this.nametag.rotation.y -= this.turretTraverseSpeed;
            }
            if (inputStates.traverseRight) {
                this.turret.rotation.y += this.turretTraverseSpeed;
                this.nametag.rotation.y += this.turretTraverseSpeed;
            }
            this.cannonDirection = new BABYLON.Vector3(Math.sin(this.turret.rotation.y) - 0.5, 1.5, Math.cos(this.turret.rotation.y) + 0.5);
        }
    }

    shootMainGun() {
        let pos = this.physicsRoot.position;
        let dir = this.cannonDirection;

        this.soundManager.shot.play();
        new Shell('HE', dir, new BABYLON.Vector3(pos.x + dir.x, pos.y + dir.y, pos.z + dir.z), this.scene);
    }

    shootMachineGun() {

    }
}
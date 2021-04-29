import Shell from "./Shell.js";

const shotCD = 1000*3.5; // 3.5s

export default class M4 {

    constructor(userName, pos, hullRotation, turretRotation, hp, scene, soundManager) {

        this.scene = scene;
        this.soundManager = soundManager;
        this.userName = userName;
        this.hp = hp;
        this.class = 'medium';

        this.speed = 0.5;
        this.idleTraverseSpeed = 0.0075;
        this.turretTraverseSpeed = 0.005;

        this.shells = [];

        let scaling = 10;

        this.frontVector = hullRotation;
        this.cannonDirection = turretRotation;

        this.lastShotTime = 0;

        BABYLON.SceneLoader.ImportMesh(null, "models/Tank/", "m4Hull.glb", scene, (newMeshes, particleSystems, skeletons) => {
            this.hull = newMeshes[0];
    
            this.hull.name = this.userName + "_hull";

            this.hull.position.x = pos.x;
            this.hull.position.y = 1;
            this.hull.position.z = pos.z;
            this.hull.scaling = new BABYLON.Vector3(scaling, scaling, scaling);
            // If I don't use this, no imported mesh will rotate :/
            this.hull.rotationQuaternion = null;
        });
    
        BABYLON.SceneLoader.ImportMesh(null, "models/Tank/", "m4Turret.glb", scene, (newMeshes, particleSystems, skeletons) => {
            this.turret = newMeshes[0];
    
            this.turret.name = this.userName + "_turret";
    
            this.turret.position.x = pos.x;
            this.turret.position.y = 1;
            this.turret.position.z = pos.z;
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
        this.nametag.position = new BABYLON.Vector3(pos.x, pos.y + 35, pos.z);
        this.nametag.material = nametagMaterial;

        this.hitbox = BABYLON.MeshBuilder.CreateBox('hitbox', {width: 25, height: 55, depth: 60}, scene);
        this.hitbox.position = new BABYLON.Vector3(pos.x, 1, pos.z);
        this.hitbox.isVisible = false;
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
                //this.physicsRoot.moveWithCollisions(this.physicsRoot.frontVector.multiplyByFloats(this.speed, this.speed, this.speed));
                this.hull.moveWithCollisions(this.frontVector.multiplyByFloats(this.speed, this.speed, this.speed));
                this.turret.moveWithCollisions(this.frontVector.multiplyByFloats(this.speed, this.speed, this.speed));
                this.hitbox.moveWithCollisions(this.frontVector.multiplyByFloats(this.speed, this.speed, this.speed));
            }    
            if (inputStates.down) {
                //this.physicsRoot.moveWithCollisions(this.physicsRoot.frontVector.multiplyByFloats(-this.speed, -this.speed, -this.speed));
                this.hull.moveWithCollisions(this.frontVector.multiplyByFloats(-this.speed, -this.speed, -this.speed));
                this.turret.moveWithCollisions(this.frontVector.multiplyByFloats(-this.speed, -this.speed, -this.speed));
                this.hitbox.moveWithCollisions(this.frontVector.multiplyByFloats(-this.speed, -this.speed, -this.speed));
            }    
            if (inputStates.left) {
                this.hull.rotation.y -= this.idleTraverseSpeed;
                this.hitbox.rotation.y -= this.idleTraverseSpeed;
                if (this.turret) this.turret.rotation.y -= this.idleTraverseSpeed;
                //this.physicsRoot.rotation.y -= this.idleTraverseSpeed;
                this.nametag.rotation.y -= this.idleTraverseSpeed;
            }    
            if (inputStates.right) {
                this.hull.rotation.y += this.idleTraverseSpeed;
                if (this.turret) this.turret.rotation.y += this.idleTraverseSpeed;
                //this.physicsRoot.rotation.y += this.idleTraverseSpeed;
                this.hitbox.rotation.y += this.idleTraverseSpeed;
                this.nametag.rotation.y += this.idleTraverseSpeed;
            }
            this.nametag.position = new BABYLON.Vector3(this.hull.position.x, this.hull.position.y + 35, this.hull.position.z);
            this.frontVector = new BABYLON.Vector3(Math.sin(this.hull.rotation.y), 0, Math.cos(this.hull.rotation.y));
            this.cannonDirection = new BABYLON.Vector3(Math.sin(this.turret.rotation.y), 0, Math.cos(this.turret.rotation.y));
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
            this.cannonDirection = new BABYLON.Vector3(Math.sin(this.turret.rotation.y), 0, Math.cos(this.turret.rotation.y));
        }
    }

    shootMainGun() {
        if (Date.now() - this.lastShotTime > shotCD) {
            let pos = this.turret.position;
            let dir = this.cannonDirection;
            //pos.y += 25;

            console.log('pos: ' + pos + ', dir: ' + dir);

            this.soundManager.shot.play();
            this.shells.push(new Shell('HE', dir, new BABYLON.Vector3(pos.x, pos.y + 50, pos.z), this.scene));

            this.lastShotTime = Date.now();
        } else {
            this.soundManager.empty.play();
        }
    }

    hit() {
        if (this.hp > 67) {
            this.hp -= 67;
        } else {
            this.initParticlesFX(this.scene);
            this.deadFX1.start();
        }
    }

    initParticlesFX(scene) {
        this.deadFX1 = new BABYLON.ParticleSystem('hitFX1', 150000, scene);
        this.deadFX1.particleTexture = new BABYLON.Texture('images/fire_02.png');
        this.deadFX1.minScaleX = 10;
        this.deadFX1.maxScaleX = 75;
        this.deadFX1.minScaleY = 10;
        this.deadFX1.maxScaleY = 125;
        this.deadFX1.emitRate = 15;
        this.deadFX1.color1 = new BABYLON.Color4(1, 0, 0);
        this.deadFX1.color2 = new BABYLON.Color4(1, 1, 0);
        this.deadFX1.emitter = this.turret.position.add(new BABYLON.Vector3(0, 20, 0));
        this.deadFX1.targetStopDuration = 600;
    }
}
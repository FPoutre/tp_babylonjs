export default class Tank {

    constructor(userName, scene) {

        this.userName = userName;
        this.hp = 100;

        BABYLON.SceneLoader.ImportMesh(null, "models/Tank/", "hull.glb", scene, (newMeshes, particleSystems, skeletons) => {
            this.hull = newMeshes[0];
    
            this.hull.name = "heroTank";
            this.hull.scaling = new BABYLON.Vector3(10, 10, 10);
            // If I don't use this, no imported mesh will rotate :/
            this.hull.rotationQuaternion = null;
    
            this.hull.position.y = 0.6;
            this.hull.speed = 0.5;
            this.hull.frontVector = new BABYLON.Vector3(0, 0, 1);
        });
    
        BABYLON.SceneLoader.ImportMesh(null, "models/Tank/", "turret.glb", scene, (newMeshes, particleSystems, skeletons) => {
            this.turret = newMeshes[0];
    
            this.turret.name = "heroTurret";
    
            this.turret.position.y = 0.6;
            this.turret.scaling = new BABYLON.Vector3(10, 10, 10);
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

        /*this.hitbox = BABYLON.MeshBuilder.CreateBox("hitox", {width:30, height:55, size:60}, scene);
        this.hitbox.position = new BABYLON.Vector3(0, 0, 1);
        this.hitbox.checkCollisions = false;*/
    }

    move(inputStates) {
        if (this.hull) {
            //tank.position.z += -1; // speed should be in unit/s, and depends on
            // deltaTime !

            // if we want to move while taking into account collision detections
            // collision uses by default "ellipsoids"

            let yMovement = 0;
            let zMovement = 5;
        
            if (this.hull.position.y > 2) {
                zMovement = 0;
                yMovement = -2;
            } 

            if (inputStates.up) {
                this.hull.moveWithCollisions(this.hull.frontVector.multiplyByFloats(this.hull.speed, this.hull.speed, this.hull.speed));
                if (this.turret) this.turret.moveWithCollisions(this.hull.frontVector.multiplyByFloats(this.hull.speed, this.hull.speed, this.hull.speed));
            }    
            if (inputStates.down) {
                this.hull.moveWithCollisions(this.hull.frontVector.multiplyByFloats(-this.hull.speed, -this.hull.speed, -this.hull.speed));
                if (this.turret) this.turret.moveWithCollisions(this.hull.frontVector.multiplyByFloats(-this.hull.speed, -this.hull.speed, -this.hull.speed));
            }    
            if (inputStates.left) {
                this.hull.rotation.y -= 0.01;
                this.nametag.rotation.y -= 0.01;
                if (this.turret) this.turret.rotation.y -= 0.01;
                this.hull.frontVector = new BABYLON.Vector3(Math.sin(this.hull.rotation.y), 0, Math.cos(this.hull.rotation.y));
            }    
            if (inputStates.right) {
                this.hull.rotation.y += 0.01;
                this.nametag.rotation.y += 0.01;
                if (this.turret) this.turret.rotation.y += 0.01;
                this.hull.frontVector = new BABYLON.Vector3(Math.sin(this.hull.rotation.y), 0, Math.cos(this.hull.rotation.y));
            }
            this.nametag.position = new BABYLON.Vector3(this.hull.position.x, this.hull.position.y + 35, this.hull.position.z);
        }
    }

    traverse(inputStates) {
        if (this.turret) {
            if (inputStates.traverseLeft) {
                this.turret.rotation.y -= 0.005;
                this.nametag.rotation.y -= 0.005;
            }
            if (inputStates.traverseRight) {
                this.turret.rotation.y += 0.005;
                this.nametag.rotation.y += 0.005;
            }
        }
    }

    shootMainGun() {
        console.log('I SWEAR I SHOT MY GUN');
    }

    shootMachineGun() {

    }
}
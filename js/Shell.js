const speed = 10;

export default class Shell {

    constructor(type, dirVect, pos, scene) {
        this.type = type;
        this.dirVect = dirVect;
        this.scene = scene;

        this.hasHit = false;

        this.mesh = BABYLON.MeshBuilder.CreateSphere('shell', {radius: 2}, scene);
        this.mesh.position = new BABYLON.Vector3(pos.x + 10*Math.sin(dirVect.x), pos.y - 26, pos.z + 10*Math.cos(dirVect.x));
        this.mesh.checkCollisions = true;
        
        this.initParticlesFX(scene);
        this.shotFX.start();
        this.dragFX.start();
    }

    move(scene) {
        if (!this.hasHit) {
            this.mesh.moveWithCollisions(this.dirVect.multiplyByFloats(speed, speed, speed));

            /*if (this.mesh.intersectsMesh(scene.ground)) {
                console.log(this.mesh.position);
                console.log('hit ground');
                this.hit();
            }*/

            scene.tanks.forEach(eTank => {
                //console.log(eTank);
                if (this.mesh.intersectsMesh(eTank.hitbox)) {
                    console.log(this.mesh.position);
                    console.log('hit tank ' + eTank);
                    this.hit();
                    eTank.hit();
                }
            });
        }
    }

    initParticlesFX(scene) {
        this.shotFX = new BABYLON.ParticleSystem('shotFX', 5000, scene);
        this.shotFX.particleTexture = new BABYLON.Texture('images/smoke_09.png');
        this.shotFX.minScaleX = 10;
        this.shotFX.maxScaleX = 15;
        this.shotFX.minScaleY = 10;
        this.shotFX.maxScaleY = 15;
        this.shotFX.emitRate = 50;
        this.shotFX.color1 = new BABYLON.Color4(0.1, 0.1, 0.1, 0.75);
        this.shotFX.color2 = new BABYLON.Color4(0.1, 0.1, 0.1, 0.75);
        this.shotFX.emitter = new BABYLON.Vector3(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);
        this.shotFX.targetStopDuration = 0.1;

        this.dragFX = new BABYLON.ParticleSystem('shotFX', 10000, scene);
        this.dragFX.particleTexture = new BABYLON.Texture('images/smoke_02.png');
        this.dragFX.minScaleX = 0.5;
        this.dragFX.maxScaleX = 1;
        this.dragFX.minScaleY = 0.5;
        this.dragFX.maxScaleY = 1;
        this.dragFX.emitRate = 1500;
        this.shotFX.color1 = new BABYLON.Color4(0.25, 0.25, 0.25, 0.75);
        this.shotFX.color2 = new BABYLON.Color4(0.25, 0.25, 0.25, 0.75);
        this.dragFX.emitter = this.mesh.position;
        this.dragFX.targetStopDuration = 100;

        this.hitFX1 = new BABYLON.ParticleSystem('hitFX1', 5000, scene);
        this.hitFX1.particleTexture = new BABYLON.Texture('images/smoke_06.png');
        this.hitFX1.minScaleX = 10;
        this.hitFX1.maxScaleX = 50;
        this.hitFX1.minScaleY = 10;
        this.hitFX1.maxScaleY = 50;
        this.hitFX1.emitRate = 150;
        this.hitFX1.color1 = new BABYLON.Color4(0.05, 0.05, 0.05);
        this.hitFX1.color2 = new BABYLON.Color4(0.05, 0.05, 0.05);
        this.hitFX1.emitter = this.mesh.position;
        this.hitFX1.targetStopDuration = 0.5;

        this.hitFX2 = new BABYLON.ParticleSystem('hitFX2', 5000, scene);
        this.hitFX2.particleTexture = new BABYLON.Texture('images/fire_02.png');
        this.hitFX2.minScaleX = 50;
        this.hitFX2.maxScaleX = 100;
        this.hitFX2.minScaleY = 50;
        this.hitFX2.maxScaleY = 100;
        this.hitFX2.emitRate = 150;
        this.hitFX2.color1 = new BABYLON.Color4(1, 0, 0, 0.8);
        this.hitFX2.color2 = new BABYLON.Color4(1, 1, 0, 0.8);
        this.hitFX2.emitter = this.mesh.position;
        this.hitFX2.targetStopDuration = 0.5;

        this.hitFX3 = new BABYLON.ParticleSystem('hitFX3', 5000, scene);
        this.hitFX3.particleTexture = new BABYLON.Texture('images/dirt_02.png');
        this.hitFX3.minScaleX = 75;
        this.hitFX3.maxScaleX = 100;
        this.hitFX3.minScaleY = 75;
        this.hitFX3.maxScaleY = 100;
        this.hitFX3.emitRate = 100;
        this.hitFX3.color1 = new BABYLON.Color4(0.25, 0.16, 0.02, 0.95);
        this.hitFX3.color2 = new BABYLON.Color4(0.46, 0.33, 0.17, 0.95);
        this.hitFX3.emitter = this.mesh.position;
        this.hitFX3.targetStopDuration = 0.1;
    }

    hit() {
        this.hasHit = true;

        this.dragFX.stop();
        this.hitFX1.start();
        this.hitFX2.start();
        this.hitFX3.start();

        this.scene.removeMesh(this.mesh);
    }

}
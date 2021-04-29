export default class SoundManager {

    constructor(scene) {
        this.theme = new BABYLON.Sound("theme", "sounds/theme.mp3", scene, () => {
            //this.theme1.play();
        }, {
            loop: true,
            autoplay: false
        });
        this.background = new BABYLON.Sound("background", "sounds/background.mp3", scene, () => {
            this.background.setVolume(0.1);
            this.background.play();
        }, {
            loop: true
        });
        this.shot = new BABYLON.Sound("shot", "sounds/shot.mp3", scene);
        this.explode = new BABYLON.Sound("explode", "sounds/explode.mp3", scene);
        this.empty = new BABYLON.Sound("empty", "sounds/empty.mp3", scene);
        this.load = new BABYLON.Sound("load", "sounds/load.mp3", scene);
        this.load.setVolume(2);
    }

}
export default class SoundManager {

    constructor(scene) {
        this.theme = new BABYLON.Sound("theme", "sounds/theme.mp3", scene, () => {
            //this.theme1.play();
        }, {
            loop: true,
            autoplay: false
        });
        this.shot = new BABYLON.Sound("shot", "sounds/shot.mp3", scene);
        this.empty = new BABYLON.Sound("shot", "sounds/empty.mp3", scene);
    }

}
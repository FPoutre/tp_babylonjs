export default class WSData {

    constructor(tank) {
        this.name = tank.userName;
        this.position = tank.hull.position.clone();
        this.hullRotation = tank.frontVector;
        this.turretRotation = tank.cannonDirection;
        this.hp = tank.hp;
    }

}
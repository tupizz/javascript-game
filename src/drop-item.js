import Phaser from 'phaser';

export class DropItem extends Phaser.Physics.Matter.Sprite {
  constructor({
    scene, x, y, frame,
  }) {
    super(scene.matter.world, x, y, 'items', frame);
    this.scene.add.existing(this);

    const collider = Phaser.Physics.Matter.Matter.Bodies.circle(this.x, this.y, 7, {
      isSensor: false,
      label: 'collider',
    });

    this.isCollectableItem = true;
    this.setExistingBody(collider);
    this.setFrictionAir(1);
    this.setScale(0.5);
    this.sound = this.scene.sound.add('pickup');
  }

  pickUp() {
    this.destroy();
    this.sound.play();
    return true;
  }
}

import Phaser from 'phaser';
import { DropItem } from './drop-item';

export class Resource extends Phaser.Physics.Matter.Sprite {
  constructor({ scene, resource }) {
    super(scene.matter.world, resource.x, resource.y, 'resources', resource.type);
    const yOrigin = resource.properties.find((p) => p.name === 'yOrigin').value;
    this.drops = JSON.parse(resource.properties.find((p) => p.name === 'drops').value);
    this.name = resource.type;
    this.health = 5;
    this.sound = this.scene.sound.add(this.name);
    this.x += this.width / 2;
    this.y -= this.height / 2;
    this.y += this.height * (yOrigin - 0.55);
    this.setExistingBody(
      Phaser.Physics.Matter.Matter.Bodies.circle(this.x, this.y, 12, {
        isSensor: false,
        label: 'collider',
      }),
    );
    this.setStatic(true);
    this.setOrigin(0.5, yOrigin);
    this.scene.add.existing(this);
  }

  static preload(scene) {
    scene.load.spritesheet('items', '../assets/images/items/items.png', { frameWidth: 32, frameHeight: 32 });
    scene.load.atlas('resources', '../assets/images/resources/resources.png', '../assets/images/resources/resources_atlas.json');
    scene.load.audio('tree', '../assets/audio/tree.mp3');
    scene.load.audio('bush', '../assets/audio/bush.mp3');
    scene.load.audio('rock', '../assets/audio/rock.mp3');
    scene.load.audio('pickup', '../assets/audio/pickup.mp3');
  }

  get dead() {
    return this.health <= 0;
  }

  hit(damage) {
    if (this.sound) this.sound.play();
    this.health -= damage;
    if (this.dead) {
      this.drops.forEach((dropItemPosition, index) => new DropItem({
        scene: this.scene,
        x: this.x + (index * 5),
        y: this.y + (index * 5),
        frame: dropItemPosition,
      }));
    }
  }
}

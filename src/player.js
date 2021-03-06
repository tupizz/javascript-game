import Phaser from 'phaser';
import constants from './constants';
import { HealthBar } from './health-bar';
import { InfoText } from './info-text';

export class Player extends Phaser.Physics.Matter.Sprite {
  static preload(scene) {
    scene.load.atlas('male', 'assets/images/male/male.png', 'assets/images/male/male_atlas.json');
    scene.load.animation('male_anim', 'assets/images/male/male_anim.json');
    scene.load.spritesheet('items', 'assets/images/items/items.png', { frameWidth: 32, frameHeight: 32 });
    scene.load.audio('player', 'assets/audio/player.mp3');
    scene.load.audio('sword', 'assets/audio/sword.mp3');
  }

  constructor({
    scene,
    x,
    y,
    texture,
    frame,
  }) {
    super(scene.matter.world, x, y, texture, frame);
    this.name = 'player';
    this.setDepth(2);
    this.scene.add.existing(this);
    this.health = 100;

    // Sound that emit when player is hurt
    this.sound = this.scene.sound.add(this.name);
    this.swordSound = this.scene.sound.add('sword');

    // Array of touching objects using collision system
    this.touching = [];

    // Array of touching objects using collision system
    this.inventory = [];

    // Player Properties
    this.playerProps = {
      walkSpeed: 2,
      attackSpeed: 2,
      damage: 3,
    };

    // Weapon
    this.spriteWeapon = new Phaser.GameObjects.Sprite(this.scene, 0, 0, 'items', 81);
    this.spriteWeapon.setDepth(1);
    this.spriteWeapon.setOrigin(0.15, 0.75);
    this.spriteWeapon.setScale(0.7);
    this.scene.add.existing(this.spriteWeapon);

    const { Body, Bodies } = Phaser.Physics.Matter.Matter;
    const playerCollider = Bodies.circle(this.x, this.y, 10, {
      isSensor: false,
      label: 'playerCollider',
    });

    const playerSensor = Bodies.circle(this.x, this.y, 20, {
      isSensor: true,
      label: 'playerSensor',
    });

    const compoundBody = Body.create({
      parts: [playerCollider, playerSensor],
      frictionAir: 0.35,
    });

    this.setExistingBody(compoundBody);
    this.setFixedRotation();
    this.createMiningCollisions(playerSensor);
    this.createPickupCollisions(playerCollider);

    // Health bar
    this.hp = new HealthBar({ scene });

    // Helper text
    this.text = new InfoText({ scene: this.scene, x: this.x, y: this.y });

    this.scene.input.on('pointermove', (pointer) => this.setFlipX(pointer.worldX < this.x));
  }

  get velocity() {
    return this.body.velocity;
  }

  get dead() {
    return this.health <= 0;
  }

  get position() {
    return new Phaser.Math.Vector2(this.x, this.y);
  }

  update() {
    this.hp.update({ x: this.x, y: this.y, health: this.health });

    // Update text helper
    this.text.update(this);

    if (this.dead) return;

    this.setPosition(
      this.body.position.x > 0 ? this.body.position.x : 0,
      this.body.position.y > 0 ? this.body.position.y : 0,
    );

    this.setPosition(
      this.body.position.x <= constants.WIDTH_DIZE
        ? this.body.position.x
        : constants.WIDTH_DIZE,
      this.body.position.y <= constants.HEIGH_SIZE
        ? this.body.position.y
        : constants.HEIGH_SIZE,
    );

    const playerVelocity = new Phaser.Math.Vector2();
    if (this.inputKeys.left.isDown) {
      playerVelocity.x = -1;
    } else if (this.inputKeys.right.isDown) {
      playerVelocity.x = 1;
    }
    if (this.inputKeys.up.isDown) {
      playerVelocity.y = -1;
    } else if (this.inputKeys.down.isDown) {
      playerVelocity.y = 1;
    }
    playerVelocity.normalize();
    playerVelocity.scale(this.playerProps.walkSpeed);
    this.setVelocity(playerVelocity.x, playerVelocity.y);

    const isMoving = Math.abs(this.velocity.x) > 0.1 || Math.abs(this.velocity.y) > 0.1;
    if (isMoving) {
      this.anims.play('walk', true);
    } else {
      this.anims.play('idle', true);
    }

    this.spriteWeapon.setPosition(this.x, this.y);
    this.configureWeaponRotationAndVelocity();
  }

  onDeath() {
    this.anims.stop();
    this.setTexture('items', 0);
    this.setOrigin(0.5, 0.5);
    this.spriteWeapon.destroy();
  }

  createPickupCollisions(playerCollider) {
    this.scene.matterCollision.addOnCollideStart({
      context: this.scene,
      objectA: [playerCollider],
      callback: ({ gameObjectB, bodyB }) => {
        if (bodyB.isSensor) return;
        if (!gameObjectB || !gameObjectB.isCollectableItem) return;
        if (gameObjectB.pickUp) {
          this.inventory.push(gameObjectB);
          gameObjectB.pickUp();
        }
      },
    });
  }

  createMiningCollisions(playerSensor) {
    this.scene.matterCollision.addOnCollideStart({
      context: this.scene,
      objectA: [playerSensor],
      callback: ({ gameObjectB, bodyB }) => {
        if (bodyB.isSensor) return;
        this.touching.push(gameObjectB);
      },
    });

    this.scene.matterCollision.addOnCollideEnd({
      context: this.scene,
      objectA: [playerSensor],
      callback: ({ gameObjectB }) => {
        this.touching = this.touching.filter((gameObject) => gameObject !== gameObjectB);
      },
    });
  }

  hit(damage) {
    this.text.sendMessage(`-${Math.round(damage)}`);
    if (this.sound) this.sound.play();
    this.swordSound.play();
    this.health -= damage;

    if (this.dead) this.onDeath();
  }

  configureWeaponRotationAndVelocity() {
    const pointer = this.scene.input.activePointer;
    if (pointer.isDown) {
      this.weaponRotation += this.playerProps.attackSpeed;
    } else {
      this.weaponRotation = 0;
    }

    if (this.weaponRotation > 50) {
      this.whackStuff();
      this.weaponRotation = 0;
    }

    if (this.flipX) {
      this.spriteWeapon.setAngle(-this.weaponRotation - 90);
    } else {
      this.spriteWeapon.setAngle(this.weaponRotation);
    }
  }

  whackStuff() {
    const touchingResources = this.touching.filter((resource) => resource.hit && !resource.dead);
    touchingResources.forEach((resource) => {
      resource.hit(this.playerProps.damage);
      if (resource.dead) resource.destroy();
    });
  }
}

import Phaser from 'phaser';
import { DropItem } from './drop-item';

export class Enemy extends Phaser.Physics.Matter.Sprite {
  static preload(scene) {
    scene.load.atlas('enemies', 'assets/images/enemies/enemies.png', 'assets/images/enemies/enemies_atlas.json');
    scene.load.animation('enemies_anim', 'assets/images/enemies/enemies_anim.json');
    scene.load.audio('sword', 'assets/audio/sword.mp3');
  }

  constructor({ scene, enemy }) {
    super(scene.matter.world, enemy.x, enemy.y, 'enemies', `${enemy.type}_idle_1`);
    this.name = enemy.type;
    this.drops = JSON.parse(enemy.properties.find((p) => p.name === 'drops').value);
    this.health = enemy.properties.find((p) => p.name === 'health').value;
    this.sound = this.scene.sound.add('sword');
    this.scene.add.existing(this);
    this.attacking = null;

    // Configuring the collider
    const { Body, Bodies } = Phaser.Physics.Matter.Matter;
    const enemyCollider = Bodies.circle(this.x, this.y, 10, {
      isSensor: false,
      label: 'enemyCollider',
    });

    const enemySensor = Bodies.circle(this.x, this.y, 50, {
      isSensor: true,
      label: 'enemySensor',
    });

    const enemyDesistSensor = Bodies.circle(this.x, this.y, 80, {
      isSensor: true,
      label: 'enemyDesistSensor',
    });

    const compoundBody = Body.create({
      parts: [enemyCollider, enemySensor, enemyDesistSensor],
      frictionAir: 0.2,
    });

    this.setExistingBody(compoundBody);
    this.setFixedRotation();
    this.createPlayerCollisionDetection(enemySensor);
  }

  get dead() {
    return this.health <= 0;
  }

  createPlayerCollisionDetection(sensor) {
    this.scene.matterCollision.addOnCollideStart({
      context: this.scene,
      objectA: [sensor],
      callback: ({ gameObjectB }) => {
        if (gameObjectB && gameObjectB.name === 'player') {
          this.attacking = gameObjectB;
        }
      },
    });
  }

  get position() {
    return new Phaser.Math.Vector2(this.x, this.y);
  }

  get velocity() {
    return this.body.velocity;
  }

  attack(target) {
    const baseAttack = 20;

    if (this.sound) this.sound.play();

    if (target.dead || this.dead) {
      clearInterval(this.attackTimer);
      return;
    }

    target.hit(Math.random() * baseAttack);
  }

  clearTime() {
    if (this.attackTimer) {
      clearInterval(this.attackTimer);
      this.attackTimer = null;
    }
  }

  update() {
    if (this.dead) {
      this.clearTime();
      return;
    }

    const isMoving = Math.abs(this.velocity.x) > 0.1 || Math.abs(this.velocity.y) > 0.1;
    if (isMoving) {
      this.anims.play(`${this.name}_walk`, true);
    } else {
      this.anims.play(`${this.name}_idle`, true);
    }

    if (this.attacking) {
      const direction = this.attacking.position.subtract(this.position);
      if (direction.length() > 90) {
        // player gone away
        return;
      } if (direction.length() > 24) {
        // enemy is far from player
        this.clearTime();
        direction.normalize();
        this.setVelocityX(direction.x);
        this.setVelocityY(direction.y);
      } else if (!this.attackTimer) {
        // enemy is close from the player
        const attackAndSetTimer = () => {
          this.attack(this.attacking);
          this.attackTimer = setInterval(this.attack, 800, this.attacking);
        };

        attackAndSetTimer();
      }
    }
    this.setFlipX(this.velocity.x < 0);
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

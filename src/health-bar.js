import Phaser from 'phaser';

export class HealthBar {
  constructor({
    scene,
  }) {
    this.scene = scene;
    this.bar = new Phaser.GameObjects.Graphics(scene);
    this.x = 0;
    this.y = 0;
    this.value = 100;
    this.p = 36 / 100;
    this.draw();
    this.bar.setDepth(100);

    scene.add.existing(this.bar);
  }

  update({ x, y, health }) {
    this.x = x - 20;
    this.y = y - 25;
    this.value = health;
    if (this.value < 0) this.value = 0;
    this.draw();
  }

  draw() {
    this.bar.clear();

    //  BG
    this.bar.fillStyle(0x000000);
    this.bar.fillRect(this.x, this.y, 40, 8);

    //  Health

    this.bar.fillStyle(0xffffff);
    this.bar.fillRect(this.x + 2, this.y + 2, 36, 4);

    if (this.value < 30) {
      this.bar.fillStyle(0xff0000);
    } else {
      this.bar.fillStyle(0x00ff00);
    }

    const d = Math.floor(this.p * this.value);

    this.bar.fillRect(this.x + 2, this.y + 2, d, 4);
  }
}

import Phaser from 'phaser';
import { Enemy } from './enemy';
import { Player } from './player';
import { Resource } from './resource';

export class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
    this.enemies = [];
  }

  preload() {
    Player.preload(this);
    Resource.preload(this);
    Enemy.preload(this);
    this.load.setBaseURL('../');
    this.load.image('tiles', 'assets/map/RPG Nature Tileset.png');
    this.load.tilemapTiledJSON('map', 'assets/map/map.json');
  }

  create() {
    // Create map
    this.map = this.make.tilemap({ key: 'map' });
    const tileset = this.map.addTilesetImage(
      'RPG Nature Tileset',
      'tiles',
      32,
      32,
    );
    const layer1 = this.map.createLayer('main', tileset, 0, 0);
    const layer2 = this.map.createLayer('tree', tileset, 0, 0);

    // Adiciona colisão
    layer1.setCollisionByProperty({ collides: true });
    layer2.setCollisionByProperty({ collides: true });
    this.matter.world.convertTilemapLayer(layer1);
    this.matter.world.convertTilemapLayer(layer2);

    // Adicionar recursos do cenário
    this.map
      .getObjectLayer('resources')
      .objects.forEach((resource) => new Resource({ scene: this, resource }));

    // Add enemies to our scene
    this.map
      .getObjectLayer('enemies')
      .objects.forEach((enemy) => {
        const newEnemy = new Enemy({ scene: this, enemy });
        this.enemies.push(newEnemy);
      });

    this.player = new Player({
      scene: this,
      x: 200,
      y: 200,
      texture: 'male',
      frame: 'townsfolk_m_idle_1',
    });

    this.add.existing(this.player);
    this.player.inputKeys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
    const camera = this.cameras.main;
    camera.zoom = 2.5;
    camera.startFollow(this.player);
    camera.setLerp(0.1, 0.1);
    camera.setBounds(0, 0, this.game.config.width, this.game.config.height);
  }

  update() {
    this.player.update();

    this.enemies.forEach((enemy) => enemy.update());
  }
}

import '../assets/styles/style.css';
import Phaser from 'phaser';
import PhaserMatterCollisionPlugin from 'phaser-matter-collision-plugin';
import { MainScene } from './main-scene';
import constants from './constants';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  width: constants.WIDTH_DIZE,
  height: constants.HEIGH_SIZE,
  parent: 'app',
  backgroundColor: '#999999',
  scale: {
    zoom: 1.25,
  },
  scene: [
    MainScene,
  ],
  physics: {
    default: 'matter',
    matter: {
      debug: true,
      gravity: {
        y: 0,
      },
    },
  },
  plugins: {
    scene: [
      {
        plugin: PhaserMatterCollisionPlugin,
        key: 'matterCollision',
        mapping: 'matterCollision',
      },
    ],
  },
});

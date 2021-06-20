import '../public/assets/styles/style.css';
import '../public/assets/styles/responsive.css';
import Phaser from 'phaser';
import PhaserMatterCollisionPlugin from 'phaser-matter-collision-plugin';
import { MainScene } from './main-scene';
import constants from './constants';

const deviceType = () => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
};

if (deviceType() === 'desktop') {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    width: constants.WIDTH_DIZE,
    height: constants.HEIGH_SIZE,
    parent: 'app',
    backgroundColor: '#999999',
    scale: {
      zoom: 1.5,
    },
    scene: [
      MainScene,
    ],
    physics: {
      default: 'matter',
      matter: {
        debug: false,
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
} else {
  document.getElementById('app').innerHTML = '<b id="alert">This was not developed to run on mobile or tablets, I\'m sorry 😢</b>';
}

import Phaser from 'phaser';

const diffSeconds = (date, otherDate) => Math.ceil(Math.abs(date - otherDate) / (1000));

export class InfoText extends Phaser.GameObjects.Text {
  constructor({ scene, x, y }) {
    super(scene, x, y);

    this.setStyle({ color: '#FF0000' });
    this.setScale(0.5);
    this.calls = [];
    scene.add.existing(this);
  }

  update(player) {
    this.setPosition(player.x + 10, player.y);

    if (this.calls.length) {
      const lastMessageTime = [...this.calls].pop();
      const diffInSeconds = diffSeconds(new Date(), lastMessageTime.time);
      if (diffInSeconds > 4) {
        this.setText('');
        this.calls = [];
      }
    }
  }

  sendMessage(message) {
    this.setText(message);
    this.calls = [...this.calls, { message, time: new Date() }];
  }
}

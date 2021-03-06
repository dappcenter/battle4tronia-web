import { Container, Point, Texture } from 'pixi.js';
import { bigIcon } from './basic';
import { Dimension } from './commons';
import { centerX, centerY, newContainer, newSprite, postionOnRight } from './utils';
import { Button } from './utils/Button';

interface ModalOpts {
  screenStage: Container;
  screenSize: Dimension;
  scale?: Point;
  decorator?: string;
  closeable?: boolean;
}

export function Modal({ scale, screenSize, screenStage, decorator, closeable = true }: ModalOpts) {
  const bodySize = {
    width: 510 * (scale ? scale.x : 1),
    height: 460 * (scale ? scale.y : 1),
  };
  const padding = new Point(58 * (scale ? scale.x : 1), 27 * (scale ? scale.y : 1));

  const stage = newContainer();
  screenStage.addChild(stage);

  const darkShadow = BackShadow(screenSize);

  const bodyFrame = newSprite('UIModal.png');
  if (scale) {
    bodyFrame.scale.set(scale.x, scale.y);
  }

  centerX(screenSize.width, bodyFrame);
  centerY(screenSize.height, bodyFrame);

  stage.addChild(darkShadow, bodyFrame);
  if (decorator) {
    const decoSprite = newSprite(decorator);
    decoSprite.x = bodyFrame.x + bodyFrame.width - decoSprite.width;
    decoSprite.y = bodyFrame.y + bodyFrame.height - decoSprite.height;
    stage.addChild(decoSprite);
  } // const prueba = newSprite(Texture.WHITE, { size: bodySize });
  // prueba.name = 'ACA';
  // prueba.x = bodyFrame.x + padding.x;
  // prueba.y = bodyFrame.y + padding.y;
  // prueba.tint = 0xff00ff;

  const body = newContainer(bodyFrame.x + padding.x, bodyFrame.y + padding.y);
  body.interactive = true;
  body.defaultCursor = 'default';

  stage.addChild(body);

  let escListener: (e: KeyboardEvent) => void;
  const dispose = () => {
    body.removeChildren();
    screenStage.removeChild(stage);
    stage.destroy();
    if (closeable) {
      document.body.removeEventListener('keypress', escListener);
    }
  };

  if (closeable) {
    const closeBtnSprite = bigIcon('IcoClose');
    closeBtnSprite.tint = 0x000000;
    postionOnRight(bodySize.width, 10, closeBtnSprite);
    closeBtnSprite.y = 10;
    body.addChild(closeBtnSprite);
    Button.from(closeBtnSprite, dispose, { soundId: 'btnNegative' });
    darkShadow.on('click', dispose);
    escListener = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dispose();
      }
    };
    document.body.addEventListener('keydown', escListener);
  }

  return {
    stage,
    body,
    bodySize,

    dispose,
  };
}

export function BackShadow(screenSize: Dimension) {
  const darkShadow = newSprite(Texture.WHITE, { size: screenSize });
  darkShadow.name = 'Modal.BackShadow';
  darkShadow.tint = 0x000000;
  darkShadow.alpha = 0.5;
  darkShadow.interactive = true;
  darkShadow.defaultCursor = 'default';
  return darkShadow;
}

export function HowtoPlayModal({
  screenSize,
  screenStage,
}: {
  screenStage: Container;
  screenSize: Dimension;
}) {
  const stage = newContainer();
  screenStage.addChild(stage);

  const darkShadow = BackShadow(screenSize);

  const bodyFrame = newSprite('UIModalHowtoPlay.png');
  bodyFrame.interactive = true;
  bodyFrame.defaultCursor = 'default';
  centerX(screenSize.width, bodyFrame);
  centerY(screenSize.height, bodyFrame);

  const btnSprite = newSprite('BtnGotIt.png');

  // centerX(bodyFrame.width, btnSprite);
  // postionOnBottom(bodyFrame.height, 25, btnSprite);
  btnSprite.position.set(286, 468);
  bodyFrame.addChild(btnSprite);

  stage.addChild(darkShadow, bodyFrame);

  const dispose = () => {
    screenStage.removeChild(stage);
    stage.destroy();
    document.body.removeEventListener('keypress', dispose);
  };

  Button.from(btnSprite, dispose);

  const escListener = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      dispose();
    }
  };

  document.body.addEventListener('keydown', escListener);
  darkShadow.on('click', dispose);

  return {
    stage,
    dispose,
  };
}

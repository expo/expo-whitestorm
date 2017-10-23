// @flow

import { EventEmitter } from 'fbemitter';
import invariant from 'invariant';
import nullthrows from 'nullthrows';
import { type CameraComponent, type ModuleManager, type RenderingModule } from 'whs';

import { type LayoutEvent } from '../types/LayoutEvent';

export type ResizeModuleParams = {
  emitter: EventEmitter,
  auto?: boolean,
};

export type ResizeCallback = (width: string, height: string) => void;

export default class ResizeModule {
  params: ResizeModuleParams;
  callbacks: Array<ResizeCallback> = [];
  _manager: ?ModuleManager;
  _viewDimensions: ?{ width: number, height: number };

  constructor(params: ResizeModuleParams) {
    this.params = {
      auto: true,
      ...params,
    };

    this.addCallback((width, height) => this.setSize(parseInt(width, 10), parseInt(height, 10)));
  }

  get camera(): CameraComponent {
    return nullthrows(this._manager).get('camera');
  }

  get rendering(): RenderingModule {
    return nullthrows(this._manager).use('rendering');
  }

  setSize(width: number, height: number): void {
    invariant(width > 0, `The width of the Whitestorm content must be positive`);
    invariant(height > 0, `The height of the Whitestorm content must be positive`);

    const camera = this.camera;
    if (camera) {
      camera.native.aspect = width / height;
      camera.native.updateProjectionMatrix();
    }

    const rendering = this.rendering;
    if (rendering) {
      rendering.setSize(width, height);
    }
  }

  manager(manager: ModuleManager): void {
    manager.define('resize');
    this._manager = manager;

    // Save the initial dimensions and subscribe to updates so we can synchronously access the
    // GLView's width and height whenever we're instructed to resize Whitestorm's modules
    const { width, height } = nullthrows(this.rendering).params;
    this._viewDimensions = { width, height };

    this.params.emitter.addListener('resize', layout => {
      const { width, height } = layout;
      this._viewDimensions = { width, height };

      if (this.params.auto) {
        this.trigger();
      }
    });
  }

  trigger(): void {
    const viewDimensions = this._viewDimensions;
    invariant(
      viewDimensions,
      `The Whitestorm GLView's dimensions must be available in order to resize the Whitestorm content`
    );

    // The rendering module scales the dimensions by the resolution (which is separate from the
    // pixel ratio) so we simulate the same behavior here
    const { resolution } = this.rendering.params;
    const width = (viewDimensions.width * resolution.x).toFixed();
    const height = (viewDimensions.height * resolution.y).toFixed();

    this.callbacks.forEach(callback => {
      callback(width, height);
    });
  }

  addCallback(callback: ResizeCallback): void {
    this.callbacks.push(callback);
  }
}

export class ResizeEventEmitter extends EventEmitter {
  /**
   * An event listener to pass to the `onLayout` prop of the GLView
   */
  layoutListener = (event: LayoutEvent) => {
    const { layout } = event.nativeEvent;
    this.emit('resize', layout);
  };
}

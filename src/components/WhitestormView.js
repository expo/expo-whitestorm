// @flow

import { GLView } from 'expo';
import invariant from 'invariant';
import * as React from 'react';
import { PixelRatio } from 'react-native';
import * as THREE from 'three';
import * as WHS from 'whs';

import ElementModule from '../modules/ElementModule';
import EndFrameModule from '../modules/EndFrameModule';
import ResizeModule, { ResizeEventEmitter } from '../modules/ResizeModule';
import { type LayoutEvent } from '../types/LayoutEvent';

opaque type EXGLRenderingContext = *;

type Props = {
  onAppCreate?: ?(app: WHS.App) => void,
} & React.ElementProps<typeof GLView>;

export default class WhitestormView extends React.Component<Props> {
  _dimensions: ?{ width: number, height: number };
  _resizeEventEmitter = new ResizeEventEmitter();

  render() {
    return (
      <GLView
        {...this.props}
        onContextCreate={this._handleGLContextCreate}
        onLayout={this._handleLayout}
      />
    );
  }

  _handleLayout = (event: LayoutEvent) => {
    if (this.props.onLayout) {
      this.props.onLayout(event);
    }

    const { width, height } = event.nativeEvent.layout;
    this._dimensions = { width, height };

    this._resizeEventEmitter.layoutListener(event);
  };

  _handleGLContextCreate = async (gl: EXGLRenderingContext) => {
    if (this.props.onContextCreate) {
      this.props.onContextCreate(gl);
    }

    if (this.props.onAppCreate) {
      const app = this._createWhitestormApp(gl);
      this.props.onAppCreate(app);
    }
  };

  _createWhitestormApp(gl: EXGLRenderingContext): WHS.App {
    invariant(
      this._dimensions,
      `The dimensions of the GLView must have been computed before creating the GL rendering context`
    );
    const { width, height } = this._dimensions;

    const app = new WHS.App([
      new ElementModule(),
      new WHS.SceneModule(),
      new WHS.DefineModule(
        'camera',
        new WHS.PerspectiveCamera({
          position: new THREE.Vector3(0, 0, 100),
          aspect: width / height,
        })
      ),

      new WHS.RenderingModule({
        width,
        height,
        pixelRatio: PixelRatio.get(),
        renderer: {
          canvas: {
            style: {},
            addEventListener() {},
            removeEventListener() {},
            clientWidth: width,
            clientHeight: height,
          },
          context: gl,
          // TODO: Apply extra renderer options
          gammaInput: true,
          gammaOutput: true,
          shadowMap: {
            enabled: true,
          },
        },
        bgColor: 0xbbbbbb,
      }),

      new ResizeModule({ emitter: this._resizeEventEmitter }),
      new EndFrameModule(),
    ]);

    return app;
  }
}

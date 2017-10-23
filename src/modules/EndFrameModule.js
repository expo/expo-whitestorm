import { Loop } from 'whs';

export default class EndFrameModule {
  manager(manager) {
    this._rendering = manager.use('rendering');
  }

  integrate(self) {
    const endFrameLoop = new Loop(() => {
      const gl = self._rendering.renderer.context;
      gl.endFrameEXP();
    });

    // Ensure that the call to end the current frame runs after all other operations by replacing
    // the implementation of `addLoop`
    const app = this;
    const originalAddLoop = app.addLoop;
    app.addLoop = async function addLoop(loop) {
      const loopCount = this.loops.length;
      await this.removeLoop(endFrameLoop);
      await originalAddLoop(loop);
      if (this.loops.length === loopCount) {
        await originalAddLoop(endFrameLoop);
      }
    };

    // Add our loop to the end
    app.loops.push(endFrameLoop);
    endFrameLoop.start();
  }
}

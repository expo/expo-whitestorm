// @flow

import { type ModuleManager } from 'whs';

type Element = {
  appendChild: (childNode: mixed) => void,
};

export default class ElementModule {
  element: Element;

  constructor() {
    this.element = {
      appendChild(canvas) {},
    };
  }

  manager(manager: ModuleManager): void {
    manager.set('element', this.element);
  }

  integrate(self: ElementModule) {}
}

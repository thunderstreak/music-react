import React from 'react';

export default function Component<T extends { new (...args: any[]): any }>(
  component: T
) {
  return class extends component {
    handleClick() {
      super.handleClick();
      console.log('hijack');
    }

    render() {
      const parent = super.render();
      return React.cloneElement(parent, { onClick: this.handleClick });
    }
  };
}

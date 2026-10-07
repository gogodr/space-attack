import { Component, type ReactNode } from 'react';

export class SceneErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) {
      return (
        <div className="scene-error" role="alert">
          The flight display could not initialize. Enable WebGL and reload the
          page.
        </div>
      );
    }
    return this.props.children;
  }
}

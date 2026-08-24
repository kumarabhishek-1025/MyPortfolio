"use client";
import { Component } from 'react';

export class ThreeErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Three.js Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
          <div className="text-center text-muted-foreground text-xs opacity-50">
            3D Graphics Unavailable
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ThreeErrorBoundary;

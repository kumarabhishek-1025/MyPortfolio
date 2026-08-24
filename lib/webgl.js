export function isWebGLAvailable() {
  if (typeof window === 'undefined') return false;
  
  // Check if WebGL is supported at all
  if (!window.WebGLRenderingContext) return false;
  
  try {
    const canvas = document.createElement('canvas');
    
    // Try WebGL2 first
    let gl = canvas.getContext('webgl2', {
      failIfMajorPerformanceCaveat: false,
      antialias: false,
      alpha: false
    });
    
    // Fall back to WebGL1
    if (!gl) {
      gl = canvas.getContext('webgl', {
        failIfMajorPerformanceCaveat: false,
        antialias: false,
        alpha: false
      });
    }
    
    if (!gl) return false;
    
    // Check for common WebGL extensions
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      if (renderer && renderer.includes('Disabled')) return false;
    }
    
    return true;
  } catch (e) {
    console.error('WebGL detection error:', e);
    return false;
  }
}

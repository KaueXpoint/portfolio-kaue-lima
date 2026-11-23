// The CSS artwork also covers devices without an accelerated WebGL 2 context.
export async function startScene(containerId) {
  const element = document.getElementById(containerId);
  if (!element || !window.WebGL2RenderingContext) return;
  const probe = document.createElement('canvas').getContext('webgl2');
  if (!probe) return;
  probe.getExtension('WEBGL_lose_context')?.loseContext();
  await import('./core-renderer.js');
  return window.CoreRenderer.addScene({
    element,
    filePath: new URL('./hero-project.json', import.meta.url).href
  });
}

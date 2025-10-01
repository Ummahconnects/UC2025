export function track(name: string, props?: Record<string, any>) {
  try {
    window.dispatchEvent(new CustomEvent("analytics:event", { detail: { name, ...props } }));
  } catch {}
}










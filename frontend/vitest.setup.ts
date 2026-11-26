import "@testing-library/jest-dom";

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// jsdom has no PointerEvent; Base UI's Switch constructs one on click.
window.PointerEvent ??= MouseEvent as unknown as typeof PointerEvent;

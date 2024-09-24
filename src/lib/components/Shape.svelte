<script>
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import { shapes } from "../stores.js";

  export let shape;
  export let scale;
  export let translateX;
  export let translateY;

  let workspace;

  // References to DOM elements
  let shapeElement;

  function onShapeMouseDown(e) {
    e.stopPropagation(); // Prevent workspace panning

    if (browser) {
      const { x, y } = getWorkspaceCoords(e);
      shape.isDragging = true;
      shape.offsetX = x - shape.x;
      shape.offsetY = y - shape.y;

      window.addEventListener("mousemove", onShapeMouseMove);
      window.addEventListener("mouseup", onShapeMouseUp);
    }
  }

  function onShapeMouseMove(e) {
    if (shape.isDragging && browser) {
      const { x, y } = getWorkspaceCoords(e);
      let newX = x - shape.offsetX;
      let newY = y - shape.offsetY;

      // Constrain within workspace bounds
      newX = Math.max(0, Math.min(newX, workspace.offsetWidth - shape.width));
      newY = Math.max(0, Math.min(newY, workspace.offsetHeight - shape.height));

      // Update the shape's position in the store
      shapes.update((currentShapes) => {
        const index = currentShapes.findIndex((s) => s.id === shape.id);
        if (index !== -1) {
          currentShapes[index].x = newX;
          currentShapes[index].y = newY;
        }
        return currentShapes;
      });
    }
  }

  function onShapeMouseUp() {
    if (shape.isDragging) {
      shape.isDragging = false;
    }
    if (browser) {
      window.removeEventListener("mousemove", onShapeMouseMove);
      window.removeEventListener("mouseup", onShapeMouseUp);
    }
  }

  // Helper function to get workspace coordinates from mouse event
  function getWorkspaceCoords(e) {
    if (workspace && browser) {
      const rect = workspace.getBoundingClientRect();
      const x = (e.clientX - rect.left - translateX * scale) / scale;
      const y = (e.clientY - rect.top - translateY * scale) / scale;
      return { x, y };
    }
    return { x: 0, y: 0 };
  }

  onMount(() => {
    workspace = shapeElement.parentElement.parentElement; // Access the workspace element
  });
</script>

<div
  class="shape"
  bind:this={shapeElement}
  style="left: {shape.x}px; top: {shape.y}px; width: {shape.width}px; height: {shape.height}px;"
  on:mousedown={onShapeMouseDown}
></div>

<style>
  .shape {
    position: absolute;
    background-color: #3498db;
    border: 2px solid #2980b9;
    cursor: move;
  }
</style>

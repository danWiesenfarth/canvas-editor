<script>
  import { onMount } from "svelte";
  import { browser } from "$app/environment";

  // Variables for panning and zooming
  let scale = 1;
  let translateX = 0;
  let translateY = 0;
  let isPanning = false;
  let startX = 0;
  let startY = 0;

  // Minimum scale and desired margin
  let minScale = 1;
  const desiredMargin = 300; // Adjust as needed

  // References to DOM elements
  let workspace;
  let viewport;

  // Shapes array
  let shapes = [];

  // Current dragging shape
  let currentShape = null;

  // Event handlers for panning and zooming
  function onMouseDown(e) {
    isPanning = true;
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
  }

  function onMouseUp() {
    isPanning = false;
  }

  function onMouseMove(e) {
    if (!isPanning) return;
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    updateTransform();
  }

  function onWheel(e) {
    e.preventDefault();
    const zoomIntensity = 0.1;
    const delta = e.deltaY > 0 ? -zoomIntensity : zoomIntensity;
    const oldScale = scale;
    scale = Math.min(Math.max(minScale, scale + delta), 5); // Max scale set to 5

    if (viewport) {
      // Adjust translateX and translateY to zoom towards the cursor position
      const rect = viewport.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      translateX -= mouseX / oldScale - mouseX / scale;
      translateY -= mouseY / oldScale - mouseY / scale;

      updateTransform();
    }
  }

  function updateTransform() {
    if (workspace) {
      workspace.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    }
  }

  function calculateMinScale() {
    if (browser) {
      // Get the viewport dimensions
      const viewportWidth = window.innerWidth - 240 * 2; // Subtract left and right toolbar widths
      const viewportHeight = window.innerHeight;

      // Calculate scale factors based on desired margin
      const scaleX = viewportWidth / (1920 + desiredMargin * 2);
      const scaleY = viewportHeight / (1080 + desiredMargin * 2);

      // Set minScale to the smaller of scaleX and scaleY
      minScale = Math.min(scaleX, scaleY);

      // Ensure minScale doesn't exceed initial scale
      minScale = Math.min(minScale, 1);

      // Update initial scale and position
      scale = minScale;
      centerWorkspace();
      updateTransform();
    }
  }

  function centerWorkspace() {
    if (browser) {
      const viewportWidth = window.innerWidth - 240 * 2;
      const viewportHeight = window.innerHeight;

      // Calculate the scaled workspace dimensions
      const scaledWidth = 1920 * scale;
      const scaledHeight = 1080 * scale;

      // Calculate translations to center the workspace
      translateX = (viewportWidth - scaledWidth) / 2;
      translateY = (viewportHeight - scaledHeight) / 2;
    }
  }

  // Initialize on mount
  onMount(() => {
    if (browser) {
      calculateMinScale(); // Initial calculation

      window.addEventListener("resize", calculateMinScale);

      // Clean up the event listener when the component is destroyed
      return () => {
        window.removeEventListener("resize", calculateMinScale);
      };
    }
  });

  // Add a rectangle to the workspace
  function addRectangle() {
    const newShape = {
      id: Date.now(),
      x: 100, // Initial x position
      y: 100, // Initial y position
      width: 100,
      height: 100,
      isDragging: false,
      offsetX: 0,
      offsetY: 0,
    };
    shapes = [...shapes, newShape];
  }

  // Event handlers for shapes
  function onShapeMouseDown(e, shape) {
    e.stopPropagation(); // Prevent workspace panning

    if (browser) {
      const { x, y } = getWorkspaceCoords(e);
      shape.isDragging = true;
      shape.offsetX = x - shape.x;
      shape.offsetY = y - shape.y;
      currentShape = shape;

      window.addEventListener("mousemove", onShapeMouseMove);
      window.addEventListener("mouseup", onShapeMouseUp);
    }
  }

  function onShapeMouseMove(e) {
    if (currentShape && currentShape.isDragging && browser) {
      const { x, y } = getWorkspaceCoords(e);
      let newX = x - currentShape.offsetX;
      let newY = y - currentShape.offsetY;

      // Constrain within workspace bounds
      newX = Math.max(
        0,
        Math.min(newX, workspace.offsetWidth - currentShape.width)
      );
      newY = Math.max(
        0,
        Math.min(newY, workspace.offsetHeight - currentShape.height)
      );

      currentShape.x = newX;
      currentShape.y = newY;

      // Trigger Svelte reactivity
      shapes = [...shapes];
    }
  }

  function onShapeMouseUp() {
    if (currentShape) {
      currentShape.isDragging = false;
      currentShape = null;
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
</script>

<div class="container">
  <!-- Left Toolbar -->
  <div class="left-toolbar">
    <!-- Left Toolbar Content -->
    <button on:click={addRectangle}>Add Rectangle</button>
  </div>

  <!-- Right Toolbar -->
  <div class="right-toolbar">
    <!-- Right Toolbar Content -->
    <p>Right</p>
  </div>

  <!-- Viewport -->
  <div
    class="viewport"
    bind:this={viewport}
    on:mousedown={onMouseDown}
    on:mouseup={onMouseUp}
    on:mousemove={onMouseMove}
    on:wheel={onWheel}
  >
    <!-- Workspace -->
    <div class="workspace" bind:this={workspace}>
      <!-- Content goes here -->
      <h1>Fake Canvas Workspace (1920x1080)</h1>
      {#each shapes as shape (shape.id)}
        <div
          class="shape"
          style="left: {shape.x}px; top: {shape.y}px; width: {shape.width}px; height: {shape.height}px;"
          on:mousedown={(e) => onShapeMouseDown(e, shape)}
        ></div>
      {/each}
    </div>
  </div>
</div>

<style>
  /* Reset styles */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  /* Container styles */
  .container {
    position: relative;
    width: 100%;
    height: 100vh;
    overflow: hidden;
  }

  /* Fixed toolbars */
  .left-toolbar,
  .right-toolbar {
    position: fixed;
    top: 0;
    bottom: 0;
    width: 240px;
    background-color: #f0f0f0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .left-toolbar {
    left: 0;
  }

  .right-toolbar {
    right: 0;
  }

  /* Viewport */
  .viewport {
    position: absolute;
    top: 0;
    left: 240px; /* Width of left toolbar */
    right: 240px; /* Width of right toolbar */
    bottom: 0;
    overflow: hidden;
    background-color: #e0e0e0;
  }

  /* Workspace */
  .workspace {
    position: absolute;
    top: 0;
    left: 0;
    width: 1920px;
    height: 1080px;
    background-color: #ffffff;
    transform-origin: 0 0;
    /* Optional grid background for reference */
    background-image: linear-gradient(to right, #ccc 1px, transparent 1px),
      linear-gradient(to bottom, #ccc 1px, transparent 1px);
    background-size: 20px 20px;
    overflow: hidden;
  }

  /* Shape styles */
  .shape {
    position: absolute;
    background-color: #3498db;
    border: 2px solid #2980b9;
    cursor: move;
  }

  /* Style for the import button */
  .left-toolbar button {
    padding: 8px 12px;
    margin: 8px;
  }
</style>

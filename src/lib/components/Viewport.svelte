<script>
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import Workspace from "./Workspace.svelte";

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
</script>

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
    <Workspace {scale} {translateX} {translateY} />
  </div>
</div>

<style>
  .viewport {
    position: absolute;
    top: 0;
    left: 240px; /* Width of left toolbar */
    right: 240px; /* Width of right toolbar */
    bottom: 0;
    overflow: hidden;
    background-color: #e0e0e0;
  }

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
</style>

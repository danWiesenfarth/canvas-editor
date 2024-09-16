<script>
  import Sidebar from "$lib/components/ui/Sidebar.svelte";
  import CanvasComponent from "$lib/components/CanvasComponent.svelte";
  import Toolbar from "$lib/components/ui/Toolbar.svelte";
  import { addWidget, selectedWidgetIndex } from "../stores/widgetsStore";
  import { writable } from "svelte/store";

  let sidebarWidth = 300;
  let isResizing = false;

  // SVG elements as a writable store for real-time updates
  let svgElements = writable([]);

  // Handle the mousedown event to start resizing
  function handleMouseDown() {
    isResizing = true;
  }

  // Handle mousemove to resize the sidebar and canvas dynamically
  function handleMouseMove(event) {
    if (!isResizing) return;
    sidebarWidth = event.clientX;
  }

  // Handle mouseup to stop resizing
  function handleMouseUp() {
    isResizing = false;
  }

  // Function to import an SVG and store it in the canvas
  function importSVG(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const svgData = e.target.result;
      if (svgData) {
        svgElements.update((elements) => [
          ...elements,
          { data: svgData, x: 100, y: 100 },
        ]);
      }
    };
    reader.readAsText(file);
  }

  // Attach event listeners for resizing, only in the browser
  $: if (isResizing && typeof window !== "undefined") {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  } else if (typeof window !== "undefined") {
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  }
</script>

<div class="editor-wrapper">
  <Toolbar {importSVG} />
  <div class="content-wrapper">
    <div class="sidebar" style="width: {sidebarWidth}px;">
      <Sidebar {selectedWidgetIndex} {svgElements} />
    </div>
    <div class="resizer" on:mousedown={handleMouseDown}></div>
    <div class="canvas-container">
      <CanvasComponent {svgElements} />
    </div>
  </div>
</div>

<style>
  .editor-wrapper {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }

  .content-wrapper {
    display: flex;
    flex: 1;
    position: relative;
  }

  .sidebar {
    display: flex;
    flex-direction: column;
    height: 100vh;
    border-right: 1px solid #ccc;
  }

  .resizer {
    width: 5px;
    background-color: #ddd;
    cursor: ew-resize;
    position: relative;
    z-index: 10;
  }

  .canvas-container {
    flex: 1;
    background-color: #f9f9f9;
  }
</style>

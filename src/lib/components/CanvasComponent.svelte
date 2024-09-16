<script>
  import { onMount } from "svelte";
  import { widgetsStore, selectedWidgetIndex } from "../../stores/widgetsStore";
  import { get } from "svelte/store"; // Access store values

  export let svgElements; // Writable store for SVG elements

  let canvas;
  let ctx;
  let isDragging = false;
  let dragStart = { x: 0, y: 0 };
  let selectedWidget = null;
  let selectedSVG = null; // Store the index of the selected SVG

  // Zooming and panning state
  let scale = 1;
  let panX = 0;
  let panY = 0;
  let isPanning = false;

  // Subscribe to the widgets store
  let widgets = [];
  widgetsStore.subscribe((value) => {
    widgets = value;
    drawWidgets(); // Redraw when widgets change
  });

  let selectedIndex = null;
  selectedWidgetIndex.subscribe((index) => {
    selectedIndex = index;
    drawWidgets(); // Redraw when selection changes
  });

  // Handle zooming with the mouse wheel
  function handleWheel(event) {
    event.preventDefault();
    const zoomFactor = 0.1;
    const zoomDirection = event.deltaY < 0 ? 1 : -1;
    const newScale = scale + zoomFactor * zoomDirection;

    if (newScale > 0.2 && newScale < 5) {
      scale = newScale;
      drawWidgets();
    }
  }

  // Handle mouse down to start panning or dragging a widget or SVG
  function handleMouseDown(event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = (event.clientX - rect.left) / scale - panX;
    const mouseY = (event.clientY - rect.top) / scale - panY;

    // Check if clicking on a widget
    selectedWidget = widgets.findIndex(
      (widget) =>
        mouseX >= widget.x &&
        mouseX <= widget.x + widget.width &&
        mouseY >= widget.y &&
        mouseY <= widget.y + widget.height
    );

    // Get the SVG elements from the store
    const svgElementsArray = get(svgElements);

    // Check if clicking on an SVG element
    selectedSVG = svgElementsArray.findIndex(
      (svg) =>
        mouseX >= svg.x &&
        mouseX <= svg.x + svg.width &&
        mouseY >= svg.y &&
        mouseY <= svg.y + svg.height
    );

    if (selectedWidget !== -1) {
      isDragging = true;
      dragStart = { x: mouseX, y: mouseY };
      selectedWidgetIndex.set(selectedWidget); // Set selected widget
    } else if (selectedSVG !== -1) {
      isDragging = true;
      dragStart = { x: mouseX, y: mouseY };
      selectedWidgetIndex.set(selectedSVG + widgets.length); // Treat SVG like a widget
    } else {
      // Reset the selection when clicking outside widgets or SVGs
      selectedWidgetIndex.set(null);
    }

    if (event.button === 1) {
      isPanning = true;
      dragStart = { x: event.clientX - panX, y: event.clientY - panY };
    }
  }

  // Handle mouse move to pan the canvas or drag the widget/SVG
  function handleMouseMove(event) {
    if (isPanning) {
      panX = (event.clientX - dragStart.x) / scale;
      panY = (event.clientY - dragStart.y) / scale;
      drawWidgets();
    } else if (isDragging) {
      const rect = canvas.getBoundingClientRect();
      const mouseX = (event.clientX - rect.left) / scale - panX;
      const mouseY = (event.clientY - rect.top) / scale - panY;

      const dx = mouseX - dragStart.x;
      const dy = mouseY - dragStart.y;

      if (selectedWidget !== null && selectedWidget < widgets.length) {
        widgetsStore.update((widgets) => {
          return widgets.map((widget, i) => {
            if (i === selectedWidget) {
              return { ...widget, x: widget.x + dx, y: widget.y + dy };
            }
            return widget;
          });
        });
      }

      if (selectedSVG !== null && selectedSVG >= 0) {
        svgElements.update((elements) => {
          return elements.map((svg, i) => {
            if (i === selectedSVG) {
              return { ...svg, x: svg.x + dx, y: svg.y + dy };
            }
            return svg;
          });
        });
      }

      dragStart = { x: mouseX, y: mouseY };
      drawWidgets(); // Redraw immediately after updating x, y
    }
  }

  // Handle mouse up to stop dragging or panning
  function handleMouseUp() {
    isDragging = false;
    isPanning = false;
  }

  // Fix for blurry canvas on high-DPI displays
  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(dpr, dpr); // Account for the device pixel ratio
      drawWidgets();
    }
  }

  // Maintain aspect ratio during resizing
  function maintainAspectRatio() {
    const aspectRatio = canvas.width / canvas.height;
    const container = canvas.parentElement;

    // Set the canvas height based on the width and aspect ratio
    const newWidth = container.clientWidth;
    const newHeight = newWidth / aspectRatio;
    canvas.style.width = `${newWidth}px`;
    canvas.style.height = `${newHeight}px`;
  }

  // Parse the SVG data and extract its width and height
  function parseSVGDimensions(svgData) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgData, "image/svg+xml");
    const svgElement = doc.querySelector("svg");

    const width = svgElement.getAttribute("width") || 100;
    const height = svgElement.getAttribute("height") || 100;

    return { width: parseInt(width), height: parseInt(height) };
  }

  // Draw the grid, widgets, and SVGs with the correct zoom and pan
  function drawWidgets() {
    if (!ctx) return; // Ensure the canvas context is available

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    ctx.save();
    ctx.translate(panX * scale, panY * scale);
    ctx.scale(scale, scale);

    // Draw grid
    const spacing = 50;
    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 0.5;
    for (let x = -5000; x < 5000; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, -5000);
      ctx.lineTo(x, 5000);
      ctx.stroke();
    }
    for (let y = -5000; y < 5000; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(-5000, y);
      ctx.lineTo(5000, y);
      ctx.stroke();
    }

    // Draw widgets
    widgets.forEach((widget, index) => {
      ctx.fillStyle = "#3498db";
      ctx.fillRect(widget.x, widget.y, widget.width, widget.height);

      // Draw a border for the selected widget
      if (index === selectedIndex) {
        ctx.strokeStyle = "red";
        ctx.lineWidth = 3;
        ctx.strokeRect(widget.x, widget.y, widget.width, widget.height);
      }
    });

    ctx.restore();

    // Get the SVG elements from the store
    const svgElementsArray = get(svgElements);

    // Draw SVG elements outside of the zoom/pan context (independent of zoom/pan)
    svgElementsArray.forEach((svg, index) => {
      const { width, height } = parseSVGDimensions(svg.data); // Get the correct dimensions

      const img = new Image();
      img.src = `data:image/svg+xml;base64,${btoa(svg.data)}`; // Convert the SVG data to an image
      img.onload = () => {
        ctx.drawImage(img, svg.x, svg.y, width, height); // Draw SVG with correct dimensions

        // Draw a border for the selected SVG
        if (selectedIndex === index + widgets.length) {
          ctx.strokeStyle = "red";
          ctx.lineWidth = 3;
          ctx.strokeRect(svg.x, svg.y, width, height);
        }
      };
    });
  }

  onMount(() => {
    resizeCanvas();

    // Handle events for zooming, panning, and dragging
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);

    window.addEventListener("resize", maintainAspectRatio);

    maintainAspectRatio(); // Ensure initial aspect ratio
  });
</script>

<!-- Canvas where widgets and SVGs will be drawn -->
<canvas bind:this={canvas} style="width: 100%; height: 100%;" />

<style>
  canvas {
    border: 1px solid #ccc;
  }
</style>

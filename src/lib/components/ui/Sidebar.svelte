<script>
  import {
    widgetsStore,
    selectedWidgetIndex,
  } from "../../../stores/widgetsStore";
  import { writable } from "svelte/store";

  export let svgElements = writable([]); // Writable store for SVG elements

  let selectedWidgetIndexValue = null;
  let widgets = [];
  let selectedWidget = null;
  let selectedSVG = null;

  // Subscribe to widgets and the selected index
  widgetsStore.subscribe((value) => {
    widgets = value;
  });

  selectedWidgetIndex.subscribe((value) => {
    selectedWidgetIndexValue = value;

    if (
      selectedWidgetIndexValue !== null &&
      selectedWidgetIndexValue < widgets.length
    ) {
      selectedWidget = widgets[selectedWidgetIndexValue];
      selectedSVG = null;
    } else if (
      selectedWidgetIndexValue !== null &&
      selectedWidgetIndexValue >= widgets.length
    ) {
      svgElements.subscribe((svgs) => {
        selectedSVG = svgs[selectedWidgetIndexValue - widgets.length];
      });
      selectedWidget = null;
    }
  });

  // Function to update properties of widgets or SVGs in real time
  function updateProperty(type, index, property, value) {
    if (type === "widget") {
      widgetsStore.update((widgets) => {
        return widgets.map((widget, i) => {
          if (i === index) {
            return { ...widget, [property]: value };
          }
          return widget;
        });
      });
    } else if (type === "svg") {
      svgElements.update((svgList) => {
        return svgList.map((svg, i) => {
          if (i === index) {
            return { ...svg, [property]: value };
          }
          return svg;
        });
      });
    }
  }
</script>

<!-- Display widget or SVG properties -->
{#if selectedWidget}
  <div>
    <h3>Widget Properties</h3>
    <label>X:</label>
    <input
      type="number"
      bind:value={selectedWidget.x}
      on:input={(e) =>
        updateProperty(
          "widget",
          selectedWidgetIndexValue,
          "x",
          parseInt(e.target.value)
        )}
    />
    <label>Y:</label>
    <input
      type="number"
      bind:value={selectedWidget.y}
      on:input={(e) =>
        updateProperty(
          "widget",
          selectedWidgetIndexValue,
          "y",
          parseInt(e.target.value)
        )}
    />
    <label>Width:</label>
    <input
      type="number"
      bind:value={selectedWidget.width}
      on:input={(e) =>
        updateProperty(
          "widget",
          selectedWidgetIndexValue,
          "width",
          parseInt(e.target.value)
        )}
    />
    <label>Height:</label>
    <input
      type="number"
      bind:value={selectedWidget.height}
      on:input={(e) =>
        updateProperty(
          "widget",
          selectedWidgetIndexValue,
          "height",
          parseInt(e.target.value)
        )}
    />
  </div>
{:else if selectedSVG}
  <div>
    <h3>SVG Properties</h3>
    <label>X:</label>
    <input
      type="number"
      bind:value={selectedSVG.x}
      on:input={(e) =>
        updateProperty(
          "svg",
          selectedWidgetIndexValue - widgets.length,
          "x",
          parseInt(e.target.value)
        )}
    />
    <label>Y:</label>
    <input
      type="number"
      bind:value={selectedSVG.y}
      on:input={(e) =>
        updateProperty(
          "svg",
          selectedWidgetIndexValue - widgets.length,
          "y",
          parseInt(e.target.value)
        )}
    />
    <label>Width:</label>
    <input
      type="number"
      bind:value={selectedSVG.width}
      on:input={(e) =>
        updateProperty(
          "svg",
          selectedWidgetIndexValue - widgets.length,
          "width",
          parseInt(e.target.value)
        )}
    />
    <label>Height:</label>
    <input
      type="number"
      bind:value={selectedSVG.height}
      on:input={(e) =>
        updateProperty(
          "svg",
          selectedWidgetIndexValue - widgets.length,
          "height",
          parseInt(e.target.value)
        )}
    />
  </div>
{:else}
  <div>Select an element to view properties.</div>
{/if}

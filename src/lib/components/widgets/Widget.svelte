<script>
  export let widget;

  function handleClick() {
    // Handle widget click logic here
  }
</script>

<div
  class="widget"
  style="left: {widget.x}px; top: {widget.y}px; width: {widget.width}px; height: {widget.height}px;"
  on:click={handleClick}
></div>

<style>
  .widget {
    position: absolute;
    background-color: #3498db;
    border: 2px solid transparent;
  }

  .widget:hover {
    cursor: pointer;
  }
</style>

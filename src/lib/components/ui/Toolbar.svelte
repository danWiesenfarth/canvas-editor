<script>
  let fileInput;

  export let importSVG = () => {};

  // Simulate a click on the hidden file input when the button is clicked
  function triggerFileInput() {
    fileInput.click();
  }
</script>

<div class="toolbar">
  <button on:click={triggerFileInput}>Import SVG</button>
  <!-- Hidden file input to trigger -->
  <input
    type="file"
    accept=".svg"
    bind:this={fileInput}
    style="display: none;"
    on:change={importSVG}
  />
</div>

<style>
  .toolbar {
    height: 72px;
    border: 1px solid red;
    display: flex;
    align-items: center;
  }

  button {
    padding: 10px;
    cursor: pointer;
  }
</style>

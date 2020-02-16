<script>
  import { getContext } from "svelte"

  const { isLoading } = getContext("appState")
</script>

<div class="layout">
  <slot name="top"></slot>
  <main class:loading={$isLoading}>
    <slot name="body"></slot>
  </main>
  <slot name="footer"></slot>
</div>

<style>
  .layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  main {
    flex: 1;
    padding-top: 24px;

    &.loading {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
</style>

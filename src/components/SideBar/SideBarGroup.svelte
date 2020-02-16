<script>
  export let title;
</script>

<div>
  <h3>{title}</h3>
  <slot></slot>
</div>

<style>
  div {
    margin-bottom: 20px;
  }
  h3 {
    border-bottom: 1px solid var(--color-blue-2);
    color: var(--color-blue-8);
    padding-bottom: 8px;
  }
</style>

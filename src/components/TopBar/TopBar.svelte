<script>
  import Search from './Search.svelte'
  import TriggerMenu from './TriggerMenu.svelte'
</script>

<header class="top-bar">
  <div class="logo-wrapper">
    <h1 class="logo">emojinf🎯</h1>
  </div>
  <div class="search-wrapper">
    <Search />
  </div>
  <TriggerMenu />
</header>

<style>
  .top-bar {
    display: grid;
    align-items: center;
    grid-template-columns: 1fr auto;
    grid-gap: 8px 16px;
    padding: 16px 24px;
    box-shadow: 0 3px 32px rgba(5, 35, 63, 0.4), 0 1px 12px rgba(5, 35, 63, 0.2);
    background-color: var(--color-primary);
  }

  .logo {
    margin: 0;
    font-family: var(--font-secondary);
    color: var(--color-blue-1);
    font-weight: 400;
  }

  .trigger-wrapper {
    order: 2;
  }

  .search-wrapper {
    order: 3;
    grid-column: 1 / -1;
  }

  @media(min-width: 768px) {
    .top-bar {
      grid-template-columns: 1fr 420px auto;
    }

    .search-wrapper {
      order: 2;
      grid-column: initial;
      margin-right: 24px;
    }

    .trigger-wrapper {
      order: 3;
    }
  }
</style>

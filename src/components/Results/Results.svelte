<script>
  import { getContext } from 'svelte'

  import { fade } from 'svelte/transition'
  import parseName from '../../utils/parseName'
  import ResultsItem from './ResultsItem.svelte'
  import ResultsSelected from './ResultsSelected.svelte'

  const { gender, mode, tone, emojiSize } = getContext('appState')
  export let data

  $: factor = $emojiSize / 60
  $: gridItemSize = $emojiSize * (2.5 - factor)
</script>

<div
  class="grid"
  style="grid-template-columns: repeat(auto-fill, minmax({gridItemSize}px, 1fr))">
  {#each data as group}
    {#if $mode !== 'simple' && group.subgroups.filter(x => x.items).length > 0}
      <h2 in:fade>{parseName(group.name)}</h2>
    {/if}
    {#each group.subgroups as subgroup}
      {#if subgroup.items}
        {#if $mode === 'hierarchized'}
          <h3 in:fade>{subgroup.name}</h3>
        {/if}
        {#each subgroup.items as item}
          {#if typeof item.gender === 'undefined' || $gender.includes(item.gender)}
            <ResultsItem data={item} tone={$tone} emojiSize={$emojiSize} buttonHeight={gridItemSize} />
          {/if}
        {/each}
      {/if}
    {/each}
  {/each}
</div>
<ResultsSelected />

<style>
  :root {
    --grid-gap: 8px;

    @media (min-width: 768px) {
      --grid-gap: 10px;
    }
  }
  .grid {
    display: grid;
    margin: 0;
    padding: 0;
    list-style: none;
    grid-gap: var(--grid-gap);
    padding: var(--grid-gap) 24px;
    /* justify-content: center; */
  }

  h2,
  h3 {
    grid-column: 1 / -1;
    margin: 0;
  }

  h2 {
    margin: 24px 0 0;
    font-family: var(--font-primary);
    color: var(--color-blue-9);
    font-size: 24px;
    &:first-child {
      margin-top: 0;
    }
  }

  h3 {
    color: #555;
    font-weight: 600;
    margin-top: 12px;
  }

  h2 + h3 {
    margin-top: 4px;
  }
</style>

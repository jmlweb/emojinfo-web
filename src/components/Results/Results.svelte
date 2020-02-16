<script>
  import { getContext } from 'svelte'

  import { fade } from 'svelte/transition'
  import parseName from '../../utils/parseName'
  import ResultsItem from './ResultsItem.svelte'
  import ResultsSelected from './ResultsSelected.svelte'

  const { gender, data, mode, tone, emojiSize, keyword } = getContext('appState')

  $: factor = $emojiSize / 60
  $: gridItemSize = $emojiSize * (2.5 - factor)
  $: results = $data.reduce(
    (acc, group) => acc + group.subgroups.reduce(
      (subAcc, subgroup) => {
        if (!subgroup.items) {
          return subAcc;
        }
        return subAcc + subgroup.items.length;
      },
      0
    ), 0);

  const resetSearch = () => {
    $keyword = '';
  }
</script>

{#if $keyword.length}
  <div class="results-header">
    <p>
      <strong>{results}</strong> results for <strong>{$keyword}</strong>
      <button type="button" on:click={resetSearch}><span class="clear">❌</span> clear</button>
    </p>
  </div>
{/if}

<div
  class="grid"
  style="grid-template-columns: repeat(auto-fill, minmax({gridItemSize}px, 1fr))">
  {#each $data as group}
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

  .results-header {
    padding: var(--grid-gap) 24px;
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

  .results-header {
    font-size: 22px;
    display: flex;
    align-items: center;
    justify-content: center;

    & button {
      background: linear-gradient(145deg, #e3e5e5, #ffffff);
      border: 0;
      box-shadow: 7px 7px 13px #cfd0d0, -7px -7px 13px #ffffff;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      transform-origin: 50% 50%;
      transition: transform 0.2s;
      outline: 0;
      margin-left: 8px;
      font-size: 18px;
      padding: 12px;
      color: #7b7b7b;

      &:hover {
        background: linear-gradient(145deg, #ffffff, #e3e5e5);
        transform: scale(1.05);
      }

      &:active {
        transform: scale(0.9);
      }
    }
  }

  .clear {
    font-family: initial;
    font-size: 13px;
    margin-right: 4px;
  }
</style>

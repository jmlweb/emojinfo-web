<script>
  import { getContext } from 'svelte'
  import TONES, { TONES_EMOJIS } from '../../constants/tones'

  const { tone } = getContext('appState')
</script>

<select bind:value={$tone}>
    <option value={null}>
      neutral
    </option>
    {#each Object.keys(TONES) as toneKey}
    <option value={TONES[toneKey]}>
      {TONES_EMOJIS[toneKey]} {toneKey}
    </option>
    {/each}
  </select>

<style>
  select {
    font-size: 16px;
  }
</style>

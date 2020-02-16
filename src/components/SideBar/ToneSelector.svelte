<script>
  import { getContext } from 'svelte'
  import TONES, { TONES_EMOJIS } from '../../constants/tones'
  import SideBarGroup from './SideBarGroup.svelte'

  const { tone } = getContext('appState')
</script>

<SideBarGroup title="Select tone">
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
</SideBarGroup>

<style>
  select {
    font-size: 16px;
  }
</style>

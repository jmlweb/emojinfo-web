<script>
  import { getContext } from 'svelte'
  import { fade } from 'svelte/transition'
  import ToneSelector from './ToneSelector.svelte'
  import Clipboard from './Clipboard.svelte'

  const { selectedEmoji, selectedEmojiData, groups, subgroups, tone } = getContext('appState')

  const resetSelectedEmoji = () => {
    selectedEmoji.set(null)
  }

  $: skinnedData = (!$tone || !$selectedEmojiData || !$selectedEmojiData.skins) ? $selectedEmojiData : $selectedEmojiData.skins[$tone - 1];

  $: parsedGroup = skinnedData && $groups ? $groups[skinnedData.group] : ''
  $: parsedSubgroup = skinnedData && $subgroups ? $subgroups[skinnedData.subgroup] : ''
</script>

{#if skinnedData}
<div class="main" transition:fade>
  <div class="overlay" transition:fade on:click={resetSelectedEmoji}></div>
  <div class="content">
    <header>
      <div class="emoji">
        {skinnedData.emoji}
      </div>
      <h1>{skinnedData.annotation}</h1>
    </header>
    <dl transition:fade>
      {#if $selectedEmojiData.skins}
        <dt>Tone</dt>
        <dd><ToneSelector /></dd>
      {/if}
      <dt>Name:</dt>
      <dd>{skinnedData.name}</dd>
      <dt>Hex Code:</dt>
      <dd>{skinnedData.hexcode}</dd>
      <dt>Shortcodes:</dt>
      <dd>{skinnedData.shortcodes.map(x => `:${x}:`).join(', ')}</dd>
      <dt>Tags:</dt>
      <dd>{$selectedEmojiData.tags.join(', ')}</dd>
      {#if skinnedData.text}
        <dt>Text:</dt>
        <dd>{skinnedData.text}</dd>
      {/if}
      <dt>Type:</dt>
      <dd>{skinnedData.type === 0 ? 'text' : 'emoji'}</dd>
      <dt>Order:</dt>
      <dd>{$selectedEmojiData.order}</dd>
      <dt>Group:</dt>
      <dd>{parsedGroup}</dd>
      <dt>Subgroup:</dt>
      <dd>{parsedSubgroup}</dd>
      <dt>Version:</dt>
      <dd>{$selectedEmojiData.version}</dd>
      {#if $selectedEmojiData.emoticon}
        <dt>Emoticon:</dt>
        <dd>{$selectedEmojiData.emoticon}</dd>
      {/if}
    </dl>
    <Clipboard value={skinnedData.emoji} onCopy={resetSelectedEmoji} />
  </div>
</div>
{/if}

<svelte:head>
  <title>{skinnedData ? `${skinnedData.name} | ` : ''}Emojinfo</title>
</svelte:head>

<style>
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: rgba(5, 35, 63, 0.8);
  }

  .main {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 50;
  }

  .content {
    width: 440px;
    max-width: 100%;
    background: #fff;
    position: relative;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 3px 12px rgba(5, 35, 63, 1), 0 12px 42px rgba(0, 0, 0, 0.6);
  }

  header {
    text-align: center;
    border-bottom: 1px solid var(--color-blue-2);
    padding: 15px 0 25px;
  }

  h1 {
    margin: 10px 0 0;
    font-size: 24px;
    color: var(--color-blue-9);
  }

  .emoji {
    font-family: initial;
    font-size: 80px;
    line-height: 1;
  }

  dl {
    display: grid;
    grid-template-columns: auto 1fr;
    grid-gap: 16px;
    padding: 24px;
    margin: 0;
  }

  dt,
  dd {
    margin: 0;
    padding: 0;
  }

  dt {
    font-weight: 600;
    color: var(--color-pink-4);
    text-align: right;
  }
</style>

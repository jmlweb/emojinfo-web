<script>
	export let categories;
</script>

<div>
  {#each Object.keys(categories) as categoryName}
    <div>
      <div>{categoryName}</div>
      <div class="items">
        {#each categories[categoryName] as item}
          <div class="item">
            <div class="emoji">
              {item.emoji}
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/each}
</div>

<style>
  .items {
    display: flex;
    flex-wrap: wrap;
  }

  .item {
    padding: 10px;
    border: 1px solid #ccc;
    margin-right: 10px;
    margin-bottom: 10px;
  }

  .emoji {
    font-size: 40px;
  }
</style>

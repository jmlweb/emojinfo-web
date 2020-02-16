<script>
  import { setContext } from 'svelte'

  import store, { data, isLoading, menuOpen } from '../store';

  import MainLayout from './MainLayout.svelte';
  import TopBar from "./TopBar/TopBar.svelte"
  import Results from "./Results/Results.svelte"
  import SideBar from "./SideBar/SideBar.svelte"
  import Preloader from './Preloader.svelte'
  import Footer from './Footer.svelte';

  const toggleMenu = () => {
    menuOpen.set(!$menuOpen)
  }

  setContext('appState', {
    ...store,
    toggleMenu,
  })
</script>

<MainLayout>
  <div slot="top">
    <TopBar />
  </div>
  <div slot="body">
    {#if $isLoading}
      <Preloader />
    {:else}
      <Results />
    {/if}
  </div>
  <div slot="footer">
    <Footer />
  </div>
</MainLayout>
<SideBar />

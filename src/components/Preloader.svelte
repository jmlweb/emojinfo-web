<div class="preloader"></div>

<style>
  .preloader {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    animation-name: anim;
    animation-duration: 1.2s;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
    transition: all 0.1s;
  }

  @keyframes anim {
    0% {
      transform: rotate(0deg);
      border: 10px solid var(--color-blue-8);
      border-top: 8px solid var(--color-pink-4);
    }
    25% {
      transform: rotate(90deg);
      border: 11px solid var(--color-blue-8);
      border-top: 7px solid var(--color-pink-5);
    }
    50% {
      border: 10px solid var(--color-blue-8);
      border-top: 8px solid var(--color-pink-4);
    }
    75% {
      transform: rotate(290deg);
      border: 11px solid var(--color-blue-8);
      border-top: 9px solid var(--color-pink-5);
    }
    100% {
      transform: rotate(360deg);
      border: 10px solid var(--color-blue-8);
      border-top: 8px solid var(--color-pink-4);
    }
  }
</style>

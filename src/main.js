import App from './components/App.svelte'

if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
}

const app = new App({
  target: document.body,
})

export default app

import tippy, { followCursor } from 'tippy.js'

function tipz(elem, opts = {}) {
  let tp
  tp = tippy(elem, {
    followCursor: true,
    plugins: [followCursor],
    ...opts,
  })

  return {
    destroy() {
      tp.destroy()
    },
  }
}

export default tipz

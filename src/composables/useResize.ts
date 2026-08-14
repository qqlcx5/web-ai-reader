/**
 * 面板拖拽调节宽度的 composable。
 *
 * 基于 Pointer Events（同时支持鼠标和触摸，h5 兼容）。
 * 用法：把返回的 onPointerDown 绑定到拖拽条元素的 @pointerdown。
 *
 * @param onResize 拖拽过程中的回调，参数是自上次调用以来的水平增量（px）。
 *                 向右拖为正、向左为负。
 */
export function useResize(onResize: (deltaX: number) => void) {
  let startX = 0
  let dragging = false

  function onPointerMove(e: PointerEvent) {
    if (!dragging) return
    const dx = e.clientX - startX
    startX = e.clientX
    if (dx !== 0) onResize(dx)
  }

  function onPointerUp(e: PointerEvent) {
    if (!dragging) return
    dragging = false
    ;(e.target as Element)?.releasePointerCapture?.(e.pointerId)
    document.body.style.userSelect = ''
    document.body.style.cursor = ''
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
  }

  function onPointerDown(e: PointerEvent) {
    e.preventDefault()
    dragging = true
    startX = e.clientX
    // setPointerCapture 让 pointermove 即使移出元素也能触发
    ;(e.target as Element)?.setPointerCapture?.(e.pointerId)
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'col-resize'
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }

  return { onPointerDown }
}

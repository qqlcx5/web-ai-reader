<script lang="ts" setup>
import { useResize } from '@/composables/useResize'

/**
 * 拖拽调节宽度的把手——一条 4px 宽的竖条，hover/active 时高亮。
 * 放在面板的左边缘或右边缘，拖拽时 emit('resize', deltaX)。
 *
 * @prop side  'right' = 放在面板右边缘（向右拖增加宽度）；
 *             'left'  = 放在面板左边缘（向左拖增加宽度，deltaX 取反）。
 */
const props = withDefaults(
  defineProps<{ side?: 'left' | 'right' }>(),
  { side: 'right' },
)
const emit = defineEmits<{ resize: [deltaX: number] }>()

const { onPointerDown } = useResize((dx) => {
  // left 边缘：向左拖（dx<0）应增加宽度，所以取反
  emit('resize', props.side === 'left' ? -dx : dx)
})
</script>

<template>
  <!-- 可作为 absolute 子元素贴在面板边缘：父元素需 relative + 传入定位 class（如 absolute inset-y-0 right-0）。
       也可作为 flex 子元素：不传定位 class，靠 -ml/-mr 偏移叠加在边缘。 -->
  <div
    class="resize-handle group z-20 cursor-col-resize"
    :class="side === 'left' ? '-ml-1' : '-mr-1'"
    style="width: 6px"
    @pointerdown="onPointerDown"
  >
    <!-- 实际可见的拖拽线（2px 居中，留出点击热区） -->
    <div
      class="h-full w-0.5 bg-line transition-colors group-hover:bg-brand/50 group-active:bg-brand"
    />
  </div>
</template>

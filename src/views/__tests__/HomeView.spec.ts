import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HomeView from '@/views/HomeView.vue'

describe('HomeView', () => {
  it('ヒーローの見出しとロゴを描画する', () => {
    const wrapper = mount(HomeView)
    expect(wrapper.text()).toContain('ペットとの暮らしを')
    expect(wrapper.find('img.home__logo').attributes('alt')).toBe('JPetStore')
  })
})

import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import App from '../App.vue'
import { notify } from '../utils/feedback'

describe('feedback global da aplicação', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('exibe uma notificação e a remove automaticamente', async () => {
    const wrapper = mount(App, {
      global: {
        stubs: { RouterView: true },
      },
    })

    notify('Senha redefinida com sucesso.', 'success')
    await nextTick()
    expect(wrapper.text()).toContain('Senha redefinida com sucesso.')

    vi.advanceTimersByTime(5000)
    await nextTick()
    expect(wrapper.text()).not.toContain('Senha redefinida com sucesso.')
    wrapper.unmount()
  })

  it('aplica o estilo de erro às mensagens de falha', async () => {
    const wrapper = mount(App, {
      global: {
        stubs: { RouterView: true },
      },
    })

    notify('Não foi possível redefinir a senha.', 'error')
    await nextTick()

    expect(wrapper.find('.text-red-800').exists()).toBe(true)
    wrapper.unmount()
  })
})

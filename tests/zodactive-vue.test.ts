import { z } from 'zod'
import { type Ref } from 'vue'
import { useForm } from '@/zodactive-vue'
import type { FormFields } from '@zodactive-form/core'
import { describe, expect, it, expectTypeOf } from 'vitest'

const userSchema = z.object({
  name: z.string().min(3, '3!'),
  age: z.number().min(18, '18!'),
  displayName: z.string().min(3, '3!').optional()
})

const matchInitial = {
  name: { value: '', error: '' },
  age: { value: 0, error: '' }
}

const matchInvalid = {
  name: { value: 'a', error: '3!' },
  age: { value: 1, error: '18!' },
  displayName: { value: 'b', error: '3!' }
}

const matchValidNoOptional = {
  name: { value: 'test', error: '' },
  age: { value: 20, error: '' }
}

const matchValidWithOptional = {
  name: { value: 'test', error: '' },
  age: { value: 20, error: '' },
  displayName: { value: 'Test', error: '' }
}

describe('Zodactive Form - Vue', () => {
  it('should return a vue ref() with proper typing', () => {
    const { form, valid } = useForm(userSchema)
    expectTypeOf(form).toMatchTypeOf<Ref<FormFields<z.infer<typeof userSchema>>>>()
    expectTypeOf(valid).toMatchTypeOf<Ref<boolean>>()
  })

  it('should have the value react to calling `assign()`', () => {
    const { form, assign } = useForm(userSchema)
    expect(form).toHaveProperty('value', matchInitial)
    assign('name', 'test')
    assign('age', 20)
    expect(form).toHaveProperty('value', matchValidNoOptional)
  })

  it('should have errors react to calling `validate()`', () => {
    const { form, assign, validate } = useForm(userSchema)
    expect(form.value).toMatchObject(matchInitial)
    assign('name', 'a')
    assign('age', 1)
    assign('displayName', 'b')
    validate()
    expect(form.value).toMatchObject(matchInvalid)
  })

  it('should have valid react to calling `validate()`', () => {
    const { assign, form, valid, validate } = useForm(userSchema)
    expect(valid.value).toBe(false)
    assign('name', 'test')
    assign('age', 20)
    validate()
    expect(valid.value).toBe(true)
    assign('displayName', 'Test')
    validate()
    expect(valid.value).toBe(true)
    expect(form.value).toMatchObject(matchValidWithOptional)
  })
})

<script lang="ts" setup>
import { provide } from 'vue'
import { useForm } from '@/zodactive-vue'

interface Props {
  id?: string
  class?: string
  form: ReturnType<typeof useForm>
}

type Emits = {
  submit: []
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

provide('form', props.form)

const onSubmit = () => {
  if (props.form.validate()) {
    emit('submit')
  }
}
</script>

<template>
  <form @submit.prevent="onSubmit" :id="id" :class="class">
    <slot></slot>
  </form>
</template>

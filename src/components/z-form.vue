<script lang="ts" setup>
import { provide } from "vue";
import type { useForm } from "../zodactive-vue";

interface Props {
  id?: string;
  class?: string;
  hideErrors?: boolean;
  form: ReturnType<typeof useForm>;
}

type Emits = {
  submit: [];
};

const props = withDefaults(defineProps<Props>(), {
  hideErrors: false,
});

const emit = defineEmits<Emits>();

provide("form", props.form);

const onSubmit = () => {
  if (props.form.validate()) {
    emit("submit");
  }
};
</script>

<template>
  <form @submit.prevent="onSubmit" :id="id" :class="props.class">
    <slot></slot>
    <slot name="errors" v-if="!hideErrors" :errors="props.form.formErrors.value">
      <p v-for="error in props.form.formErrors.value" :key="error">{{ error }}</p>
    </slot>
    <slot name="actions">
      <button type="submit">Submit</button>
    </slot>
  </form>
</template>

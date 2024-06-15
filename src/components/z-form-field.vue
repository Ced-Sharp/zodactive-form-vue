<script lang="ts" setup>
import { computed, inject } from "vue";
import type { useForm } from "../zodactive-vue";

interface Props {
  id?: string;
  class?: string;
  name?: string;
  label: string;
  type?: HTMLInputElement["type"];
  path: string | string[];
}

type Emits = {
  input: [text: string];
  change: [text: string];
  click: [];
};

const props = withDefaults(defineProps<Props>(), {
  type: "text",
});

const emits = defineEmits<Emits>();

const context = inject<ReturnType<typeof useForm>>("form");
if (!context)
  throw new Error(
    "ZFormField: Missing form context. Make sure ZFormField is used inside a ZForm component.",
  );

const normalizedPath = computed(() => {
  if (!props.path) throw new Error("ZFormField: Missing path prop!");
  return Array.isArray(props.path) ? props.path : props.path.split(".");
});
const field = computed(
  () =>
    context.getFieldByPath(normalizedPath.value) || { value: "", error: "" },
);

const updateValue = (value: string) => context.assign(props.path, value);

const on = {
  input: (ev: Event) => {
    const val = (ev.target as HTMLInputElement).value;
    updateValue(val);
    emits("input", val);
  },
  change: (ev: Event) => {
    const val = (ev.target as HTMLInputElement).value;
    updateValue(val);
    emits("change", val);
  },
  click: () => emits("click"),
};
</script>

<template>
  <label>
    <slot name="label" :label="label">
      <span>{{ label }}</span>
    </slot>

    <slot
      name="input"
      :id="id"
      :class="props.class"
      :name="name"
      :path="normalizedPath"
      :value="field.value"
      :on="on"
    >
      <input
        :type="type"
        :value="field.value"
        :id="id"
        :class="props.class"
        :name="name"
        @input="on.input"
        @change="on.change"
        @click="on.click"
      />
    </slot>

    <slot name="error" :error="field.error">
      <p v-if="field.error">{{ field.error }}</p>
    </slot>
  </label>
</template>

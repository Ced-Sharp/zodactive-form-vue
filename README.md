[npm]: https://img.shields.io/npm/v/@zodactive-form/vue
[npm-url]: https://www.npmjs.com/package/@zodactive-form/vue
[size]: https://packagephobia.now.sh/badge?p=@zodactive-form/vue
[size-url]: https://packagephobia.now.sh/result?p=@zodactive-form/vue
[libera]: https://img.shields.io/badge/libera-manifesto-lightgrey.svg
[libera-url]: https://liberamanifesto.com

<h1 align="center">Zodactive Form</h1>
<h2 align="center">Vue JS</h2>

Zodactive Form aims to provide very simple form reactivity
based on the Zod validation library. This package wraps
@zodactive-form/core to work with Vue's reactivity and
provides simple example components.

[![npm][npm]][npm-url]
[![size][size]][size-url]
[![libera manifesto][libera]][libera-url]

## Preface

This is not an official Zod library. This is a personal project which is mainly meant
to be used by my other projects. However, you are free to use it if you find it useful.

In addition, this library is under development and not all functionality from zod is
supported yet.

## Description

This Vue library is a wrapper on top of @zodactive-form/core and provides components
to quickly get started with reactive forms validated with Zod.

It provides the following:
 - `useForm(zodSchema)`: A wrapper around `useZodactiveForm()` which uses `ref()` for reactivity;
 - `ZForm`: A simple form component which emits `@submit` only when submitting while the form is valid;
 - `ZFormField`: A simple wrapper around `<input>` which is connected to the `useForm()` and will reactively show errors; 

## Dependencies

@zodactive-form/vue has the following dependencies:
 - [Zod](https://npmjs.com/package/zod): The validation library used by the zodactive-form family;
 - [Vue](https://npmjs.com/package/vue): The reactive ui framework which this package wraps around;
 - [@zodactive-form/core](https://npmjs.com/package/@zodactive-form/core): Contains the main form validation logic;

## Installation

As a simple npm package, it can be installed using your favorite package manager:

```shell
npm install @zodactive-form/vue
```

## Usage

First, create a Zod schema, then pass it to `useForm()` to generate the reactive context. You can then use
this reactive context however which you like:

```vue
<script lang="ts" setup>
    import { z } from 'zod';
    import { useForm } from '@zodactive-form/vue';
    
    const userSchema = z.object({
        username: z.string().min(3),
        password: z.string().min(3),
        confirmPassword: z.string().min(3),
    }).refine(({ password, confirmPassword }) => password === confirmPassword);
    
    const { 
      form, // A ref() containing the whole form, including errors
      valid, // A ref() which is either true or false
      validate, // A function which will check if the values in the form are valid
      assign, // A helper function to assign a value to a specific field of the form
      getFieldFromPath, // A helper function to get the field data from the form structure
      toJson, // A helper function to retrieve the data without reactivity or errors
      clearErrors, // A helper function which removes the error state (but `valid` would still be false)
      clear, // A helper function which resets all the values in the form to the initial values
    } = useForm(userSchema);
</script>
```

In addition to managing a vue-compatible reactive form structure, @zodactive-form/vue provides some very basic
form component which use that reactivity.

NOTE: The `form` attribute of `z-form` is not the `form` ref, but the whole object returned by `useForm()`.
The names are a little confusing and will most probably be changed in the future.

```vue
<script lang="ts" setup>
  import { z } from 'zod';
  import { useForm, ZForm, ZFormField } from '@zodactive-form/vue';

  const userSchema = z.object({
    username: z.string().min(3),
    password: z.string().min(3),
    confirmPassword: z.string().min(3),
  }).refine(({ password, confirmPassword }) => password === confirmPassword);
  
  const form = useForm(userSchema);
  
  const onSubmit = () => {
    const data = form.toJson();
    // Form is valid, ready to fetch() with data!
  }
</script>

<template>
  <z-form :form="form" @submit="onSubmit">
    <z-form-field label="Username" path="username" />
    <z-form-field label="Password" path="password" />
    <z-form-field label="Confirm Password" path="confirmPassword" />
  </z-form>
</template>
```

The provided `<z-form>` is simply `<form><slot /></form>`;

The provided `<z-form-field>` has the following default output:
```vue
<template>
  <label>
    <span>{{ label }}</span>
    <input :value="value" @input="(ev) => assign(props.path, ev.target.value)" />
    <p v-if="error">{{ error }}</p>
  </label>
</template>
```

### Additional Details

 - `form.form`, the `ref()`, contains a structure with both values and errors. The nested values are *NOT REACTIVE*.
To update the form programmatically it is necessary to set `form.form.value` directly. This is what `assign()`
does and it is the recommended way to update the form.
 - The form is validated on creation, but errors are ignored. This is to set the `valid` property based on
the initial data provided to the form;
 - When calling `validate()`, all errors are removed. If errors need to be removed at a different time,
please use `clearErrors()`;
 - The `submit` event of `z-form` internally calls `event.preventDefault()`. In addition, it will only be emitted
when the form is valid. If there are errors, it will not be emitted.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

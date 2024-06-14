import { z } from "zod";
import { ref, type Ref } from "vue";
import { type FormFields, useZodactiveForm } from "@zodactive-form/core";
import type { Obj, ObjEffect } from "@zodactive-form/core/lib/utils";

const getObj = <S extends Obj | ObjEffect>(data: S) => {
	if (data.constructor.name === z.ZodEffects.name)
		return (data as z.ZodEffects<Obj>)._def.schema;
	return data as Obj;
};

export const useForm = <S extends Obj | ObjEffect>(
	schema: S,
	initialData?: z.TypeOf<S>,
) => {
	const createReactive = () => ref();
	const getReactive = <T>(ref: Ref<T>) => ref.value;
	const setReactive = <T>(ref: Ref<T>, value: T) => {
		if (typeof value === "object") {
			ref.value = (Array.isArray(value) ? [...value] : { ...value }) as T;
		} else {
			ref.value = value;
		}
	};

	const { form, formErrors, valid, ...others } = useZodactiveForm<
		S,
		Ref<unknown>
	>(
		{
			createReactive,
			getReactive,
			setReactive,
		},
		schema,
		initialData,
	);

	const schemaData = getObj(schema);
	const newForm = form as Ref<FormFields<z.infer<typeof schemaData>>>;
	const newFormErrors = formErrors as Ref<string[]>;
	const newValid = valid as Ref<boolean>;

	return {
		form: newForm,
		formErrors: newFormErrors,
		valid: newValid,
		...others,
	};
};

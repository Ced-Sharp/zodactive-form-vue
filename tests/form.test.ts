import { z } from "zod";
import { useForm } from "@/zodactive-vue";
import { describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { render, fireEvent } from "@testing-library/vue";
import type { Obj, ObjEffect } from "@zodactive-form/core/lib/utils";

// @ts-ignore
import ZForm from "@/components/z-form.vue";
// @ts-ignore
import ZFormField from "@/components/z-form-field.vue";

const testSchema = z
	.object({
		username: z.string().min(3, "3!"),
		email: z
			.string()
			.refine(
				(v) => /[a-zA-Z0-9_]{2,}@[a-zA-Z0-9_]{2,}\.[a-zA-Z0-9_]{2,}/.test(v),
				"@!",
			),
		password: z.string().min(3, "3!"),
		confirmPassword: z.string().min(3, "3!"),
	})
	.refine(
		({ password, confirmPassword }) => password === confirmPassword,
		"P!",
	);

const TestForm = {
	props: {
		schema: { type: Object, required: false },
		initialData: { type: Object, required: false },
		form: { type: Object, required: false },
		onSubmit: { type: Function, required: false },
	},
	components: {
		ZForm,
		ZFormField,
	},
	setup(props: {
		schema?: Obj | ObjEffect;
		form?: ReturnType<typeof useForm>;
		initialData?: Record<string, unknown>;
		onSubmit?: () => void;
	}) {
		const schema = props.schema || testSchema;
		const initialData = props.initialData;
		const form = props.form || useForm(schema, initialData);
		const onSubmit = props.onSubmit || (() => {});

		return { form, onSubmit };
	},
	template: `
    <z-form :form="form" @submit="onSubmit">
      <z-form-field id="username" label="Username" path="username" />
      <z-form-field id="email" label="Email" path="email" />
      <z-form-field id="password" label="Password" path="password" />
      <z-form-field id="confirm" label="Confirm Password" path="confirmPassword" />
      <button id="submit" type="submit">Register</button>
    </z-form>
  `,
};

describe("Zodactive Form - Vue - Form Component", () => {
	it("should render with default values", () => {
		const { container } = render(TestForm);

		const usernameInput = container.querySelector("#username");
		expect(usernameInput).not.toBeNull();
		expect(usernameInput).toBeInstanceOf(HTMLInputElement);
		expect(usernameInput).toHaveProperty("value", "");

		expect(container.querySelector("#email")).toHaveProperty("value", "");
		expect(container.querySelector("#password")).toHaveProperty("value", "");
		expect(container.querySelector("#confirm")).toHaveProperty("value", "");
	});

	it("should render with initial values", () => {
		const initialData = {
			username: "user",
			email: "user@example.com",
			password: "password",
			confirmPassword: "password",
		};

		const form = useForm(testSchema, initialData);

		const { container } = render(TestForm, {
			props: { form },
		});

		expect(container.querySelector("#username")).toHaveProperty(
			"value",
			"user",
		);
		expect(container.querySelector("#email")).toHaveProperty(
			"value",
			"user@example.com",
		);
		expect(container.querySelector("#password")).toHaveProperty(
			"value",
			"password",
		);
		expect(container.querySelector("#confirm")).toHaveProperty(
			"value",
			"password",
		);

		expect(form.valid.value).toBe(true);
	});

	it("should give errors when validating an invalid form", async () => {
		const form = useForm(testSchema);
		const { container } = render(TestForm, { props: { form } });

		form.validate();
		await nextTick();

		expect(form.valid.value).toBe(false);
		expect(form.form.value.username.error).toBe("3!");

		const username = container.querySelector("#username")!.parentElement!;
		const usernameError = username.querySelector("p");
		expect(usernameError).not.toBeNull();
		expect(usernameError?.innerHTML).toBe("3!");
	});

	it("should update field value when updating the form", async () => {
		const form = useForm(testSchema);
		const { container } = render(TestForm, { props: { form } });

		expect(container.querySelector("#username")).toHaveProperty("value", "");

		form.form.value = {
			...form.form.value,
			username: { value: "test", error: "" },
		};

		await nextTick();

		expect(container.querySelector("#username")).toHaveProperty(
			"value",
			"test",
		);
	});

	it("should update form when field value is updated", async () => {
		const form = useForm(testSchema);
		const { container } = render(TestForm, { props: { form } });

		expect(container.querySelector("#username")).toHaveProperty("value", "");

		await fireEvent.update(container.querySelector("#username")!, "test");

		await nextTick();

		const userField = form.getFieldByPath(["username"]);
		expect(userField).toHaveProperty("value", "test");
	});

	it("should emit submit event if form is valid when submitting", async () => {
		const onSubmit = vi.fn();
		const { container } = render(TestForm, { props: { onSubmit } });
		const submit = container.querySelector("#submit")!;

		expect(onSubmit).not.toHaveBeenCalled();

		await fireEvent.click(submit);
		await nextTick();

		expect(onSubmit).not.toHaveBeenCalled();

		await Promise.all([
			fireEvent.update(container.querySelector("#username")!, "test"),
			fireEvent.update(container.querySelector("#email")!, "test@test.com"),
			fireEvent.update(container.querySelector("#password")!, "test"),
			fireEvent.update(container.querySelector("#confirm")!, "test"),
		]);

		await nextTick();
		await fireEvent.click(submit);
		await nextTick();

		expect(onSubmit).toHaveBeenCalledOnce();
	});
});

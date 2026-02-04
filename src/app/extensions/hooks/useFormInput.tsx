import { useCallback, useEffect, useRef, useState } from "react";

export function useFormInput(requiredFields: string[] = [], data: Record<string, any> = {}) {
  const initialValues = {
    isValid: false,
    values: {} as any,
    touched: {},
    errors: {} as Record<string, any>,
  };
  const [formState, setFormState] = useState(initialValues);
  const isInitialValuesSet = useRef(false);

  const clearErrores = useCallback((errors: Record<string, any>): Record<string, any> => {
    return Object.keys(errors).reduce((acc, key) => {
      if (errors[key] !== null && errors[key] !== undefined) {
        acc[key] = errors[key];
      }
      return acc;
    }, {} as Record<string, any>);
  }, []);

  useEffect(() => {
    if (!isInitialValuesSet.current && data && Object.keys(data).length > 0) {
      setFormState((prevFormState) => ({
        ...prevFormState,
        values: Object.fromEntries(Object.entries(data).filter(([key, value]) => value !== null)),
      }));

      isInitialValuesSet.current = true;
    }
  }, [data]);

  useEffect(() => {
    const cleanedErrors = clearErrores(formState.errors);
    const noErrors = Object.keys(cleanedErrors).length === 0;
    const allFieldsFilled =
      Object.keys(formState.values).length > 0 &&
      Object.keys(formState.values).length >= requiredFields.length &&
      requiredFields.every((element) => Object.keys(formState.values).includes(element));
    setFormState((prevState) => ({
      ...prevState,
      errors: cleanedErrors,
      isValid: noErrors && allFieldsFilled,
    }));
  }, [formState.values, clearErrores]);

  const stractImageField = (field: string, value: string | number) => {
    return field === "image" ? value[0] : value;
  };
  const resetValues = useCallback(() => {
    setFormState({ ...initialValues });
  }, []);

  const handleChange = (field: string, value: string | number) => {
    setFormState((formState) => ({
      ...formState,
      values: {
        ...formState.values,
        [field]: stractImageField(field, value),
      },
      touched: {
        ...formState.touched,
        [field]: true,
      },
      errors: {
        ...formState.errors,
        [field]: requiredFields.includes(field) ? (value ? null : "Field is required") : null,
      },
    }));
  };
  // console.log(
  //   Object.keys(formState.values),
  //   requiredFields,
  //   formState.isValid,
  //   Object.keys(formState.values).length > 0 &&
  //     Object.keys(formState.values).length >= requiredFields.length &&
  //     requiredFields.every((element) =>
  //       Object.keys(formState.values).includes(element),
  //     ),
  // );

  return {
    formState,
    handleChange,
    resetValues,
  };
}

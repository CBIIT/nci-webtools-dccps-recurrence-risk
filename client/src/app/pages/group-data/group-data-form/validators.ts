import { ValidatorFn, AbstractControl, ValidationErrors } from "@angular/forms";

export const seerStatFilesValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const files: File[] = Array.from(control.value || []);
  const isValid =
    files?.find((file: File) => /.dic$/i.test(file.name)) && files?.find((file: File) => /.txt$/i.test(file.name));
  return isValid ? null : { required: true };
};

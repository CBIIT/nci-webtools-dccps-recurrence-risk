import { Directive, HostListener, ElementRef } from "@angular/core";
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from "@angular/forms";

@Directive({
  selector: 'input[type="file"]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: FileValueAccessorDirective,
      multi: true,
    },
  ],
})
export class FileValueAccessorDirective implements ControlValueAccessor {
  @HostListener("change", ["$event.target.files"]) onChange = (_: any) => {};
  @HostListener("blur") onTouched = () => {};

  constructor(private elementRef: ElementRef) {}

  writeValue(value: FileList | File[] | null) {
    const fileInput: HTMLInputElement = this?.elementRef?.nativeElement;
    if (fileInput) {
      if (!value) {
        fileInput.value = "";
      } else if (value instanceof FileList) {
        fileInput.files = value;
      } else {
        const dataTransfer = new DataTransfer();
        for (const file of value) {
          dataTransfer.items.add(file);
        }
        fileInput.files = dataTransfer.files;
      }
    }
  }

  registerOnChange(fn: (_: any) => void) {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void) {
    this.onTouched = fn;
  }
}

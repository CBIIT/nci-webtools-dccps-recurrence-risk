import { Component, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormArray, FormControl, FormGroup } from "@angular/forms";

export type SelectOption = {
  value: any;
  label: string;
  disabled?: boolean;
};

@Component({
  selector: "app-multiselect",
  templateUrl: "./multiselect.component.html",
  styleUrls: ["./multiselect.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: MultiselectComponent,
      multi: true,
    },
  ],
})
export class MultiselectComponent implements OnInit, OnChanges, ControlValueAccessor {
  @Input() controlId: string = "";
  @Input() options: SelectOption[] = [];

  form: FormGroup = new FormGroup({});
  value: any[] = [];
  onChange = (_: any) => {};
  onTouched = (_: any) => {};

  constructor() {}

  ngOnInit(): void {
    this.form.valueChanges.subscribe((formValue) => {
      this.value = Object.entries(formValue)
        .filter(([key, value]) => value)
        .map(([key]) => key);
      this.onChange(this.value);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.options) {
      this.resetOptions(changes.options.currentValue);
    }
  }

  resetOptions(options: SelectOption[]) {
    for (const key in this.form.controls) {
      this.form.removeControl(key, { emitEvent: false });
    }

    options.forEach((option: SelectOption) => {
      this.form.addControl(
        option.value,
        new FormControl({
          value: this.value.includes(option.value),
          disabled: option.disabled,
        }),
        { emitEvent: false },
      );
    });
  }

  writeValue(value: any): void {
    let formValue: any = {};

    // preserve value if no option exists with the specified value
    for (const key of value) {
      if (!this.form.get(key)) {
        this.form.addControl(key, new FormControl({ value: true }));
      }
      formValue[key] = true;
    }

    // set form value based on options
    for (const option of this.options) {
      formValue[option.value] = this.value.includes(option.value);
    }

    this.form.setValue(formValue);
  }

  handleClick(event: Event) {
    // prevent accidental form submissions
    event.preventDefault();
    event.stopImmediatePropagation();
    this.onTouched(true);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}

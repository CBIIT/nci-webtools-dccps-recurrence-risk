import { Component, AfterViewInit, ElementRef, Renderer2, ViewChild, OnDestroy } from "@angular/core";
import { lastValueFrom } from "rxjs";
import { RecurrenceService } from "src/app/services/recurrence/recurrence.service";
import { GroupDataParameters, GroupDataWorkspace } from "./group-data.types";
import { DEFAULT_GROUP_DATA_WORKSPACE } from "./group-data.defaults";

@Component({
  selector: "app-group-data",
  templateUrl: "./group-data.component.html",
  styleUrls: ["./group-data.component.scss"],
})
export class GroupDataComponent implements AfterViewInit, OnDestroy {
  @ViewChild('navElement', { static: false }) navElement!: ElementRef;
  private observer!: MutationObserver;
  private intervalId!: any; // For backup removal

  activeNavId: string = "results";
  error: any = null;
  loading: boolean = false;
  workspace: GroupDataWorkspace = DEFAULT_GROUP_DATA_WORKSPACE;
  alerts: any[] = [];

  constructor(private renderer: Renderer2, private recurrenceRiskService: RecurrenceService) {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.removeAriaSelected();  // Initial removal
      this.observeAriaChanges();  // Continuous monitoring
      this.startIntervalFix();    // Backup method
    });
  }

  private removeAriaSelected() {
    if (!this.navElement) return;
    const navLinks = this.navElement.nativeElement.querySelectorAll('a[ngbNavLink]');
    navLinks.forEach((link: HTMLElement) => {
      this.renderer.removeAttribute(link, 'aria-selected');
    });
  }

  private observeAriaChanges() {
    if (!this.navElement) return;

    this.observer = new MutationObserver(() => {
      this.removeAriaSelected(); // Remove `aria-selected` whenever added
    });

    this.observer.observe(this.navElement.nativeElement, {
      attributes: true,
      subtree: true,
      attributeFilter: ['aria-selected'],
    });
  }

  private startIntervalFix() {
    // Backup method to remove `aria-selected` every 500ms
    this.intervalId = setInterval(() => {
      this.removeAriaSelected();
    }, 500);
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect(); // Stop observing on component destroy
    }
    if (this.intervalId) {
      clearInterval(this.intervalId); // Stop interval on component destroy
    }
  }

  handleReset() {
    this.activeNavId = "results";
    this.workspace = DEFAULT_GROUP_DATA_WORKSPACE;
    this.error = null;
    this.loading = false;
    this.alerts = [];
  }

  async handleSubmit(parameters: GroupDataParameters) {
    try {
      this.handleReset();
      this.loading = true;
      const response$ = this.recurrenceRiskService.getRiskFromGroupData(parameters);
      const results = await lastValueFrom(response$);
      this.workspace = { parameters, results };
    } catch (e) {
      this.error = e;
      this.alerts.push({
        type: "danger",
        message:
          "Your request could not be processed due to an internal error. Please contact the website administrator if this problem persists.",
      });
      console.error(e);
    } finally {
      this.loading = false;
    }
  }

  handleLoadWorkspace(workspace: GroupDataWorkspace) {
    this.workspace = workspace;
  }
}

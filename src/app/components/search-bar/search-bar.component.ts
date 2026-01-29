import { Component, EventEmitter, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { debounceTime, Subject } from "rxjs";

export interface SearchFilters {
  keyword: string;
  priority?: "low" | "medium" | "high" | null;
  startDate?: Date | null;
  endDate?: Date | null;
}

@Component({
  selector: "app-search-bar",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./search-bar.component.html",
})
export class SearchBarComponent {
  @Output() filtersChanged = new EventEmitter<SearchFilters>();

  keyword: string = "";
  selectedPriority: "low" | "medium" | "high" | null = null;
  startDate: string = "";
  endDate: string = "";
  showAdvancedFilters: boolean = false;

  private searchSubject = new Subject<string>();

  constructor() {
    // Debounce keyword search
    this.searchSubject.pipe(debounceTime(300)).subscribe((keyword) => {
      this.emitFilters();
    });
  }

  onKeywordChange(value: string) {
    this.keyword = value;
    this.searchSubject.next(value);
  }

  togglePriority(priority: string) {
    const typedPriority = priority as "low" | "medium" | "high";
    this.onPriorityChange(
      this.selectedPriority === typedPriority ? null : typedPriority,
    );
  }

  onPriorityChange(priority: "low" | "medium" | "high" | null) {
    this.selectedPriority = priority;
    this.emitFilters();
  }

  onDateChange() {
    this.emitFilters();
  }

  toggleAdvancedFilters() {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  clearFilters() {
    this.keyword = "";
    this.selectedPriority = null;
    this.startDate = "";
    this.endDate = "";
    this.emitFilters();
  }

  private emitFilters() {
    const filters: SearchFilters = {
      keyword: this.keyword,
      priority: this.selectedPriority,
      startDate: this.startDate ? new Date(this.startDate) : null,
      endDate: this.endDate ? new Date(this.endDate) : null,
    };
    this.filtersChanged.emit(filters);
  }
}

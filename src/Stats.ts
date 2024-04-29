export class Stats {
  deleted: number = 0;
  updated: number = 0;

  constructor() {
    this.deleted = 0;
    this.updated = 0;
  }

  addDeleted() {
    this.deleted++;
  }

  addUpdated() {
    this.updated++;
  }

  hasBoth() {
    return this.hasDeleted() && this.hasUpdated();
  }

  hasDeleted() {
    return !!this.deleted;
  }

  hasUpdated() {
    return !!this.updated;
  }

  reset() {
    this.deleted = 0;
    this.updated = 0;
  }

  getStatsMessage() {
    if (this.hasBoth()) {
      return `Code Comments: ${this.updated} lines updated and ${this.deleted} lines deleted!`;
    }

    if (this.hasDeleted()) {
      return `Code Comments: ${this.deleted} lines deleted!`;
    }

    if (this.hasUpdated()) {
      return `Code Comments: ${this.updated} lines updated!`;
    }

    return 'Code Comments: nothing has changed';
  }
}

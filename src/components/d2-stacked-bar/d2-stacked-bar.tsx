import { Component, Prop, h } from '@stencil/core';

@Component({
  tag: 'd2-stacked-bar',
  styleUrl: 'd2-stacked-bar.scss',
  shadow: true
})
export class D2AuditBranches {
  @Prop() value1: number;
  @Prop() value2: number;
  @Prop() value3: number;
  @Prop() total: number;
  @Prop() label: string;

  render() {
    const {
      value1,
      value2,
      value3,
      label,
      total = (value1 || 0) + (value2 || 0) + (value3 || 0) || 1
    } = this;

    return (
      <ul class="c-bar">
        <li
          class="c-bar__item"
          style={{ '--bar-item-percent': ((value1 / total) * 100) as any }}
        >
          {/* <div>{value1}</div> */}
          <span class="c-bar__label">{label}</span>
        </li>
        {!Number.isNaN(value2) && (
          <li
            class="c-bar__item"
            style={{ '--bar-item-percent': ((value2 / total) * 100) as any }}
          >
            <div>{value2}</div>
            <span class="c-bar__label">{label}</span>
          </li>
        )}
        {!Number.isNaN(value3) && (
          <li
            class="c-bar__item"
            style={{ '--bar-item-percent': ((value3 / total) * 100) as any }}
          >
            <div>{value3}</div>
            <span class="c-bar__label">{label}</span>
          </li>
        )}
      </ul>
    );
  }
}

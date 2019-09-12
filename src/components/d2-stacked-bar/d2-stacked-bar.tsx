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

  render() {
    const { value1, value2, value3 } = this;
    const total = value1 + value2 + value3;

    return (
      <ul class="c-bar">
        <li>
          <div
            class="c-bar__item"
            style={{ '--bar-item-percent': ((value1 / total) * 100) as any }}
          >
            {value1}
          </div>
        </li>
        <li>
          <div
            class="c-bar__item"
            style={{ '--bar-item-percent': ((value2 / total) * 100) as any }}
          >
            {value2}
          </div>
        </li>
        <li>
          <div
            class="c-bar__item"
            style={{ '--bar-item-percent': ((value3 / total) * 100) as any }}
          >
            {value3}
          </div>
        </li>
      </ul>
    );
  }
}

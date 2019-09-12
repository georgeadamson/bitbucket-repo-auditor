import { Component, Prop, h, State } from '@stencil/core';

@Component({
  tag: 'd2-dashboard-cta',
  styleUrl: 'd2-dashboard-cta.scss',
  shadow: true
})
export class D2DashboardCta {
  @Prop() href;
  @Prop() src;
  @Prop() alt = '';

  @State() show: boolean = false;

  onClick = () => {
    this.show = !this.show;
  };

  onBlur = () => (this.show = false);

  render() {
    const { src, alt, show, onClick, onBlur } = this;

    console.log(this.show);
    return (
      <div>
        <button class="c-dashboard-cta" onClick={onClick} onBlur={onBlur}>
          <img class="c-dashboard-cta__img" src={src} alt=""></img>
          {alt}
        </button>
        {show && (
          <ul class="c-dashboard-cta__locale">
            <li class="c-dashboard-cta__locale--item">
              <a class="c-dashboard-cta__locale--link" href="report.html">
                UK
              </a>
            </li>
            <li class="c-dashboard-cta__locale--item">
              <a class="c-dashboard-cta__locale--link" href="report.html">
                India
              </a>
            </li>
            <li class="c-dashboard-cta__locale--item">
              <a class="c-dashboard-cta__locale--link" href="report.html">
                Spain
              </a>
            </li>
          </ul>
        )}
      </div>
    );
  }
}

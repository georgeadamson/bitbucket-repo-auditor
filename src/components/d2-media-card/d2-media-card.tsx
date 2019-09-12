import { Component, Prop, h } from '@stencil/core';

@Component({
  tag: 'd2-media-card',
  styleUrl: 'd2-media-card.scss',
  shadow: true
})
export class D2AuditBranches {
  @Prop() href;
  @Prop() src;
  @Prop() alt = '';
  @Prop() heading = 'Brand';
  @Prop() body;
  @Prop() actions;
  @Prop() mode;

  render() {
    const { href, src, alt, heading, body, actions } = this;

    return (
      <div class="c-thumb">
        <a class="c-thumb__link" href={href}>
          <div
            class={`c-thumb__img-wrapper c-thumb__img-wrapper--${heading.toLowerCase()}`}
          >
            <img class="c-thumb__img" src={src} alt={alt} />
          </div>
          <h3 class="c-thumb__heading">{heading}</h3>
          <p class="c-thumb__body">{body}</p>
          <p class="c-thumb__actions">{actions}</p>
        </a>
      </div>
    );
  }
}

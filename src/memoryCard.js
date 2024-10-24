import { LitElement, html, css } from 'lit';

export class MemoryCard extends LitElement {
    static properties = {
        name: { type: String },
        flipped: { type: Boolean }
    };

    static styles = css`
    .card {
      width: 100%;
      height: 100%;
      border: 1px solid #ccc;
      position: relative;
      background-color: var(--card-bg-color, #f0f0f0);
    }
    img {
      width: 100%;
      height: 100%;
      position: absolute;
    }
  `;

    constructor() {
        super();
        this.name = '';
        this.flipped = false;
    }

    render() {
        return html`
      <div class="card" style="background-color: ${this.flipped ? 'white' : '#f0f0f0'}">
        ${this.flipped ? html`<img src="img/${this.name}.webp" alt="${this.name}">` : ''}
      </div>
    `;
    }
}

customElements.define('memory-card', MemoryCard);

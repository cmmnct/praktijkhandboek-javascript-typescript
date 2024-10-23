import { LitElement, html, css } from "lit";
import { property, customElement } from "lit/decorators.js";

@customElement("memory-card")
export class MemoryCard extends LitElement {
  @property({ type: String }) name = "";
  @property({ type: String }) set = "";
  @property({ type: Boolean }) exposed = false;

  static styles = css`
    :host {
      display: block;
      position: relative;
      perspective: 1000px;
    }
    .card {
      width: 100%;
      height: 100%;
      position: absolute;
      transition: transform 0.6s;
      transform-style: preserve-3d;
    }
    .card.exposed {
      transform: rotateY(180deg);
    }
    .card .front,
    .card .back {
      position: absolute;
      width: 100%;
      height: 100%;
      backface-visibility: hidden;
    }
    .card .front {
      background-color: #bbb;
      color: black;
    }
    .card .back {
      background-color: white;
      transform: rotateY(180deg);
    }
    .card .back img {
      width:100%
    }
  `;

  render() {
    return html`
      <div class="card ${this.exposed ? "exposed" : ""}">
        <div class="front"></div>
        <div class="back">
          <img src="/assets/img/${this.name}.webp" alt="${this.name}" />
        </div>
      </div>
    `;
  }
}

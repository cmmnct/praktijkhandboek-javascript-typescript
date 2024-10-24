export class MemoryCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._name = '';
        this._flipped = false;
        this.render();
    }

    static get observedAttributes() {
        return ['name', 'flipped'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'name') {
            this._name = newValue;
        } else if (name === 'flipped') {
            this._flipped = newValue === 'true';
        }
        this.render();
    }

    render() {
        const content = this._flipped ? `<img src="img/${this._name}.webp" alt="${this._name}">` : '';
        const bgColor = this._flipped ? 'white' : '#f0f0f0';

        this.shadowRoot.innerHTML = `
            <style>
                .card {
                    width: 100%;
                    height: 100%;
                    border: 1px solid #ccc;
                    position: relative;
                    background-color: ${bgColor};
                }
                img {
                    width: 100%;
                    height: 100%;
                    position: absolute;
                }
            </style>
            <div class="card">${content}</div>
        `;
    }
}

customElements.define('memory-card', MemoryCard);

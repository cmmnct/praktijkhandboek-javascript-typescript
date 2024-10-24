import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { container } from "../../inversify.config";
import { StateService } from "../services/stateService";
import { TYPES } from '../../inversify.config';

@customElement("login-component")
export class LoginComponent extends LitElement {
    @property({ type: String }) email: string = "";
    @property({ type: String }) password: string = "";
    @property({ type: String }) message: string = "";
    stateService: StateService;
    static styles = css`
                    .popup {
                    width: 80vw;
                    max-width: 1024px;
                    }
                    .overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: 999;
                    }
                    .container {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: white;
                    padding: 20px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                    z-index: 1000;
                    display: flex;
                    flex-direction: column;
                    width: 300px;
                    margin: auto;
                    padding: 1em;
                    border: 1px solid #ccc;
                    border-radius: 10px;
                    }
                    .container input {
                    margin: 0.5em 0;
                    padding: 0.5em;
                    font-size: 1em;
                    }
                    .container button {
                    margin: 0.5em 0;
                    padding: 0.5em;
                    font-size: 1em;
                    cursor: pointer;
                    }
                    .message {
                    margin: 0.5em 0;
                    color: red;
                    }
                    `;
    constructor() {
        super();
        this.stateService = container.get<StateService>(TYPES.StateService);
    }

    render() {
        return html`
                <div class="overlay">
                <div class="container">
                <h2>Login</h2>
                <input
                type="email"
                placeholder="Email"
                .value=${this.email}
                @input=${(e: Event) =>
                                (this.email = (e.target as HTMLInputElement).value)}
                />
                <input
                type="password"
                placeholder="Password"
                .value=${this.password}
                @input=${(e: Event) =>
                                (this.password = (e.target as HTMLInputElement).value)}
                />
                <button @click="${this.login}">Login</button>
                <button @click="${this.register}">Register</button>
                <button @click="${this.cancel}">Cancel</button>
                <div class="message">${this.message}</div>
                </div>
                </div>
                `;
    }
    cancel() {
        this.dispatchEvent(
            new CustomEvent("cancel", { bubbles: true, composed: true })
        );
    }
    async login() {
        this.message = await this.stateService.login(this.email, this.password);
    }
    async register() {
        this.message = await this.stateService.register(this.email, this.password);
    }
}
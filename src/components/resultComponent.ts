import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Result } from "../models/models";
import { repeat } from "lit/directives/repeat.js";
import Chart, { ChartConfiguration } from "chart.js/auto";
import "chartjs-adapter-date-fns";

@customElement("result-component")
export class ResultComponent extends LitElement {
    @property({ type: Array }) results: Result[] = [];
    @property({ type: String }) displayMode: "average" | "best" = "average";
    @property({ type: String }) selectedMonth: string = "";

    private chart: Chart | null = null;

    static styles = css`
.popup {
position: fixed;
top: 50%;
left: 50%;
transform: translate(-50%, -50%);
background: white;
padding: 20px;
box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
z-index: 1000;
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
.chart-container {
width: 100%;
min-height: 50vh
}
button {
padding: 10px;
cursor: pointer;
}
`;

    render() {
        const months = this.getAvailableMonths();
        return html`
                    <div class="overlay" @click="${this.closePopup}"></div>
                    <div class="popup">
                    <div>
                    <label for="displayMode">Weergave:</label>
                    <select id="displayMode" @change="${this.changeDisplayMode}">
                    <option
                    value="average"
                    ?selected="${this.displayMode === "average"}"
                    >
                    Gemiddelde
                    </option>
                    <option value="best" ?selected="${this.displayMode === "best"}">
                    Beste score
                    </option>
                    </select>
                    <label for="selectedMonth">Maand:</label>
                    <select id="selectedMonth" @change="${this.changeMonth}">
                    ${months.map(
                            (month) => html`<option value="${month}">${month}</option>`
                        )}
                    </select>
                    </div>
                    <div class="chart-container">
                    <canvas id="resultsChart"></canvas>
                    </div>
                    <button @click="${this.closePopup}">Sluiten</button>
                    </div>
                    `;
            }

    updated() {
        this.renderChart();
    }

    connectedCallback() {
        super.connectedCallback();
        this.selectedMonth = this.getMostRecentMonth();
    }

    getMostRecentMonth() {
        const months = this.getAvailableMonths();
        return months.length > 0 ? months[months.length - 1] : "";
    }

    changeMonth(e: Event) {
        this.selectedMonth = (e.target as HTMLSelectElement).value;
        this.requestUpdate();
    }

    getAvailableMonths() {
        const months = Array.from(
            new Set(
                this.results.map((result) => {
                    const date = new Date(result.date);
                    return date.toLocaleString("default", {
                        year: "numeric",
                        month: "long",
                    });
                })
            )
        );
        return months;
    }

    changeDisplayMode(e: Event) {
        this.displayMode = (e.target as HTMLSelectElement).value as
            | "average"
            | "best";
        this.requestUpdate();
    }

    renderChart() {
        const ctx = this.shadowRoot?.getElementById(
            "resultsChart"
        ) as HTMLCanvasElement;
        if (!ctx) return;
        const resultsForSelectedMonth = this.results.filter((result) => {
            const date = new Date(result.date);
            const month = date.toLocaleString("default", {
                year: "numeric",
                month: "long",
            });
            return month === this.selectedMonth;
        });
        const uniqueDates = Array.from(
            new Set(
                resultsForSelectedMonth.map((result) =>
                    new Date(result.date).toLocaleDateString()
                )
            )
        );
        const mappedData = (results: Result[], gridSize: number) =>
            uniqueDates.map((date) => {
                const resultsOnDate = results.filter(
                    (result) =>
                        result.gridSize === gridSize &&
                        new Date(result.date).toLocaleDateString() === date
                );
                if (this.displayMode === "average") {
                    return (
                        resultsOnDate.reduce((sum, result) => sum + result.score, 0) /
                        resultsOnDate.length
                    );
                } else {
                    return Math.min(...resultsOnDate.map((result) => result.score));
                }
            });
        const data = {
            labels: uniqueDates,
            datasets: [
                {
                    label: "4 x 4",
                    data: mappedData(resultsForSelectedMonth, 16),
                    fill: false,
                    borderColor: "rgba(75, 192, 192, 1)",
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                },
                {
                    label: "5 x 5",
                    data: mappedData(resultsForSelectedMonth, 25),
                    fill: false,
                    borderColor: "rgba(192, 75, 192, 1)",
                    backgroundColor: "rgba(192, 75, 192, 0.2)",
                },
                {
                    label: "6 x 6",
                    data: mappedData(resultsForSelectedMonth, 36),
                    fill: false,
                    borderColor: "rgba(192, 192, 75, 1)",
                    backgroundColor: "rgba(192, 192, 75, 0.2)",
                },
            ],
        };
        if (this.chart) {
            this.chart.destroy();
        }
        const config = {
            type: "line",
            data: data,
            options: {
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: this.selectedMonth,
                        },
                    },
                    y: {
                        min: 0,
                        max: 10,
                        title: {
                            display: true,
                            text:
                                this.displayMode === "average"
                                    ? "Gemiddelde score"
                                    : "Beste score",
                        },
                    },
                },
            },
        };
        this.chart = new Chart(ctx, config as ChartConfiguration);
    }


    closePopup() {
        this.dispatchEvent(
            new CustomEvent("close-popup", { bubbles: true, composed: true })
        );
    }
}


<template>
    <ion-modal :is-open="isOpen" @didDismiss="closeModal">
        <ion-header>
            <ion-toolbar>
                <ion-title>Resultaten</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="closeModal">Sluiten</ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content>
            <div>
                <ion-item>
                    <ion-label>Weergave</ion-label>
                    <ion-select v-model="displayMode" interface="popover">
                        <ion-select-option value="average">Gemiddelde</ion-select-option>
                        <ion-select-option value="best">Beste score</ion-select-option>
                    </ion-select>
                </ion-item>

                <ion-item>
                    <ion-label>Maand</ion-label>
                    <ion-select v-model="selectedMonth" interface="popover">
                        <ion-select-option v-for="month in availableMonths" :key="month" :value="month">
                            {{ month }}
                        </ion-select-option>
                    </ion-select>
                </ion-item>
            </div>


            <div class="chart-container">
                <canvas ref="canvasRef"></canvas>
            </div>
        </ion-content>
    </ion-modal>
</template>

<script setup lang="ts">
import { ref, watchEffect, onMounted, computed, defineEmits } from 'vue';
import { Chart, ChartConfiguration, CategoryScale, LinearScale, LineController, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { Result } from '@/models/models';

// Register de Chart.js componenten die je gebruikt
Chart.register(CategoryScale, LinearScale, LineController, PointElement, LineElement, Title, Tooltip, Legend);


const props = defineProps({
    results: {
        type: Array as () => Result[],
        default: () => []
    },
    isOpen: Boolean,
});

const emits = defineEmits(['close']);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const displayMode = ref('average');
const selectedMonth = ref('');
const chartInstance = ref<Chart | null>(null);

// Beschikbare maanden voor de dropdown
const availableMonths = computed(() => {
    return [...new Set(props.results.map(result => {
        const date = new Date(result.date);
        return date.toLocaleString("default", { year: "numeric", month: "long" });
    }))];
});

// Sluit de modal en vernietig de chart-instance
const closeModal = () => {
    if (chartInstance.value) {
        chartInstance.value.destroy();
        chartInstance.value = null;
    }
    emits('close');
};

// Luister naar veranderingen in de grafiekgegevens of modal state
watchEffect(() => {
    if (props.isOpen) {
        renderChart();
    } else {
        if (chartInstance.value) {
            chartInstance.value.destroy();
            chartInstance.value = null;
        }
    }
});

onMounted(() => {
    selectedMonth.value = availableMonths.value[availableMonths.value.length - 1] || '';
    renderChart();
});

function renderChart() {
    const ctx = canvasRef.value;
    if (!ctx) return;

    const resultsForSelectedMonth = props.results.filter(result => {
        const date = new Date(result.date);
        const month = date.toLocaleString("default", { year: "numeric", month: "long" });
        return month === selectedMonth.value;
    });

    const uniqueDates = [...new Set(resultsForSelectedMonth.map(result => new Date(result.date).toLocaleDateString()))];

    const mappedData = (gridSize: number) =>
        uniqueDates.map(date => {
            const resultsOnDate = resultsForSelectedMonth.filter(result =>
                result.gridSize === gridSize &&
                new Date(result.date).toLocaleDateString() === date
            );

            return displayMode.value === "average"
                ? resultsOnDate.reduce((sum, result) => sum + result.attempts, 0) / resultsOnDate.length
                : Math.min(...resultsOnDate.map(result => result.attempts));
        });

    const data = {
        labels: uniqueDates,
        datasets: [
            { label: "4 x 4", data: mappedData(16), borderColor: "rgba(75, 192, 192, 1)", backgroundColor: "rgba(75, 192, 192, 0.2)" },
            { label: "5 x 5", data: mappedData(25), borderColor: "rgba(192, 75, 192, 1)", backgroundColor: "rgba(192, 75, 192, 0.2)" },
            { label: "6 x 6", data: mappedData(36), borderColor: "rgba(192, 192, 75, 1)", backgroundColor: "rgba(192, 192, 75, 0.2)" }
        ]
    };

    if (chartInstance.value) {
        chartInstance.value.destroy();
    }

    const config: ChartConfiguration = {
        type: "line",
        data: data,
        options: {
            scales: {
                x: { title: { display: true, text: "Datum" }, type: 'category' },
                y: { title: { display: true, text: displayMode.value === "average" ? "Gemiddelde score" : "Beste score" } }
            }
        }
    };

    chartInstance.value = new Chart(ctx, config);
}
</script>

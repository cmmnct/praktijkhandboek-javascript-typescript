<template>
    <div class="card" :class="{ exposed: card.exposed }">
      <div class="card-inner">
        <div class="card-front"></div>
        <div class="card-back"><img :src="`/assets/img/${card.set}.webp`" :alt="card.name" /></div>
      </div>
    </div>
  </template>
  
  <script lang="ts" setup>
  import type { Card } from '../models/models.ts';
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const props = defineProps<{
    card: Card;
  }>();
  </script>
  
  <style scoped>
  .card {
    perspective: 1000px;
    width: 100%;
  }
  
  .card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    transition: transform 0.6s;
    transform-style: preserve-3d;
    aspect-ratio: 1/1;
  }
  
  .card.exposed .card-inner {
    transform: rotateY(180deg);
  }
  
  .card-front,
  .card-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }
  
  .card-front {
    background-color: #bbb;
    color: black;
  }
  
  .card-back {
    transform: rotateY(180deg);
  }
  </style>
  
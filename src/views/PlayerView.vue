<template>
    <div class="container">
      <div class="controls">
        <button @click="toggle3DModel">{{ toggle3DModelText }}</button>
        <form @submit.prevent="submitLatLong">
          <input v-model="latitude" placeholder="纬度" required />
          <input v-model="longitude" placeholder="经度" required />
          <br />
          <button type="submit">提交</button>
        </form>
        <form @submit.prevent="submitOffsets">
          <input v-model.number="offsetX" placeholder="偏移数值 X" required />
          <input v-model.number="offsetY" placeholder="偏移数值 Y" required />
          <input v-model.number="offsetZ" placeholder="偏移数值 Z" required />
          <br />
          <button type="submit">提交</button>
        </form>
      </div>
      <div class="data-display">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.id">
              <td>{{ item.id }}</td>
              <td>{{ item.name }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>
  
  <script>
  import { Config, PixelStreaming } from '@epicgames-ps/lib-pixelstreamingfrontend-ue5.3';
  import { Application, PixelStreamingApplicationStyle } from '@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.3';
  
  export default {
    name: 'PlayerView',
    data() {
      return {
        toggle3DModelText: '开启3D模型',
        is3DModelOn: false,
        latitude: '',
        longitude: '',
        offsetX: 0,
        offsetY: 0,
        offsetZ: 0,
        items: [],
      };
    },
    mounted() {
      const PixelStreamingApplicationStyles = new PixelStreamingApplicationStyle();
      PixelStreamingApplicationStyles.applyStyleSheet();
  
      const config = new Config({ useUrlParams: true });
      const stream = new PixelStreaming(config);
      const application = new Application({
        stream,
        onColorModeChanged: (isLightMode) => PixelStreamingApplicationStyles.setColorMode(isLightMode)
      });
  
      document.body.appendChild(application.rootElement);
    },
    methods: {
      toggle3DModel() {
        this.is3DModelOn = !this.is3DModelOn;
        this.toggle3DModelText = this.is3DModelOn ? '关闭3D模型' : '开启3D模型';
      },
      submitLatLong() {
        // Assume sending to the backend
        console.log(`Submitted Latitude and Longitude: ${this.latitude}, ${this.longitude}`);
      },
      submitOffsets() {
        // Assume sending to the backend
        console.log(`Submitted Offsets: X=${this.offsetX}, Y=${this.offsetY}, Z=${this.offsetZ}`);
      }
    }
  }
  </script>
  
  <style>
  body {
    width: 100vw;
    height: 100vh;
    min-height: -webkit-fill-available;
    font-family: 'Montserrat';
    margin: 0;
  }
  .container {
    display: flex;
    justify-content: space-between;
    align-items: flex-start; /* Adjust alignment */
    width: 100vw;
    height: 25vh;
  }
  .controls {
    flex: 0 0 300px; /* No grow, no shrink, fixed width */
    padding: 20px;
  }
  .data-display {
    flex: 1;
    padding: 20px;
    text-align: left;
  }
  table {
    width: 100%;
    border-collapse: collapse;
  }
  table, th, td {
    border: 1px solid black;
  }
  th, td {
    padding: 8px;
  }
  </style>
  
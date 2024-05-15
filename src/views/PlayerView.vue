<template>
    <div class="container">
      <div class="controls">
        
        <form @submit.prevent="submit3dtiles">
          <input v-model="filePath" placeholder="文件路径" required />
          <input v-model="latitude" placeholder="纬度" required />
          <input v-model="longitude" placeholder="经度" required />
          <input v-model="offsetX" placeholder="偏移数值 X" required />
          <input v-model="offsetY" placeholder="偏移数值 Y" required />
          <input v-model="offsetZ" placeholder="偏移数值 Z" required />
          <br />
          <button type="submit">经纬度提交</button>
        </form>
        <button @click="toggle3DModel">{{ toggle3DModelText }}</button>
      </div>
      <div class="data-display">
        <form @submit.prevent="createLabel">
          <input v-model="LabelX" placeholder="标签 X" required />
          <input v-model="LabelY" placeholder="标签 Y" required />
          <input v-model="LabelZ" placeholder="标签 Z" required />
          <input v-model="LabelText" placeholder="标签内容" required />
          <br />
          <button type="submit">标签创建</button>
        </form>
        <form @submit.prevent="createCamera">
          <input v-model="CameraX" placeholder="相机 X" required />
          <input v-model="CameraY" placeholder="相机 Y" required />
          <input v-model="CameraZ" placeholder="相机 Z" required />
          <input v-model="RotateLeftRight" placeholder="左右旋转角度" required />
          <input v-model="RotateUpDown" placeholder="上下旋转角度" required />
          <br />
          <button type="submit">相机位置更新</button>
        </form>
        <form @submit.prevent="adjustSpeed">
          <input v-model="Speed" placeholder="漫游速度" required />
          <br />
          <button type="submit">漫游速度更新</button>
        </form>
        <button @click="toggleWhiteModel">{{ whiteModelCameraText }}</button>
        <button @click="toggleTilesModel">{{ tilesModelCameraText }}</button>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>
            <td>{{ item.id}}</td>
            <td>{{ item.name }}</td>
          </tbody>
        </table>
      </div>
    </div>
  </template>
  
  <script>
import { Config, PixelStreaming,Flags,TextParameters} from '@epicgames-ps/lib-pixelstreamingfrontend-ue5.3';
import { Application, PixelStreamingApplicationStyle, UIElementCreationMode} from '@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.3';
// import { is } from 'core-js/core/object';

export default {
  name: 'PlayerView',
  data() {
    return {
      toggle3DModelText: '开启3D模型',
      is3DModelOn: false,
      isWhiteModelOn: false,
      isTilesModelOn: false,
      filePath: '',
      latitude: '',
      longitude: '',
      offsetX: '',
      offsetY: '',
      offsetZ: '',
      LabelX: '',
      LabelY: '',
      LabelZ: '',
      CameraX: '',
      CameraY: '',
      CameraZ: '',
      RotateLeftRight: '',
      RotateUpDown: '',
      LabelText: '',
      whiteModelCameraText: '白模摄像机位置',
      tilesModelCameraText: '倾斜摄影摄像机位置',
      Speed: '',
      item: { id: null, name: null },
      stream: null,
    };
  },
  mounted() {
    this.initializePixelStreaming();
  },
  methods: {
    initializePixelStreaming() {
    const PixelStreamingApplicationStyles = new PixelStreamingApplicationStyle();
    PixelStreamingApplicationStyles.applyStyleSheet();

      const config = new Config({ useUrlParams: true});
      config.setFlagEnabled(Flags.HoveringMouseMode, true);
      config.setFlagEnabled(Flags.FakeMouseWithTouches, true);
      config.setFlagEnabled(Flags.MatchViewportResolution, true);
      config.setTextSetting(TextParameters.SignallingServerUrl, 'ws://localhost:80');

      this.stream = new PixelStreaming(config);
      const application = new Application({
        stream: this.stream,
        onColorModeChanged: (isLightMode) => new PixelStreamingApplicationStyle().setColorMode(isLightMode),
        settingsPanelConfig: { 
          isEnabled : true,
          visibilityButtonConfig : { creationMode : UIElementCreationMode.CreateDefaultElement }
        },
        statsPanelConfig: { 
          isEnabled : false,
          visibilityButtonConfig : { creationMode : UIElementCreationMode.Disable }
        },
        fullScreenControlsConfig: { 
          isEnabled : false,
          visibilityButtonConfig : { creationMode : UIElementCreationMode.CreateDefaultElement }
      }
    }
    );
      document.body.appendChild(application.rootElement);

      // 假设 addResponseEventListener 是一个用于监听数据的方法
      this.stream.addResponseEventListener('handle_responses', this.handleDataFromUE);
    },

    handleDataFromUE(data) {
  console.log("Received data:", data);
  try {
    // 确认 data 是字符串并尝试解析它
    const receivedData = typeof data === 'string' ? JSON.parse(data) : data;

    // 更新 item 对象，仅更改接收到的字段
    if (receivedData.id) {
      this.item.id = receivedData.id;
    }
    if (receivedData.name) {
      this.item.name = receivedData.name;
    }

    console.log("Updated item:", this.item);
  } catch (error) {
    console.error("Error parsing JSON:", error);
  }
},
    toggle3DModel() {
      this.is3DModelOn = !this.is3DModelOn;
      this.toggle3DModelText = this.is3DModelOn ? '关闭3D模型' : '开启3D模型';
      this.sendCommandToUE({ command: this.is3DModelOn ? 'open3DModel' : 'close3DModel' });
    },

    toggleWhiteModel() {
      this.isWhiteModelOn = true;
      // this.whiteModelCameraText = this.isWhiteModelOn ? '去白模' : '回原点';
      this.sendCommandToUE({ command: this.isWhiteModelOn ? 'openWhiteModel' : 'closeWhiteModel' });
    },

    toggleTilesModel() {
      this.isTilesModelOn = true;
      // this.tilesModelCameraText = this.isTilesModelOn ? '去倾斜摄影' : '回原点';
      this.sendCommandToUE({ command: this.isTilesModelOn ? 'openTiles' : 'closeTiles' });
    },
    
    sendCommandToUE(descriptor) {
      if (this.stream && typeof this.stream.emitUIInteraction === 'function') {
        this.stream.emitUIInteraction(descriptor);
      } else {
        console.error('Stream not initialized or emitUIInteraction not available.');
      }
    },
    submit3dtiles() {
      const descriptor = {
        command: 'updateLatLong',
        filePath: this.filePath,
        latitude: this.latitude,
        longitude: this.longitude,
        offsetX: this.offsetX,
        offsetY: this.offsetY,
        offsetZ: this.offsetZ
      };
      this.sendCommandToUE(descriptor);
    },
    createLabel() {
      const descriptor = {
        command: 'createLabel',
        labelX: this.LabelX,
        labelY: this.LabelY,
        labelZ: this.LabelZ,
        labelText: this.LabelText
      };
      this.sendCommandToUE(descriptor);
    },
    createCamera() {
      const descriptor = {
        command: 'createCamera',
        cameraX: this.CameraX,
        cameraY: this.CameraY,
        cameraZ: this.CameraZ,
        rotateLeftRight: this.RotateLeftRight,
        rotateUpDown: this.RotateUpDown
      };
      this.sendCommandToUE(descriptor);
    },
    adjustSpeed() {
      const descriptor = {
        command: 'adjustSpeed',
        speed: this.Speed
      };
      this.sendCommandToUE(descriptor);
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
    height: 40vh;
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
  
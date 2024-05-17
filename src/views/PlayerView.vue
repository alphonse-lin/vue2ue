<template>
  <div class="container">
    <div class="controls">

      <form @submit.prevent="submit3dtiles(filePath, modelCode, latitude, longitude, height, offsetX, offsetY, offsetZ)">
        <input v-model="filePath" placeholder="文件路径" required />
        <input v-model="modelCode" placeholder="模型代码" required />
        <input v-model="latitude" placeholder="纬度" required />
        <input v-model="longitude" placeholder="经度" required />
        <input v-model="height" placeholder="高度" required />
        <input v-model="offsetX" placeholder="偏移数值 X" required />
        <input v-model="offsetY" placeholder="偏移数值 Y" required />
        <input v-model="offsetZ" placeholder="偏移数值 Z" required />
        <br />
        <button type="submit">3dtiles信息提交</button>
      </form>
      <br />
      <form @submit.prevent="toggleModel(modelCode_vis)">
        <input v-model="modelCode_vis" placeholder="模型代码" required />
        <br />
        <button type="submit">{{ toggleModelText }}</button>
      </form>
    </div>
    <div class="data-display">
      <form @submit.prevent="createLabel(labelX, labelY, labelZ, labelText)">
        <input v-model="labelX" placeholder="标签 X" required />
        <input v-model="labelY" placeholder="标签 Y" required />
        <input v-model="labelZ" placeholder="标签 Z" required />
        <input v-model="labelText" placeholder="标签内容" required />
        <br />
        <button type="submit">标签创建</button>
      </form>
      <br />
      <form @submit.prevent="createCamera(cameraX, cameraY, cameraZ, rotateLeftRight, rotateUpDown)">
        <input v-model="cameraX" placeholder="相机 X" required />
        <input v-model="cameraY" placeholder="相机 Y" required />
        <input v-model="cameraZ" placeholder="相机 Z" required />
        <input v-model="rotateLeftRight" placeholder="左右旋转角度" required />
        <input v-model="rotateUpDown" placeholder="上下旋转角度" required />
        <br />
        <button type="submit">相机位置更新</button>
      </form>
      <table>
        <thead>
          <tr>
            <th>Camera_Lat</th>
            <th>Camera_Lon</th>
          </tr>
        </thead>
        <tbody>
          <td>{{ camera_item.camera_lat }}</td>
          <td>{{ camera_item.camera_lon }}</td>
        </tbody>
      </table>
      <br />
      <form @submit.prevent="adjustSpeed(speed)">
        <input v-model="speed" placeholder="漫游速度" required />
        <br />
        <button type="submit">漫游速度更新</button>
      </form>
      <br />
      <button @click="toggleWhiteModel">{{ whiteModelCameraText }}</button>
      <button @click="toggleTilesModel">{{ tilesModelCameraText }}</button>
      <br />
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          <td>{{ item.id }}</td>
          <td>{{ item.name }}</td>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { Config, PixelStreaming, Flags, TextParameters } from '@epicgames-ps/lib-pixelstreamingfrontend-ue5.3';
import { Application, PixelStreamingApplicationStyle, UIElementCreationMode } from '@epicgames-ps/lib-pixelstreamingfrontend-ui-ue5.3';
// import { is } from 'core-js/core/object';

export default {
  name: 'PlayerView',
  data() {
    return {
      toggleModelText: '切换模型',
      is3DModelOn: false,
      isWhiteModelOn: false,
      isTilesModelOn: false,
      filePath: '',
      latitude: '',
      longitude: '',
      height: '',
      offsetX: '',
      offsetY: '',
      offsetZ: '',
      labelX: '',
      labelY: '',
      labelZ: '',
      cameraX: '',
      cameraY: '',
      cameraZ: '',
      modelCode: '',
      modelCode_vis: '',
      rotateLeftRight: '',
      rotateUpDown: '',
      labelText: '',
      whiteModelCameraText: '白模摄像机位置',
      tilesModelCameraText: '倾斜摄影摄像机位置',
      speed: '',
      item: { id: null, name: null },
      camera_item: { camera_lat: null, camera_lon: null },
      stream: null,
    };
  },
  mounted() {
    this.initializePixelStreaming();
  },
  methods: {
    //#region 基础功能
    // 初始化PixelStreaming
    initializePixelStreaming() {
      const PixelStreamingApplicationStyles = new PixelStreamingApplicationStyle();
      PixelStreamingApplicationStyles.applyStyleSheet();

      const config = new Config({ useUrlParams: true });
      config.setFlagEnabled(Flags.HoveringMouseMode, true);
      config.setFlagEnabled(Flags.FakeMouseWithTouches, true);
      config.setFlagEnabled(Flags.MatchViewportResolution, true);
      config.setTextSetting(TextParameters.SignallingServerUrl, 'ws://localhost:80');

      this.stream = new PixelStreaming(config);
      const application = new Application({
        stream: this.stream,
        onColorModeChanged: (isLightMode) => new PixelStreamingApplicationStyle().setColorMode(isLightMode),
        settingsPanelConfig: {
          isEnabled: true,
          visibilityButtonConfig: { creationMode: UIElementCreationMode.CreateDefaultElement }
        },
        statsPanelConfig: {
          isEnabled: false,
          visibilityButtonConfig: { creationMode: UIElementCreationMode.Disable }
        },
        fullScreenControlsConfig: {
          isEnabled: false,
          visibilityButtonConfig: { creationMode: UIElementCreationMode.CreateDefaultElement }
        }
      }
      );
      document.body.appendChild(application.rootElement);

      // 假设 addResponseEventListener 是一个用于监听数据的方法
      this.stream.addResponseEventListener('handle_responses', this.handleDataFromUE);
    },
    // 处理来自UE的数据
    handleDataFromUE(data) {
      // console.log("Received data:", data);
      try {
        // 确认 data 是字符串并尝试解析它
        const receivedData = typeof data === 'string' ? JSON.parse(data) : data;
        // console.log("Received data:", receivedData);
        // 更新 item 对象，仅更改接收到的字段
        if (receivedData.id) {
          this.item.id = receivedData.id;
        }
        if (receivedData.name) {
          this.item.name = receivedData.name;
        }
        if (receivedData.labelX) {
          this.camera_item.camera_lat = receivedData.labelX;
        }
        if (receivedData.labelY) {
          this.camera_item.camera_lon = receivedData.labelY;
        }

        console.log("Updated item:", this.camera_item);
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    },
    // 发送指令到UE
    sendCommandToUE(descriptor) {
      if (this.stream && typeof this.stream.emitUIInteraction === 'function') {
        this.stream.emitUIInteraction(descriptor);
      } else {
        console.error('Stream not initialized or emitUIInteraction not available.');
      }
    },
    //#endregion

    //#region 业务功能
    // 基于modelCode，切换模型
    toggleModel(modelCode) {
    if (!modelCode) {
      alert('请输入模型代码！');
      return;
    }

    const command = this.is3DModelOn ? 'close3DModel' : 'open3DModel';
    this.sendCommandToUE({
      command: command,
      modelCode_vis: modelCode
    });

    this.is3DModelOn = !this.is3DModelOn;
    this.toggleModelText = this.is3DModelOn ? '关闭3D模型' : '开启3D模型';
  },

    // 相机切换去白模
    toggleWhiteModel() {
      this.isWhiteModelOn = true;
      // this.whiteModelCameraText = this.isWhiteModelOn ? '去白模' : '回原点';
      this.sendCommandToUE({ command: this.isWhiteModelOn ? 'openWhiteModel' : 'closeWhiteModel' });
    },

    // 相机切换去倾斜摄影
    toggleTilesModel() {
      this.isTilesModelOn = true;
      // this.tilesModelCameraText = this.isTilesModelOn ? '去倾斜摄影' : '回原点';
      this.sendCommandToUE({ command: this.isTilesModelOn ? 'openTiles' : 'closeTiles' });
    },

    // 提交3dtiles信息
    submit3dtiles(filePath, modelCode, latitude, longitude, height, offsetX, offsetY, offsetZ) {
      const descriptor = {
        command: 'updateLatLong',
        filePath: filePath,
        modelCode: modelCode,
        latitude: latitude,
        longitude: longitude,
        height: height,
        offsetX: offsetX,
        offsetY: offsetY,
        offsetZ: offsetZ
      };
      this.sendCommandToUE(descriptor);
    },

    // 创建标签
    createLabel(labelX, labelY, labelZ, labelText) {
      const descriptor = {
        command: 'createLabel',
        labelX: labelX,
        labelY: labelY,
        labelZ: labelZ,
        labelText: labelText
      };
      this.sendCommandToUE(descriptor);
    },

    // 创建相机
    createCamera(cameraX, cameraY, cameraZ, rotateLeftRight, rotateUpDown) {
      const descriptor = {
        command: 'createCamera',
        cameraX: cameraX,
        cameraY: cameraY,
        cameraZ: cameraZ,
        rotateLeftRight: rotateLeftRight,
        rotateUpDown: rotateUpDown
      };
      this.sendCommandToUE(descriptor);
    },

    // 更新漫游速度
    adjustSpeed(speed) {
      const descriptor = {
        command: 'adjustSpeed',
        speed: speed
      };
      this.sendCommandToUE(descriptor);
    }
    //#endregion
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
  align-items: flex-start;
  /* Adjust alignment */
  width: 100vw;
  height: 40vh;
}

.controls {
  flex: 0 0 300px;
  /* No grow, no shrink, fixed width */
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

table,
th,
td {
  border: 1px solid black;
}

th,
td {
  padding: 8px;
}
</style>
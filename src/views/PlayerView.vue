<template>
  <div class="container">
    <div class="controls">

      <form
        @submit.prevent="submit3dtiles(newFilePath, newModelCode, newLatitude, newLongitude, newHeight, newOffsetX, newOffsetY, newOffsetZ)">
        <input v-model="newFilePath" placeholder="文件路径" required />
        <input v-model="newModelCode" placeholder="模型代码" required />
        <input v-model="newLatitude" placeholder="纬度" required />
        <input v-model="newLongitude" placeholder="经度" required />
        <input v-model="newHeight" placeholder="高度" required />
        <br />
        <button type="submit">3dtiles信息提交</button>
      </form>
      <form
      @submit.prevent="offsetModel(newModelCodeOffset, newOffsetX, newOffsetY, newOffsetZ)">
        <input v-model="newModelCodeOffset" placeholder="模型代码" required />
        <input v-model="newOffsetX" placeholder="偏移数值 X" required />
        <input v-model="newOffsetY" placeholder="偏移数值 Y" required />
        <input v-model="newOffsetZ" placeholder="偏移数值 Z" required />
        <br />
        <button type="submit">偏移值信息提交</button>
      </form>
      <br />
      <form @submit.prevent>
        <input v-model="modelCode_vis" placeholder="模型代码" required />
        <br />
        <button @click.prevent="toggleModelOn(modelCode_vis)">开启模型</button>
        <button @click.prevent="toggleModelOff(modelCode_vis)">关闭模型</button>
      </form>
      <br />
      <form @submit.prevent="rotateModel(modelCodeRotate, rotateX, rotateY, rotateZ)">
        <input v-model="modelCodeRotate" placeholder="模型代码" required />
        <input v-model="rotateX" placeholder="旋转x" required />
        <input v-model="rotateY" placeholder="旋转y" required />
        <input v-model="rotateZ" placeholder="旋转z" required />
        <br />
        <button type="submit">旋转信息提交</button>
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
      filePath: [],
      modelCode: [],
      latitude: '',
      longitude: '',
      height: '',
      modelCodeOffset: '',
      offsetX: '',
      offsetY: '',
      offsetZ: '',
      modelCodeRotate: '',
      rotateX: '',
      rotateY: '',
      rotateZ: '',
      labelX: '',
      labelY: '',
      labelZ: '',
      cameraX: '',
      cameraY: '',
      cameraZ: '',
      modelCodeOn: '',
      modelCodeOff: '',
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
      console.log("Received data:", data);
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
    toggleModelOn(modelCode) {
      if (!modelCode) {
        alert('请输入模型代码！');
        return;
      }
      const descriptor = {
      command: 'open3DModel',
      modelCodeOn: modelCode,
      // modelOpen:"open"
    };
    this.sendCommandToUE(descriptor);
  },

  // 基于modelCode，关闭模型
  toggleModelOff(modelCode) {
      if (!modelCode) {
        alert('请输入模型代码！');
        return;
      }
      const descriptor = {
      command: 'open3DModel',
      modelCodeOff: modelCode,
      // modelClose:"close"
    };
    this.sendCommandToUE(descriptor);
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
  submit3dtiles(newFilePath, newModelCode, newLatitude, newLongitude, newHeight) {
    this.filePath.push(newFilePath);
    this.modelCode.push(newModelCode);
    // this.latitude.push(newLatitude);
    // this.longitude.push(newLongitude);
    // this.height.push(newHeight);
    // this.offsetX.push(newOffsetX);
    // this.offsetY.push(newOffsetY);
    // this.offsetZ.push(newOffsetZ);

    // 创建 filePath 对象
    let filePathObject = {};
    let modelCodeObject = {};
    this.filePath.forEach((path, index) => {
      filePathObject[`filepath_${index + 1}`] = path;
    });
    this.modelCode.forEach((code, index) => {
      modelCodeObject[`modelCode_${index + 1}`] = code;
    });

    let filepath_input = {
      filePaths: filePathObject
    };
    let modelCode_input = {
      modelCodes: modelCodeObject
    };

    // console.log(filepath_input);
    // console.log(modelCode_input);

    const descriptor = {
      command: 'updateLatLong',
      filePath: filepath_input,
      modelCode: modelCode_input,
      latitude: newLatitude,
      longitude: newLongitude,
      height: newHeight
    };
    this.sendCommandToUE(descriptor);
  },

  // 提交偏移信息
  offsetModel(newModelCodeOffset, newOffsetX, newOffsetY, newOffsetZ) {
    const descriptor = {
      command: 'offsetModel',
      modelCodeOffset: newModelCodeOffset,
      offsetX: newOffsetX,
      offsetY: newOffsetY,
      offsetZ: newOffsetZ
    };
    this.sendCommandToUE(descriptor);
  },

    // 创建标签
    rotateModel(modelCodeRotate, rotateX, rotateY, rotateZ) {
      const descriptor = {
        command: 'rotateModel',
        modelCodeRotate: modelCodeRotate,
        rotateX: rotateX,
        rotateY: rotateY,
        rotateZ: rotateZ
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
  },
  //#endregion

  //#region 输出功能
      // 基于modelCode，开启模型
  toggleModel(modelCode, modelState) {
      if(modelState === true) {
        this.toggleModelOn(modelCode);
      } else if(modelState === false) {
        this.toggleModelOff(modelCode);
      } else {
        alert('请输入模型状态！');
      }
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
  height: 50vh;
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
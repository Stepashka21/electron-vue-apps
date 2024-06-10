<template>
  <div class="alls">
    <div class="overlay" v-if="dialogVisible"></div>
    <div class="leftPanel">
      <div class="nameProj">
        <h2 class="headNameProj" @click="toggleContextMenu" ref="headNameProj">
          {{ projectName }}
        </h2>
        <ul
          v-if="showContextMenu"
          :style="{
            top: `${contextMenuPosition.top}px`,
            left: `${contextMenuPosition.left}px`,
          }"
          class="context-menu">

          <li @click="showRenameDialog">Переименовать проект</li>
          <li @click="goBack">Вернуться</li>
          <li @click="saveProject">Сохранить проект</li>
          <li @click="saveCanvasAsImage">Сохранить как картинку</li>
        </ul>
      </div>
      <!-- <router-link :to="{ name: 'ReplaceDialog' }">Перейти на страницу Replace</router-link> -->
      <div class="divLayer">
        <div class="lay">
          <h2 style="margin-top: 3px">Слои</h2>
          <draggable
            v-model="layers"
            @end="above"
            style="
              display: flex;
              flex-direction: column;
              align-items: flex-start;
              width: 11vw;
            "
          >
            <div
              v-for="(layer, index) in layers"
              :key="index"
              style="margin-bottom: 10px"
            >
              <span @click="selectLayer(layer)" class="layer"
                >{{ layer.name }}
              </span>
              <!-- /{{ layer.selected ? "selected" : "deselected" }} -->
            </div>
          </draggable>
        </div>
      </div>
    </div>

    <div class="canvasPanel">
      <div class="buttunsGrid">
        <div class="listBtn">
          <button class="btnss" @click="deselectAll" title="Сброс выделения">
            <img class="imgIcons" :src="require('/src/assets/kursor.png')" />
          </button>
        </div>

        <div class="listBtn">
          <button class="btnss" @click="addText" title="Создать текст">
            <img class="imgIcons" :src="require('/src/assets/text.png')" />
            <!--Text-->
          </button>
        </div>

        <div class="listBtn">
          <button class="btnss" @click="viewFigure" title="Добавить фигуру">
            <img class="imgIcons" :src="require('/src/assets/geometry.png')" />
          </button>
        </div>

        <!-- <div class="listBtn">
          <button class="btnss" @click="viewFigure">
            <img class="imgIcons" :src="require('/src/assets/pen.png')" />
          </button>
        </div> -->

        <div class="listBtn">
          <button class="btnss" @click="addImg" title="Добавить изображение">
            <img class="imgIcons" :src="require('/src/assets/img.png')" />
          </button>
        </div>

        <div class="listBtn">
          <button class="btnss" @click="startSelection" style="color: #ffffff" title="Выделить область">
            <img class="imgIcons" :src="require('/src/assets/selectLay.png')" />
          </button>
        </div>
        <div class="listBtn">
          <button class="btnss" @click="confirmSelection" style="color: #ffffff" title="Передать область">
            <img class="imgIcons" :src="require('/src/assets/saveLay.png')"/>
          </button>
        </div>
        
        <div>
          <button class="btnss" @click="deleteEl" title="Удалить элемент">
            <img class="imgIcons" :src="require('/src/assets/deleteEl.png')"/>
          </button>
        </div>
        <div>
          <button class="btnss" @click="clearCanvas" title="Очистить канвас">
            <img class="imgIcons" :src="require('/src/assets/clearCanvas.png')"/>           
        </button>
        </div>

        <div v-if="showFigureMenu" class="additionalMenu">
          <button class="btnss" @click="addRectangle">
            <img class="imgIcons" :src="require('/src/assets/rect.png')" />
            <span style="color: #ffffff">Квадрат</span>
            <!--квадрат/прямоугольник-->
          </button>
          <button class="btnss" @click="addCircle">
            <img class="imgIcons" :src="require('/src/assets/circle.png')" />
            <span style="color: #ffffff">Круг</span>
            <!--круг-->
          </button>
        </div>
      </div>

      <div class="canav">
        <canvas
          ref="canvas"
          width="1280"
          height="835"
          @click="deselectAll"
          @dragover.prevent="handleDragOver"
          @drop="handleDrop"
        ></canvas>
      </div>
    </div>

    <div class="rightPanel">
      <div class="elementSeting">
        <div v-if="selectedLayer && selectedLayer.object">
          <div class="viewSetings">
            <!-- <p>Выбранный элемент: {{ selectedLayer.name }}</p> -->
            <p>Тип объекта: {{ selectedLayer.object.type }}</p>

            <label class="lab">Наименование:</label>
            <input
              type="text"
              v-model="layerName"
              id="name"
              class="inputRigth"
            />

            <!-- Параметры для картинки -->
            <div style="display: flex; flex-direction: column; align-items: center" 
              v-if="selectedLayer.object.type == 'image'">
              <!-- Кнопки фильтров -->
              <div style="margin-top: 10px; display: flex; flex-direction: column; align-items: center">
                <label style="margin-bottom: 0" >Фильтры:</label>
                <div style="display: flex; flex-direction: column;">
                  <button class="filterBtn" @click="applyFilter('grayscale')">Черно-белое</button>
                  <button class="filterBtn" @click="applyFilter('sepia')">Сепия</button>
                  <button class="filterBtn" @click="applyFilter('brightness')">Яркость</button>
                  <button class="filterBtns" @click="clearFilters()">Очистить фильтры</button>
                </div>  
              </div>
              <!-- <label class="lab">Прозрачность:</label>
              <input
                class="inputRigth"
                type="range"
                v-model="layerOpacity"
                value="0"
                max="1"
                step="0.05"
                id="opacity"
              /> -->
            </div>

            <!-- Параметры для объектов с цветом заливки -->
            <div
              style="display: flex; flex-direction: column; align-items: center"
              v-if="selectedLayer.object.type !== ('image' && 'textbox')"
            >
              <label class="lab">Ширина:</label>
              <input
                class="inputRigth"
                v-model="layerWidth"
                type="number"
                @change="updateLayerProperty('width', layerWidth)"
              />
              <label class="lab">Высота:</label>
              <input
                class="inputRigth"
                v-model="layerHeight"
                type="number"
                @change="updateLayerProperty('height', layerHeight)"
              />
              <label class="lab">Цвет:</label>
              <input type="color" v-model="layerColor" id="color" />
              <label class="lab">Прозрачность:</label>
              <input
                class="inputRigth"
                type="range"
                v-model="layerOpacity"
                value="0"
                max="1"
                step="0.05"
                id="opacity"
              />
            </div>

            <!-- Параметры для текста -->
            <div
              style="display: flex; flex-direction: column; align-items: center"
              v-if="selectedLayer.object.type === 'textbox'"
            >
              <label class="lab">Ширина:</label>
              <input
                class="inputRigth"
                v-model="layerWidth"
                type="number"
                @change="updateLayerProperty('width', layerWidth)"
              />
              <label class="lab">Высота:</label>
              <input
                class="inputRigth"
                v-model="layerHeight"
                type="number"
                @change="updateLayerProperty('height', layerHeight)"
              />
              <label class="lab" for="font-family">Стиль шрифта:</label>
              <select
                class="inputRigth"
                id="font-family"
                v-model="selectedFont"
                @change="applyFont"
              >
                <option v-for="font in fonts" :value="font" :key="font">
                  {{ font }}
                </option>
              </select>
              <label class="lab">Размер шрифта:</label>
              <input
                class="inputRigth"
                v-model="layerFontSize"
                type="number"
                @change="updateLayerProperty('fontSize', layerFontSize)"
              />
              <label class="lab">Цвет:</label>
              <input type="color" v-model="layerColor" id="color" />
              <label class="lab" >Прозрачность:</label>
              <input
                class="inputRigth"
                type="range"
                v-model="layerOpacity"
                value="0"
                max="1"
                step="0.05"
                id="opacity"
              />
              <div class="btnBlock">
                <button class="btns" @click="toggleBold">
                  <img
                    class="imgBtns"
                    :src="require('/src/assets/zhirnuy.png')"
                  />
                </button>
                <button class="btns" @click="toggleUnderline">
                  <img
                    class="imgBtns"
                    :src="require('/src/assets/podcherk.png')"
                  />
                </button>
                <button class="btns" @click="toggleItalic">
                  <img
                    class="imgBtns"
                    :src="require('/src/assets/kursiv.png')"
                  />
                </button>
              </div>
              <div class="textAlignButtons">
               
                  <label>Горизонтальное</label>
                  <label style="margin-bottom: 10px">выравнивание:</label>

                <div class="textAlignBtn">
                  <button
                    :class="{ active: selectedTextAlign === 'left' }"
                    @click="setTextAlign('left')"
                  >
                    <img
                      class="btnsImgs"
                      :src="require('/src/assets/left.png')"
                    />
                  </button>
                  <button
                    :class="{ active: selectedTextAlign === 'center' }"
                    @click="setTextAlign('center')"
                  >
                    <img
                      class="btnsImgs"
                      :src="require('/src/assets/center.png')"
                    />
                  </button>
                  <button
                    :class="{ active: selectedTextAlign === 'right' }"
                    @click="setTextAlign('right')"
                  >
                    <img
                      class="btnsImgs"
                      :src="require('/src/assets/prav.png')"
                    />
                  </button>
                  <button
                    :class="{ active: selectedTextAlign === 'justify' }"
                    @click="setTextAlign('justify')"
                  >
                    <img
                      class="btnsImgs"
                      :src="require('/src/assets/shirina.png')"
                    />
                  </button>
                </div>
              </div>
            </div>

            <button class="btnsss" @click="saveSettings">
              <p style="color: #ffffff; padding: 0; margin: 0">
                Сохранить
              </p>
            </button>
          </div>
        </div>
      </div>

      <!-- <button class="btnss" @click="openDialog">
        <p style="color: #ffffff; padding: 0; margin: 0">! Документация</p>
      </button> -->
    </div>

    <dialog ref="diaOptions" class="dialogNew">
      <div>
        <h1>Просто кнопка с диалоговым окном</h1>
      </div>
      <button class="closeDialog" @click="closeDialog()">Вернуться</button>
    </dialog>

    <dialog ref="diaDocs" class="dialogNew">
      <div>
        <h1>Информация</h1>
      </div>
      <button class="closeDialog" @click="closeDocs()">Вернуться</button>
    </dialog>
    <dialog ref="renameDialog" class="newNameDialog">
      <h2 style="color: #ffffff">Переименовать проект</h2>
      <input
        class="inputs"
        type="text"
        v-model="newProjectName"
        placeholder="Новое название проекта"
      />
      <div class="btnsDialog">
        <button class="closeDialog" @click="closeRenameDialog">
          <h4 style="margin: 0; padding: 0">Отмена</h4>
        </button>
        <button class="saveProj" @click="renameProject">
          <h4 style="margin: 0; padding: 0">Сохранить</h4>
        </button>
      </div>
    </dialog>

    <dialog ref="imageDialog" class="dialogNew">
      <h1>Выделенная область</h1>
      <img
        :src="selectedImageSrc"
        alt="Выделенная область"
        v-if="selectedImageSrc"
        style="border: 1px solid black;"
      />
      <button class="closeDialog" @click="closeImageDialog">Закрыть</button>
    </dialog>
  </div>
</template>
<script src="https://cdn.jsdelivr.net/npm/vue@2.6.14/dist/vue.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js"></script>
  
<script>
const fs = require("fs");
const path = require("path");
const os = require("os");
import { fabric } from "fabric";
import draggable from "vuedraggable";
import ListProject from "./ListProject.vue";
import FontFaceObserver from "fontfaceobserver";

export default {
  name: "ProjectEditor",

  components: {
    draggable,
    ListProject,
  },

  data() {
    return {
      canvas: null,
      dataValue: "",
      showContextMenu: false,
      projectName: "",
      newProjectName: "",
      projectFilePath: "",
      projectData: null,
      layers: [],
      selectedLayer: null,
      showFigureMenu: false,
      jsonData: null,
      selectionPosition: null,
      selectedFolderPath: this.getDefaultFolderPath(),
      fonts: [
        "Times New Roman",
        "Pacifico",
        "VT323",
        "Quicksand",
        "Inconsolata",
        "Gwendolyn",
        "Honk",
        "Montserrat",
        "Lato",
        "Playfair Display",
        "Abril Fatface",
      ],
      selectedFont: "Times New Roman",
      contextMenuPosition: { top: 0, left: 0 },
      layerName: "",
      layerColor: "",
      layerOpacity: "",
      layerWidth: "",
      layerHeight: "",
      layerFont: "",
      layerFontSize: "",
      selectedTextAlign: "left",
      dialogVisible: false,
      isSelecting: false,
      startX: 0,
      startY: 0,
      selectedImageSrc: null,
      selectionRect: null, // передаваемая область
    };
  },

  mounted() {
    // Переместили глобальную обработку событий на методы компонента
    document.addEventListener("dragover", this.handleDragOver, false);
    document.addEventListener("drop", this.handleDrop, false);
    document.addEventListener('click', this.handleClickOutside);

    this.canvas = new fabric.Canvas(this.$refs.canvas, {
      isDrawingMode: false,
    });
    this.loadProject();

    this.canvas.on("selection:created", this.handleSelection);
    this.canvas.on("selection:updated", this.handleSelection);
    this.canvas.on("selection:cleared", this.clearSelection);

    this.canvas.on("mouse:down", this.onMouseDown);
    this.canvas.on("mouse:move", this.onMouseMove);
    this.canvas.on("mouse:up", this.onMouseUp);
    console.log(this.getDefaultFolderPath());
  },

  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside);
  },

  methods: {
    getDefaultFolderPath() {
      const documentsPath = path.join(os.homedir(), "Documents");
      const neuroEditorPath = path.join(documentsPath, "NeuroEditor");
      return neuroEditorPath;
    },

    //
    //
    //
    //
    // ПЕРЕДАВАЕМАЯ ОБЛАСТЬ
    //
    //
    //
    //
    onMouseDown(options) {
      if (!this.isSelecting) return;
      const pointer = this.canvas.getPointer(options.e);
      this.startX = pointer.x;
      this.startY = pointer.y;
      this.selectionRect = new fabric.Rect({
        left: this.startX,
        top: this.startY,
        width: 0,
        height: 0,
        fill: "rgba(0, 0, 0, 0.5)", // Полупрозрачный фон для затемнения
        stroke: "black",
        strokeWidth: 1,
        selectable: false,
        evented: false,
      });
      this.canvas.add(this.selectionRect);
    },

    onMouseMove(options) {
      if (!this.isSelecting || !this.selectionRect) return;
      const pointer = this.canvas.getPointer(options.e);
      const width = pointer.x - this.startX;
      const height = pointer.y - this.startY;
      this.selectionRect.set({
        width: Math.abs(width),
        height: Math.abs(height),
      });
      if (width < 0) {
        this.selectionRect.set({ left: pointer.x });
      }
      if (height < 0) {
        this.selectionRect.set({ top: pointer.y });
      }
      this.canvas.renderAll();
    },

    onMouseUp() {
      if (!this.isSelecting || !this.selectionRect) return;
      this.isSelecting = false;
    },

    confirmSelection() {
      if (!this.selectionRect) {
        console.log("Область не выбрана");
        return;
      }

      // Сохраните координаты и размеры выделенной области
      const { left, top, width, height } = this.selectionRect;

      // Удалите выделение с затемнением
      this.canvas.remove(this.selectionRect);

      // Создайте новый прямоугольник без затемнения для получения данных
      const cleanRect = new fabric.Rect({
        left: this.startX,
        top: this.startY,
        width,
        height,
        fill: "transparent",
        stroke: "transparent",
        selectable: false,
        evented: false,
      });
      this.canvas.add(cleanRect);
      this.canvas.renderAll();

      // Получите данные изображения из выделенной области
      const dataURL = this.canvas.toDataURL({
        left: cleanRect.left,
        top: cleanRect.top,
        width: cleanRect.width,
        height: cleanRect.height,
      });

      // Удалите чистый прямоугольник
      this.canvas.remove(cleanRect);
      this.canvas.renderAll();

      // Установите полученные данные как источник изображения
      this.selectedImageSrc = dataURL;
      console.log("Selected image src:", this.selectedImageSrc);

      // Откройте диалоговое окно с изображением
      this.openImageDialog();
    },

    startSelection() {
      this.isSelecting = true;
      if (this.selectionRect) {
        this.canvas.remove(this.selectionRect);
        this.selectionRect = null;
      }
    },

    openImageDialog() {
      if (this.selectedImageSrc){     
        this.$refs.imageDialog.style.visibility = "visible";
        const img = new Image();
        img.onload = () => {
          const width = img.width;
          const height = img.height;
          this.$refs.imageDialog.style.width = `${width + 100}px`;
          this.$refs.imageDialog.style.height = `${height + 150}px`;
          this.$refs.imageDialog.showModal();
        };
        img.src = this.selectedImageSrc;
      }
    },

    closeImageDialog() {
      this.$refs.imageDialog.style.visibility = "hidden";
      this.$refs.imageDialog.close();
    },

    handleDragOver(event) {
      event.preventDefault();
    },
    handleDrop(event) {
      event.preventDefault();
      const files = event.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (e) => {
            fabric.Image.fromURL(e.target.result, (img) => {
              const canvasCenter = this.canvas.getCenter();
              img.set({
                left: canvasCenter.left - img.width / 2,
                top: canvasCenter.top - img.height / 2,
              });
              this.canvas.add(img);
              this.addLayer(img);
              this.canvas.renderAll();
            });
          };
          reader.readAsDataURL(file);
        }
      }
    },

    updateObject() {
      if (this.selectedLayer && this.selectedLayer.object) {
        const object = this.selectedLayer.object;
        object.setCoords();
        this.canvas.renderAll();
      }
    },

    //
    //
    //
    //
    // ЗАГРУЗКА ПРОЕКТА
    //
    //
    //
    //

    loadProject() {
      if (!this.newProjectName) {
        this.projectName = this.$route.params.projectName;
      }
      if (this.newProjectName) {
        this.projectName = this.newProjectName;
      }
      const selectedFolderPath = this.getDefaultFolderPath();
      this.projectFilePath = path.join(
        selectedFolderPath,
        `${this.projectName}.json`
      );

      console.log(this.projectFilePath);

      fs.readFile(this.projectFilePath, "utf-8", (err, data) => {
        if (err) {
          console.error("Ошибка загрузки проекта: Файл не найден", err);
          return;
        }

        try {
          this.projectData = JSON.parse(data);
          this.restoreCanvasState();
        } catch (e) {
          console.error("Ошибка парсинга JSON:", e);
        }
      });
    },
    addLayer(object) {
      const layer = { name: object.type, object, selected: false };
      this.layers.unshift(layer);
    },
    restoreCanvasState() {
      if (!this.projectData) return;
      this.canvas.loadFromJSON(this.projectData.canvas, () => {
        this.canvas.renderAll();

        // После того как холст полностью загружен, обновляем слои
        if (this.projectData.layers && Array.isArray(this.projectData.layers)) {
          this.projectData.layers.forEach((layerData) => {
            const object = this.canvas.item(layerData.index);
            if (object) this.addLayer(object);
          });
        }
      });
    },

    //
    //
    //
    //
    // ПЕРЕИМЕНОВАНИЕ ПРОЕКТА
    //
    //
    //
    //
    showRenameDialog() {
      this.dialogVisible = true;
      this.newProjectName = this.projectName; // заполняем поле текущим именем проекта
      this.$refs.renameDialog.style.visibility = "visible";
      this.$refs.renameDialog.showModal();
      this.showContextMenu = false;
    },

    closeRenameDialog() {
      this.dialogVisible = false;
      this.$refs.renameDialog.style.visibility = "hidden";
      this.$refs.renameDialog.close();
    },

    renameProject() {
      const selectedFolderPath = this.getDefaultFolderPath();
      const oldFilePath = path.join(
        selectedFolderPath,
        `${this.projectName}.json`
      );
      const newFilePath = path.join(
        selectedFolderPath,
        `${this.newProjectName}.json`
      );

      fs.rename(oldFilePath, newFilePath, (err) => {
        if (err) {
          console.error("Ошибка при переименовании проекта", err);
          return;
        }

        console.log("Проект успешно переименован");
        this.projectName = this.newProjectName;
        this.projectFilePath = newFilePath;

        this.loadProject(this.newProjectName); // перезагружаем проект после переименования
        this.closeRenameDialog();
      });
    },

    // ОТОБРАЖЕНИЕ МЕНЮ С ФИГУРАМИ
    viewFigure() {
      this.showFigureMenu = !this.showFigureMenu;
    },

    //
    //
    //
    //
    // ДИАЛОГОВЫЕ ОКНА
    //
    //
    //
    //
    viewDocs() {
      this.dialogVisible = true;
      this.$refs.diaDocs.style.visibility = "visible";
      this.$refs.diaDocs.showModal();
    },
    closeDocs() {
      this.dialogVisible = false;
      this.$refs.diaDocs.style.visibility = "hidden";
      this.$refs.diaDocs.close();
    },
    closeDialog() {
      this.dialogVisible = false;
      this.$refs.diaOptions.style.visibility = "hidden";
      this.$refs.diaOptions.close();
    },
    above(ev) {
      this.layers[ev.newIndex].object.moveTo(
        this.layers.length - ev.newIndex - 1
      );
    },

    //
    //
    //
    //
    // ДОБАВЛЕНИЕ НА КАНВАС ФИГУР // КАРТИНКИ
    //
    //
    //
    //
    addRectangle() {
      const rect = new fabric.Rect({
        id: this.generateId(),
        name: "Rectangle",
        width: 100,
        height: 100,
        fill: `#000000`,
        left: 10,
        top: 10,
        selectable: true,
      });
      this.canvas.add(rect);
      this.addLayer(rect);
      this.viewFigure();
    },
    addCircle() {
      const circle = new fabric.Circle({
        id: this.generateId(),
        name: "Circle",
        radius: 50,
        fill: `#000000`,
        left: 50,
        top: 50,
        selectable: true,
      });
      this.canvas.add(circle);
      this.addLayer(circle);
      this.viewFigure();
    },
    addImg() {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const fabricImage = new fabric.Image(img, {
              id: this.generateId(),
              name: "Image",
            });
            this.canvas.add(fabricImage);
            this.addLayer(fabricImage);
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      };
      input.click();
    },
    addText() {
      const text = new fabric.Textbox("", {
        left: 50,
        top: 50,
        width: 150,
        height: 100,
        fill: "#000000",
        fontSize: 20,
        fontFamily: this.selectedFont,
        underline: false,
        fontWeight: "normal",
        fontStyle: "normal",
        textAlign: this.selectedTextAlign,
        originY: "top",
      });
      this.canvas.add(text);
      this.addLayer(text);
    },
    addListeners(layer) {
      layer.object.onSelect = () => {
        this.selectedLayer = layer;
        layer.selected = true;
      };
      layer.object.onDeselect = () => {
        layer.selected = false;
        this.selectedLayer = null;
      };
    },
    deselectAll() {
      this.canvas.discardActiveObject();
      this.selectedLayer = null;
      this.canvas.renderAll();
    },
    selectLayer(layer) {
      if (layer.object) {
        console.log(layer.object);
        this.selectedLayer = layer;
        this.layerName = layer.name;
        this.layerWidth = layer.object.width * layer.object.scaleX;
        this.layerHeight = layer.object.height * layer.object.scaleY;
        this.layerColor = layer.object.fill;
        this.layerOpacity = layer.object.opacity;
        if (layer.object.type === "textbox") {
          this.layerFont = layer.object.fontFamily;
          this.layerFontSize = layer.object.fontSize;
        } else {
          this.layerFont = null;
          this.layerFontSize = null;
        }
        this.canvas.setActiveObject(layer.object);
        this.canvas.renderAll();
      }
    },

    //
    //
    //
    //
    // СОХРАНЕНИЕ ПРОЕКТА
    //
    //
    //
    //
    saveProject() {
      if (this.newProjectName) {
        this.projectName = this.newProjectName;
      }
      const canvasData = this.canvas.toJSON();
      const layersData = this.layers.map((layer) => ({
        name: layer.name,
        index: this.canvas.getObjects().indexOf(layer.object),
      }));
      const projectData = {
        canvas: canvasData,
        layers: layersData,
      };
      const jsonData = JSON.stringify(projectData);

      const selectedFolderPath = this.getDefaultFolderPath();
      const filePath = path.join(
        selectedFolderPath,
        `${this.projectName}.json`
      );

      fs.writeFile(filePath, jsonData, (err) => {
        if (err) {
          console.error("Ошибка при сохранении проекта", err);
          return;
        }
        console.log("Проект успешно сохранен");
      });
      this.showContextMenu = false;
    },
    saveCanvasAsImage() {
      const dataURL = this.canvas.toDataURL();
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = "canvas_image.png";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    deleteEl() {
      const activeObject = this.canvas.getActiveObject();
      this.layers = this.layers.filter(
        (layer) => layer.object !== activeObject
      );
      this.canvas.remove(activeObject);
    },
    clearCanvas() {
      this.canvas.clear();
      this.layers = [];
    },

    //
    //
    //
    //
    // ШРИФТЫ И ТЕКСТ
    //
    //
    //
    //
    applyFont() {
      if (this.selectedFont !== "Times New Roman") {
        this.loadAndUse(this.selectedFont);
      } else {
        this.canvas.getActiveObject().set("fontFamily", this.selectedFont);
        this.canvas.requestRenderAll();
      }
    },
    loadAndUse(font) {
      const myfont = new FontFaceObserver(font);
      myfont
        .load()
        .then(() => {
          this.canvas.getActiveObject().set("fontFamily", font);
          this.canvas.requestRenderAll();
        })
        .catch((e) => {
          console.log(e);
          alert("Font loading failed " + font);
        });
    },
    // Метод для переключения подчеркивания текста
    toggleUnderline() {
      const activeObject = this.canvas.getActiveObject();
      if (activeObject && activeObject.type === "textbox") {
        activeObject.set("underline", !activeObject.underline);
        this.canvas.renderAll();
      }
    },
    // Метод для переключения жирного шрифта
    toggleBold() {
      const activeObject = this.canvas.getActiveObject();
      if (activeObject && activeObject.type === "textbox") {
        activeObject.set(
          "fontWeight",
          activeObject.fontWeight === "bold" ? "normal" : "bold"
        );
        this.canvas.renderAll();
      }
    },
    // Метод для переключения курсивного шрифта
    toggleItalic() {
      const activeObject = this.canvas.getActiveObject();
      if (activeObject && activeObject.type === "textbox") {
        activeObject.set(
          "fontStyle",
          activeObject.fontStyle === "italic" ? "normal" : "italic"
        );
        this.canvas.renderAll();
      }
    },
    // Метод для применения горизонтального выравнивания
    setTextAlign(align) {
      this.selectedTextAlign = align;
      this.applyTextAlign();
    },
    applyTextAlign() {
      const activeObject = this.canvas.getActiveObject();
      if (activeObject && activeObject.type === "textbox") {
        activeObject.set("textAlign", this.selectedTextAlign);
        this.canvas.renderAll();
      }
    },
    // Метод для применения фильтра к активному изображению
    applyFilter(type) {
      const activeObject = this.canvas.getActiveObject();
      if (activeObject && activeObject.type === "image") {
        let filter;
        switch (type) {
          case "grayscale":
            filter = new fabric.Image.filters.Grayscale();
            break;
          case "sepia":
            filter = new fabric.Image.filters.Sepia();
            break;
          case "brightness":
            filter = new fabric.Image.filters.Brightness({ brightness: 0.1 }); // Пример яркости
            break;
          // Добавьте другие фильтры по мере необходимости
        }
        activeObject.filters.push(filter);
        activeObject.applyFilters();
        this.canvas.renderAll();
      }
    },
    // Метод для очистки всех фильтров с активного изображения
    clearFilters() {
      const activeObject = this.canvas.getActiveObject();
      if (activeObject && activeObject.type === "image") {
        activeObject.filters = [];
        activeObject.applyFilters();
        this.canvas.renderAll();
      }
    },
    handleSelection(e) {
      const activeObject = e.target;
      const selectedLayer = this.layers.find(
        (layer) => layer.object === activeObject
      );
      if (selectedLayer) {
        this.selectLayer(selectedLayer);
      }
    },

    clearSelection() {
      this.selectedLayer = null;
      this.layerName = "";
      this.layerWidth = "";
      this.layerHeight = "";
      this.layerColor = "";
      this.layerOpacity = "";
      this.layerFont = "";
      this.layerFontSize = "";
    },

    updateLayerProperty(property, value) {
      if (this.selectedLayer && this.selectedLayer.object) {
        const object = this.selectedLayer.object;
        if (property === "width" || property === "height") {
          object.set(property, parseFloat(value));
        } else {
          object.set(property, value);
        }
        this.canvas.renderAll();
      }
    },
    saveSettings() {
      if (this.selectedLayer) {
        const object = this.selectedLayer.object;
        this.selectedLayer.name = this.layerName;
        object.set({
          width: parseFloat(this.layerWidth),
          height: parseFloat(this.layerHeight),
          fill: this.layerColor,
          opacity: parseFloat(this.layerOpacity),
        });
        if (object.type === "textbox") {
          object.set({
            fontFamily: this.selectedFont,
            fontSize: parseFloat(this.layerFontSize),
          });
        }
        this.canvas.renderAll();
      }
    },

    changeTextAlignment(alignment) {
      this.selectedTextAlign = alignment;
    },

    toggleContextMenu(event) {
      this.showContextMenu = !this.showContextMenu;
      if (this.showContextMenu) {
        this.contextMenuPosition = {
          top: event.clientY,
          left: event.clientX,
        };
      }
    },
    handleClickOutside(event) {
      const contextMenu = this.$refs.contextMenu;
      const headNameProj = this.$refs.headNameProj;

      if (
        contextMenu &&
        !contextMenu.contains(event.target) &&
        headNameProj &&
        !headNameProj.contains(event.target)
      ) {
        this.showContextMenu = false;
      }
    },

    goBack() {
      // код для возврата к предыдущему экрану
      this.$router.push({
        name: "home",
      });
      this.showContextMenu = false;
    },
    generateId() {
      return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    },
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
@import url("https://fonts.googleapis.com/css2?family=Pacifico&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Pacifico&family=VT323&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Quicksand:wght@300..700&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Inconsolata:wght@200..900&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Honk&family=Inconsolata:wdth@50&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Gwendolyn:wght@400;700&family=Pacifico&family=VT323&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap");

* {
  font-family: "Inter", sans-serif;
  font-weight: 300;
}
.alls {
  display: flex;
  background-color: #a7a7a7;
}
.leftPanel {
  margin: 8px 8px 8px 8px;
  height: 96vh;
  width: 12vw;
}
.nameProj {
  background-color: #bcbcbc;
  display: flex;
  justify-content: center;
  width: auto;
  max-width: 190px;
  height: 32px;
  border-radius: 12px;
  padding: 5px;
  align-items: center;
}
.headNameProj {
  font-weight: 600;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  margin: 0;
  padding: 0;
}
.headNameProj:hover {
  cursor: pointer;
}
.canvasPanel {
  margin-top: 9px;
}
.divLayer {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #2c2c2c;
  margin-top: 29px;
  border-radius: 12px;
  height: 89vh;
}
.layer {
  cursor: pointer;
  background-color: #8f8f8f;
  padding: 2px 5px 2px 5px;
  color: #ffffff;
  border-radius: 10px;
  width: 10vw;
  display: flex;
  flex-direction: row;
}
.lay {
  color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.settingsElement {
  height: 29vh;
  margin-top: 15px;
  background-color: #2c2c2c;
  border-radius: 12px;
}
.canav {
  width: 1280px;
  height: 835;
  background-color: #ffffff;
}
canvas {
  border: 2px solid #000000;
}

.buttunsGrid {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  width: 1284px;
  height: 34px;
  margin-top: 0px;
  background-color: #2c2c2c;
  border-radius: 8px 8px 0 0;
}
.btnBlock {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  width: 100%;
  margin-top: 12px;
}
.btns {
  background-color: #2c2c2c;
  border: none;
  border-inline: none;
  font-size: 28px;
}
.imgBtns {
  width: 28px;
}
.textAlignButtons {
  margin: 10px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.gorizont {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.textAlignButtons div {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;  
  width: 100%;
}

.textAlignButtons button {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 35px;
  border: none;
  border-inline: none;
  border-radius: 7px;
  background-color: #2c2c2c;
  cursor: pointer;
  padding: 5px;
}

.textAlignButtons button.active {
  background-color: #7c7c7c;
  border: none;
  border-inline: none;
  border-radius: 7px;
}
.btnsImgs {
  width: 20px;
}

.btnss {
  font-size: 16px;
  padding-top: 3px;
  margin: 5px;
  justify-content: space-between;
  height: 25px;
  border-radius: 10px;
  border: none;
  border-inline: none;
  background-color: #2c2c2c;
}
.btnss:hover {
  cursor: pointer;
  background-color: #0c8ce9;
}
.btnsss {
  font-size: 16px;
  margin: 5px;
  justify-content: space-between;
  height: 25px;
  border-radius: 10px;
  border: none;
  border-inline: none;
  background-color: #000000;
}
.btnsss:hover {
  cursor: pointer;
  background-color: #0c8ce9;
}

.querySelectionPanel {
  width: 40vw;
  display: flex;
  justify-content: space-between;
  margin: 8px 0;
}
.request {
  background-color: #ffffff;
  color: #000000;
  border-radius: 12px;
}
.negativeRequest {
  background-color: #000000;
  color: #ffffff;
  border-radius: 12px;
}
.queryPanel {
  padding: 0;
  margin: 5px 16px;
}
.textareaQuery {
  width: 39vw;
  background-color: #ffffff;
  border-radius: 12px;
}
.textAr {
  padding-left: 7px;
  border: none;
  border-inline: none;
  border-radius: 12px;
  resize: none;
  width: -webkit-fill-available;
  margin: 3px;
}
textarea:active {
  border: none;
  border-inline: none;
}
.rigthSettingAndPhoto {
  /* width: 46vw; */
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.btnsSetting {
  margin-top: 8px;
  width: 200px;
  height: 35px;
  background-color: #ffffff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.rigthPhoto {
  width: 26vw;
  background-color: #ffffff;
  border-radius: 12px;
  height: 16vh;
  margin-top: 10px;
}

.dialogNew {
  height: 660px;
  width: 1180px;
  border: none;
  display: flex;
  border-radius: 15px;
  flex-direction: column;
  align-items: center;
  visibility: hidden;
  background-color: #ffffff;
}

.additionalMenu {
  display: flex;
  position: absolute;
  background-color: #2c2c2c;
  border-radius: 10px;
  margin: 33px 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  flex-direction: column;
  align-items: flex-start;
}

.imgIcons {
  width: 20px;
}

.inputRigth {
  width: 90%;
  border: none;
  border-inline: none;
  border-radius: 7px;
  font-size: 16px;
}
.inputRigth:active {
  border: none;
  border-inline: none;
  border-radius: 7px;
}
.lab {
  margin-top: 12px;
  margin-bottom: 5px;
}
.filterBtn {
  margin-top: 5px; 
  border: none;  
  border-inline: none;  
  border-radius: 7px;
  background-color: #ffffff;
}
.filterBtn:hover {
  background-color: #d3d3d3;
}
.filterBtns {
  margin-top: 5px; 
  border: none;  
  border-inline: none;  
  border-radius: 7px;
  background-color: #a7a7a7;
}
.filterBtns:hover {
  background-color: #000000;
  color: #ffffff;
}
.rightPanel {
  /* width: 12vw; */
  height: auto;
}
.elementSeting {
  margin-top: 5px;
}
.viewSetings {
  display: flex;
  color: #ffffff;
  width: fit-content;
  margin: 9px;
  padding: 5px;
  background-color: #2c2c2c;
  border-radius: 12px;
  flex-direction: column;
  align-items: center;
}
.generateee {
  font-family: "Times New Roman", Times, serif;
  font-size: medium;
  height: 43px;
  width: 143px;
  border-radius: 8px;
  border: none;
  color: rgba(0, 0, 0, 0.63);
}

.context-menu {
  position: absolute;
  background-color: rgba(0, 0, 0, 0.69);
  border-radius: 15px;
  border: none;
  list-style: none;
  padding: 0;
  margin: 0;
  z-index: 1000;
}

.context-menu li {
  margin: 4px 8px;
  background-color: rgba(255, 255, 255, 0.94);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: medium;
  cursor: pointer;
}

.context-menu li:hover {
  background-color: #eee;
  border-radius: 12px;
}

.newNameDialog {
  border: none;
  display: flex;
  border-radius: 20px;
  flex-direction: column;
  align-items: center;
  visibility: hidden;
  background-color: #646464;
  height: 240px;
  width: 400px;
}
.inputs {
  font-size: medium;
  width: 304px;
  height: 40px;
  margin-top: 40px;
  margin-bottom: 27px;
  border-radius: 12px;
  border: none;
  outline: none;
}
.btnsDialog {
  display: flex;
  flex-direction: row;
  width: 386px;
  margin: 20px 5px 5px 5px !important;
  justify-content: space-between;
}
.closeDialog {
  background-color: #f04444;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  height: 34px;
  width: 172px;
}
.saveProj {
  background-color: #39b400;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  height: 34px;
  width: 172px;
}
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8); /* Полупрозрачный черный цвет */
  z-index: 1000; /* Убедитесь, что оверлей перекрывает всё остальное */
}

.dialogNew {
  z-index: 1001; /* Убедитесь, что диалоговое окно находится выше оверлея */
}
</style>


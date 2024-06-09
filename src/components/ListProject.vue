<template>
  <div class="bodyList">
    <div class="overlay" v-if="dialogVisible"></div>
    <div class="content">
      <div>
        <img @click="selectFolder" class="imgLogo" :src="require('@/assets/logotip.png')" />
      </div>
      <button class="showDialog" @click="openDialog">
        Создать проект
      </button>
      <div class="list-group-project">
        <div v-for="project in projects" :key="project.name">
          <button class="list-item">
            <router-link
              :to="{ name: 'edit', params: { projectName: project.name } }"
              style="text-decoration: none; color: #ffffff;"
            >{{ project.name }}</router-link>
          </button>
        </div>
      </div>
    </div>
    <dialog ref="diaOptions" class="dialogNew">
      <h2 style="color: #ffffff;">Введите название проекта</h2>
      <input
        class="inputs"
        type="text"
        v-model="newProjectName"
        placeholder="Название..."
      />
      <div class="btnsDialog">
        <button class="closeDialog" @click="closeDialog()">
          <h4 style="margin: 0; padding: 0;">Отмена</h4>
        </button>
        <button class="saveProj" @click="createProject">
          <h4 style="margin: 0; padding: 0;">Создать</h4>
        </button>
      </div>
    </dialog>
  </div>
</template>

<script>
const { remote } = require('electron');
const fs = require('fs');
const path = require('path');
const os = require('os');

export default {
  name: "ListProject",

  data() {
    return {
      projects: [],
      newProjectName: "",
      // selectedFolderPath: localStorage.getItem('selectedFolderPath') || path.join(os.homedir(), 'Downloads'),
      selectedFolderPath: this.getDefaultFolderPath(),
      dialogVisible: false,
    };
  },

  mounted() {
    this.ensureNeuroEditorFolderExists();
    this.loadProjects();
  },

  methods: {
    getDefaultFolderPath() {
      const documentsPath = path.join(os.homedir(), 'Documents');
      const neuroEditorPath = path.join(documentsPath, 'NeuroEditor');
      return neuroEditorPath;
    },

    ensureNeuroEditorFolderExists() {
      const folderPath = this.getDefaultFolderPath();
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }
    },
    openDialog() {
      this.dialogVisible = true;
      this.$refs.diaOptions.style.visibility = "visible";
      this.$refs.diaOptions.showModal();
    },
    closeDialog() {
      this.dialogVisible = false;
      this.$refs.diaOptions.style.visibility = "hidden";
      this.$refs.diaOptions.close();
    },
    isProjectFile(filePath) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(content);
        // Проверяем наличие ключей, которые могут указывать на то, что это проект
        return data.version || data.objects || data.canvas || data.canvas.version || data.canvas.objects;
      } catch (error) {
        return false;
      }
    },
    async loadProjects() {
      if (!this.selectedFolderPath) return;

      fs.readdir(this.selectedFolderPath, (err, files) => {
        if (err) {
          console.error('Ошибка при чтении директории', err);
          return;
        }
        const projects = files
          .filter(file => file.endsWith('.json'))
          .map(file => path.join(this.selectedFolderPath, file))
          .filter(filePath => this.isProjectFile(filePath))
          .map(filePath => ({ name: path.basename(filePath, '.json') }));

        this.projects = projects;
      });
    },
    selectFolder() {
      const { dialog } = remote;
      dialog.showOpenDialog({
        properties: ['openDirectory']
      }).then(result => {
        if (!result.canceled) {
          this.selectedFolderPath = result.filePaths[0];
          localStorage.setItem('selectedFolderPath', this.selectedFolderPath);
          this.loadProjects();
        }
      }).catch(err => {
        console.log(err);
      });
    },
    createProjectFile() {
      const projectName = this.newProjectName.trim();
      if (!projectName) {
        alert("Введите название проекта");
        return;
      }

      const projectData = { version: "5.3.0", objects: [] };
      const jsonData = JSON.stringify(projectData);

      if (this.selectedFolderPath) {
        const filePath = path.join(this.selectedFolderPath, `${projectName}.json`);
        fs.writeFile(filePath, jsonData, (err) => {
          if (err) {
            console.error('Ошибка при создании файла', err);
          } else {
            console.log('Файл успешно создан');
            this.loadProjects();
          }
        });
      } else {
        alert("Пожалуйста, выберите папку для сохранения проекта.");
      }
    },
    createProject() {
      if (this.newProjectName.trim() === "") {
        alert("Введите название проекта");
        return;
      }

      this.createProjectFile();

      this.$router.push({
        name: "edit",
        params: { projectName: this.newProjectName },
      });
    },
  },
};
</script>


<style>
.bodyList {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 95vw;
  height: 90vh;
  background-color: #A7A7A7;
}
.selectFolder {
  height: 8vh;
  border-radius: 12px;
  margin: 8px 0;
  padding: 0 59px;
  background-color: #006ae3d3;
  color: #ffffff;
  border: none;
}
.selectFolder:hover {
  cursor: pointer;  
  background-color: #005eca;
}

.content {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  margin: 20px auto;
  padding: 10px;
  background-color: #A7A7A7;
  border-radius: 20px;
  max-width: 70vw;
  max-height: 70vh;
}

.list-group-project {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
}

.list-item {
  width: 300px;
  height: 116px;
  font-size: xx-large;
  margin: 20px 20px;
  padding: 10px;
  background-color: #898989b4;
  color: white;
  border-radius: 21px;
  list-style-type: none;
  border: none;
}
.list-item:hover {
  background-color: #464646b4;
  cursor: pointer;
}

.showDialog {
  height: 8vh;
  border-radius: 12px;
  margin: 8px 0;
  padding: 0 59px;
  background-color: #006ae3d3;
  color: #ffffff;
  border: none;
}
.showDialog:hover {
  cursor: pointer;  
  background-color: #005eca;
}
.dialogNew {
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
  background-color: #F04444;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  height: 34px;
  width: 172px;
}
.saveProj {
  background-color: #39B400;
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
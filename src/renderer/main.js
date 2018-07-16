import Vue from 'vue';
import App from './App';
import Buefy from 'buefy';
import 'buefy/lib/buefy.css';
import util from 'util';
import { ipcRenderer } from 'electron';

import "vue-material-design-icons/styles.css"
import FilePlus from "vue-material-design-icons/file-plus.vue"
import ContentSave from "vue-material-design-icons/content-save.vue"
import FolderOpen from "vue-material-design-icons/folder-open.vue"
import ContentCut from "vue-material-design-icons/content-cut.vue"
import FormatBold from "vue-material-design-icons/format-bold.vue"
import FormatItalic from "vue-material-design-icons/format-italic.vue"

Vue.component("content-save", ContentSave);
Vue.component("file-plus", FilePlus);
Vue.component("folder-open", FolderOpen);
Vue.component("content-cut", ContentCut);
Vue.component("format-bold", FormatBold);
Vue.component("format-italic", FormatItalic);

Vue.use(Buefy);

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

export const messageBus = new Vue({
  methods: {
    newContentToRender(newContent) {
      ipcRenderer.send('newContentToRender', newContent);
    },
    saveCurrentFile() {  }
  }
});

ipcRenderer.on('newContentToPreview', (event, url2preview) => {
  console.log(`ipcRenderer.on newContentToPreview ${util.inspect(event)} ${url2preview}`);
  messageBus.$emit('newContentToPreview', url2preview);
});

ipcRenderer.on('newFile2Edit', (event) => {
  console.log(`ipcRenderer.on newFile2Edit ${util.inspect(event)}`);
  messageBus.$emit('newFile2Edit');
});

ipcRenderer.on('editorDoUndo', (event) => {
  console.log(`ipcRenderer.on editorDoUndo ${util.inspect(event)}`);
  messageBus.$emit('editorDoUndo');
});

ipcRenderer.on('editorDoRedo', (event) => {
  console.log(`ipcRenderer.on editorDoRedo ${util.inspect(event)}`);
  messageBus.$emit('editorDoRedo');
});

ipcRenderer.on('editorSelectAll', (event) => {
  console.log(`ipcRenderer.on editorSelectAll ${util.inspect(event)}`);
  messageBus.$emit('editorSelectAll');
});

ipcRenderer.on('openNewFile', (event, file2open) => {
  console.log(`ipcRenderer.on openNewFile  ${util.inspect(file2open)}`);
  messageBus.$emit('openNewFile', file2open);
});

ipcRenderer.on('saveCurrentFile', (event) => {
  console.log(`ipcRenderer.on saveCurrentFile ${util.inspect(event)}`);
  messageBus.$emit('saveCurrentFile');
});

/* eslint-disable no-new */
new Vue({
  components: { App },
  template: '<App/>'
}).$mount('#app')

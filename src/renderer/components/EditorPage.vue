<template>

<div id="wrapper">
    <section class="button-bar">
        <b-tooltip label="New file" position="is-right">
            <button class="button" @click="newFile2Edit">
                <file-plus></file-plus>
            </button>
        </b-tooltip>
        <b-tooltip label="Save file" position="is-right">
            <button class="button" @click="saveCurrentFile">
                <content-save></content-save>
            </button>
        </b-tooltip>
        <b-tooltip label="Open file" position="is-bottom">
            <button class="button" @click="openNewFile">
                <folder-open></folder-open>
            </button>
        </b-tooltip>
        <b-tooltip label="Cut" position="is-bottom">
            <button class="button" @click="editorContentCut">
                <content-cut></content-cut>
            </button>
        </b-tooltip>
        <b-tooltip label="Insert bold" position="is-bottom">
            <button class="button" @click="editorFormatBold">
                <format-bold></format-bold>
            </button>
        </b-tooltip>
        <b-tooltip label="Insert italic" position="is-bottom">
            <button class="button" @click="editorFormatItalic">
                <format-italic></format-italic>
            </button>
        </b-tooltip>
    </section>

    <div id="editor" class="columns is-gapless is-mobile">
        <editor 
            id="aceeditor"
            ref="aceeditor"
            class="column"
            v-model="input" 
            @init="editorInit" 
            lang="markdown" 
            theme="twilight" 
            width="500px" 
            height="100%"></editor>
        <preview-iframe 
            id="previewor" 
            class="column"
            ref="previewor"></preview-iframe>
    </div>

    <section class="status-bar columns">
        <span class="status-item column tag is-info">{{ fileName }}</span>
        <span class="status-item column tag is-info">{{ input.length }} bytes</span>
        <span class="status-item column tag is-info">{{ isChangedFile ? "CHANGED" : "" }}</span>
        <span class="status-item column tag is-info">{{ isNewFile ? "NEW" : "" }}</span>
    </section>
</div>

</template>


<script>

import PreviewIframe from './PreviewIframe.vue';
import { messageBus } from '../main.js';
import fs from 'fs-extra';
import util from 'util';

export default {
    data: function() {
        return {
            input: '# hello',
            isNewFile: true,
            isChangedFile: false,
            fileName: "",
            layoutFileName: ""
        };
    },
    components: { 
        editor: require('vue2-ace-editor'),
        previewIframe: PreviewIframe
    },
    watch: {
        input: function(newContent, oldContent) {
            this.isChangedFile = true;
            messageBus.newContentToRender(newContent);
        }
    },
    computed: {
        editor() { return this.$refs.aceeditor; },
        previewor() { return this.$refs.previewor; }
    },
    methods: {
        editorInit(editor) {
            require('brace/ext/language_tools');
            require('brace/mode/html');
            require('brace/mode/markdown');
            require('brace/theme/twilight');
            editor.setWrapBehavioursEnabled(true);
            editor.setShowInvisibles(true);
            editor.setShowFoldWidgets(true);
            editor.setShowPrintMargin(true);
            editor.getSession().setUseWrapMode(true);
            editor.getSession().setUseSoftTabs(true);
            messageBus.newContentToRender(this.input);
        },
        editorChanged(input) {
            console.log(`editorChanged ${input}`);
            this.isChangedFile = true;
        },
        editorContentCut() { 
            let selected = this.editor.editor.getSelection();
            if (! selected.isEmpty()) {
                let selectedRange = this.editor.editor.getSelectionRange();
                this.editor.editor.getSession().getDocument().replace(selectedRange, '');
            }
            this.$nextTick(() => {
                this.editor.editor.focus();
            });
        },
        editorFormatBold() {
            let selected = this.editor.editor.getSelection();
            if (! selected.isEmpty()) {
                let selectedRange = this.editor.editor.getSelectionRange();
                let selectedText = this.editor.editor.getSession().getDocument().getTextRange(selectedRange);
                this.editor.editor.getSession().getDocument().replace(selectedRange, `**${selectedText}**`);
            } else {
                this.editor.editor.insert('**BOLD**');
            }
            this.$nextTick(() => {
                this.editor.editor.focus();
            });
        },
        editorFormatItalic() {
            let selected = this.editor.editor.getSelection();
            if (! selected.isEmpty()) {
                let selectedRange = this.editor.editor.getSelectionRange();
                let selectedText = this.editor.editor.getSession().getDocument().getTextRange(selectedRange);
                this.editor.editor.getSession().getDocument().replace(selectedRange, `_${selectedText}_`);
            } else {
                this.editor.editor.insert('_Italic_');
            }
            this.$nextTick(() => {
                this.editor.editor.focus();
            });
        },
        askSaveFile(file2save) {
            return new Promise((resolve, reject) => {
                this.$dialog.confirm({
                    title: `Save File?`,
                    message: `${file2save}`,
                    cancelText: 'No',
                    confirmText: 'Yes',
                    onCancel: () => { resolve("cancel"); },
                    onConfirm: () => { resolve("confirm"); }
                })
            });
        },
        async saveContentToFile(file2save) {
            return await fs.writeFile(file2save, this.input, 'utf8');
        },
        saveAsGetFileName() {
            const remote = this.$electron.remote;
            const dialog = remote.dialog;
            console.log(`saveAsGetFileName ASKING SAVE TO`);
            return new Promise((resolve, reject) => {
                try {
                    dialog.showSaveDialog({
                        title: "Save"
                    }, filename => {
                        console.log(`saveAsGetFileName GOT SAVE TO ${filename}`);
                        resolve(filename);
                    });
                } catch (err) { reject(err); }
            });
        },
        async openNewFile() {
            if (this.isNewFile && this.isChangedFile) {
                console.log(`openNewFile isNewFile isChangedFile UNTITLED`);
                let doit = await this.askSaveFile('UNTITLED');
                if (doit === "confirm") {
                    let fileName = await this.saveAsGetFileName();
                    try { await this.saveContentToFile(fileName); } catch (e) {
                        console.error(`openNewFile saveContentToFile FAIL because for ${fileName} ${e.stack}`);
                    }
                }
            } else if (this.isChangedFile) {
                console.log(`openNewFile isChangedFile ${this.fileName}`);
                let doit = await this.askSaveFile(this.fileName);
            }
            console.log(`openNewFile BEFORE showOpenDialog`);
            let file2open = await new Promise((resolve, reject) => {
                const remote = this.$electron.remote;
                const dialog = remote.dialog;
                dialog.showOpenDialog({
                    properties: [ 'openFile' ],
                    title: "Open document",
                    filters: [ { 
                        name: "Markdown Files", 
                        extensions: [ "md" ] 
                    } ]
                }, filePaths => {
                    if (filePaths) {
                        console.log(`openNewFile showOpenDialog ${filePaths[0]}`);
                        resolve(filePaths[0]);
                    } else resolve(undefined);
                });
            });
            console.log(`openNewFile READING1 ${file2open}`);
            if (!file2open) return;
            await new Promise((resolve, reject) => {
                console.log(`openNewFile READING2 ${file2open}`);
                fs.readFile(file2open, 'utf8', (err, text) => {
                    if (err) reject(err);
                    else {
                        this.isNewFile = false;
                        this.isChangedFile = false;
                        this.fileName = file2open;
                        this.input = text;
                        console.log(`openNewFile readFile ${file2open}`);
                        resolve();
                    }
                });
            });
        },
        async saveCurrentFile() {
            let p;
            let fileName;
            if (this.isNewFile && this.isChangedFile) {
                fileName = await this.saveAsGetFileName();
                console.log(`saveCurrentFile saveAsGetFileName ${fileName}`);
                if (!fileName) return;
            } else if (this.isChangedFile) {
                fileName = this.fileName;
            } else return;
            try { await this.saveContentToFile(fileName); } catch (e) {
                console.error(`saveCurrentFile saveContentToFile FAIL for ${fileName} because ${e.stack}`);
            }
            this.isNewFile = false;
            this.isChangedFile = false;
            this.fileName = fileName;
        },
        async newFile2Edit() {
            let p;
            if (this.isNewFile && this.isChangedFile) {
                console.log(`openNewFile isNewFile isChangedFile UNTITLED`);
                let doit = await this.askSaveFile('UNTITLED');
                if (doit === "confirm") {
                    let fileName = await this.saveAsGetFileName();
                    try { await this.saveContentToFile(fileName); } catch (e) {
                        console.error(`newFile2Edit saveContentToFile FAIL for ${fileName} because ${e.stack}`);
                    }
                }
            } else if (this.isChangedFile) {
                console.log(`openNewFile isChangedFile ${this.fileName}`);
                let doit = await this.askSaveFile(this.fileName);
                if (doit === "confirm") {
                    try { await this.saveContentToFile(this.fileName); } catch (e) {
                        console.error(`newFile2Edit saveContentToFile FAIL for ${fileName} because ${e.stack}`);
                    }
                }
            }
            this.isNewFile = true;
            this.isChangedFile = false;
            this.fileName = undefined;
            this.layoutFileName = undefined;
            this.input = "# hello";
        }
    },
    created: function() {
        messageBus.$on('newFile2Edit', () => { this.newFile2Edit(); });
        messageBus.$on('editorDoUndo',    () => { this.editor.editor.undo();      });
        messageBus.$on('editorDoRedo',    () => { this.editor.editor.redo();      });
        messageBus.$on('editorSelectAll', () => { this.editor.editor.selectAll(); });
        messageBus.$on('openNewFile', async (file2open) => {
            try { this.openNewFile(); } catch (err) {
                console.error(`openNewFile ERROR ${file2open} ${err.stack}`);
            }
        });
        messageBus.$on('saveCurrentFile', () => {
            try { this.saveCurrentFile(); } catch (err) {
                console.error(`saveCurrentFile ERROR ${file2open} ${err.stack}`);
            }
        });
    },
}
</script>


<style scoped>
#wrapper {
    height: 100%;
    min-height: 100%;
}

.button-bar {
    margin-bottom: 0px !important;
    top: 0px;
    right: 0px;
    left: 0px;
    height: 40px;
}

.button-bar button,
.button-bar a.navbar-item {
    padding: 0px;
}

#editor {
    position: absolute;
    top: 40px;
    bottom: 30px;
    left: 0px;
    right: 0px;
    margin: 0px;
}

#aceeditor {
    height: 100%;
    min-height: 100%;
}

#previewor {
    margin-left: 2px;
    height: 100%;
    min-height: 100%;
}

.status-bar {
    position: absolute;
    height: 30px;
    right: 0px;
    left: 0px;
    bottom: 0px;
    margin: 0px;
}

.status-bar .status-item {
    vertical-align: middle;
    /* margin-bottom: 5px; */
}

</style>

<template>
    <iframe src=""/>
</template>

<script>
import { messageBus } from '../main.js';

export default {
    methods: {
        reload(previewSrcURL) {
            this.$el.src = previewSrcURL;
        }
    },
    created: function() {
        messageBus.$on('newContentToPreview', (url2preview) => {
            console.log(`newContentToPreview ${url2preview}`);
            this.reload(url2preview);
            // this.getChild('preview-iframe').reload(url2preview);
        });
    }
}
</script>

<style scoped>
iframe { height: 100%; }
</style>
import { createApp } from 'vue';
import { VFileUpload, VFileUploadItem } from 'vuetify/labs/VFileUpload';
import App from './App.vue';

// Vuetifyのインポート
import '@mdi/font/css/materialdesignicons.css';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import 'vuetify/styles';

const vuetify = createVuetify({
  components: {
    ...components,
    VFileUpload,
    VFileUploadItem,
  },
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
});

createApp(App).use(vuetify).mount('#app');

<template>
  <v-app>
    <v-container>
      <v-row justify="center">
        <v-col cols="12" md="8" style="background-color: white">
          <v-card class="mb-4" border>
            <v-card-title class="text-wrap"
              >Steam版ウマ娘 UI切り取りメーカー / Steam Umamusume UI Cropper</v-card-title
            >
            <v-card-text>
              Steam版ウマ娘で左右の白いUI部分を切り取るツール。レシート因子メーカーに突っ込む等用。
            </v-card-text>
          </v-card>

          <v-file-upload
            v-model="model"
            multiple
            accept="image/png, image/jpeg"
            show-size
            scrim="primary"
            density="comfortable"
            title="Drag and Drop PNG/JPEG or Click to Select"
            @update:model-value="handleUpload"
          >
            <template v-slot:item="{ file: itemFile, props: itemProps }">
              <v-file-upload-item v-bind="itemProps" lines="one" nav>
                <template v-slot:prepend>
                  <v-avatar class="avatar" rounded />
                </template>
                <template v-slot:append
                  >;
                  <div>
                    <v-col class="d-flex flex-column ga-2">
                      <v-btn
                        color="primary"
                        prepend-icon="mdi-download"
                        size="large"
                        @click="() => handleDownload(itemFile)"
                      >
                        Download
                      </v-btn>
                      <v-btn
                        prepend-icon="mdi-clipboard-text"
                        size="large"
                        @click="() => handleCopyToClipboard(itemFile)"
                        border
                      >
                        Clipboard
                      </v-btn>
                    </v-col>
                  </div>
                </template>
              </v-file-upload-item>
            </template>
          </v-file-upload>

          <v-col class="d-flex flex-column ga-2">
            <v-btn
              prepend-icon="mdi-clipboard-text"
              size="large"
              @click="handlePasteFromClipboard"
              width="100%"
              border
            >
              Paste from Clipboard
            </v-btn>

            <v-btn
              color="error"
              prepend-icon="mdi-close-circle"
              size="large"
              @click="handleDeleteAll"
              width="100%"
              :disabled="model.length === 0"
            >
              Delete All
            </v-btn>

            <v-divider />

            <v-btn
              color="primary"
              prepend-icon="mdi-download"
              size="large"
              @click="handleDownloadAll"
              width="100%"
              :disabled="model.length === 0"
            >
              Download All
            </v-btn>
          </v-col>

          <v-card border>
            <v-card-title>※</v-card-title>
            <v-card-text>
              Download
              Allボタンで複数のファイルをまとめてダウンロードするには、ブラウザの設定で自動ダウンロードを許可する必要があります。<br />
              クロップ範囲は(横幅*148/1920)（四捨五入）から(横幅*958/1920)（四捨五入）-1pxの範囲としている。<br />
              1920x1080では、148から957までの範囲に相当する。いくつかの解像度で試したが動いている。
            </v-card-text>
          </v-card>

          <v-snackbar-queue
            v-model="successSnackbar"
            :timeout="3000"
            color="success"
            location="top right"
          />
          <v-snackbar-queue
            v-model="errorSnackbar"
            :timeout="3000"
            color="error"
            location="top right"
          />
        </v-col>
      </v-row> </v-container
  ></v-app>
</template>

<script setup lang="ts">
import { onErrorCaptured, onMounted, onUnmounted, ref } from 'vue';
import { getCropRange } from './getCropRange';

const model = ref<File[]>([]);
let pastModel: File[] = [];
const successSnackbar = ref<string[]>([]);
const errorSnackbar = ref<string[]>([]);

const handleUpload = (files: File[]) => {
  if (files.length === 0) {
    pastModel = model.value;
    return;
  }
  // ファイルを追加したとき、過去のファイルとマージする
  // 行ごとに削除できるようにしたいが、マージとの整合性を保つのが難しいので機能追加しない
  model.value = [...pastModel, ...files];
  pastModel = model.value;
};

const handlePasteFromClipboard = async () => {
  try {
    const clipboardItems = await navigator.clipboard.read();
    for (const item of clipboardItems) {
      for (const type of item.types) {
        if (type === 'image/png' || type === 'image/jpeg') {
          const blob = await item.getType(type);
          addImageFile(blob, type);
        }
      }
    }
  } catch (err) {
    errorSnackbar.value.push(
      `Clipboard error: ${err instanceof Error ? err.message : String(err)}`
    );
  }
};

const addImageFile = (blob: Blob, type: string) => {
  const fileName = `clipboard_${Date.now()}.${type === 'image/png' ? 'png' : 'jpg'}`;
  const file = new File([blob], fileName, { type });
  model.value.push(file);
};

const cropImageFile = (file: File): Promise<File> => {
  return new Promise<File>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const [cropX, cropWidth] = getCropRange(img.width);
        canvas.width = cropWidth;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, cropX, 0, cropWidth, canvas.height, 0, 0, cropWidth, canvas.height);
          canvas.toBlob((blob) => {
            if (blob) {
              const croppedFile = new File([blob], file.name, { type: file.type });
              resolve(croppedFile);
            } else {
              reject(new Error('Blob生成失敗'));
            }
          }, file.type);
        } else {
          reject(new Error('Canvasコンテキスト取得失敗'));
        }
      };
      img.onerror = () => reject(new Error('画像読み込み失敗'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('ファイル読み込み失敗'));
    reader.readAsDataURL(file);
  });
};

const handleDownload = async (file: File) => {
  try {
    const croppedFile = await cropImageFile(file);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(croppedFile);
    link.download = croppedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    successSnackbar.value.push(`Downloaded: ${croppedFile.name}`);
  } catch (err) {
    errorSnackbar.value.push(`Download error: ${err instanceof Error ? err.message : String(err)}`);
  }
};

const handleCopyToClipboard = async (file: File) => {
  try {
    const croppedFile = await cropImageFile(file);
    const blob = new Blob([croppedFile], { type: croppedFile.type });
    const item = new ClipboardItem({ [croppedFile.type]: blob });
    await navigator.clipboard.write([item]);
    successSnackbar.value.push(`Copied to clipboard: ${croppedFile.name}`);
  } catch (err) {
    errorSnackbar.value.push(
      `Clipboard copy error: ${err instanceof Error ? err.message : String(err)}`
    );
  }
};

const handleDownloadAll = async () => {
  try {
    for (const file of model.value) {
      await handleDownload(file);
    }
    successSnackbar.value.push('All files downloaded successfully');
  } catch (err) {
    errorSnackbar.value.push(
      `Download all error: ${err instanceof Error ? err.message : String(err)}`
    );
  }
};

const handleDeleteAll = () => {
  model.value = [];
  pastModel = [];
  successSnackbar.value.push('All files deleted successfully');
};

onMounted(() => {
  window.addEventListener('paste', handlePasteFromClipboard);
});

onUnmounted(() => {
  window.removeEventListener('paste', handlePasteFromClipboard);
});

onErrorCaptured((error) => {
  errorSnackbar.value.push(`Error: ${error.message}`);
  console.error(error.message);
});
</script>

<style scoped>
.avatar {
  width: 192px;
  height: 108px;
}
</style>

<template>
  <v-app>
    <v-container>
      <v-row justify="center">
        <v-col cols="12" md="10" style="background-color: white">
          <v-card class="mb-4" border>
            <v-card-title class="text-wrap"
              >Steam版ウマ娘 UI切り取りメーカー / Steam Umamusume UI Cropper</v-card-title
            >
            <v-card-text> Steam版ウマ娘で左右の白いUI部分の内側を切り取るツール。 </v-card-text>
          </v-card>

          <v-file-input
            v-model="inputFiles"
            multiple
            label="ここにファイルをドロップ OR ファイル選択 OR Ctrl + Vで貼り付け"
            @update:model-value="handleUpload"
            accept="image/png, image/jpeg"
          />

          <v-btn
            color="secondary"
            prepend-icon="mdi-content-copy"
            size="large"
            @click="handlePasteFromClipboard"
          >
            クリップボードから貼り付け
          </v-btn>

          <v-divider class="my-4" />

          <v-checkbox
            v-model="isCropNarrowEnabled"
            color="primary"
            label="さらに中の縦長のダイアログを切り取る"
            hide-details="auto"
          ></v-checkbox>

          <v-row
            ><v-col>
              <v-btn
                color="primary"
                prepend-icon="mdi-download"
                size="large"
                @click="handleDownloadAll"
                width="100%"
                :disabled="storeFiles.length === 0"
              >
                Download All
              </v-btn>
            </v-col>
            <v-col>
              <v-btn
                color="error"
                prepend-icon="mdi-close-circle"
                size="large"
                @click="handleDeleteAll"
                width="100%"
                :disabled="storeFiles.length === 0"
              >
                Delete All
              </v-btn>
            </v-col></v-row
          >

          <div v-for="(value, index) in filesUrl" :key="value">
            <v-divider class="my-4" />
            <span>{{ storeFiles[index].name }}</span>
            <v-row>
              <v-col cols="8"> <v-img :src="value" /></v-col>
              <v-col cols="4">
                <v-btn
                  color="primary"
                  prepend-icon="mdi-download"
                  size="large"
                  @click="handleDownload(storeFiles[index])"
                  class="mb-3"
                  width="100%"
                  >Download
                </v-btn>
                <v-btn
                  color="secondary"
                  prepend-icon="mdi-clipboard-text"
                  size="large"
                  @click="handleCopyToClipboard(storeFiles[index])"
                  class="mb-3"
                  width="100%"
                  >Copy
                </v-btn>
                <v-btn
                  color="error"
                  prepend-icon="mdi-close-circle"
                  size="large"
                  @click="handleDelete(storeFiles[index])"
                  class="mb-3"
                  width="100%"
                  >Delete
                </v-btn>
              </v-col></v-row
            >
          </div>

          <v-divider class="my-4" />
          <v-card border>
            <v-card-title>※メモ</v-card-title>
            <v-card-text>
              Download
              Allボタンで複数のファイルをまとめてダウンロードするには、ブラウザの設定で自動ダウンロードを許可する必要があります。<br />
              クロップ範囲は(横幅*148/1920)（四捨五入）から(横幅*958/1920)（四捨五入）-1pxの範囲としている。<br />
              1920x1080では、148から957までの範囲に相当する。いくつかの解像度で試したが動いている。<br />
              さらに中の縦長のダイアログを切り取る機能は切り取り範囲が怪しい。
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
import { computed, onErrorCaptured, onMounted, onUnmounted, ref } from 'vue';
import { getCropRange, getCropRangeNarrow } from './getCropRange';

const inputFiles = ref<File[]>([]);
const storeFiles = ref<File[]>([]);
const successSnackbar = ref<string[]>([]);
const errorSnackbar = ref<string[]>([]);
const isCropNarrowEnabled = ref<boolean>(false);

const handleUpload = (files: File | File[]) => {
  if (Array.isArray(files)) {
    storeFiles.value.push(...files);
  } else {
    storeFiles.value.push(files);
  }
  inputFiles.value = [];
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
  storeFiles.value.push(file);
};

const filesUrl = computed(() => {
  return storeFiles.value.map((file) => URL.createObjectURL(file));
});

const cropImageFile = (file: File): Promise<File> => {
  return new Promise<File>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const [cropX, cropWidth, cropY, cropHeight] = isCropNarrowEnabled.value
          ? getCropRangeNarrow(img.width, img.height)
          : getCropRange(img.width, img.height);
        canvas.width = cropWidth;
        canvas.height = cropHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
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

// 単体系
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

const handleDelete = (file: File) => {
  storeFiles.value = storeFiles.value.filter((f) => f !== file);
  successSnackbar.value.push(`Deleted: ${file.name}`);
};

// ALL系
const handleDownloadAll = async () => {
  try {
    for (const file of storeFiles.value) {
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
  storeFiles.value = [];
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

<style scoped></style>

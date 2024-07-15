<template>
  <div class="bg-black bg-opacity-80 mx-auto w-full p-5 mb-10">
    <div class="flex flex-row w-full justify-between">
      <button @click.prevent="pdfTab = true">Rysunki</button>
      <button @click.prevent="pdfTab = false">Historia</button>
    </div>
  </div>
  <div class="bg-black bg-opacity-80 mx-auto w-full p-5 grow">
    <form @submit.prevent="uploadImage" v-if="pdfTab">
    <div class="flex flex-row flex-wrap mb-5 justify-between">
      <div class="flex flex-col">
        <h2>Wybierz plik:</h2>
        <input type="file" name="image" accept="application/pdf" />
      </div>
      <div>
        <h2>Wybierz styl:</h2>
        <input class="px-3" type="text" name="style" v-model="imageStyle"/>
      </div>
    </div>
    <div class="flex items-center justify-center mt-12">
        <button class="" type="submit">Generuj!</button>
    </div>

      <a :href="imageResult" class="block" target="_blank">
        <img v-if="imageResult" :src="imageResult" alt="" />
      </a>
<!--      <div v-if="imageResult">-->
<!--        <embed style="width: 100vw; height: 100vh" :src="originalImage" />-->
<!--      </div>-->
    </form>
    <div v-else class="flex flex-col flex-wrap">
      <div class="full flex flex-col gap-4">
        <h2>Dokończ niesamowitą przygodę!</h2>
      <p>
        <span>Dawno, dawno temu żył sobie <input type="text" v-model="input1" class="inline-block mx-2" /> o imieniu
          <input type="text" v-model="input2" class="inline-block mx-2" />.</span>
      </p>
      <p>
        <span>Pewnego dnia znalazł magiczny <input type="text" v-model="input3" class="inline-block mx-2" />
          i usłyszał głos, który powiedział: "Spełnię jedno twoje życzenie."</span>
      </p>
      <p>
        <span v-text="input2" class="text-violet-600"/> życzył sobie móc <input type="text" v-model="input4" class="inline-block mx-2" />. Nagle znalazł się w świecie pełnym
        <input type="text" v-model="input5" class="inline-block mx-2" />, gdzie mógł <span v-text="input4" class="text-violet-600"/>.
      </p>
      <p>
        Poznał tam <input type="text" v-model="input6" class="inline-block mx-2" /> o imieniu <input type="text" v-model="input7" class="inline-block mx-2" /> i zostali wielkimi przyjaciółmi.
        Na koniec, <span v-text="input2" class="text-violet-600"/> zrozumiał, że prawdziwym skarbem są przyjaciele i wspólne przygody.
      </p>
    </div>
      <p class="w-full flex items-center justify-center py-10">albo</p>
      <div class="w-full">
        <h2>Wymyśl własną historię!</h2>
        <textarea name="ownStory" id="ownStory" cols="30" rows="10" class="p-3 w-full" v-model="ownStory"/>
      </div>
      <div class="w-full">
        <a :href="storyResult" class="block" target="_blank">
          <img v-if="storyResult" :src="storyResult" alt="" />
        </a>
        <p v-if="storyResult" v-text="story"></p>
        <form @submit.prevent="uploadText" class="w-full flex items-center justify-center py-10">
          <input type="hidden" name="fullStory" v-model="story"/>
          <button class="inline-block" type="submit">Generuj!</button>
        </form>
      </div>
    </div>

    <div v-if="isProcessing" class="spinner_bg">
      <img src="../assets/spinner.gif">
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';

const imageResult = ref('');
const storyResult = ref('');
const originalImage = ref('');
const isProcessing = ref(false);
const imageStyle = ref('van gogh');
const token = ref(process.env.MAKE_TOKEN || '');
const url1 = ref(process.env.MAKE_URL_1 || '');
const url2 = ref(process.env.MAKE_URL_2 || '');
const pdfTab = ref(true);
const input1 = ref('');
const input2 = ref('');
const input3 = ref('');
const input4 = ref('');
const input5 = ref('');
const input6 = ref('');
const input7 = ref('');
const ownStory = ref('');


const story = computed(() => {
  if (ownStory.value) {
    return ownStory.value;
  }
  return `Dawno, dawno temu żył sobie ${input1.value} o imieniu ${input2.value}. Pewnego dnia znalazł magiczny ${input3.value}. ${input2.value} życzył sobie móc ${input4.value}. Nagle znalazł się w świecie pełnym ${input5.value}, gdzie mógł ${input4.value}. Poznał tam ${input6.value} i zostali wielkimi przyjaciółmi.`;
});

const uploadImage = async (event: Event) => {
  imageResult.value = '';
  const file = (event.target as HTMLFormElement).image.files[0];
  originalImage.value = URL.createObjectURL(file);

  try {
    isProcessing.value = true;
    fetch(url1.value, {
      method: 'POST',
      body: new FormData(event.target as HTMLFormElement),
      headers: {
        'Authorization': 'Bearer '+ token.value,
      },
    })
        .then((response) => {
          const reader = response.body?.getReader();
          return new ReadableStream({
            start(controller) {
              return pump();
              function pump(): any {
                return reader?.read().then(({ done, value }) => {
                  // When no more data needs to be consumed, close the stream
                  if (done) {
                    controller.close();
                    return;
                  }
                  // Enqueue the next data chunk into our target stream
                  controller.enqueue(value);
                  return pump();
                });
              }
            },
          });
        })
        // Create a new response out of the stream
        .then((stream) => new Response(stream))
        // Create an object URL for the response
        .then((response) => response.text())
        // Update image
        .then((url) => {
          imageResult.value = url;
        })
        .catch((err) => console.error(err))
        .finally(() => {
          isProcessing.value = false;
        });

  } catch (error) {
    console.error(error);
  }
};
const uploadText = async (event: Event) => {
  try {
    isProcessing.value = true;
    fetch(url2.value, {
      method: 'POST',
      body: new FormData(event.target as HTMLFormElement),
      headers: {
        'Authorization': 'Bearer '+ token.value,
      },
    })
        .then((response) => {
          const reader = response.body?.getReader();
          return new ReadableStream({
            start(controller) {
              return pump();
              function pump(): any {
                return reader?.read().then(({ done, value }) => {
                  // When no more data needs to be consumed, close the stream
                  if (done) {
                    controller.close();
                    return;
                  }
                  // Enqueue the next data chunk into our target stream
                  controller.enqueue(value);
                  return pump();
                });
              }
            },
          });
        })
        // Create a new response out of the stream
        .then((stream) => new Response(stream))
        // Create an object URL for the response
        .then((response) => response.text())
        // Update image
        .then((url) => {
          storyResult.value = url;
        })
        .catch((err) => console.error(err))
        .finally(() => {
          isProcessing.value = false;
        });

  } catch (error) {
    console.error(error);
  }
};
</script>
<style scoped>
.spinner_bg {
  background: white;
}
h2 {
  @apply text-2xl py-3 text-orange-500 font-bold;
  text-shadow: 0 0 1px white;
}
</style>

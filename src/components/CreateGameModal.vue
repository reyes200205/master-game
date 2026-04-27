<template>
  <div class="w-full space-y-5">

    <div>
      <h2 class="font-medium text-md mb-1 text-gray-400">Crear Nueva Sala</h2>
    </div>

    <div class="flex flex-col items-start justify-center  mb-2 rounded-xl">
      <span class="text-[10px] uppercase tracking-[0.2em] text-blue-400 font-bold ">Código de la sala</span>
      <input  v-model="myData.roomId" type="text" placeholder="Codigo De Sala"
        class="w-full p-4 rounded-lg outline-none text-md transition-all focus:border-[#378ADD]"
        style="background:rgba(255,255,255,0.05); border:0.5px solid rgba(133,183,235,0.3); color:#E6F1FB; font-size:14px;" />
    </div>


    <div v-if="errorMessage" class="mb-4 px-3 py-2 rounded-lg text-sm"
      style="background:rgba(226,75,74,0.1); border:0.5px solid rgba(240,149,149,0.3); color:#f09595;">
      {{ errorMessage }}
    </div>

    <div class="flex gap-3 pt-2">
      <button @click="confirmJoinHost"
        class="flex-[2] py-3 rounded-lg font-bold shadow-lg shadow-blue-900/20 transition-transform active:scale-[0.98]"
        style="background:#185FA5; border:0.5px solid #378ADD; color:#E6F1FB; font-size:14px;">
        Crear sala →
      </button>
    </div>

  </div>
</template>

<script>
export default {
  name: 'createGameModal',
  props: {
    myData: Object,
    errorMessage: String,
  },
  mounted() {
    this.myData.roomId  = Math.random().toString(36).substring(2, 6).toUpperCase();
  },
  methods: {
    goHome() {
      this.$emit('goHome');
    },
    confirmJoinHost() {
      this.$emit('confirmJoinHost', this.myData);
    }
  }
}
</script>
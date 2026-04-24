<template>
    <button @click="createRoom" class="flex-1 min-w-[150px] text-left p-6 rounded-xl transition-all"
          style="background:rgba(255,255,255,0.04);border:0.5px solid rgba(133,183,235,0.2);"
          onmouseover="this.style.background='rgba(133,183,235,0.08)';this.style.borderColor='rgba(133,183,235,0.4)'"
          onmouseout="this.style.background='rgba(255,255,255,0.04)';this.style.borderColor='rgba(133,183,235,0.2)'">
          <div class="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
            style="background:rgba(55,138,221,0.15);">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="2" y="8" width="14" height="2" rx="1" fill="#85B7EB" />
              <rect x="8" y="2" width="2" height="14" rx="1" fill="#85B7EB" />
            </svg>
          </div>
          <h3 class="font-medium mb-1" style="color:#E6F1FB;font-size:15px;">Crear partida (HOST)</h3>
          <p style="color:#7BAFD4;font-size:12px;line-height:1.5;">
            Genera un código y compártelo con tus jugadores.
          </p>
        </button>
</template>



<script>
export default {
    name: 'buttonCreate',
    methods: {
        createRoom() {
            this.$emit('createRoom');
        }
    }
}

</script>
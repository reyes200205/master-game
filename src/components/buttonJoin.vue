<template>
    <button @click="openJoinModal" class="flex-1 min-w-[150px] text-left p-6 rounded-xl transition-all"
          style="background:rgba(29,158,117,0.08);border:1.5px solid rgba(29,158,117,0.4);"
          onmouseover="this.style.background='rgba(29,158,117,0.15)'"
          onmouseout="this.style.background='rgba(29,158,117,0.08)'">
          <div class="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
            style="background:rgba(29,158,117,0.2);">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M11 4l5 5-5 5" stroke="#5DCAA5" stroke-width="1.5" stroke-linecap="round"
                stroke-linejoin="round" />
              <path d="M16 9H4" stroke="#5DCAA5" stroke-width="1.5" stroke-linecap="round" />
              <path d="M2 3v12" stroke="#5DCAA5" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </div>
          <h3 class="font-medium mb-1" style="color:#E6F1FB;font-size:15px;">Unirse</h3>
          <p style="color:#7BAFD4;font-size:12px;line-height:1.5;">
            Entra con el código de sala de otro jugador.
          </p>
        </button>
</template>


<script>
export default {
    name: 'buttonJoin',
    methods: {
        openJoinModal() {
            this.$emit('joinRoom');
        }
    }
}
</script>
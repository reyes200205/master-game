<template>
  <div class="w-full space-y-5">
    
    <div>
      <label class="block text-[10px] uppercase tracking-widest text-blue-400 font-bold mb-2">Ingresas tu nombre</label>
      <input
        :value="myData.username"
        @input="$emit('update:username', $event.target.value)"
        type="text" 
        placeholder="Ej. Juan García"
        class="w-full p-3 rounded-lg outline-none transition-all focus:border-[#378ADD]"
        style="background:rgba(255,255,255,0.05); border:0.5px solid rgba(133,183,235,0.3); color:#E6F1FB; font-size:14px;" 
      />
    </div>

    <div>
      <label class="block text-[10px] uppercase tracking-widest text-blue-400 font-bold mb-2">Código de Sala</label>
      <input
        :value="myData.roomId"
        @input="$emit('update:roomId', $event.target.value)"
        type="text" 
        placeholder="6AYC8Q"
        class="w-full p-3 rounded-lg outline-none uppercase tracking-widest transition-all focus:border-[#378ADD]"
        style="background:rgba(255,255,255,0.05); border:0.5px solid rgba(133,183,235,0.3); color:#E6F1FB; font-size:14px;" 
      />
    </div>

    <div v-if="errorMessage" class="px-3 py-2 rounded-lg text-sm"
      style="background:rgba(226,75,74,0.1); border:0.5px solid rgba(240,149,149,0.3); color:#f09595;">
      {{ errorMessage }}
    </div>

    <button 
      @click="$emit('confirmJoin')" 
      class="w-full py-4 rounded-xl font-bold transition-transform active:scale-[0.98] shadow-lg shadow-blue-900/20"
      style="background:#185FA5; border:0.5px solid #378ADD; color:#E6F1FB; font-size:15px;">
      Entrar →
    </button>
    
  </div>
</template>

<script>
export default {
  name: 'joinGameModal', // Le cambié el nombre a Form en lugar de Modal
  props: {
    myData: Object,
    errorMessage: String,
  },
  emits: ['confirmJoin', 'update:roomId', 'update:username']
}
</script>
<template>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" class="empty-talisman">
    <!-- Base Talisman paper shape -->
    <polygon points="16,8 48,8 48,46 32,56 16,46" fill="#0F0F14" stroke="#581C87" stroke-width="1.5" />
    
    <!-- Sealing runes (sharp abstract lines) -->
    <path d="M 24,18 L 40,18 L 32,26 L 40,34 L 24,34" stroke="#71717A" stroke-width="1.5" stroke-linejoin="bevel" fill="none" />
    <path d="M 32,18 L 32,46" stroke="#581C87" stroke-width="1" stroke-dasharray="2 2" />
    <polygon points="28,40 36,40 32,44" fill="#991B1B" opacity="0.5" />
    
    <!-- Floating cursed aura (dim) -->
    <path d="M 10,32 Q 5,20 16,16" stroke="#581C87" stroke-width="1" fill="none" opacity="0.4" class="aura-line" />
    <path d="M 54,32 Q 59,20 48,16" stroke="#581C87" stroke-width="1" fill="none" opacity="0.4" class="aura-line" />
  </svg>
</template>

<style scoped>
.empty-talisman {
  width: 100%;
  height: 100%;
}
.aura-line {
  stroke-dasharray: 20;
  stroke-dashoffset: 20;
  animation: auraFloat 4s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate;
}
@keyframes auraFloat {
  to { stroke-dashoffset: 0; }
}
</style>

<template>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" class="empty-monolith">
    <!-- Monolith pillars -->
    <polygon points="12,50 24,50 24,20 12,28" fill="#0F0F14" stroke="#581C87" stroke-width="1.5" />
    <polygon points="26,50 38,50 38,10 26,14" fill="#0F0F14" stroke="#581C87" stroke-width="1.5" />
    <polygon points="40,50 52,50 52,30 40,34" fill="#0F0F14" stroke="#581C87" stroke-width="1.5" />
    
    <!-- Chain bindings -->
    <path d="M 8,36 L 56,22" stroke="#71717A" stroke-width="1.5" stroke-dasharray="3 2" />
    <path d="M 8,42 L 56,28" stroke="#71717A" stroke-width="1.5" stroke-dasharray="3 2" />
    
    <!-- Base seal -->
    <polygon points="8,50 56,50 48,56 16,56" fill="#12111A" stroke="#581C87" stroke-width="1" opacity="0.6" />
    
    <!-- Cursed eye (closed/sleeping) -->
    <path d="M 28,18 Q 32,22 36,18 Q 32,16 28,18 Z" fill="#991B1B" opacity="0.4" class="cursed-eye" />
  </svg>
</template>

<style scoped>
.empty-monolith {
  width: 100%;
  height: 100%;
}
.cursed-eye {
  animation: eyePulse 6s infinite;
  transform-origin: 32px 18px;
}
@keyframes eyePulse {
  0%, 90% { transform: scaleY(0.1); opacity: 0.2; }
  95% { transform: scaleY(1); opacity: 0.8; }
  100% { transform: scaleY(0.1); opacity: 0.2; }
}
</style>

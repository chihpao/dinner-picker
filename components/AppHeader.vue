<template>
  <header class="hero" :class="{ 'hero--expenses': isExpenses }">
    <div class="mappa-bg-layer">
      <svg viewBox="0 0 400 150" class="energy-lines" preserveAspectRatio="none">
        <defs>
          <linearGradient id="mappaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#581C87" />
            <stop offset="100%" stop-color="#E11D48" />
          </linearGradient>
          <filter id="cursedBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>
        <g stroke="url(#mappaGrad)" stroke-width="2.5" fill="none" filter="url(#cursedBlur)">
          <path class="cursed-path" d="M 0,20 Q 50,80 100,10 T 200,50 T 300,10 T 400,60" />
          <path class="cursed-path delay-1" d="M -20,100 Q 80,40 150,110 T 300,30 T 420,90" />
          <path class="cursed-path delay-2" d="M 50,-20 Q 150,120 250,-10 T 350,130" />
        </g>
      </svg>
    </div>
    <div class="hero-header">
      <div class="hero-title-wrap">
        <NuxtLink
          v-if="backTo"
          :to="backTo"
          class="btn btn-sm back-btn"
          title="返回上一頁"
          aria-label="返回上一頁"
        >
          <IconArrowLeft />
        </NuxtLink>
        <div class="hero-heading">
          <h1>{{ title }}</h1>
          <p class="hero-subtitle">{{ subtitle || todayLabel }}</p>
        </div>
      </div>

      <div class="hero-actions">
        <div class="hero-quick-actions">
          <slot name="actions"></slot>
        </div>
        
        <div v-if="!hideAuth" class="auth-bar">
          <button v-if="!user" @click="signInWithGoogle()" class="btn btn-google" type="button">
            <svg viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            <span class="btn-text">登入</span>
          </button>
          
          <div v-else class="auth-pill">
            <button class="auth-avatar" @click="toggleMenu" :title="user.email">
              {{ userInitial }}
            </button>
            <transition name="pop">
              <div v-show="menuOpen" class="auth-menu">
                <div class="menu-header">
                  <span class="user-email">{{ user.email }}</span>
                </div>
                <button @click="switchAccount" class="menu-item">
                  <span class="icon">↺</span> 切換帳號
                </button>
                <button @click="signOut" class="menu-item danger">
                  <span class="icon">×</span> 登出
                </button>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>
    <slot name="bottom"></slot>
  </header>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import IconArrowLeft from '~/components/icons/IconArrowLeft.vue'

const { backTo, hideAuth = false, subtitle } = defineProps<{
  title: string
  isExpenses?: boolean
  backTo?: string
  hideAuth?: boolean
  subtitle?: string
}>()

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)
const { signInWithGoogle, signOut } = authStore

const menuOpen = ref(false)

const userInitial = computed(() => user.value?.email?.[0]?.toUpperCase() || 'U')

const todayLabel = computed(() => {
  const n = new Date()
  const f = (v: number) => String(v).padStart(2, '0')
  return `${n.getFullYear()}/${f(n.getMonth() + 1)}/${f(n.getDate())}`
})

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const switchAccount = () => {
  signInWithGoogle()
  menuOpen.value = false
}

const handleDocumentClick = (e: MouseEvent) => {
  if (!(e.target as HTMLElement).closest('.auth-pill')) {
    menuOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleDocumentClick))
onUnmounted(() => document.removeEventListener('click', handleDocumentClick))
</script>

<style scoped>
.hero {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 14px 16px;
  background: var(--bg-paper);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s var(--ease-snappy);
  overflow: hidden;
}

.mappa-bg-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.energy-lines {
  width: 100%;
  height: 100%;
}

.cursed-path {
  stroke-dasharray: 800;
  stroke-dashoffset: 800;
  animation: energy-flow 1.5s cubic-bezier(0, 1, 0, 1) forwards,
             cursed-pulse 4s infinite alternate cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center;
}

.delay-1 { animation-delay: 0s, 0.5s; }
.delay-2 { animation-delay: 0s, 1.2s; }

@keyframes energy-flow {
  to { stroke-dashoffset: 0; }
}

@keyframes cursed-pulse {
  0% { opacity: 0.1; transform: scaleY(0.9) skewX(2deg); }
  20% { opacity: 0.5; transform: scaleY(1.1) skewX(-3deg); }
  40% { opacity: 0.2; transform: scaleY(0.95) skewX(4deg); }
  60% { opacity: 0.4; transform: scaleY(1.05) skewX(-1deg); }
  80% { opacity: 0.1; transform: scaleY(0.9) skewX(3deg); }
  100% { opacity: 0.6; transform: scaleY(1.15) skewX(-4deg); }
}

.hero-header, .hero-actions, .hero-title-wrap {
  position: relative;
  z-index: 1;
}

.hero--expenses {
  background: rgba(18, 17, 26, 0.6);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-color: rgba(124, 58, 237, 0.1);
}

.hero-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.hero-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
}

.hero-actions, .auth-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.hero-quick-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.hero-title-wrap h1 {
  margin: 0;
  font-size: 22px;
  line-height: 1.2;
  color: var(--ink);
}

.hero-heading {
  min-width: 0;
}

.hero-heading h1 {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hero-subtitle {
  margin: 3px 0 0;
  font-size: 11px;
  color: var(--ink-light);
  font-family: var(--font-pixel);
  letter-spacing: 0.05em;
}

.hero-actions {
  flex-wrap: wrap;
  justify-content: flex-end;
  margin-left: auto;
}

.back-btn {
  width: 36px;
  height: 36px;
  padding: 0;
}

.back-btn :deep(svg) {
  width: 16px;
  height: 16px;
}

@media (max-width: 720px) {
  .hero {
    padding: 12px;
    gap: 10px;
    backdrop-filter: blur(20px);
    background: rgba(18, 17, 26, 0.85);
  }

  .hero-header {
    align-items: center;
    gap: 8px;
  }

  .hero-title-wrap {
    flex: 1;
    min-width: 0;
  }

  .hero-title-wrap h1 {
    font-size: 18px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .hero-actions {
    width: auto;
    flex: 0 0 auto;
    margin-left: 0;
    gap: 6px;
    justify-content: flex-end;
  }

  .hero-quick-actions {
    flex-wrap: nowrap;
    gap: 6px;
  }

  .auth-bar {
    margin-left: 0;
    gap: 6px;
  }

  .hero-subtitle {
    display: none;
  }

  .btn-text {
    display: none;
  }

  .btn-google {
    width: 40px;
    min-width: 40px;
    padding: 0;
  }

  .back-btn {
    width: 34px;
    height: 34px;
  }
}

.btn-google {
  gap: 8px;
  background: var(--bg-paper);
  border: 1px solid var(--border);
  color: var(--ink);
  font-family: var(--font-pixel);
  letter-spacing: 0.05em;
  min-height: 36px;
  padding: 0 12px;
}

.btn-google svg {
  width: 18px;
  height: 18px;
}

.auth-avatar {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  background: var(--primary);
  color: white;
  border: 1px solid rgba(0,0,0,0.1);
  font-family: var(--font-pixel);
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s var(--ease-snappy);
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.auth-avatar:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.15);
}

.auth-pill {
  position: relative;
}

.auth-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: var(--bg-paper);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.5);
  padding: 6px;
  display: flex;
  flex-direction: column;
  min-width: 180px;
  z-index: 50;
  transform-origin: top right;
}

@media (max-width: 720px) {
  .btn-google {
    min-height: 38px;
  }

  .auth-avatar {
    width: 40px;
    height: 40px;
  }

  .auth-menu {
    min-width: 168px;
  }
}

.menu-header {
  padding: 8px 12px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 4px;
}

.user-email {
  font-size: 11px;
  color: var(--ink-light);
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}

.menu-item {
  background: none;
  border: none;
  padding: 8px 12px;
  text-align: left;
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--ink);
  border-radius: 6px;
  cursor: pointer;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.1s;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--primary);
}

.menu-item.danger:hover {
  color: var(--danger);
  background: rgba(220, 38, 38, 0.1);
}

.icon {
  font-family: var(--font-pixel); 
  width: 16px;
  text-align: center;
}

.pop-enter-active,
.pop-leave-active {
  transition: all 0.2s var(--ease-snappy);
}

.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-5px);
}
</style>
